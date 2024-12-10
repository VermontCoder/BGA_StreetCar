<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * LineNumberOne implementation : © David Felcan dfelcan@gmail.com, Stefan van der Heijden axecrazy@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * LineNumberOne game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!


$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array("" => 10)
    ),

    10 => array(
        "name" => "firstAction",
        "description" => clienttranslate('${actplayer} must play a track part.'),
        "descriptionmyturn" => clienttranslate('${you} must play a track part.'),
        "type" => "activeplayer",
        "args" => "argPlayerTurn",
        "possibleactions" => array('firstAction','placeTrain'),
        "transitions" => array("nextPlayer" => 11, "rollDice" => 12, "zombiePass" => 11)
    ),

    11 => array(
        "name" => "nextPlayer",
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => true,
        "transitions" => array("firstAction" => 10, "rollDice" => 12, "cantPlay" => 11, "endGame" => 99)
    ),
    12 => array(
        "name" => "rollDice",
        "description" => clienttranslate('${actplayer} must roll dice or end their turn.'),
        "descriptionmyturn" => clienttranslate('${you} must roll dice or end your turn.'),

        "type" => "activeplayer",
        //"action" => "stRollDice",
        "args" => "argPlayerTurn",
        "possibleactions" => array('rollDice','doneWithTurn'),
        "transitions" => array( "selectDie"=> 13, "nextPlayer" => 11, "zombiePass" => 11)
    ),
    13 => array(
        "name" => "selectDie",
        "description" => clienttranslate('${actplayer} must select a die.'),
        "descriptionmyturn" => clienttranslate('${you} must select a die.'),

        "type" => "activeplayer",
        "args" => "argPlayerTurn",
        "possibleactions" => array('selectDie'),
        "transitions" => array( "moveTrain"=> 14, "zombiePass" => 11),
    ),
    14 => array(
        "name" => "moveTrain",
        "description" => clienttranslate('${actplayer} selects the destination for their train.'),
        "descriptionmyturn" => clienttranslate('${you} must select the destination for your train.'),

        "type" => "activeplayer",
        "args" => "argMoveTrain",
        "possibleactions" => array('selectTrainDestination','selectDie','rollDice','doneWithTurn'),
        "transitions" => array("rollDice" => 12, "selectDie"=> 13, "moveTrain"=> 14, "nextPlayer"=> 11, "zombiePass" => 11,"gameEnd" => 99)
    ),

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);
