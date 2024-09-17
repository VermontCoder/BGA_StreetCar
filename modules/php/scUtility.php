<?php

/** Static Class to Hold Generally useful functions */
class scUtility
{
  public static $NESW = ['N','E','S','W'];
  private static $unplayableIDs = [];
  private static $terminalIDs=[];
  
  /**
   * @param string $direction NSEW
   * @return string returns direction opposite $direction parameter.
   */
  
  public static function get180($direction)
  {
      switch($direction)
      {
          case "N": return "S";
          case "E": return "W";
          case "S": return "N";
          case "W": return "E";
      }
  }

  /**
  * @param string $direction NSEW
  * @return integer returns degrees version of $direction parameter.
  */
  public static function getDegrees($direction)
  {
    switch($direction)
      {
          case "N": return 0;
          case "E": return 90;
          case "S": return 180;
          case "W": return 270;
      }
  }

  /**
   * @param string $direction NESW
   * @param integer $startTileX
   * @param integer $startTileY
   * @return array x and y as keys, their values as values.
   */
  public static function getCoordsOfTileInDirection($direction, $startTileX, $startTileY)
  {
    switch($direction)
    {
        case "N": return array('x'=>$startTileX,'y'=>$startTileY-1);
        case "E": return array('x'=>$startTileX+1,'y'=>$startTileY);
        case "S": return array('x'=>$startTileX,'y'=>$startTileY+1);
        case "W": return array('x'=>$startTileX-1,'y'=>$startTileY);;
    }  
  }
/** 
  * @param integer $startTileX
  * @param integer $startTileY
  * @param integer $endTileX
  * @param integer $endTileY
  * @return string direction - NESW.
  */
  public static function getDirectionOfTileFromCoords($startTileX, $startTileY, $endTileX, $endTileY)
  {
    foreach(scUtility::$NESW as $direction)
    {
      $candidateCoords = scUtility::getCoordsOfTileInDirection($direction, $startTileX, $startTileY);
      if ($candidateCoords['x'] == $endTileX && $candidateCoords['y']==$endTileY)
      {
        return $direction;
      }
    }
  }

  /**
   * Get xy from key\
   * @return array x and y as keys, their values as values.
   */
  public static function key2xy($key)
  {
    $split = explode ("_", $key);
    return array('x' => intval($split[0]), 'y'=>intval($split[1]));
  }

  /**
   * Key from xy
   * @return string key
   */
  public static function xy2key($x,$y)
  {
    return $x.'_'.$y;
  }

  /**
   * @return array x y and d as keys, their values as values.
   */
  public static function nodeID2xyd($nodeID)
  {
      $split = explode ("_", $nodeID);
      return array('x' => intval($split[0]), 'y'=>intval($split[1]), 'd'=> $split[2]);
  }

  public static function xyd2NodeID($x, $y, $d)
  {
    return $x.'_'.$y.'_'.$d;
  }

  /**
   * returns locations of stops if they have been assigned to a tile.
   * @param array $stops x =>y=> stop array of all tiles. - from BOARD.
   * @return array Key: stop letter, value array 'x'=xCol and 'y'=yCol or null if not assigned to tile yet.
   */
  public static function getStopsLocations($stops)
  {
    $stopLocations =[];
    foreach($stops as $x => $yArray)
      foreach($yArray as $y => $stop)
      {
        if ($stop != null)
        {
          $stopLocations[$stop] = array('x' => $x, 'y' => $y);
        }
      }
    
    foreach (str_split("ABCDEFGHIJKLM") as $char) 
    {
      if (!isset($stopLocations[$char])) $stopLocations[$char] = null;
    }

    return $stopLocations;
  }

  /**
   * get numDice number of six sided dice.
   * @param integer $numDice
   */
  public static function rollDice($numDice)
  {
    $thrown = array();
    for ($i = 0; $i < $numDice; $i++) {
        array_push($thrown, random_int(1, 6));
    }

    return $thrown;
  }

  /**
   * Determines if a coordinate lands in the unplayable border area.
   * @param integer $x
   * @param integer $y
   * @param mixed $game this from game.php
   * @return bool
   */
  public static function isUnplayable($x, $y, $game)
  {
    //so we don't recalculate over and over, just figure this out once.
    if (count(scUtility::$unplayableIDs) == 0)
    {
      scUtility::initializeUnplayableIDs($game);
    }

    if ($x < 0 || $x >13 || $y < 0 || $y > 13) return true;
    //$game->dump('unplayable: ',scUtility::$unplayableIDs);

    return isset(scUtility::$unplayableIDs[scUtility::xy2key($x,$y)]);
  }

  /**
   * Gets list of terminal nodes
   *  @param mixed $game this from game.php
   * @return array a list of terminal ids x_y => true;
   */

  public static function getTerminalIDs($game)
  {
    //so we don't recalculate over and over, just figure this out once.
    if (count(scUtility::$terminalIDs) == 0)
    {
      scUtility::initializeTerminalIDs($game);
    }

    return scUtility::$terminalIDs;
  }

  private static function initializeTerminalIDs($game)
  {
    foreach($game->routeEndPoints as $startAndEndPoints)
      foreach($startAndEndPoints as $listsOfEndPoints)
        foreach($listsOfEndPoints as $listOfEndPoints)
          foreach($listOfEndPoints as $endPoint)
          {
            $xy = scUtility::key2xy($endPoint);
            scUtility::$terminalIDs[scUtility::xy2key($xy['x'],$xy['y'])]=true;
          }
  }
  //** Creates a key => true list where the key is $x.'_'.$y for unplayable locations */
  private static function initializeUnplayableIDs($game)
  { 
    $terminalIDs= scUtility::getTerminalIDs($game);

    for($x=0; $x <= 13; $x++)
        for($y=0;$y <= 13; $y++)
        {
          if($x==0 || $y==0 || $x == 13 || $y==13)
          {
            if (!isset($terminalIDs[scUtility::xy2key($x,$y)]))
            {
              scUtility::$unplayableIDs[scUtility::xy2key($x,$y)]=true;
            }
          }
        }
  }

  public static function isTerminalNode($nodeID)
  {
    $xy = scUtility::key2xy($nodeID);
    return ($xy['x']==0 || $xy['y']==0 || $xy['x'] == 13 || $xy['y']==13);
  }
}

