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
     * Takes care of database updating and routing instructions for front end for moving the train to a particular node.
     * Typically next step after player selects destination from "getTrainMoves" below.
     * @return ['moveRoute'=> $moveRoute, 'routes'=> $routes,'direction'=>$direction]
     *          'moveRoute - route for train to get to destinationNode. 
     *          'routes' - new routes to show from train to end node.
     *          'curTrainFacingsTileSelection' - Set of tiles to for the user to choose from toward which they can face the train
     *          'direction' - Direction train is to point - A direction string - NESW.
     */
    public function moveTrainToDestination($destinationNode, $player, $stops)
    {
        $this->cGraph = new scConnectivityGraph($this->game);
        $this->scRouteFinder = new scRouteFinder($this->cGraph);

        //Step 0 - set up basic sql statment
        $sql = "UPDATE player set trainposition='" . $destinationNode . "',";
        $moveRoute = null;

        if ($destinationNode != $player['trainposition']) //i.e. train actually moved.
        {
            $moveRoute = $this->getMoveRoute($destinationNode, $player, $stops);

            //Step 2 - Note any stops or terminal nodes.
             //account for stops and record last stop.
            $stopsLocations = scUtility::getStopsLocations($stops);
            $stopOnRoute = $moveRoute->getStopOnRoute($stopsLocations);

            //step 2a - special processing for 2 space move. We must return the route that passes a stop, if there is one.
            //This is ugly, but no avoiding it :(
            //$this->twoSpaceMoveSpecialProcessing($moveRoute, $stopOnRoute, $player, $stops, $stopsLocations);


            //Step 2b - If a stop is on the route, check to see if it fulfills a goal. If so, modify database accordingly.
            if ($stopOnRoute['stop'] != null && in_array($stopOnRoute['stop'], $player['goals'])) {
                //as $player will be used again later, modify $player
                $player['goals'] = array_diff($player['goals'], [$stopOnRoute['stop']]); //deletes stop from goals
                $player['goalsfinished'][] = $stopOnRoute['stop']; //and adds it to goalsfinished

                $sql .= "goals='" . json_encode(array_values($player['goals'])) . "', goalsfinished='" . json_encode(array_values($player['goalsfinished'])) . "', ";
            }

            //Step 2c - If a stop or terminal is noted on the route, record the nodeID in the "lastStopNodeID" column for the player.
            if ($stopOnRoute['lastStopNodeID'] != null) {
                $sql .= "laststopnodeid='" . $stopOnRoute['lastStopNodeID'] . "', ";
            }
        }

        //Step 3 - check if player won!
        if (scUtility::hasPlayerWon($destinationNode, $player)) {
            $routes = null; //no further route

            $trainLoc = scUtility::key2xy($destinationNode);

            $direction = '';
            if ($trainLoc['x'] == 0) {
                $direction = 'W';
            }
            if ($trainLoc['y'] == 0) {
                $direction = 'N';
            }
            if ($trainLoc['x'] == 13) {
                $direction = 'E';
            }
            if ($trainLoc['y'] == 13) {
                $direction = 'S';
            }

            //record victory in database.
            $sql .= "player_score=1, ";
        } else {
            //Step 3a - run a route calc from the $destinationNode to the end using calcRoutesFrom Node. This is our new curRoute.
            $routes = $this->game->calcRoutesFromNode($destinationNode, $player, $stops);

            //default face the train toward shortest route. If there is more than one route, the player can choose a different one in the next state.
            $direction = $this->getDefaultDirection($destinationNode, $routes[0]);
        }

        $sql .= "traindirection='" . $direction . "' WHERE player_id = " . $player['id'] . ";";

        $this->game->DbQuery($sql);

        //step 5 - return routes and traindirection.
        //$this->game->dump('out3', ['moveRoute' => $moveRoute, 'routes' => $routes, 'direction' => $direction]);

        return ['moveRoute' => $moveRoute, 'routes' => $routes, 'direction' => $direction];
    }

    private function getMoveRoute($destinationNode, $player)
    {
        //Step 1 - find route to destination.

        //If routes to the destination have been stored in globals, we use those instead of calculating the route.
        //This happens during the move to next station choices, as findShortestRoute sometimes gives the wrong route.
        $storedRoutes = json_decode($this->game->globals->get(PRECALCULATED_ROUTES));

        if ($storedRoutes == null) {
            $moveRoute = $this->scRouteFinder->findShortestRoute($player['trainposition'], $destinationNode);
        } else {
            foreach ($storedRoutes as $idx => $route) {
                if ($route->endNodeID == $destinationNode) {
                    $moveRoute = scRoute::JSON2Route($route);
                }
            }
        }

        return $moveRoute;
    }

    public function moveTrainToDestinationTwoSpace($destinationNode, $player, $stops)
    {
        $this->cGraph = new scConnectivityGraph($this->game);
        $this->scRouteFinder = new scRouteFinder($this->cGraph);

        $possibleAdjacentNodes = $this->moveAheadOne($player['trainposition'], $player, $stops);
        $routesToDestination = [];

       
        foreach ($possibleAdjacentNodes as $node) {
            $altRoute = $this->scRouteFinder->findShortestRoute($player['trainposition'], $node);

            //check for winning in one move
            if (scUtility::hasPlayerWon($node, $player)) {
                $this->game->globals->set(PRECALCULATED_ROUTES, json_encode([$altRoute]));
                return $this->moveTrainToDestination($destinationNode, $player, $stops);
            }

            $possibleNextNodes = $this->moveAheadOne($node, $player, $stops);

            $altRoutePart2 = null;
            foreach ($possibleNextNodes as $nextNode)
            {
                //is this a node on the same tile as the destination node?
                $destXYD = scUtility::nodeID2xyd($destinationNode);
                $nextXYD = scUtility::nodeID2xyd($nextNode);

                if ($destXYD['x'] == $nextXYD['x'] && $destXYD['y'] == $nextXYD['y']) {
                    //this is the next node.
                    $altRoutePart2 = $this->scRouteFinder->findShortestRoute($node, $nextNode);
                }
            }
            
            $this->game->dump('altPart', $altRoute);
            $this->game->dump('altPart2', $altRoutePart2);
           
            if ($altRoutePart2 == null ) continue; //this is not a valid route.
            $routesToDestination[] = $altRoute->merge($altRoutePart2);
        }

        //$this->game->dump('outr2', $routesToDestination);
        $this->game->globals->set(PRECALCULATED_ROUTES, json_encode($routesToDestination));
        if (count($routesToDestination) == 1) {
            return $this->moveTrainToDestination($destinationNode, $player, $stops);
        }

        //two routes. Return them to the player for selection.
        $routesAndDirection['twoSpaceMoveRoutes'] = $routesToDestination;
        return $routesAndDirection;
    }

    private function twoSpaceMoveSpecialProcessing(&$moveRoute, &$stopOnRoute, $player, $stops, $stopsLocations)
    {
        $dieRoll =  $this->game->globals->get(CUR_DIE);

        if ($dieRoll >= 3)
        // if ($stopOnRoute['lastStopNodeID'] != null && $dieRoll != 1)
        {
            //this situation does not require special processing
            return;
        }

        $possibleAdjacentNodes = $this->moveAheadOne($moveRoute->startNodeID, $player, $stops);
        foreach ($possibleAdjacentNodes as $node) {
            $altRoute = $this->scRouteFinder->findShortestRoute($moveRoute->startNodeID, $node);

            //check for winning in one move
            if (scUtility::hasPlayerWon($node, $player)) {
                $moveRoute = $altRoute;
                return;
            }

            $altStopOnRoute = $altRoute->getStopOnRoute($stopsLocations);

            //if we find a stop on the next node, route this way.
            if ($altStopOnRoute['lastStopNodeID'] != null) {
                //this might be the node we are looking for
                $altRoutePart2 = $this->scRouteFinder->findShortestRoute($node, $moveRoute->endNodeID);

                //This route needs to be length 1. If not, this is further than two squares, so its no good.
                if ($altRoutePart2->getLength() != 1) continue;

                //now that we know this is a good route, check for a stop at the end.
                $altStopOnRoutePart2 = $altRoutePart2->getStopOnRoute($stopsLocations);

                //if there is a stop at the end of the move, this is the stop we need to return.
                //This situation happens if you get a two move die roll just before entering a terminal.
                //The first tile in the terminal becomes the $altStopOnRoute and the 2nd is $altstopOnRoutePart2
                $stopOnRoute = $altStopOnRoutePart2['lastStopNodeID'] != null ? $altStopOnRoutePart2 : $altStopOnRoute;
                $moveRoute = $altRoute->merge($altRoutePart2);
                return;
            }
        }

        //alt routes didn't have any stops either.
        return;
    }

    /**
     * This is the same purpose as the moveTrainToDestination above, but for moving back to previous stop
     * Things work differently here - much simpler for everything but the move route, which requires special handling. 
     * But the return info is the same:
     * 
     * @return ['moveRoute'=> $moveRoute, 'routes'=> $routes,'direction'=>$direction]
     *          'moveRoute - route for train to get to destinationNode. 
     *          'routes' - new routes to show from train to end node.
     *          'curTrainFacingsTileSelection' - Set of tiles to for the user to choose from toward which they can face the train
     *          'direction' - Direction train is to point - A direction string - NESW.
     */
    public function moveTrainToDestinationPrevStop($destinationNode, $player, $stops)
    {

        $this->cGraph = new scConnectivityGraph($this->game);
        $this->scRouteFinder = new scRouteFinder($this->cGraph);

        if ($destinationNode == $player['trainposition']) {
            $moveRoute = null;
        } else {
            //To calculate moveroute, we do a route calc from the *previous stop* to the *current player position*
            //Then we flip the parent child relationship to reverse the route!
            //This means that this route will *not* be connectively valid, but for displaying the train moving back, it will be fine
            // as that only uses the x and y (no d).
            $routeFromStop = $this->scRouteFinder->findShortestRoute($destinationNode, $player['trainposition']);
            $moveRoute = new scRoute($player['trainposition'], $destinationNode);

            $curRouteNodeID = $routeFromStop->startNodeID . '_' . $routeFromStop->routeID;

            //flip route
            while ($curRouteNodeID != null && isset($routeFromStop->routeNodes[$curRouteNodeID])) {
                $start = scRoute::truncRouteID($routeFromStop->routeNodes[$curRouteNodeID]);
                $target = scRoute::truncRouteID($curRouteNodeID);
                $moveRoute->insertRouteNode($start, $target);

                $curRouteNodeID = $routeFromStop->routeNodes[$curRouteNodeID];
            }
        }

        $routes = $this->game->calcRoutesFromNode($destinationNode, $player, $stops);
        $direction = $this->getDefaultDirection($destinationNode, $routes[0]);

        //Modify database
        $sql = "UPDATE player set trainposition='" . $destinationNode . "',";
        $sql .= "traindirection='" . $direction . "' WHERE player_id = " . $player['id'] . ";";

        $this->game->DbQuery($sql);

        return ['moveRoute' => $moveRoute, 'routes' => $routes, 'direction' => $direction];
    }

    /** Helper function for above functions */
    private function getDefaultDirection($destinationNode, $route)
    {
        $startNodeOfRoute = $route->startNodeID . '_' . $route->routeID;
        $nextNodeOfRoute = $route->routeNodes[$startNodeOfRoute];
        $xydStart = scUtility::nodeID2xyd($destinationNode);
        $xydEnd = scUtility::nodeID2xyd($nextNodeOfRoute);
        return scUtility::getDirectionOfTileFromCoords($xydStart['x'], $xydStart['y'], $xydEnd['x'], $xydEnd['y']);
    }

    /**
     * Based on current player position, get the possible moves for the train.
     */
    public function getTrainMoves($player, $die)
    {
        $curTrainNodeID = $player['trainposition'];
        $stops = $this->game->getStops();

        switch (intval($die)) {
            case 1: //move ahead 2
            case 2: //move ahead 2
                return $this->moveAheadTwo($curTrainNodeID, $player, $stops);
                break;
            case 3: //move ahead 1
                return $this->moveAheadOne($curTrainNodeID, $player, $stops);
                break;
            case 4: //do nothing
                return [$curTrainNodeID];
                break;
            case 5: //proceed to next station
                return $this->moveToNextStation($curTrainNodeID, $player, $stops);
                break;
            case 6: //go back to previous station.
                return $this->moveToPreviousStation($player);
                break;
        }
        //return ['2_2_S','10_3_E'];
    }

    public function moveAheadOne($curTrainNodeID, $player, $stops)
    {
        $possibleMoves = [];

        $connectedNodes = $this->game->cGraph->getChildNodes($curTrainNodeID);

        foreach ($connectedNodes as $connectedNode) {
            //find if there are route(s) from this node to the end. If so, this is a possible way to go.
            $routes = $this->game->calcRoutesFromNode($connectedNode, $player, $stops);

            if ($routes == null) continue; //no routes found.

            foreach ($routes as $route) {
                if ($route->isComplete) {
                    //this node lies in a possible direction 
                    $possibleMoves[] = $connectedNode;
                    break;
                }
            }
        }

        return $possibleMoves;
    }

    public function moveAheadTwo($curTrainNodeID, $player, $stops)
    {
        $possibleMoves = [];
        $nextNodeIDs = $this->moveAheadOne($curTrainNodeID, $player, $stops);

        //if moving ahead one results in a win, it will be in the $nextNodeIDs array and the player will have completed his goals

        $nextMoveWin = array_intersect($nextNodeIDs, $player['endnodeids']);

        if (count($nextMoveWin) > 0 && count($player['goals']) == 0) {
            return array(reset($nextMoveWin)); //player has won
        }

        $stopsLocations = scUtility::getStopsLocations($stops);

        foreach ($nextNodeIDs as $nextNodeID) {
            //Before checking which nodes are legit 2nd nodes, if this node contains a stop
            //in the player's goals, remove it so the routing works to find the 2nd node! 
            //This fixes the case where the player must move two and the first tile is a stop in the goal list.

            $stopAtNode = scUtility::getStopAtNode($nextNodeID, $stopsLocations);
            $origGoals = $player['goals'];
            if ($stopAtNode != null) {
                $player['goals'] = array_diff($player['goals'], array($stopAtNode));
            }

            $secondMoveNodes = $this->moveAheadOne($nextNodeID, $player, $stops);
            $possibleMoves = array_merge($possibleMoves, $secondMoveNodes);

            //restore original goals.
            $player['goals'] = $origGoals;
        }

        return $possibleMoves;
    }

    public function moveToNextStation($curTrainNodeID, $player, $stops)
    {

        //step 1 - make a copy of connectivity graph
        $connectivityGraphCopy = new scConnectivityGraph($this->game);

        //step 2a - compile list of possible next station nodes
        $stationNodes = [];
        $stopsLocations = scUtility::getStopsLocations($stops);
        foreach ($stopsLocations as $stopLocation) {
            if ($stopLocation != null) {
                //add all 4 nodes at this location to stop list
                foreach (scUtility::$NESW as $direction) {
                    $stationNodes[] = scUtility::xyd2NodeID($stopLocation['x'], $stopLocation['y'], $direction);
                }
            }
        }

        $terminalIDs = scUtility::getTerminalIDs($this->game);
        foreach ($terminalIDs as $ID => $irrelevant) {
            //add all 4 nodes at this terminal to stop list
            foreach (scUtility::$NESW as $direction) {
                $stationNodes[] = $ID . '_' . $direction;
            }
        }

        //step 2b
        //if the train is on a station, do not break connections from it.
        //remove the station node train is currently on from the list of station nodes.

        foreach ($stationNodes as $idx => $stationNode) {
            $sXYD = scUtility::nodeID2xyd($stationNode);
            $tXYD = scUtility::nodeID2xyd($curTrainNodeID);
            if ($sXYD['x'] == $tXYD['x'] && $sXYD['y'] == $tXYD['y'] && $sXYD['d'] == $tXYD['d']) {
                unset($stationNodes[$idx]);
            }
        }
        //step 2c - Alter connectivity graph to end at terminals or stops
        foreach ($connectivityGraphCopy->connectivityGraph as $node => $children) {
            if (in_array($node, $stationNodes)) {
                //terminate this node here.
                $connectivityGraphCopy->connectivityGraph[$node] = [];
            }
        }

        //step 3 - run shortest path to all stops and terminals.
        $routesToStations = [];
        $routeFinder = new scRouteFinder($connectivityGraphCopy);
        foreach ($stationNodes as $stationNode) {
            $route = $routeFinder->findShortestRoute($curTrainNodeID, $stationNode);
            if (!$route->isEmpty()) {
                $routesToStations[] = $route;
            }
        }

        //step 4 - From all stops and terminals accessable, run from node to end.

        //$cGraph = new scConnectivityGraph($this->game); // create a non-altered connectivity graph
        $routeFinder = new scRouteFinder($this->game->cGraph);


        $candidateNodes = []; //This is an array of the form $x_$y => [$d => length of route to end] - reasoning explained below.

        //store all the routesToStations as JSON in the database for retrieval for when it is time to move the train
        $this->game->globals->set(PRECALCULATED_ROUTES, json_encode($routesToStations));
        foreach ($routesToStations as $route) {
            //endNodes of these routes are candidates for next destination
            $candidateRoutes = $routeFinder->findRoutesFromNode($route->endNodeID, $player, $stopsLocations, $this->game);
            $candidateRoutes = scRoute::getShortestRoutes($candidateRoutes);

            //while the findRoutesFromNode returns multiple routes, if there are any complete routes, only complete shortest routes will be returned.
            //Thus, we only need to check the first route.
            if ($candidateRoutes != null && count($candidateRoutes) > 0 && $candidateRoutes[0]->isComplete) {
                //*IF* the given tile (x_y) is already a candidate, we must choose between the NESW nodes to return.
                //This will be node with the shortest route to the end.
                $endNodeXYD = scUtility::nodeID2xyd($route->endNodeID);
                $xyKey = scUtility::xy2key($endNodeXYD['x'], $endNodeXYD['y']);
                if (isset($candidateNodes[$xyKey])) {
                    //one of the nodes at this xy is already a $destinationnode
                    //if this new node has a shorter route, replace the old node with this one (which will have a different d).
                    if ($candidateRoutes[0]->getLength() < reset($candidateNodes[$xyKey])) {
                        $candidateNodes[$xyKey] = [$endNodeXYD['d'] => $candidateRoutes[0]->getLength()];
                    }
                } else {
                    $candidateNodes[$xyKey] = [$endNodeXYD['d'] => $candidateRoutes[0]->getLength()];
                }
            }
        }

        //create destination nodes list
        $destinationNodes = [];
        foreach ($candidateNodes as $xyKey => $dPlusLen) {
            $destinationNodes[] = $xyKey . '_' . array_key_first($dPlusLen);
        }

        //step 5 - the routes that complete are locations available
        return $destinationNodes;
    }

    public function moveToPreviousStation($player)
    {
        return [$player['laststopnodeid']];
    }
}
