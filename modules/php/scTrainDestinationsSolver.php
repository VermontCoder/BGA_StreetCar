<?php

require_once('scUtility.php');
require_once('scRoute.php');
require_once('scConnectivityGraph.php');
require_once('scRouteFinder.php');

/**
 * This is to support the sole function of finding legal destinations for the train, given a particular die roll
 */
class scTrainDestinationsSolver
{
    private $game;
    private $cGraph;
    private $scRouteFinder;

    function __construct($game) 
    {
        $this->game = $game;
    }

    
    /**
     * Takes care of database updating for moving the train to a particular node.
     * @return [scRoutes, string] route for train to get to destinationNode. A direction string - NESW.
     */
    public function moveTrainToDestination($destinationNode, $player, $stops, $doNotRecordStops=false)
    {
        $this->cGraph = new scConnectivityGraph($this->game);
        $this->scRouteFinder = new scRouteFinder($this->cGraph);

        $stopsLocations = scUtility::getStopsLocations($stops);
        //Step 0 - set up basic sql statment

        $sql = "UPDATE player set trainposition='".$destinationNode."',";

        //Step 1 - find route to destination.
        $moveRoute = $this->scRouteFinder->findShortestRoute($player['trainposition'],$destinationNode);
        //$this->game->dump('route:', $route);

        //Step 2 - Note any stops or terminal nodes.
        $stopOnRoute = $moveRoute->getStopOnRoute($stopsLocations);

         //Step 2a - If a stop is on the route, check to see if it fulfills a goal. If so, modify database accordingly.
        $lastStopNodeID = $stopOnRoute['lastStopNodeID'];
        
        if ($stopOnRoute['stop'] != null && in_array($stopOnRoute['stop'],$player['goals']))
        {
            //as $player will be used again later, modify $player
            $player['goals']= array_diff( $player['goals'], [$stopOnRoute['stop']] );//deletes stop from goals
            $player['goalsfinished'][] = $stopOnRoute['stop']; //and adds it to goalsfinished
            
            $sql .="goals='".json_encode(array_values($player['goals']))."', goalsfinished='".json_encode(array_values($player['goalsfinished']))."', ";
        }

        //Step 2b - If a stop or terminal is noted on the route, record the nodeID in the "lastStopNodeID" column for the player.
        if( $lastStopNodeID != null)
        {
            $sql .= "laststopnodeid='".$lastStopNodeID."', ";
        }
        
        //Step 3 - run a route calc from the $destinationNode to the end using calcRoutesFrom Node. This is our new curRoute.

        $routes = $this->game->calcRoutesFromNode( $destinationNode, $player,$stops);

        //Step 4 - Find direction of train. This might be a temporary direction - the user will select the direction in next state, if more than one direction is possible.
        $curTrainFacingsTilesSelection = $this -> getPossibleDirectionsOfRouteFromNode($destinationNode, $player, $stops);

        $direction = '';
        if (count($curTrainFacingsTilesSelection) == 0 )
        {
            //This would be the direction if the train has finished! calculate this from the x or y = 0 or 13.
            $direction = 'N';
        }
        else
        {
            //default face the train toward shortest route. If there is more than one route, the player can choose a different one in the next state.

            $startNodeOfRoute = $routes[0] -> startNodeID.'_'.$routes[0] -> routeID;
            $nextNodeOfRoute = $routes[0] ->routeNodes[$startNodeOfRoute];
            $xydStart = scUtility::nodeID2xyd($destinationNode);
            $xydEnd = scUtility::nodeID2xyd($nextNodeOfRoute);
            $direction = scUtility::getDirectionOfTileFromCoords($xydStart['x'],$xydStart['y'],$xydEnd['x'],$xydEnd['y']);
        }

        $sql .= "traindirection='".$direction."' WHERE player_id = ".$player['id'] . ";";

        $this->game->DbQuery($sql);

        //step 5 - return routes and traindirection.

        return ['moveRoute'=> $moveRoute, 'routes'=> $routes,'curTrainFacingsTileSelection'=>$curTrainFacingsTilesSelection,'direction'=>$direction];
    }

    
    /** Helper function for above */
    private function getPossibleDirectionsOfRouteFromNode($nodeID, $player, $stops)
    {
        $possibleTileFacingsSelection = [];

        $connectedNodes = $this->game->cGraph->getChildNodes($nodeID);

        foreach($connectedNodes as $connectedNode)
        {
            //find if there are route(s) from this node to the end. If so, this is a possible way to go.
            $routes = $this->game->calcRoutesFromNode($connectedNode,$player,$stops);
            
            //$this->game->dump('CONNECTED NODE: ', $connectedNode);
            if ($routes==null) continue; //no routes found.
            
            foreach($routes as $route)
            {
                if ($route->isComplete)
                {
                    //this node lies in a possible direction
                    //but to point at this node from the originating node, we need to 180 the node direction (entering from the south, the direction is north from the originating node.)
                    // $xyd = scUtility::nodeID2xyd($connectedNode);
                    // $possibleTileFacingsSelection[] = $connectedNode;
                    $possibleTileFacingsSelection[] = $connectedNode;
                    break;
                }
            }

        }

        return $possibleTileFacingsSelection;
    }

    /**
     * Based on current player position, get the possible moves for the train.
     */
    public function getTrainMoves($player,$die)
    {
        $curTrainNodeID = $player['trainposition'];
        $stops = $this->game->getStops();

        //TESTING
        $die = 3;

        switch(intval($die))
        {
            case 0: //move ahead 2
                return $this -> moveAheadTwo($curTrainNodeID,$player,$stops);
                break;
            case 1: //move ahead 1
                return $this -> moveAheadOne($curTrainNodeID,$player);
                break;
            case 2: //do nothing
                return [$curTrainNodeID];
                break;
            case 3: //proceed to next station
                return $this -> moveToNextStation($curTrainNodeID,$player,$stops);
                break;
            case 4 || 5: //go back to previous station.
                break;
        }
        //return ['2_2_S','10_3_E'];
    }

    /**
     * Moving ahead one, no choice, player moves forward in the direction of train facing.
     */
    public function moveAheadOne($curTrainNodeID,$player)
    {
        $xyd= scUtility::nodeID2xyd($curTrainNodeID);
        $xyDestination = scUtility::getCoordsOfTileInDirection($player['traindirection'],$xyd['x'],$xyd['y']);

        //Train will be entering new node from the side opposite the train direction (train moving North enters from the south,etc.)
        $d = scUtility::get180($player['traindirection']);

        return [scUtility::xyd2NodeID($xyDestination['x'],$xyDestination['y'],$d)];
    }

    public function moveAheadTwo($curTrainNodeID,$player,$stops)
    {
       $nextNodeID = $this->moveAheadOne($curTrainNodeID,$player)[0];

       //oddly enough, this method also works here! This isn't actually directions, but nodes which lie in the next directions.
       return $this->getPossibleDirectionsOfRouteFromNode($nextNodeID, $player, $stops);
    }

    public function moveToNextStation($curTrainNodeID,$player,$stops)
    {

        //step 0 - get the next node on the train's path
        $originNode = $this->moveAheadOne($curTrainNodeID,$player)[0];

        //step 1 - make a copy of connectivity graph
        $connectivityGraphCopy = new scConnectivityGraph($this->game);

        //step 2a - compile list of possible next station nodes
        $stationNodes = [];
        $stopsLocations = scUtility::getStopsLocations($stops);
        foreach($stopsLocations as $stopLocation)
        {
            if ($stopLocation != null)
            {
                //add all 4 nodes at this location to stop list
                foreach(scUtility::$NESW as $direction)
                {
                    $stationNodes[] = scUtility::xyd2NodeID($stopLocation['x'],$stopLocation['y'],$direction);
                }
            }
        }
        
        $terminalIDs = scUtility::getTerminalIDs($this->game);
        foreach($terminalIDs as $ID => $irrelevant)
        {
            //add all 4 nodes at this terminal to stop list
            foreach(scUtility::$NESW as $direction)
            {
                $stationNodes[] = $ID.'_'.$direction;
            }
            
        }

        //$this->game->dump('Station Nodes', $stationNodes);
        //step 2b - Alter connectivity graph to end at terminals or stops
        foreach($connectivityGraphCopy->connectivityGraph as $node => $children)
        {
            $this->game->dump('NODEs', $node);
            if (in_array($node, $stationNodes))
            {
                //terminate this node here.
                $this->game->dump('NULL NODE', $node);
                $connectivityGraphCopy->connectivityGraph[$node] = [];
            }
        }

        //$this->game->dump('CGRAPH', $connectivityGraphCopy ->connectivityGraph);
        //step 3 - run shortest path to all stops and terminals.
        $routesToStations =[];
        $routeFinder = new scRouteFinder($connectivityGraphCopy);
        foreach($stationNodes as $stationNode)
        {
            $route = $routeFinder->findShortestRoute($originNode,$stationNode);
            if (!$route->isEmpty())
            {
                $routesToStations[] = $route;
            }

        }

        $this->game->dump("ROUTES", $routesToStations);
        //$this->game->dump('CGRAPH', $this->game->cGraph->connectivityGraph);
        //step 4 - From all stops and terminals accessable, run from node to end.
        
        $cGraph = new scConnectivityGraph($this->game); // create a non-altered connectivity graph
        $routeFinder = new scRouteFinder($cGraph);

        $destinationNodes = [];
        foreach($routesToStations as $route)
        {
            //endNodes of these routes are candidates for next destination
            $candidateRoutes = $routeFinder->findRoutesFromNode($route->endNodeID,$player,$stopsLocations, $this->game);

            //while the findRoutesFromNode returns multiple routes, if there are any complete routes, only complete routes will be returned.
            //Thus, we only need to check the first route.
            if ($candidateRoutes[0]->isComplete)
            {
                $destinationNodes[] = $route->endNodeID;
            }
        }

        $this->game->dump("destinations: ", $destinationNodes);
        //step 5 - the routes that complete are locations available
        return $destinationNodes;
    }
}