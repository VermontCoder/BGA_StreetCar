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
    private $scRouteFinder;

    function __construct($game) 
    {
        $this->game = $game;
        $this->scRouteFinder = new scRouteFinder($game->cGraph);
    }

    public function getTrainMoves($player,$die)
    {
        return ['2_2_S','10_3_E'];
    }
}