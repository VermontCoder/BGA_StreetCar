<?php

require_once('scUtility.php');
/**
 * Stores connectivity information for the current board. Is created at time of construction
 * @property array $board This is a complete copy of the board table with a _ delimited ID as key.
 * @property mixed $game we need stuff from game to construct the connectivity graph.
 * @property array $connectivtyGraph - key: x_y_d, value: array of ids which are reachable from x_y_d
 */

class scConnectivityGraph 
{
  public $board;
  private $game;
  public $connectivityGraph;
  
  function __construct($game) 
  {
    $this->game = $game;
    $this->board = $this->processBoard($game->getBoardAsObjectList());
    $this->connectivityGraph = $this->constructGraph();
  }


  
  /** This function takes the board object list and creates an associative array keyed on "x_y" from the data. 
  * It also casts columns into ints where appropriate. 

  * If a board space doesn't have a track in it, it doesn't appear in this board version. 
  * @param array $startBoard
  */
  
  private function processBoard($startBoard)
  {
    $newBoard =[];

    for ($i=0; $i < count($startBoard); $i++)
    {
        $oldRow = $startBoard[$i];
        
        //do not process empty squares.
        if ($oldRow['directions_free']=='[]') continue;

        $newRow = array(
            'x'=> intval($oldRow['x']),
            'y'=> intval($oldRow['y']),
            'directions_free' => $oldRow['directions_free'],
            'card' => intval($oldRow['card']),
            'rotation' => intval($oldRow['rotation']),
        );
        $newBoard[$oldRow['x'].'_'.$oldRow['y']] = $newRow;
    }

    return $newBoard;
  }

  /**  The connectivity graph is an array. Each tile on the board can have up to 4 nodes in the array, one for 
  * each direction of entrance into the tile. So if a tile has two sides of access, there will be 2 nodes. 
  * Nodes in the connectivityGraph are denoted x_y_s, where x & y are the tile coordinates, and s is the side of the tile from which 
  * the route is entering the tile. 

  * The node ID is the key in the connectivity graph. The values are the other nodes that can be reached from that node.
  * If there are no nodes to go to, the values are null. 
  */
  
  private function constructGraph()
  {
    $connectivityGraph = [];

    foreach($this->board as $locationID =>$data)
    {
        //retrieve connectivity info for this track and orientation.
        $dataIdx = $data['rotation']/90;
        $card = $data['card'];
        $connectivityInfo = $this->game->tracks[$card][$dataIdx];

        //Iterate through connectivityInfo, creating nodes based on it
        foreach($connectivityInfo as $enteringDirection => $exitingDirections)
        {
            //skip directions with no exit
            if ($exitingDirections == '') continue;
            $curNodeID = $locationID.'_'.$enteringDirection;

            $connectivityGraph[$curNodeID] = [];

            foreach (str_split($exitingDirections) as $exitingDirection) 
            {
                $targetCoords = scUtility::getCoordsOfTileInDirection($exitingDirection, $data['x'], $data['y']);
                $targetID = scUtility::xy2key($targetCoords['x'],$targetCoords['y']);
                
                if (isset($this->board[$targetID]))
                { 
                    $targetNodeID = $targetID.'_'.scUtility::get180($exitingDirection);
                    $connectivityGraph[$curNodeID][] = $targetNodeID;
                }
            }
        }
        //$this->game->dump('connectivity', $connectivityInfo);
    }

    //done, save it to object.
    return $connectivityGraph;
  }

  /**
   * Determines if a node is potentially reachable. 
  */
  public function isNodeConnected($nodeID)
  {
    if (isset($this->connectivityGraph[$nodeID]))
    {
      return true;
    }

    //The above finds nodes which have children.
    //But if the node we are looking for has no children it won't be there.
    //So check for the presence of this node in the children of the tile adjacent to this node in the direction of the id.
    
    $xy = scUtility::key2xy($nodeID);
    $direction = substr($nodeID, -1);
    $adjacentTile = scUtility::getCoordsOfTileInDirection($direction,$xy['x'],$xy['y']);

    foreach(scUtility::$NESW as $parentDirection)
    {
      $parentNodeID = scUtility::xy2key($adjacentTile['x'],$adjacentTile['y']).'_'.$parentDirection;

      if (!isset($this->connectivityGraph[$parentNodeID]))
      {
        //this ID isn't in the connectivity graph
        continue;
      }

      if (in_array($nodeID,$this->connectivityGraph[$parentNodeID]))
      {
        return true;
      }
    }

    return false;
  }

  /**
   * @return array nodes Connected to this node.
   */
  public function getChildNodes($nodeID)
  {
    return $this->connectivityGraph[$nodeID];
  }

  public function test() {
    $this->game->dump('Dump: ',$this->connectivityGraph);
  }
  
}