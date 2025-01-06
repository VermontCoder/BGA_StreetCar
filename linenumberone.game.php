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
 * linenumberone.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */


require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');
require_once('modules/php/scConnectivityGraph.php');
require_once('modules/php/scRouteFinder.php');
require_once('modules/php/scRoute.php');
require_once('modules/php/scUtility.php');
require_once('modules/php/scTrainDestinationsSolver.php');

const STACK_SIZE = 125;

//globals names
const STACK_INDEX = "stackIndex";
const CUR_DIE = "curDie";
const CUR_DIE_IDX = "curDieIdx";
const CUR_TRAIN_DESTINATIONS_SELECTION = "curTrainDestinationsSelection"; //used to remember possible destinations as a result of a die roll
const GAME_PROGRESSION = "gameProgression";
const ROUTES_TO_NEXT_STATION = "routesToNextStation";

class LineNumberOne extends Table
{
    function __construct()
    {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels(array(

            //    "my_first_global_variable" => 10,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ));
    }

    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "linenumberone";
    }

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        $this->globals->set(STACK_INDEX, 0);
        $this->globals->set(CUR_DIE, null);
        $this->globals->set(CUR_DIE_IDX, null);
        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);
        $this->globals->set(GAME_PROGRESSION, 0);
        $this->globals->set(ROUTES_TO_NEXT_STATION, null);


        $stack = array();
        for ($i = 0; $i < 24; $i++) {
            array_push($stack, 0);
        }
        for ($i = 0; $i < 23; $i++) {
            array_push($stack, 1);
        }
        for ($i = 0; $i < 13; $i++) {
            array_push($stack, 2);
            array_push($stack, 3);
        }
        for ($i = 0; $i < 12; $i++) {
            array_push($stack, 4);
        }
        for ($i = 0; $i < 8; $i++) {
            array_push($stack, 5);
            array_push($stack, 6);
            array_push($stack, 7);
        }
        for ($i = 0; $i < 5; $i++) {
            array_push($stack, 8);
            array_push($stack, 9);
        }
        for ($i = 0; $i < 3; $i++) {
            array_push($stack, 10);
            array_push($stack, 11);
        }
        shuffle($stack);

        $sql_values = array();
        $sql = "INSERT INTO stack (id, card) VALUES ";
        for ($y = 0; $y < count($stack); $y++) {
            $sql_values[] = "('$y','$stack[$y]')";
        }
        $sql .= implode(',', $sql_values);
        self::DbQuery($sql);
        $start = array();
        for ($i = 1; $i < 7; $i++) {
            array_push($start, $i);
        }
        shuffle($start);
        $goalsIdx = array();

        if (intval(count($players)) >= 4) {
            for ($i = 0; $i < 6; $i++) {
                array_push($goalsIdx, $i);
            }
        } else {
            for ($i = 6; $i < 12; $i++) {
                array_push($goalsIdx, $i);
            }
        }
        shuffle($goalsIdx);


        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, available_cards, linenum, goals, goalsfinished, trainposition, traindirection, endnodeids, dice, diceused, lasttileplacementinformation) VALUES ";
        $values = array();
        $cardindex = 0;
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $linenum = $start[$cardindex];
            $goalnum = $goalsIdx[$cardindex];

            //goals will appear in database as JSON encoded PHP array
            //$jGoals = "'".json_encode(array_values(["B","I"]))."'" ;
            $jGoals = "'" . json_encode(array_values($this->goals[$goalnum][$linenum - 1])) . "'";

            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "','[0,0,0,1,1]',$linenum,$jGoals,'[]',NULL,NULL, NULL,NULL,0,NULL)";
            $cardindex++;
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);

        $sql = "INSERT INTO board (board_x,board_y,directions_free) VALUES ";
        $sql_values = array();


        for ($x = 0; $x <= 13; $x++) {
            for ($y = 0; $y <= 13; $y++) {
                if (scUtility::isUnplayable($x, $y, $this)) {
                    $sql_values[] = "('$x','$y','X')";
                } else if (($x != 0) && ($y != 0) && ($x != 13) && ($y != 13)) {
                    $sql_values[] = "('$x','$y','[]')";
                }
            }
        }

        $sql .= implode(',', $sql_values);
        self::DbQuery($sql);

        // add border tracks.
        $sql = "INSERT INTO board (board_x,board_y,directions_free,card,rotation) VALUES ";
        $sql_values = array();

        $sql_values[] = "(2,0,'ES',1,270)";
        $sql_values[] = "(3,0,'SW',1,0)";
        $sql_values[] = "(6,0,'ES',1,270)";
        $sql_values[] = "(7,0,'SW',1,0)";
        $sql_values[] = "(10,0,'ES',1,270)";
        $sql_values[] = "(11,0,'SW',1,0)";

        $sql_values[] = "(0,2,'ES',1,270)";
        $sql_values[] = "(13,2,'SW',1,0)";
        $sql_values[] = "(0,3,'NE',1,180)";
        $sql_values[] = "(13,3,'NW',1,90)";
        $sql_values[] = "(0,6,'ES',1,270)";
        $sql_values[] = "(13,6,'SW',1,0)";
        $sql_values[] = "(0,7,'NE',1,180)";
        $sql_values[] = "(13,7,'NW',1,90)";

        $sql_values[] = "(0,10,'ES',1,270)";
        $sql_values[] = "(13,10,'SW',1,0)";
        $sql_values[] = "(0,11,'NE',1,180)";
        $sql_values[] = "(13,11,'NW',1,90)";

        $sql_values[] = "(2,13,'NE',1,180)";
        $sql_values[] = "(3,13,'NW',1,90)";
        $sql_values[] = "(6,13,'NE',1,180)";
        $sql_values[] = "(7,13,'NW',1,90)";
        $sql_values[] = "(10,13,'NE',1,180)";
        $sql_values[] = "(11,13,'NW',1,90)";


        $sql .= implode(',', $sql_values);
        self::DbQuery($sql);


        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();
        $this->undoSavepoint(); //create first savepoint

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
        $this->cGraph = new scConnectivityGraph($this);
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.

        $players = $this->getPlayersWithIDKey();
        $result['players'] = $players;
        $result['initialStops'] = $this->initialStops; //This is from materials.inc
        $result['tracks'] = $this->tracks;
        $result['goals'] = $this->goals;
        $result['routeEndPoints'] = $this->routeEndPoints;
        //added spectator check SvdH
        if (array_key_exists(intval($current_player_id), $players) !== false) {
            $curPlayer = $players[$current_player_id];
            $trainposition = $curPlayer['trainposition'];

            if ($trainposition == null) {
                $result['routes'] = $this->calcRoutes($curPlayer, $this->getStops()); //these stops are stops located on the board.
            } else {
                $result['routes'] = $this->calcRoutesFromNode($curPlayer['trainposition'], $curPlayer, $this->getStops());
            }
        }

        //only relevant when choosing the train start location (one time).
        $result[CUR_TRAIN_DESTINATIONS_SELECTION] = $this->globals->get(CUR_TRAIN_DESTINATIONS_SELECTION);

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return intval($this->globals->get(GAME_PROGRESSION));
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    //@return array
    function getPlayers()
    {
        $players = self::getObjectListFromDB("SELECT player_no play, player_id id, player_color color, player_name, player_score score, available_cards, linenum, traindirection,goals,goalsfinished,trainposition, endnodeids, laststopnodeid, dice, diceused, lasttileplacementinformation
                                           FROM player");
        for ($i = 0; $i < count($players); $i++) {
            $players[$i]['goals'] = json_decode($players[$i]['goals']);
            $players[$i]['goalsfinished'] = json_decode($players[$i]['goalsfinished']);
            $players[$i]['endnodeids'] = json_decode($players[$i]['endnodeids']);
            $players[$i]['lasttileplacementinformation'] = json_decode($players[$i]['lasttileplacementinformation']);
        }
        return $players;
    }

    function getPlayersWithIDKey()
    {
        //Players needs to be massaged to have an ID key. Why this wasn't done this way before eludes me.
        $p = self::getPlayers();

        $players = [];
        foreach ($p as $player) {
            $players[intval($player['id'])] = $player;
        }
        return $players;
    }

    function getBoardAsObjectList()
    {
        return self::getObjectListFromDB("SELECT board_x x, board_y y, directions_free, card, rotation, stop 
                                                               FROM board");
    }
    function getBoard()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, directions_free 
                                                               FROM board", true);
    }
    function getStop($s)
    {
        $res = self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, card FROM board WHERE stop ='" . $s . "'", true);
        return count($res) > 0;
    }
    function getTracks()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, card
                                                               FROM board", true);
    }
    function getRotation()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, rotation
                                                               FROM board", true);
    }
    function getStops()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, stop
                                                               FROM board", true);
    }

    function getStack()
    {
        //convert to integers
        return array_map('intval', self::getObjectListFromDB("SELECT card FROM stack", true));
    }


    function getDataToClient()
    {
        $this->cGraph = new scConnectivityGraph($this);
        $stops =  self::getStops();
        $players = self::getPlayers();

        return array(
            'players' => $players,
            'board' => self::getBoard(),
            'tracks' => self::getTracks(),
            'rotations' => self::getRotation(),
            'stops' => $stops,
            'stackCount' => STACK_SIZE - intval($this->globals->get(STACK_INDEX)),
            'connectivityGraph' => $this->cGraph->connectivityGraph,
        );
    }
    function argPlayerTurn()
    {
        return $this->getDataToClient();
    }

    function argMoveTrain()
    {
        $data = $this->getDataToClient();
        $data['curDie'] = $this->globals->get(CUR_DIE);
        $data['curDieIdx'] = $this->globals->get(CUR_DIE_IDX);

        return $data;
    }

    // called when player is about to take their next turn.
    function stNextPlayer()
    {
        // Active next player
        $player_id = self::activeNextPlayer();
        $players = self::getPlayersWithIDKey();

        if ($players[$player_id]['trainposition'] == NULL) {
                 
            $this->undoSavepoint();
            $this->gamestate->nextState('firstAction');
        } else {
            $this->gamestate->nextState('rollDice');
        }
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 

    

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in linenumberone.action.php)
    */

    /**
     * Actually send placed track to database and replenish hand
     * @param integer $r1 rotation of first placed track
     * @param integer $x1 x Coord of first placed track
     * @param integer $y1 y Coord of first placed track
     * @param integer $c1 cardid of first placed track
     * @param string $directions_free sides of placed track that have a track emerging from them. NWSE.
     * @param string $availableCards what cards are remaining after the placement of these cards.
     * @param integer $availableCardsOwner which player's deck are we looking at?
   
     */
    function placeTrack($r1, $x1, $y1, $c1, $directions_free, $availableCards, $availableCardsOwner) //, $r2, $x2, $y2, $c2, $directions_free2, $availableCards2, $availableCardsOwner2)
    {
        $this->checkAction('placeTrack');
        $isFirstAction = $this->gamestate->state()['name'] == 'firstAction';
        $players=$this->getPlayersWithIDKey();

        //available cards comes in as a comma delimited string of numbers. Convert to array
        $availableCards = array_map('intval', explode(',', $availableCards));

        $this->updateAvailableCards($availableCards, $availableCardsOwner);

        $stopToAdd = $this->addStop($x1, $y1);
        $this->insertPiece($x1, $y1, $r1, $c1, $directions_free, $stopToAdd);

        $placedTileDestination = 'square_' . scUtility::xy2key($x1, $y1);

        $placedTile = ['card' => $c1, 'rotation' => $r1, 'ownerID' => $availableCardsOwner, 'destination' => $placedTileDestination];
        $placedTiles = [];

        $player_name = self::getActivePlayerName();
        $player_id =self::getActivePlayerId();

        if (!$isFirstAction)
        {
            //we need to pull the previous information and add this to the new information
            $placedTiles = $players[$player_id]['lasttileplacementinformation'];
        }
            
        $placedTiles[] = $placedTile;    

        //record location of placed pieces in database
        $sql = "UPDATE `player` SET `lasttileplacementinformation`='".json_encode($placedTiles)."' WHERE `player_id`= ". $player_id;
        self::DbQuery($sql);

        
        $stops = self::getStops();

        //In the notify, inform the other players of which tiles were placed where for the animation
        //We are not concerned with final state from this data, that is coming across in other data field.
        

        self::notifyAllPlayers('placedTrack', clienttranslate('${player_name} a placed track.'), array(
            'player_name' => $player_name,
            'board' => self::getBoard(),
            'tracks' => self::getTracks(),
            'rotations' => self::getRotation(),
            'stops' => $stops,
            'placedTile' => $placedTile,
            'isSwap' => count($availableCards) == count(json_decode($players[$availableCardsOwner]['available_cards']))
        ));

        //this is an now an updated list of player info
        $players = self::getPlayers();

        $this->cGraph = new scConnectivityGraph($this);

        foreach ($players as $player) {
            $routes = null;
            if ($player['trainposition'] == null) {
                $routes = $this->calcRoutes($player, $stops); //these stops are stops located on the board.
            } else {
                $routes = $this->calcRoutesFromNode($player['trainposition'], $player, $stops);
            }

            self::notifyPlayer(
                $player['id'],
                'updateRoute',
                '',
                array(
                    'player_id' => $player['id'],
                    'routes' => $routes,
                )
            );
        }
       
        if ($isFirstAction)
        {
            $this->gamestate->nextState('secondAction');
        }
        else
        {
            $this->refillAllHands($players);
           
             //goto next player
             $this->giveExtraTime(self::getActivePlayerID());
             $this->gamestate->nextState('nextPlayer');
        }
    }

    function placeTrain($linenum, $trainStartNodeID, $trainEndNodeID)
    {
        $this->checkAction(('placeTrain'));
        $player_id = self::getActivePlayerId();

        //based on start node, find direction
        $trainLoc = scUtility::key2xy($trainStartNodeID);

        $traindirection = '';
        if ($trainLoc['x'] == 0) {
            $traindirection = 'E';
        }
        if ($trainLoc['y'] == 0) {
            $traindirection = 'S';
        }
        if ($trainLoc['x'] == 13) {
            $traindirection = 'W';
        }
        if ($trainLoc['y'] == 13) {
            $traindirection = 'N';
        }

        //the train could end at either of the two endpoints. Get the missing endpoint from materials.inc.
        //save the two endpoints as string with comma separator.
        $trainEndNodeIDs = '';

        $nodes = $this->routeEndPoints[((int)$linenum)]['end'];
        if ($nodes[0][0] == $trainEndNodeID) {
            $trainEndNodeIDs = [$trainEndNodeID, $nodes[0][1]];
        }
        if ($nodes[0][1] == $trainEndNodeID) {
            $trainEndNodeIDs = [$trainEndNodeID, $nodes[0][0]];
        }
        if ($nodes[1][0] == $trainEndNodeID) {
            $trainEndNodeIDs = [$trainEndNodeID, $nodes[1][1]];
        }
        if ($nodes[1][1] == $trainEndNodeID) {
            $trainEndNodeIDs = [$trainEndNodeID, $nodes[1][0]];
        }

        $sql = "UPDATE `player` SET trainposition='" . $trainStartNodeID . "', traindirection='" . $traindirection . "', endnodeids='" . json_encode(array_values($trainEndNodeIDs)) . "', laststopnodeid='" . $trainStartNodeID . "', lasttileplacementinformation = NULL where player_id=" . $player_id;
        self::DbQuery($sql);

        self::notifyAllPlayers('placedTrain', clienttranslate('${player_name} placed a train.'), array(
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'linenum' => $linenum,
            'trainStartNodeID' => $trainStartNodeID,
            'traindirection' => $traindirection,
        ));

        //once someone places their train, we are halfway through the game
        if (intval($this->globals->get(GAME_PROGRESSION)) < 50) {
            $this->globals->set(GAME_PROGRESSION, 50);
        }

        //replenish hands

        $this->refillAllHands(self::getPlayers());
        $this->gamestate->nextState('rollDice');
    }

    function rollDice()
    {
        $this->checkAction('rollDice');
        $player_id = self::getActivePlayerID();

        //get number of dice to throw
        $sql = "SELECT diceused FROM player WHERE player_id = " . $player_id . ";";
        $diceUsed = (int)self::getUniqueValueFromDB($sql);

        // set dice for this turn
        $throw = scUtility::rollDice(3 - $diceUsed);
        //testing
        //$throw = [1,4,5];
        $sql = "UPDATE player SET dice = '" . json_encode(array_values($throw)) . "' WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);

        self::notifyAllPlayers('rolledDice', clienttranslate('${player_name} rolled dice.'), array(
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'throw' => $throw,
        ));

        $this->gamestate->nextState('selectDie');
    }

    function selectDie($dieIdx, $die)
    {
        $this->checkAction('selectDie');
        $player_id = self::getActivePlayerID();
        $players = $this->getPlayersWithIDKey();
        $player = $players[$player_id];

        $this->globals->set(CUR_DIE, (int)$die);
        $this->globals->set(CUR_DIE_IDX, (int) $dieIdx);

        //clear previously stored routes in globals, if any (only on move to next station)
        $this->globals->set(ROUTES_TO_NEXT_STATION, null);

        $trainDestinationsSolver = new scTrainDestinationsSolver($this);
        $possibleTrainMoves = $trainDestinationsSolver->getTrainMoves($player, $die);

        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, $possibleTrainMoves);

        self::notifyAllPlayers('selectedDie', clienttranslate('${player_name} selected die.'), array(
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'die' => $die,
            'dieIdx' => $dieIdx,
            'possibleTrainMoves' => $possibleTrainMoves,
        ));

        $this->gamestate->nextState('moveTrain');
    }

    function doneWithTurn()
    {
        //player has decided to end dice throwing
        $this->checkAction(('doneWithTurn'));
        $player_id = self::getActivePlayerID();
        $sql = "UPDATE player SET dice = NULL, diceused=0 WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);
        self::notifyAllPlayers('doneWithTurn', clienttranslate('${player_name} has finished their turn.'), array(
            'player_name' => self::getActivePlayerName(),
        ));

        //clear out saved state
        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);
        $this->globals->set(CUR_DIE, null);
        $this->globals->set(CUR_DIE_IDX, null);

        //End of turn for die rolling.
        $this->giveExtraTime($player_id);

        //goto next player
        $this->gamestate->nextState('nextPlayer');
    }

    function selectTrainDestination($destinationNode)
    {
        $this->checkAction(('selectTrainDestination'));
        $player_id = self::getActivePlayerID();

        $player = self::getPlayersWithIDKey()[$player_id];
        $stops = self::getStops();

        $trainDestinationsSolver = new scTrainDestinationsSolver($this);

        if ($this->globals->get(CUR_DIE) >= 5) {
            $routesAndDirection = $trainDestinationsSolver->moveTrainToDestinationPrevStop($destinationNode, $player, $stops);
        } else {
            $routesAndDirection = $trainDestinationsSolver->moveTrainToDestination($destinationNode, $player, $stops);
        }

        //modify database to reflect the die selection
        $this->updateDice($player);

        self::notifyAllPlayers('moveTrain', clienttranslate('${player_name} has moved their train.'), array(
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'nodeID' => $destinationNode,
            'traindirection' => $routesAndDirection['direction'],
            'linenum' => $player['linenum'],
            'routes' => $routesAndDirection['routes'],
            'moveRoute' => $routesAndDirection['moveRoute'],
        ));

        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);

        //check for win condition!!!!

        if (scUtility::hasPlayerWon($destinationNode, $player)) {
            //game is over
            $this->notifyAllPlayers(
                "endOfGame",
                clienttranslate('${player_name} wins the game!'),
                array(
                    "player_name" => $this->getActivePlayerName(),
                    "player_id" => $player_id,
                    "score_delta" => 1,
                )
            );

            $this->globals->set(GAME_PROGRESSION, 100);
            $this->gamestate->nextState('gameEnd');
            return;
        }

        //Set game progression
        //If we are here, the game is already at least 50% done
        //Routes are typically around 50 tiles long. So 50 - the number of tiles in the remaining route + 50 is the progression.
        //But if someone is further along, don't update

        $newProgression = 50 + 50 - ($routesAndDirection['routes'][0])->getLength();
        $newProgression = $newProgression > 100 ? 100 : $newProgression;

        if ($newProgression > intval($this->globals->get(GAME_PROGRESSION))) {
            $this->globals->set(GAME_PROGRESSION, $newProgression);
        }
        //We're done with the selection and the die.
        $this->determineNextStateFromDice($player_id);
    }

    function updateDice($player)
    {
        $dice = json_decode($player['dice']);

        if ($this->globals->get(CUR_DIE_IDX) === null) //0 is NOT the same as null
        {
            throw new BgaSystemException("Die Selected is Not Possible.");
        }

        unset($dice[$this->globals->get(CUR_DIE_IDX)]);

        $sql = "UPDATE player SET dice='" . json_encode(array_values($dice)) . "', diceused= diceUsed+1 WHERE player_id = " . $player['id'] . ";";

        self::DbQuery($sql);
    }

    public function determineNextStateFromDice($player_id)
    {
        $sql = "SELECT diceused FROM player WHERE player_id = " . $player_id . ";";
        $diceUsed = (int)self::getUniqueValueFromDB($sql);
        $curDie = (int)$this->globals->get(CUR_DIE);

        $this->globals->set(CUR_DIE, null);
        $this->globals->set(CUR_DIE_IDX, null);

        //finish turn if player had to go back to station or have used all their dice.
        if ($diceUsed == 3 || $curDie >= 5) {
            $this->doneWithTurn();
        } else {
            $this->gamestate->nextState('rollDice');
        }
    }

    public function undo() {
        $this->undoRestorePoint();
        $this->gamestate->nextState('firstAction');
    }

    //*********************************************** */

    /**
     * Gets the route as far as it can based on connected stops.
     *  IMPORTANT: Do not call $this->getCurrentPlayerID() on game setup. Throws an error.
     * So do not call it then.
     * 
     * @param array $stops from self::getStops()
     * @param array $players key: data field, value: data value  - FULL player information.
     * @return array scRoute::scRoute Shortest routes (in array) 
     */
    function calcRoutes($player, $stops)
    {
        $stopsLocations = scUtility::getStopsLocations($stops);

        $routeFinder = new scRouteFinder($this->cGraph);
        $routes = $routeFinder->findRoutesForPlayer($player, $stopsLocations, $this);
        return scRoute::getShortestRoutes($routes);
    }

    /**
     * Gets the route from a node as far as it can based on connected stops.
     * IMPORTANT: Do not call $this->getCurrentPlayerID() on game setup. Throws an error.
     * So do not call it then.
     * 
     * @param string $nodeID starting node.
     * @param array $stops from self::getStops()
     * @param array $player FULL player information.
     * @return array scRoute::scRoute Shortest routes (in array) 
     */
    function calcRoutesFromNode($nodeID, $player, $stops)
    {
        $stopsLocations = scUtility::getStopsLocations($stops);
        $routeFinder = new scRouteFinder($this->cGraph);

        $routes = $routeFinder->findRoutesFromNode($nodeID, $player, $stopsLocations, $this);
        return scRoute::getShortestRoutes($routes);
    }

    function updateAvailableCards($available_cards, $player_id)
    {   
        $sql = "UPDATE player SET  available_cards = '" . json_encode(array_values($available_cards)) . "' WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);
    }

    //** This refills all hands, which should always be done after a player places tiles.
    /* @param array $players - array of players with full player information from self::getPlayers() - not self::getPlayersWithIDKey()!
    */
    function refillAllHands($players)
    {
        foreach ($players as $player) 
        {
            //refill hand
            $available_cards = json_decode($player['available_cards']);

            $newHand = $this->refillHand($available_cards);
            if ($newHand != $available_cards) {
                $this->updateAvailableCards($newHand, $player['id']);
            }
        }
    }

    function refillHand($available_cards)
    {
        $stackindex =  intval($this->globals->get(STACK_INDEX));
        $stack = self::getStack();

        $numNewCards = 5 - count($available_cards);

        //check for stack depletion - modify $numNewCards to reflect if the stack is depleted.
        if ($stackindex + $numNewCards >= STACK_SIZE) {
            $numNewCards = STACK_SIZE - $stackindex;
        }

        $stackindex += $numNewCards;
        $this->globals->set(STACK_INDEX, $stackindex);


        //check if we need to refill - stack index will continue to rise even after stack depleted, leading to negative $numNewCards.
        //when that happens, just don't do any refill.
        
        if ($numNewCards <= 0) return $available_cards;


        for ($i = 0; $i < $numNewCards; $i++) {
            $card = array_shift($stack);
            $available_cards[] = $card;
        }

        $sql = "DELETE FROM `stack` WHERE id <" . $stackindex;
        self::DbQuery($sql);

        if (intval($this->globals->get(GAME_PROGRESSION)) < 50) {
            //update game progression based on number of tiles played - but don't go over 50.

            //estimate that around 50 cards are played before a route is established.
            $this->globals->set(GAME_PROGRESSION, $stackindex < 50 ? $stackindex : 50);
        }

        return $available_cards;
    }

    function addStop($x, $y)
    {
        // find stop if near location
        $needles = [$x, $y];
        $stopToAdd = null;
        $north = array_filter($this->initialStops, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] && $var['row'] == $needles[1] - 1);
        });
        $east = array_filter($this->initialStops, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] + 1 && $var['row'] == $needles[1]);
        });
        $south = array_filter($this->initialStops, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] && $var['row'] == $needles[1] + 1);
        });
        $west = array_filter($this->initialStops, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] - 1 && $var['row'] == $needles[1]);
        });
        $found = $north + $east + $south + $west;
        if (count($found) > 0) {
            $stopToAdd = array_values($found)[0]["code"];
        }
        // see if this stop already exist
        if (self::getStop($stopToAdd)) {
            $stopToAdd = null;
        }
        return $stopToAdd;
    }

    function insertPiece($x, $y, $r, $c, $directions_free, $stopToAdd)
    {
        $this->addCardsToDBStack([]);
        //TBD change to update
        $sql_values = array();
        $sql = '';

        if ($stopToAdd == null) {
            $sql = "INSERT INTO board (board_x,board_y,rotation, card, directions_free) VALUES ";
            $sql_values[] = "($x,$y ,$r ,$c ,'$directions_free')";
        } else {
            $sql = "INSERT INTO board (board_x,board_y,rotation, card, directions_free, stop) VALUES ";
            $sql_values[] = "($x,$y ,$r ,$c ,'$directions_free','$stopToAdd')";
        }

        $sql .= implode(',', $sql_values);
        $sql .= " ON DUPLICATE KEY UPDATE rotation= VALUES(rotation), card = VALUES(card), directions_free = VALUES(directions_free)";
        if ($stopToAdd != null) {
            $sql .= ", stop = VALUES(stop)";
        }
        self::DbQuery($sql);
    }




    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    ////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    ////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */

    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player)
    {
        $statename = $state['name'];

        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');

            return;
        }

        throw new feException("Zombie mode not supported at this game state: " . $statename);
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */

    function upgradeTableDb($from_version)
    {
        if( $from_version <= 2411192022 )
        {
          // ! important ! Use DBPREFIX_<table_name> for all tables
          // test first the new column existance since it can exists from a previous call to upgradeTableDb while an undo was performed
          $result = self::getUniqueValueFromDB("SHOW COLUMNS FROM player LIKE 'lasttileplacementlocation'");
          if (empty($result))
              self::applyDbUpgradeToAllDB("ALTER TABLE DBPREFIX_player ADD `lasttileplacementlocation` VARCHAR(20) DEFAULT NULL;");
        }

        if( $from_version == 2411212045 )
        {
          // ! important ! Use DBPREFIX_<table_name> for all tables
            self::applyDbUpgradeToAllDB("ALTER TABLE DBPREFIX_player MODIFY COLUMN `lasttileplacementlocation` VARCHAR(20) DEFAULT NULL;");
        }

        if( $from_version <= 2411261625 )
        {
            //Add the new cards!
            $this->addCardsToDBStack([0,0,0,0,1,1,1,2,2,2,3,3,3,4,4,5,5,6,6,7,7,8,9,10,11]);
        }

        if( $from_version <= 2412081800 )
        {
            //Need to make column bigger to accomodate more information about lasttile.
            self::applyDbUpgradeToAllDB("ALTER TABLE DBPREFIX_player CHANGE COLUMN `lasttileplacementlocation` `lasttileplacementinformation` VARCHAR(255) DEFAULT NULL;");
        }

        if( $from_version <= 2412251232 )
        {
            //fix to make current game work.
            self::applyDbUpgradeToAllDB('UPDATE DBPREFIX_bga_globals SET `value`="[]" WHERE value = JSON_ARRAY("_13_")');
        }
    }

    /**
     * Takes an array of card values, adds them to the stack and saves it back to the database. Does not modify stack pointer or stack count.
     * 
     * @param array $newCards - array of new card ids to add
     */
    function addCardsToDBStack($newCards)
    {
        $curStack = $this->getStack();
        $newStack = array_merge($curStack, $newCards);
        shuffle($newStack);

        $stackIdx = (int)$this->globals->get(STACK_INDEX);
        $sql_values = array();

        //Destroy previous stack, replace with new one.
        self::DbQuery("DELETE from stack;");

        foreach($newStack as $card)
        {
            $sql = "INSERT INTO stack (id, card) VALUES ";
            $sql_values[] = "('$stackIdx','$card')";
            $stackIdx++;
        }
        $sql .= implode(',', $sql_values);
        self::DbQuery($sql);
    }
}
