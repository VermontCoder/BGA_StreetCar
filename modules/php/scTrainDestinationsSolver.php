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
        //Step 1 - find routes to destination.
        $route = $this->scRouteFinder->findShortestRoute($player['trainposition'],$destinationNode);
        $this->game->dump('route:', $route);

        //Step 1a - ONLY in the case of a two space move, we must choose the route which has a stop on it. For the others, any route will do.
        //Step 2 - Note any stops or terminal nodes.
        $stopOnRoute = $route->getStopOnRoute($stopsLocations);

         //Step 2a - If a stop is on the route, check to see if it fulfills a goal. If so, modify database accordingly.
        

        $lastStopNodeID = $stopOnRoute['lastStopNodeID'];
        
        if ($stopOnRoute['stop'] != null && in_array($stopOnRoute['stop'],$player['goals']))
        {
            $newGoals= array_diff( $player['goals'], [$stopOnRoute['stop']] );//deletes stop from goals
            $newGoalsFinished = $player['goalsfinished'];
            $newGoalsFinished[] = $stopOnRoute['stop'];
            
            $sql .="goals='".json_encode(array_values($newGoals))."', goalsfinished='".json_encode(array_values($newGoalsFinished))."', ";
        }

        //Step 2b - If a stop or terminal is noted on the route, record the nodeID in the "lastStopNodeID" column for the player.
        if( $lastStopNodeID != null)
        {
            $sql .= "laststopnodeid='".$lastStopNodeID."', ";
        }
        
        //Step 3 - run a route calc from the $destinationNode to the end using calcRoutesFrom Node. Use the next node in this route to determine new direction (more than one, just pick first).

        $routes = $this->game->calcRoutesFromNode( $destinationNode, $player,$stops);
        $direction = 'N';

        $sql .= "traindirection='".$direction."' WHERE player_id = ".$player['id'] . ";";

        $this->game->DbQuery($sql);

        //step 4 - return routes and traindirection.

        return ['routes'=> $routes,'direction'=>$direction];


    }

    public function getTrainMoves($player,$die)
    {
        $curTrainNodeID = $player['trainposition'];
        $stops = $this->game->getStops();

        //TESTING
        $die = 1;

        switch(intval($die))
        {
            case 0: //move ahead 2
                break;
            case 1: //move ahead 1
                return $this -> moveAheadOne($curTrainNodeID,$player,$stops);
                break;
            case 2: //do nothing
                break;
            case 3: //proceed to next station
                break;
            case 4 || 5: //go back to previous station.
                break;
        }
        //return ['2_2_S','10_3_E'];
    }

    /**
     * @param 
     */
    private function moveAheadOne($curTrainNodeID,$player,$stops)
    {
        $retNodes =[];

        //get adjacent connected nodes
        $connectedNodes = $this->game->cGraph->getChildNodes($curTrainNodeID);

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
                    $retNodes[] = $route->startNodeID;
                }
            }

        }
        return $retNodes;
    }
}