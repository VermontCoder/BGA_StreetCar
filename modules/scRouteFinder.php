<?php

require_once('scUtility.php');
require_once('scRoute.php');

/**
 * Finds routes through the board. Connectivity Graph needs to be created beforehand.
 * 
 * @property scConnectivityGraph::scConnectivityGraph $connectivityGraph
 */
class scRouteFinder
{
    public $connectivityGraph;
    private $game;
    
    function __construct($connectivityGraph,$game) 
    {
        $this->connectivityGraph = $connectivityGraph;
        $this->game = $game;
    }

    /**
    * use BFS to find shortest path between any two nodes.
    * @param string $startNodeID nodeID in x_y_d format.
    * @param string $endNodeID nodeID in x_y_d format.
    * @return scRoute
    */
    public function findShortestRoute($startNodeID,$endNodeID)
    {
        //edges of the graph are stored as | delimited string - $$parent|$child
        $edgeQueue = new SplQueue();
        $nodesPointingBack = []; //key - destination node, value - parent node.
        $visited = []; //key - Id of nodes visited, value always true. 

        //for the BFS algorithm, the first edge is the starting node pointing to itself.
        $edgeQueue->enqueue($startNodeID.'|'.$startNodeID);

        $foundRoute = false;
        
        while (!$edgeQueue->isEmpty())
        {
            $curEdge = explode('|',$edgeQueue->dequeue());

            $parent = $curEdge[0];
            $child = $curEdge[1];

            $nodesPointingBack[$child]= $parent;

            if ($child== $endNodeID)
            {
                //We found a route!
                $foundRoute = true;
                break;
            }

            //enqueue all edges from child node that haven't been visited
            foreach($this->connectivityGraph->connectivityGraph[$child] as $childOfChild)
            {
                if (!isset($visited[$childOfChild]))
                {
                    $edgeQueue->enqueue($child.'|'.$childOfChild);
                    $visited[$childOfChild] = true;
                }
            }
            $visited[$parent] = true;
        }

        $route = new scRoute($startNodeID,$endNodeID);

        if ($foundRoute)
        {
            $curNodeID = $endNodeID;
           
            //trace back from the end node to the start node, flipping child and parent. Also insert at beginning of route, so the
            //new array starts with the startNode
            while ($curNodeID != $startNodeID)
            {
                $route->insertRouteNode($nodesPointingBack[$curNodeID], $curNodeID);
                $curNodeID = $nodesPointingBack[$curNodeID];
            }
        }
        return $route;
    }

    /**
     * @returns array<scRoute::scRoute>
     */
    private function routesFromNodeToStop($startNodeID, $stopLetter, $stopLocation)
    {
        $routes = [];
        foreach(scUtility::$NESW as $direction)
        {
            $nodeAtGoal = scUtility::xy2key($stopLocation['x'],$stopLocation['y']).'_'.$direction;
            if($this->connectivityGraph->isNodeConnected($nodeAtGoal))
            {
                $route = $this->findShortestRoute($startNodeID,$nodeAtGoal);
                if(! $route->isEmpty())
                {
                    $route->stopGoals[] = $stopLetter;
                    $routes[] = $route;
                }
            }
        }
        return $routes;
    }

    /**
     * Finds all routes for a line, complete or incomplete (to one or two of the stops).
     * @param array $routeEndPoints This is the routeEndPoints from the line, which is straight from game-> routeEndPoints
     * @param array $stopGoals key: Goal letter, value: x_y_d id of tile or null if stop is not on a tile yet.
     */
    public function findRoutesForLine($routeEndPoints, $stopGoals, $game)
    {
        //This will calculate all possible combinations of routes from every possible start node to
        //all the stop Nodes, and from there to other stop nodes. And from there possible to the third stop nodes.
        //Finally those routes will be extended to the end nodes to see if they are possible.
        $routeSet1 = [];

        //construct all routes from start positions to one of the stops

        //4 possible start locations, 2 top/left, 2 bottom/right.
        for($i=0;$i<2;$i++)
        {
            foreach($routeEndPoints['start'][$i] as $startNodeID)
            {
                //Any of the stop goals could be the next stop on shortest route.
                foreach($stopGoals as $stopLetter => $stopLocation)
                {
                    if($stopGoals[$stopLetter]==null) continue;
                    $routesToFirstStop = $this->routesFromNodeToStop($startNodeID, $stopLetter, $stopLocation);
                    foreach($routesToFirstStop as $route)
                    {
                        if (!$route->isEmpty())
                        {
                            $routeSet1[] = $route;
                        }
                    }
                }
            }
        }

        $routeSet2 = [];
        
        //run through previously calculated routes
        foreach($routeSet1 as $route)
        {   
            //only work with routes that actually connect to one of the stop goals
            if (isset($route->stopGoals[0]))
            {
                $startNodeID = $route->endNodeID;

                //route to next goal
                $remainingGoals = $stopGoals;
                $removeLetter = $route->stopGoals[0];
                unset($remainingGoals[$removeLetter]);
                
                //from this stop, we could go to either of the remaining stops, or the only next stop (if only two)
                foreach($remainingGoals as $stopLetter => $stopLocation)
                {   
                    if($stopGoals[$stopLetter]==null) continue;
                    $newRoutes = $this->routesFromNodeToStop($startNodeID, $stopLetter,$stopLocation);
                    foreach($newRoutes as $newRoute)
                    {
                        if(! $newRoute->isEmpty())
                        {
                            $routeSet2[] = $route->merge($newRoute);
                        }
                    }
                }
            }
        }

        $routeSet3 = [];
         //route the remaining routes that have two stops in them to the remaining third goal.
        if (count($stopGoals)==3)
        {
            //run through previously calculated routes - only routes that have gone through two stops will make it here
            foreach($routeSet2 as $route)
            {
                //find goal remaining for this route
                $remainingGoal = $stopGoals;
                $removeLetter1 = $route->stopGoals[0];
                $removeLetter2 = $route->stopGoals[1];
                unset($remainingGoal[$removeLetter1]);
                unset($remainingGoal[$removeLetter2]);

                //convert $remainingGoal array of one to the stopLetter and stopLocation
                $stopLetter = key($remainingGoal);
                $stopLocation = reset($remainingGoal);

                if($stopGoals[$stopLetter]==null) continue;

                $startNodeID = $route->endNodeID;
                $newRoutes = $this->routesFromNodeToStop($startNodeID, $stopLetter,$stopLocation);
                foreach($newRoutes as $newRoute)
                {
                    if(! $newRoute->isEmpty())
                    {
                        $routeSet3[] = $route->merge($newRoute);
                    }
                }
            }
        }
        else
        {
            //No 3rd stop required so just use the the routes we found before.
            $routeSet3 = &$routeSet2;
        }

        $routeSet4=[];
        //route to endPoints.
        foreach($routeSet3 as $route)
        {
            //only work with routes which have achieved all the goals
            if(count($route->stopGoals) == count($stopGoals))
            {
                $startNodeID = $route->endNodeID;
                
                //which two end goals are appropriate depends on the start of the route
                //get matching endpoint idx.
                $routeEndPointsIdx = in_array($route->startNodeID, $routeEndPoints['start'][0]) ? 0 : 1;
                
                foreach($routeEndPoints['end'][$routeEndPointsIdx] as $endNodeID)
                {
                    $newRoute = $this->findShortestRoute($startNodeID,$endNodeID);
                    if(! $newRoute->isEmpty())
                    {
                        $newRoute->isComplete = true;
                        $routeSet4[] = $route->merge($newRoute);
                    }
                }
                
            }
        }

        //return the routeset that has covered the most goals
        if(count($routeSet4) > 0) return $routeSet4;
        if(count($routeSet3) > 0) return $routeSet3;
        if(count($routeSet2) > 0) return $routeSet2;
        return $routeSet1;
    }
}