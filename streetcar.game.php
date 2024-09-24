<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Streetcar implementation : © <Your name here> <Your email address here>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * streetcar.game.php
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

const STACK_SIZE = 100;

//globals names
const STACK_INDEX = "stackIndex";
const CUR_DIE = "curDie"; //only used to undo die selection 
const CUR_TRAIN_DESTINATIONS_SELECTION = "curTrainDestinationsSelection"; //used to remember possible destinations as a result of a die roll
const CUR_TRAIN_FACINGS_TILE_SELECTION = "curTrainFacingsTileSelection";

class Streetcar extends Table
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
        return "streetcar";
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
        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);
        $this->globals->set(CUR_TRAIN_FACINGS_TILE_SELECTION, null);

        

        $allcards = array();
        for ($i = 0; $i < 21; $i++) {
            array_push($allcards, 0);
        }
        for ($i = 0; $i < 20; $i++) {
            array_push($allcards, 1);
        }
        for ($i = 0; $i < 10; $i++) {
            array_push($allcards, 2);
            array_push($allcards, 3);
            array_push($allcards, 4);
        }
        for ($i = 0; $i < 6; $i++) {
            array_push($allcards, 5);
            array_push($allcards, 6);
            array_push($allcards, 7);
        }
        for ($i = 0; $i < 4; $i++) {
            array_push($allcards, 8);
            array_push($allcards, 9);
        }
        for ($i = 0; $i < 2; $i++) {
            array_push($allcards, 10);
            array_push($allcards, 11);
        }
        shuffle($allcards);

        $sql_values = array();
        $stack = array_slice($allcards, 1);
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
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, available_cards, linenum, goals, goalsfinished, trainposition, traindirection, endnodeids, dice, diceused) VALUES ";
        $values = array();
        $cardindex = 0;
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $linenum = $start[$cardindex];
            $goalnum = $goalsIdx[$cardindex];

            //goals will appear in database as JSON encoded PHP array
            //$jGoals = "'".json_encode(array_values(["B","I"]))."'" ;
            $jGoals = "'".json_encode(array_values($this->goals[$goalnum][$linenum-1]))."'" ;

            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "','[0,0,0,1,1]',$linenum,$jGoals,'[]',NULL,NULL, NULL,NULL,0)";
            $cardindex++;
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);

        $sql = "INSERT INTO board (board_x,board_y,directions_free) VALUES ";
        $sql_values = array();

       
        for ($x = 0; $x <= 13; $x++) {
            for ($y = 0; $y <= 13; $y++) 
            {
                if (scUtility::isUnplayable($x,$y,$this))
                {
                    $sql_values[] = "('$x','$y','X')";
                }
                else if (($x != 0) && ($y != 0) && ($x !=13) && ($y !=13))
                {
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

        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here


        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

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

        $curPlayer = $players[$current_player_id];
        $trainposition = $curPlayer['trainposition'];

        if($trainposition==null)
        {
            $result['routes'] = $this->calcRoutes($curPlayer,$this->getStops());//these stops are stops located on the board.
        }
        else
        {
            $result['routes'] =$this-> calcRoutesFromTrainPositionAndDirection($curPlayer,$this->getStops());
        }

        //only relevant when choosing the train start location (one time).
        $result[CUR_TRAIN_DESTINATIONS_SELECTION] = $this->globals->get(CUR_TRAIN_DESTINATIONS_SELECTION);
    
        //only relevant when choosing train facing.
        $result[CUR_TRAIN_FACINGS_TILE_SELECTION] = $this->globals->get(CUR_TRAIN_FACINGS_TILE_SELECTION); 

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

        return 0;
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////
    
    //@return array
    function getPlayers()
    {
        $players = self::getObjectListFromDB("SELECT player_no play, player_id id, player_color color, player_name, player_score score, available_cards, linenum, traindirection,goals,goalsfinished,trainposition, endnodeids, laststopnodeid, dice, diceused
                                           FROM player");
        for($i=0;$i < count($players);$i++)
        {
            $players[$i]['goals'] = json_decode($players[$i]['goals']);
            $players[$i]['goalsfinished'] = json_decode($players[$i]['goalsfinished']);
            $players[$i]['endnodeids'] = json_decode($players[$i]['endnodeids']);
        }
        return $players;
    }

    function getPlayersWithIDKey()
    {
        //Players needs to be massaged to have an ID key. Why this wasn't done this way before eludes me.
        $p = self::getPlayers();
        
        $players =[];
        foreach ($p as $player)
        {
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
            'connectivityGraph'=> $this->cGraph->connectivityGraph,
        );
    }
    function argPlayerTurn()
    {   
        return $this->getDataToClient();
    }

    function argMoveTrain()
    {   
        return $this->getDataToClient();
    }

    function argSelectDirection()
    {
        return $this->getDataToClient();
    }   

    function stNextPlayer()
    {
        // Active next player
        $player_id = self::activeNextPlayer();
        $players = self::getPlayersWithIDKey();

        if ($players[$player_id]['trainposition'] == NULL) 
        {
            $this->gamestate->nextState('placeTrack');
        } 
        else {
            $this->gamestate->nextState('rollDice');
        }
            
    }

   
    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in streetcar.action.php)
    */

    /**
     * Actually send placed track to database and replenish hand
     * @param integer $r1 rotation of first placed track
     * @param integer $x1 x Coord of first placed track
     * @param integer $y1 y Coord of first placed track
     * @param integer $c1 cardid of first placed track
     * @param string $directions_free1 sides of placed track that have a track emerging from them. NWSE.
     * @param string $availableCards1 what cards are remaining after the placement of these cards.
     * @param integer $availableCardsOwner1 which player's deck are we looking at?
     * @param integer $r2 rotation of 2nd placed track
     * @param integer $x2 x Coord of 2nd placed track
     * @param integer $y2 y Coord of 2nd placed track
     * @param integer $c2 cardid of 2nd placed track
     * @param string $directions_free2 sides of 2nd placed track that have a track emerging from them. NWSE.
     * @param string $availableCards2 what cards are remaining after the placement of these cards.
     * @param integer $availableCardsOwner2 which player's deck are we looking at?
     */
    function placeTracks($r1, $x1, $y1, $c1, $directions_free1, $availableCards1, $availableCardsOwner1, $r2, $x2, $y2, $c2, $directions_free2, $availableCards2, $availableCardsOwner2)
    {
        $this->checkAction( 'placeTrack' );
        //available cards comes in as a comma delimited string of numbers. Convert to array
        $availableCards1 = array_map('intval',explode(',',$availableCards1));
        $availableCards2 = array_map('intval',explode(',',$availableCards2));
        
        $this->updateAndRefillAvailableCards($availableCards1, $availableCardsOwner1);

        //only update 2nd set of cards if the cards of two different players have been altered.
        if ($availableCardsOwner1 != $availableCardsOwner2)
        {
            $this->updateAndRefillAvailableCards($availableCards2, $availableCardsOwner2);
        }

        $stopToAdd = $this->addStop($x1,$y1);
        $this->insertPiece($x1,$y1,$r1,$c1, $directions_free1,$stopToAdd);

        $stopToAdd = $this->addStop($x2,$y2);
        $this->insertPiece($x2,$y2,$r2,$c2, $directions_free2,$stopToAdd);
       
        $player_name = self::getActivePlayerName();
        $stops = self::getStops();
        
        self::notifyAllPlayers('placedTrack', clienttranslate('${player_name} placed tracks.'), array(
            'player_name' =>$player_name,
            'board' => self::getBoard(),
            'tracks' => self::getTracks(),
            'rotations' => self::getRotation(),
            'stops' => $stops,
        ));

        $players = self::getPlayers();
        $this->cGraph = new scConnectivityGraph($this);

        foreach($players as $player)
        {
            $routes = null;
            if($player['trainposition']==null)
            {
                $routes = $this->calcRoutes($player,$stops);//these stops are stops located on the board.
            }
            else
            {
                $routes =$this-> calcRoutesFromTrainPositionAndDirection($player,$stops);
                //$routes =$this->calcRoutesFromNode( $player['trainposition'], $player,$stops);//these stops are stops located on the board.
            }
            
            self::notifyPlayer($player['id'],'updateRoute','',
            array(
                'player_id' =>$player['id'],
                'routes' => $routes,
            ));
        }

        //goto next player
        $this->gamestate->nextState('nextPlayer');
    }

    function placeTrain($linenum,$trainStartNodeID,$trainEndNodeID)
    {
        $player_id = self::getActivePlayerId();

        //based on start node, find direction
        $trainLoc = scUtility::key2xy($trainStartNodeID);

        $traindirection = '';
        if ($trainLoc['x'] == 0 ) { $traindirection = 'E';}
        if ($trainLoc['y'] == 0 ) { $traindirection = 'S';}
        if ($trainLoc['x'] == 13 ) { $traindirection = 'W';}
        if ($trainLoc['y'] == 13 ) { $traindirection = 'N';}

        //the train could end at either of the two endpoints. Get the missing endpoint from materials.inc.
        //save the two endpoints as string with comma separator.
        $trainEndNodeIDs = '';
        
        $nodes = $this->routeEndPoints[((int)$linenum)]['end'];
        if ($nodes[0][0] == $trainEndNodeID) { $trainEndNodeIDs= [$trainEndNodeID,$nodes[0][1]]; }
        if ($nodes[0][1] == $trainEndNodeID) { $trainEndNodeIDs = [$trainEndNodeID,$nodes[0][0]]; }
        if ($nodes[1][0] == $trainEndNodeID) { $trainEndNodeIDs = [$trainEndNodeID,$nodes[1][1]]; }
        if ($nodes[1][1] == $trainEndNodeID) { $trainEndNodeIDs = [$trainEndNodeID,$nodes[1][0]]; }

        //$this->dump('nodes',$nodes);
      

        $sql = "UPDATE `player` SET trainposition='".$trainStartNodeID."', traindirection='".$traindirection."', endnodeids='".json_encode(array_values($trainEndNodeIDs))."', laststopnodeid='".$trainStartNodeID."' where player_id=".$player_id;
        self::DbQuery($sql);

        self::notifyAllPlayers('placedTrain', clienttranslate('${player_name} placed a train.'), array(
            'player_name' =>self::getActivePlayerName(),
            'player_id' => $player_id,
            'linenum' => $linenum,
            'trainStartNodeID' => $trainStartNodeID,
            'traindirection' => $traindirection,
        ));
        $this->gamestate->nextState('nextPlayer');
    }

    function rollDice()
    {
        $this->checkAction( 'rollDice' );
        $player_id = self::getActivePlayerID();
        
        //get number of dice to throw
        $sql = "SELECT diceused FROM player WHERE player_id = " . $player_id . ";";
        $diceUsed = (int)self::getUniqueValueFromDB($sql);

         // set dice for this turn
        $throw = scUtility::rollDice(3-$diceUsed);
        $sql = "UPDATE player SET dice = '" . json_encode(array_values($throw)) . "' WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);

        self::notifyAllPlayers('rolledDice', clienttranslate('${player_name} rolled dice.'), array(
            'player_name' =>self::getActivePlayerName(),
            'player_id' => $player_id,
            'throw' => $throw,
        ));

        $this->gamestate->nextState('selectDie');
    }

    function selectDie($dieIdx,$die)
    {
        $this->checkAction( 'selectDie' );
        $player_id = self::getActivePlayerID();
        $players = $this->getPlayersWithIDKey();
        $player = $players[$player_id];

        $dice= json_decode($player['dice']);
       
        if ($dice[(int)$dieIdx] == (int)$die)
        {
            unset($dice[(int)$dieIdx]);
        }
        else
        {
            throw new BgaSystemException( "Die Selected is Not Possible." );
        }

        $sql = "UPDATE player SET dice='".json_encode(array_values($dice))."', diceused= diceUsed+1 WHERE player_id = " . $player_id . ";";
    
        self::DbQuery($sql);

        //TO DO - get possible moves for this dice selection. For now, stub it out.
        $trainDestinationsSolver = new scTrainDestinationsSolver($this);
        $possibleTrainMoves = $trainDestinationsSolver->getTrainMoves($player,$die);
        
        //$possibleTrainMoves = ['0_0_N','2_1_W'];
        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, $possibleTrainMoves);
        $this->globals->set(CUR_DIE,(int)$die);

        self::notifyAllPlayers('selectedDie', clienttranslate('${player_name} selected die.'), array(
            'player_name' =>self::getActivePlayerName(),
            'player_id' => $player_id,
            'die' => $die,
            'possibleTrainMoves' => $possibleTrainMoves,
        ));
        
        $this->gamestate->nextState('moveTrain');
    }

    function chooseDifferentDie()
    {
        //put die back.
        $this->checkAction('chooseDifferentDie');

        $player_id = self::getActivePlayerID();
        $sql = "SELECT dice FROM player WHERE player_id = " . $player_id . ";";
        
        $dice= json_decode(self::getUniqueValueFromDB($sql));
        $dice[] = intval($this->globals->get(CUR_DIE));

        $sql = "UPDATE player SET dice='".json_encode(array_values($dice))."', diceused= diceUsed-1 WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);

        //clear out saved state for possible Train Moves
        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);
        
        $this->gamestate->nextState('selectDie');
    }

    function doneWithTurn()
    {
        //player has decided to end dice throwing
        $this->checkAction(('doneWithTurn'));
        $player_id = self::getActivePlayerID();
        $sql = "UPDATE player SET dice = NULL, diceused=0 WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);
        self::notifyAllPlayers('doneWithTurn', clienttranslate('${player_name} has finished their turn.'), array(
            'player_name' =>self::getActivePlayerName(),
        ));

        //clear out saved state
        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);
        $this->globals->set(CUR_TRAIN_FACINGS_TILE_SELECTION, null);
        $this->globals->set(CUR_DIE,null);
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
        $routesAndDirection = $trainDestinationsSolver->moveTrainToDestination($destinationNode,$player,$stops);

        self::notifyAllPlayers('moveTrain', clienttranslate('${player_name} has moved their train.'), array(
            'player_name' =>self::getActivePlayerName(),
            'player_id' => $player_id,
            'nodeID' => $destinationNode,
            'traindirection' => $routesAndDirection['direction'],
            'linenum' => $player['linenum'],
            'routes' => $routesAndDirection['routes'],
            'moveRoute' => $routesAndDirection['moveRoute'],
            CUR_TRAIN_FACINGS_TILE_SELECTION => $routesAndDirection[CUR_TRAIN_FACINGS_TILE_SELECTION],
        ));

        $this->globals->set(CUR_TRAIN_DESTINATIONS_SELECTION, null);
        $this->globals->set(CUR_DIE,null);

        //check for win condition!!!!

        if (in_array($destinationNode, $player['endnodeids']))
        {
            //game is over
            $this->notifyAllPlayers( "endOfGame",
    			clienttranslate( '${player_name} wins the game!' ),
    			array(
    					"player_name" => $this->getActivePlayerName(),
    					"player_id" => $player_id,
    					"score_delta" => 1,
    			)
   			);

            $this->gamestate->nextState('gameEnd');
            return;
        }

        //check if we need to offer the user a choice of directions

        if (count($routesAndDirection[CUR_TRAIN_FACINGS_TILE_SELECTION])>1)
        {
            $this->globals->set(CUR_TRAIN_FACINGS_TILE_SELECTION, $routesAndDirection[CUR_TRAIN_FACINGS_TILE_SELECTION]);
            $this->gamestate->nextState('selectDirection');
            return;
        }

         //We're done with the selection and the die.
        $this->determineNextStateFromDice($player_id);
    }

    public function selectTrainDirection($direction)
    {
        $this->checkAction(('selectTrainDirection'));
        
        $player_id = self::getActivePlayerID();
        $sql = "UPDATE player SET traindirection='".$direction."' WHERE player_id = ".$player_id . ";";
        self::DbQuery($sql);

        $this->globals->set(CUR_TRAIN_FACINGS_TILE_SELECTION, null);

        $player = self::getPlayersWithIDKey()[$player_id];
        $stops = self::getStops();

        //update player for next function call
        $player['traindirection'] = $direction;

        //find the route from the new direction.
        $routes = $this-> calcRoutesFromTrainPositionAndDirection($player,$stops);

        self::notifyAllPlayers('selectDirection', clienttranslate('${player_name} has choosen a direction to face their train.'), array(
            'player_name' =>self::getActivePlayerName(),
            'player_id' => $player_id,
            'traindirection' => $direction,
            'linenum' => $player['linenum'],
            'routes' => $routes,
        ));

        $this->determineNextStateFromDice($player_id);
    }

    public function determineNextStateFromDice($player_id)
    {
        $sql = "SELECT diceused FROM player WHERE player_id = " . $player_id . ";";
        $diceUsed= (int)self::getUniqueValueFromDB($sql);

       if ($diceUsed == 3)
       {
           $this->doneWithTurn();
       }
       else
       {
           $this->gamestate->nextState('rollDice');
       }
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
    function calcRoutes($player,$stops)
    {
        $stopsLocations = scUtility::getStopsLocations($stops);

        $routeFinder = new scRouteFinder($this->cGraph);
        $routes = $routeFinder->findRoutesForPlayer($player,$stopsLocations,$this);
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
    function calcRoutesFromNode($nodeID,$player,$stops)
    {
        $stopsLocations = scUtility::getStopsLocations($stops);
        $routeFinder = new scRouteFinder($this->cGraph);

        $routes = $routeFinder->findRoutesFromNode($nodeID,$player,$stopsLocations,$this);
        return scRoute::getShortestRoutes($routes);
    }

    /**
     * Gets the route from the trainposition as far as it can based on connected stops AND assuming the first node of the route is in the direction the train is pointing.
     * IMPORTANT: Do not call $this->getCurrentPlayerID() on game setup. Throws an error.
     * So do not call it then.
     * 
     * @param string $nodeID starting node.
     * @param array $stops from self::getStops()
     * @param array $player FULL player information.
     * @return array scRoute::scRoute Shortest routes (in array) 
     */
    function calcRoutesFromTrainPositionAndDirection($player,$stops)
    {

        $trainDestinationsSolver = new scTrainDestinationsSolver($this);

        //normally moveAheadOne is called for die rolls which expects an array of locations which it is possible to move.
        //So the return here is an array of one. We extract it.
        $nodeInDirection = $trainDestinationsSolver -> moveAheadOne($player['trainposition'],$player)[0];

        $routes = $this->calcRoutesFromNode($nodeInDirection,$player,$stops);
        
        foreach($routes as $route)
        {
            $route->newStartNode($player['trainposition']);
        }

        return scRoute::getShortestRoutes($routes);
    }

    function updateAndRefillAvailableCards($available_cards, $player_id)
    {
        $newHand = $this->refillHand($available_cards);
        $sql = "UPDATE player SET  available_cards = '" . json_encode(array_values($newHand)) . "' WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);      
    }

    function refillHand($available_cards)
    {
        $stackindex =  intval($this->globals->get(STACK_INDEX));
        $stack = self::getStack();

        $numNewCards = 5 - count($available_cards);

        //check for stack depletion - modify $numNewCards to reflect if the stack is depleted.
        if ($stackindex+$numNewCards >= STACK_SIZE)
        {
            $numNewCards = STACK_SIZE - $stackindex;
        }

        $stackindex += $numNewCards;
        $this->globals->set(STACK_INDEX,$stackindex);

        //check if we need to refill - stack index will continue to rise even after stack depleted, leading to negative $numNewCards.
        //when that happens, just don't do any refill.
        if ($numNewCards <= 0) return $available_cards;
       

        for ($i = 0; $i < $numNewCards; $i++) 
        {
            $card = array_shift($stack); 
            $available_cards[] = $card;
        }
        
        $sql = "DELETE FROM `stack` WHERE id <" . $stackindex;
        self::DbQuery($sql);
        
        
        return $available_cards;
    }

    function addStop($x,$y)
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

    function insertPiece($x,$y ,$r ,$c ,$directions_free,$stopToAdd)
    {
        //TBD change to update
        $stopToAdd = $stopToAdd == null ? 'NULL' : "'$stopToAdd'";
        $sql_values = array();
        $sql = "INSERT INTO board (board_x,board_y,rotation, card, directions_free, stop) VALUES ";
        $sql_values[] = "($x,$y ,$r ,$c ,'$directions_free',$stopToAdd)";
        $sql .= implode(',', $sql_values);
        $sql .= " ON DUPLICATE KEY UPDATE rotation= VALUES(rotation), card = VALUES(card), directions_free = VALUES(directions_free), stop = VALUES(stop)";
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
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //


    }
}
