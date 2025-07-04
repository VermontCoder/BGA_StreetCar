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

    /**
     * Deserialize JSON stdObj into a route object
     */
    public static function JSON2Route($jsonObj)
    {
        $route = new scRoute($jsonObj->startNodeID,$jsonObj->endNodeID);
        $route->routeNodes = get_object_vars($jsonObj->routeNodes); //convert to array instead of object.
        $route->stopGoals = $jsonObj->stopGoals;
        $route->isComplete = $jsonObj->isComplete;
        $route->routeID = $jsonObj->routeID;

        return $route;
    }
    /**
     * Remove RouteID from route nodes
     */
    public static function truncRouteID($nodeID)
    {
        $data = scRoute::getDataFromRouteNodeID($nodeID);
        return $data['x'].'_'.$data['y'].'_'.$data['d'];
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
    {   
        $this->routeNodes[$sourceNodeID.'_'.$this->routeID] =$targetNodeID.'_'.$this->routeID;
    }

    /**
     * If route calculations are done from an adjacent routeID, as if the train had moved one square on that route,
     * we need to bring the route back one square to the originating square. This becomes the new start node.
     * 
     * NOTE: The resulting route could be invalid if the new start node is not on a route or connected to the current startnode.
     */
    public function newStartNode($newStartNode)
    {
        $this->insertRouteNode($newStartNode, $this->startNodeID);
        $this->startNodeID = $newStartNode;
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

        //IMPORTANT: For this to work, we now need to alter the last node of the original route to point to the child of the start of the other route.
        $mergedRoute->routeNodes[$this->_getLastRouteNode()] = $otherRoute->routeNodes[$otherRoute->startNodeID.'_'.$otherRoute->routeID];

        //remove the start node of the other route.
        unset($mergedRoute->routeNodes[$otherRoute->startNodeID.'_'.$otherRoute->routeID]);
        return $mergedRoute;

    }


    private function _getLastRouteNode()
    {
        if ($this->isEmpty()) return null;

        foreach($this->routeNodes as $node)
        {
            if (!isset($this->routeNodes[$node])) return $node;
        }
    }
    /**
     * Gets both the stop or terminal on the route, if present, and records a lastStopNodeID to be inserted into the database if this stop or a terminal node is passed through.
     * @return array 'stop' => stop letter on route, null if none, 'lastStopNodeID' => if there was a stop or terminal node on the route, it is recorded here, otherwise null
     */
    public function getStopOnRoute($stoplocations)
    {
        $retArray = [ 'stop' => null, 'lastStopNodeID' =>null];
        $startNodeID = $this->startNodeID.'_'.$this->routeID;

        //if there is no route, there are no stops.
        if (!isset($this->routeNodes[$startNodeID])) return $retArray;
        
        //Note - starting node is *not* included in the search, but ending one is.
        $curNode = $this->routeNodes[$startNodeID];

        while($curNode != null)
        {
            $curNodeXY = scUtility::key2xy($curNode);

            //check if this node is a stop
            foreach($stoplocations as $stopletter => $stoplocation)
            {
                if ($stoplocation != null && $curNodeXY['x']==$stoplocation['x'] && $curNodeXY['y']==$stoplocation['y'])
                {
                    $retArray['stop'] = $stopletter;
                    $retArray['lastStopNodeID'] = scRoute::XYDR2XYD($curNode);
                }
            }

            //check for terminal node
            if (scUtility::isTerminalNode(scRoute::XYDR2XYD($curNode)))
            {
                $retArray['lastStopNodeID'] = scRoute::XYDR2XYD($curNode);
            }

            if (isset($this->routeNodes[$curNode]) )
            {
                $curNode = $this->routeNodes[$curNode];
            }
            else
            {
                $curNode = null;
            }
        }

        return $retArray;
    }

    public static function getRouteNodeID($x, $y, $d, $routeNum)
    {
        return $x.'_'.'_'.$y.'_'.$d.'_'.$routeNum;
    }

    public static function getDataFromRouteNodeID($nodeID)
    {
        $data= explode('_',$nodeID);
        $retData = [];
        $retData['x'] = $data[0];
        $retData['y'] = $data[1];
        $retData['d'] = $data[2];
        $retData['routeID'] = $data[3];
        return $retData;
    }

    public static function XYDR2XYD($routeNodeID)
    {
        $data = scRoute::getDataFromRouteNodeID($routeNodeID);
        return  $data['x'].'_'.$data['y'].'_'.$data['d'];
    }
}