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

    function __construct($game) 
    {
        $this->game = $game;
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
        $retRoutes = [];

        //get adjacent connected nodes
        $connectedNodes = $this->game->cGraph->getChildNodes($curTrainNodeID);

        foreach($connectedNodes as $connectedNode)
        {
            //find if there are route(s) from this node to the end. If so, this is a possible way to go.
            $routes = $this->game->calcRoutesFromNode($connectedNode,$player,$stops);
            
            $this->game->dump('CONNECTED NODE: ', $connectedNode);
            if ($routes==null) continue; //no routes found.
            
            foreach($routes as $route)
            {
                if ($route->isComplete)
                {
                    $retNodes[] = $route->startNodeID;
                    $retRoutes[] = $route;
                }
            }

        }
        return $retNodes;
    }
}