<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Streetcar implementation : © David Felcan dfelcan@gmail.com, Stefan van der Heijden axecrazy@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * streetcar.action.php
 *
 * Streetcar main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/streetcar/streetcar/myAction.html", ...)
 *
 */


class action_streetcar extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if (self::isArg('notifwindow')) {
      $this->view = "common_notifwindow";
      $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
    } else {
      $this->view = "streetcar_streetcar";
      self::trace("Complete reinitialization of board game");
    }
  }

  //public function placeTracks()
  public function placeTrack()
  {
    self::setAjaxMode();
    $r1 = self::getArg("r1", AT_posint, true);
    $x1 = self::getArg("x1", AT_posint, true);
    $y1 = self::getArg("y1", AT_posint, true);
    $c1 = self::getArg("c1", AT_posint, true);
    $directions_free = self::getArg("directions_free", AT_alphanum, true);
    $availableCards = self::getArg("availableCards",AT_numberlist, true);
    $availableCardsOwner = self::getArg("availableCardsOwner", AT_posint, true);
    
    $this->game->placeTrack($r1, $x1, $y1, $c1, $directions_free, $availableCards, $availableCardsOwner);//, $r2, $x2, $y2, $c2, $directions_free2, $availableCards2, $availableCardsOwner2);
    self::ajaxResponse();
  }

  public function placeTrain()
  {
    $trainStartNodeID = self::getArg('trainStartNodeID', AT_alphanum,true);
    $linenum = self::getArg('linenum', AT_posint,true);
    $trainEndNodeID = self::getArg('trainEndNodeID', AT_alphanum, true);

    $this->game->placeTrain($linenum,$trainStartNodeID,$trainEndNodeID);
    self::ajaxResponse();
  }

  public function rollDice()
  {
    $this->game->rollDice();
    self::ajaxResponse();
  }

  public function doneWithTurn()
  {
    $this->game->doneWithTurn();
    self::ajaxResponse();
  }

  public function selectDie()
  {
    self::setAjaxMode();
    $dieIdx = self::getArg("dieIdx", AT_posint,true);
    $die = self::getArg("die", AT_posint, true );
    $this->game->selectDie($dieIdx,$die);
    self::ajaxResponse();
  }

  public function selectTrainDestination()
  {
    $destinationNode = self::getArg("destinationNode",AT_alphanum, true);
    $this->game->selectTrainDestination($destinationNode);
    self::ajaxResponse();
  }

  public function selectTwoSpaceMoveRoute()
  {
    $routeIdx = self::getArg("routeIdx", AT_posint, true);
    $this->game->selectTwoSpaceMoveRoute($routeIdx);
    self::ajaxResponse();
  }

  public function undo()
  {
    $this->game->undo();
    self::ajaxResponse();
  }


}
