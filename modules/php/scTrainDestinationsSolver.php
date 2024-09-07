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
        $routes = $this->game->calcRoutesFromNode($curTrainNodeID,$player,$stops);

        if ($routes==null)
        {
            throw new Exception('Cannot find route for train to endpoint!');
        }

        $curRoute = $routes[0];

        //TESTING
        $die = 1;

        switch(intval($die))
        {
            case 0: //move ahead 2
                break;
            case 1: //move ahead 1
                return $this -> moveAheadOne($curRoute,$stops);
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
     * @param scRoute $curRoute
     */
    private function moveAheadOne($curRoute,$stops)
    {
        $stopslocations = scUtility::getStopsLocations(($stops));
        $routStart = $curRoute->startNodeID.'_'.$curRoute->routeID;

        $nextNodeID = $curRoute->routeNodes[$routStart];

        return [scRoute::XYDR2XYD($nextNodeID)];

    }
}