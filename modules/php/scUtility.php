<?php

/** Static Class to Hold Generally useful functions */
class scUtility
{
  public static $NESW = ['N','E','S','W'];
  public static $unplayableIDs = [];
  
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
   * Get xy from key
   */
  public static function key2xy($key)
  {
    $split = explode ("_", $key);
    return array('x' => intval($split[0]), 'y'=>intval($split[1]));
  }

  /**
   * Key from xy
   */
  public static function xy2key($x,$y)
  {
    return $x.'_'.$y;
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
   */
  public static function isUnplayable($x, $y, $game)
  {
    //so we don't recalculate over and over, just figure this out once.
    if (count(scUtility::$unplayableIDs) == 0)
    {
      scUtility::initializeUnplayableIDs($game);
    }

    if ($x < 0 || $x >13 || $y < 0 || $y > 13) return true;
    $game->dump('unplayable: ',scUtility::$unplayableIDs);

    return isset(scUtility::$unplayableIDs[scUtility::xy2key($x,$y)]);
  }

  //** Creates a key => true list where the key is $x.'_'.$y for unplayable locations */
  private static function initializeUnplayableIDs($game)
  {
    //use the game->routeEndPoints to construct this list from edge tiles that don't have an endpoint.
    $playableIDs = [];
    foreach($game->routeEndPoints as $startAndEndPoints)
      foreach($startAndEndPoints as $listsOfEndPoints)
        foreach($listsOfEndPoints as $listOfEndPoints)
          foreach($listOfEndPoints as $endPoint)
          {
            $xy = scUtility::key2xy($endPoint);
            $playableIDs[scUtility::xy2key($xy['x'],$xy['y'])]=true;
          }

    for($x=0; $x <= 13; $x++)
        for($y=0;$y <= 13; $y++)
        {
          if($x==0 || $y==0 || $x == 13 || $y==13)
          {
            if (!isset($playableIDs[scUtility::xy2key($x,$y)]))
            {
              scUtility::$unplayableIDs[scUtility::xy2key($x,$y)]=true;
            }
          }
        }
  }
}