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
            "stackindex" => 10,
            "tracksplaced" => 11,

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
        self::setGameStateInitialValue('stackindex', 0);
        self::setGameStateInitialValue('tracksplaced', 0);

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
        $goals = array();

        self::trace(">>>>>PLAYERSNAUMENBRNEEN" . self::getPlayersNumber());
        if (intval(count($players)) >= 4) {
            for ($i = 1; $i < 7; $i++) {
                array_push($goals, $i);
            }
        } else {
            for ($i = 7; $i < 13; $i++) {
                array_push($goals, $i);
            }
        }
        shuffle($goals);


        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, available_cards, startposition, goals,trainposition,traveldirection, trackdone, dice, diceused) VALUES ";
        $values = array();
        $cardindex = 0;
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "','[0,0,0,1,1]',$start[$cardindex],$goals[$cardindex],'[]','',0, '[]',0)";
            $cardindex++;
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);

        $sql = "INSERT INTO board (board_x,board_y,orientation) VALUES ";
        $sql_values = array();

        for ($x = 1; $x <= 12; $x++) {
            for ($y = 1; $y <= 12; $y++) {
                $sql_values[] = "('$x','$y','[]')";
            }
        }
        $sql .= implode(',', $sql_values);
        self::DbQuery($sql);
        // add border
        $sql = "INSERT INTO board (board_x,board_y,orientation,card,rotation) VALUES ";
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

        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb($sql);
        $result['locations'] = $this->locations;
        $result['tracks'] = $this->tracks;
        $result['goals'] = $this->goals;
        $result['routepoints'] = $this->routepoints;

        // TODO: Gather all information about current game situation (visible by player $current_player_id).

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
    function getPlayers()
    {
        return self::getObjectListFromDB("SELECT player_no play, player_id id, player_color color, player_name, player_score score, available_cards, startposition, goals,trainposition,traveldirection, trackdone, dice, diceused
                                           FROM player");
    }
    function getBoard()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, orientation orientation
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
    function getOrientation()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, rotation
                                                               FROM board", true);
    }
    function getStops()
    {
        return self::getDoubleKeyCollectionFromDB("SELECT board_x x, board_y y, stop
                                                               FROM board", true);
    }
    // function getCardsPlayed()
    // {
    //     return self::getObjectListFromDB("SELECT x,y,rotation, card, player_id
    //                                        FROM placedcards");
    // }
    function getStack()
    {
        return self::getObjectListFromDB("SELECT card FROM stack", true);
    }
    function argPlayerTurn()
    {
        return array(
            'players' => self::getPlayers(),
            'board' => self::getBoard(),
            // 'cards_played' => self::getCardsPlayed(),
            // 'cards' => $this->cards,
            'tracks' => self::getTracks(),
            'orientation' => self::getOrientation(),
            'stops' => self::getStops(),
            'stack' => self::getStack(),
            // 'defaultscoring' => intval(self::getGameStateValue('defaultscoring'))



        );
    }

    function stNextPlayer()
    {
        // Active next player
        $player_id = self::activeNextPlayer();
        $players = self::getPlayers();
        foreach ($players as $player_id3 => $player) {
            if ($player["id"] == $player_id) {
                if (intval($player["trackdone"]) == 0) {
                    $this->gamestate->nextState('nextTurn');
                } else {
                    // set dice for this turn
                    $thrown = array();
                    for ($i = 0; $i < 3; $i++) {
                        array_push($thrown, rand(1, 6));
                    }
                    $sql = "UPDATE player SET  diceused = 0, dice = '" . json_encode(array_values($thrown)) . "' WHERE player_id = " . $player_id . ";";
                    self::DbQuery($sql);
                    $this->gamestate->nextState('moveTrain');
                }
            }
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in streetcar.action.php)
    */
    function placeTrack($r, $x, $y, $c, $o)
    {
        $player_id = self::getActivePlayerId();
        $players = self::getPlayers();
        foreach ($players as $player_id3 => $player) {
            if ($player["id"] == $player_id) {
                $available_cards = json_decode($player["available_cards"]);
                if (($key = array_search($c, $available_cards)) !== false) {
                    unset($available_cards[$key]);
                }
                $sql = "UPDATE player SET  available_cards = '" . json_encode(array_values($available_cards)) . "' WHERE player_id = " . $player_id . ";";
                self::DbQuery($sql);
            }
        }
        // find stop if near location
        $needles = [$x, $y];
        $stopToAdd = '';
        $north = array_filter($this->locations, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] && $var['row'] == $needles[1] - 1);
        });
        $east = array_filter($this->locations, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] + 1 && $var['row'] == $needles[1]);
        });
        $south = array_filter($this->locations, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] && $var['row'] == $needles[1] + 1);
        });
        $west = array_filter($this->locations, function ($var) use ($needles) {
            return ($var['col'] == $needles[0] - 1 && $var['row'] == $needles[1]);
        });
        $found = $north + $east + $south + $west;
        if (count($found) > 0) {
            $stopToAdd = array_values($found)[0]["code"];
        }
        // see if this stop already exist
        if (self::getStop($stopToAdd)) {
            $stopToAdd = '';
        }

        // self::trace(">>LOCATIONSLSLS>>>>" . array_values($found)[0]["code"]);
        //
        $sql_values = array();
        $sql = "INSERT INTO board (board_x,board_y,rotation, card, orientation, stop) VALUES ";
        $sql_values[] = "($x,$y ,$r ,$c ,'$o','$stopToAdd')";
        $sql .= implode(',', $sql_values);
        $sql .= " ON DUPLICATE KEY UPDATE rotation= VALUES(rotation), card = VALUES(card), orientation = VALUES(orientation), stop = VALUES(stop)";
        self::DbQuery($sql);
        // update tracksplaced
        $tracksplaced = intval(self::getGameStateValue('tracksplaced'));
        $tracksplaced++;
        self::setGameStateValue('tracksplaced', $tracksplaced);

        $players = self::loadPlayersBasicInfos();
        $player_id = self::getActivePlayerId();

        self::notifyAllPlayers('placedTrack', clienttranslate('${player_name} placed track.'), array(
            // 'i18n' => array( 'symbol' ),
            'player_name' => $players[$player_id]['player_name'],
            'board' => self::getBoard(),
            // 'cards_played' => self::getCardsPlayed(),
            // 'cards' => $this->cards,
            'tracks' => self::getTracks(),
            'orientation' => self::getOrientation(),
            'stops' => self::getStops(),
        ));
        if ($tracksplaced == 2) {
            //goto next player
            self::setGameStateValue('tracksplaced', 0);
            //fill current player hand to 5
            $players = self::getPlayers();
            foreach ($players as $player_id3 => $player) {
                if ($player["id"] == $player_id) {
                    $old = json_decode($player["available_cards"]);
                    for ($i = 0; $i < 2; $i++) {
                        $stackindex =  intval(self::getGameStateValue('stackindex'));
                        $stack = self::getStack();
                        $card = array_shift($stack);
                        $sql = "DELETE FROM `stack` WHERE id =" . $stackindex;
                        self::DbQuery($sql);
                        $stackindex += 1;
                        self::setGameStateValue('stackindex', $stackindex);
                        array_push($old, intval($card));
                    }
                    self::trace(">>>>>>>>stackindex>>> [" . $stackindex . "]");
                    $sql = "UPDATE player SET  available_cards = '" . json_encode($old) . "' WHERE player_id = " . $player["id"] . ";";
                    self::DbQuery($sql);
                }

                //switch player
                // $this->activeNextPlayer();
            }
            $this->gamestate->nextState('nextPlayer');
        }
    }
    function trackDone()
    {
        $player_id = self::getActivePlayerId();
        $sql = "UPDATE player SET  trackdone = 1 WHERE player_id = " . $player_id . ";";
        self::DbQuery($sql);
        self::setGameStateValue('tracksplaced', 0);
        $this->gamestate->nextState('nextPlayer');
    }
    function setTrainLocation($x, $y)
    {
        $player_id = self::getActivePlayerId();
        $players = self::getPlayers();
        foreach ($players as $player_id3 => $player) {
            if ($player["id"] == $player_id) {
                $position = array();
                array_push($position, intval($x));
                array_push($position, intval($y));
                $sql = "UPDATE player SET  trainposition = '" . json_encode(array_values($position)) . "' WHERE player_id = " . $player_id . ";";
                self::DbQuery($sql);
            }
        }
    }
    function setTrainDirection($d)
    {
        $player_id = self::getActivePlayerId();
        $players = self::getPlayers();
        foreach ($players as $player_id3 => $player) {
            if ($player["id"] == $player_id) {

                $sql = "UPDATE player SET  traveldirection = '" . $d . "' WHERE player_id = " . $player_id . ";";
                self::DbQuery($sql);
            }
        }
    }
    /*
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */


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
