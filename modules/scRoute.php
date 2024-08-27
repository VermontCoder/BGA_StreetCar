<?php

/**
 * Stores info about a route, partial or complete.
 * @property array $routeNodes holds route in $sourceNode => $targetNode format
 * @property string $startNodeID
 * @property string $endNodeID
 * @property array $stopGoals key: Goal letter, value: x_y_d id of tile or null if stop is not on a tile yet.
 * @property bool $isComplete does this route complete the goals by connecting the start and end and traversing all the stops.
*/

class scRoute
{    
    public $routeNodes;
    public $startNodeID;
    public $endNodeID;
    public $stopGoals;
    public $isComplete;
    public $routeID;
    private static $curRouteID =0;

    function __construct($startNodeID,$endNodeID) 
    {
        $this->startNodeID = $startNodeID;
        $this->endNodeID = $endNodeID;
        $this->routeNodes = [];
        $this->stopGoals = [];
        $this->isComplete = false;
        $this->routeID = scRoute::$curRouteID;
        scRoute::$curRouteID++;
    }

    public static function getShortestRoutes($routes)
    {
        if ($routes== null || count($routes)==0) return null;
        $minLength = 10000;
        $returnRouteIdx=0;

        foreach($routes as $idx => $route)
        {
            $routeLen = $route->getLength();
            if (!$route->isEmpty() && $routeLen < $minLength)
            {
                $minLength = $routeLen;
            }
        }

        $retRoutes = [];
        foreach($routes as $route)
        {
            if ($route->getLength() == $minLength)
            {
                $retRoutes[] = $route;
            }
        }
        return $retRoutes;
    }

    public function getRouteNodes()
    {
        return $this->routeNodes;
    }

    /**
     * @return int
     */
    public function getLength()
    {
        return count($this->routeNodes);
    }

    /**
     * @return bool
     */
    public function isEmpty()
    {
        return $this->routeNodes == [];
    }

    /** 
    * To insert new Route notes, we must append the route id to the id of the nodes. 
    * ALWAYS use this function to insertRouteNodes
    */
    
    public function insertRouteNode($sourceNodeID,$targetNodeID)
    {   //$game->dump('insert flkj ', $this->routeNodes);
        $this->routeNodes[$sourceNodeID.'_'.$this->routeID] =$targetNodeID.'_'.$this->routeID;
    }

    /**
     * Modifies the current route by appending the $otherRoute.
     * Will throw an error if the last nodeID of this route does not match the first of the merged.
     * 
     * @param scRoute $otherRoute
     * @return scRoute The Merged route. This route is left unchanged.
     */
    public function merge($otherRoute)
    {
        if ($otherRoute->startNodeID != $this->endNodeID)
        {
            throw new Exception('Cannot Merge Routes with different start-end IDs: routeID: '.$this->routeID.', mergedRouteId: '.$otherRoute->routeID );
        }
        if ($otherRoute->isEmpty())
        {
            //the merged route will just be a copy of the old route.
            $mergedRoute = $this;
            return $mergedRoute;
        }

        $mergedRoute = new scRoute($this->startNodeID,$otherRoute->endNodeID);
        $mergedRoute->routeID = $this->routeID; //route will retain id of the source route.
        $mergedRoute->stopGoals = array_merge($this->stopGoals,$otherRoute->stopGoals);
        $mergedRoute->routeNodes = array_merge($this->routeNodes,$otherRoute->routeNodes);
        $mergedRoute->isComplete = ($this->isComplete || $otherRoute->isComplete);

        //IMPORTANT: For this to work, we now need to alter the last node of the original route.
        $mergedRoute->routeNodes[$this->endNodeID.'_'.$this->routeID] = $otherRoute->startNodeID.'_'.$otherRoute->routeID;
        return $mergedRoute;

    }
}