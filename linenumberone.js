/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * LineNumberOne implementation : © David Felcan dfelcan@gmail.com, Stefan van der Heijden axecrazy@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * linenumberone.js
 *
 * LineNumberOne user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

 define([
    "dojo","dojo/_base/declare", 
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/js/scUtility.js",
    g_gamethemeurl + "modules/js/scEventHandlers.js",
    g_gamethemeurl + "modules/js/scRouting.js",
    g_gamethemeurl + "modules/js/scZoom.js"
],
function (dojo, declare) {
    return declare("bgagame.linenumberone", ebg.core.gamegui, {
        constructor: function(){
            console.log('linenumberone constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            this.nesw = ["N","E","S","W"];
            this.scUtility = new bgagame.scUtility();
            this.scEventHandlers = new bgagame.scEventHandlers(this);
            this.scRouting = new bgagame.scRouting(this,gamedatas.routes);
            //console.log('window: ',JSON.stringify(window));
            this.scZoom = new bgagame.scZoom('wrapper','zoom_in','zoom_out');
            
            
            console.log("SETUP",gamedatas);
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
                var player_board_div = $('player_board_'+player_id);

                dojo.place( this.format_block('jstpl_player_board', player ), player_board_div );

                //place player trains. If they are not there, this will simply return without doing anything.
                this.showTrain(player.linenum,player_id,player.trainposition,player.traindirection);

            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            
            this.rotation = 0;
            this.selectedTrack = null;
            this.firstPlacementData = {};
            this.traceTrack = false;
            

            // show stops

            gamedatas.initialStops.forEach(l=>{
                // dojo.destroy('stoplocation_'+stops[x][y])
                html = "<div class='goallocation goalstart' id='stoplocation_"+l.code+"'>"+l.code+"</div><div class='goalname' id='goalname_"+l.code+"'>"+l.name+"</div>";
                $('stops_'+l.col+"_"+l.row).innerHTML=html;
            });
                        
            //wire up show route button.
            dojo.query( '.shortestRouteButton' ).connect( 'onclick', this, 'onToggleShowRoute' );

            //if, after die roll, user refreshes, this will contain the possible destinations they can send the train to.
            this.showTrainDestinations(gamedatas.curTrainDestinationsSelection, 'onSelectTrainDestination');

            this.stackCounter = new ebg.counter();
            this.stackCounter.create('stack_count');

            this.updateLastTilesPlacedHighlighting(gamedatas.players);

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName ,args);
            this.currentState = stateName
            
            switch( stateName )
            {
                case "firstAction":
                case "secondAction":
                    this.selectedTrack = null;
                    this.rotation = 0;

                    if (this.isCurrentPlayerActive())
                    {
                        var activePlayer = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.getActivePlayerId())[0];
                        var lastTilePlacementInformation = activePlayer['lasttileplacementinformation'];

                        
                        if (lastTilePlacementInformation == null || stateName == 'firstAction')
                        {
                            this.firstPlacementData = null;
                        }
                        else
                        {
                            firstSelectedTrack =  {domID: 'track_',
                                card: parseInt(lastTilePlacementInformation[0].card),
                                player_id: lastTilePlacementInformation[0].ownerID};
                                
                            this.firstPlacementData = {rotation : parseInt(lastTilePlacementInformation[0].rotation),
                                                    posx: this.scUtility.extractXY(lastTilePlacementInformation[0].destination)['x'],
                                                    posy: this.scUtility.extractXY(lastTilePlacementInformation[0].destination)['y'],
                                                    selectedTrack: firstSelectedTrack,
                                                    directions_free: this.scUtility.getDirections_free(firstSelectedTrack, lastTilePlacementInformation[0].rotation) };
                            
                            this.firstPlacementData.badDirections = this.scEventHandlers.fitCardOnBoard(lastTilePlacementInformation[0].destination,
                                this.firstPlacementData.selectedTrack.card, 
                                this.firstPlacementData.rotation,
                                this.firstPlacementData.posx,
                                this.firstPlacementData.posy);
                        }
                        //clear out previous clickhandlers, if they exist
                        this.scEventHandlers.onPlaceCardHandlers.forEach( dojo.disconnect);
                            //do it this way so we can later destroy the click handlers.
                        for(x=1;x<=12;x++)
                            for(y=1;y<=12;y++)
                            { 
                                this.scEventHandlers.onPlaceCardHandlers.push(dojo.connect($('square_'+x+'_'+y), 'onclick', this, 'onPlaceCard'));
                            }
                    }
                    //delay this to allow for animations.
                    setTimeout(function() {this.updateBoardState(args.args.players, args.args.stackCount)}.bind(this),450);
                    break;
                case "rollDice":
                    console.log('rollDice');

                     //remove click ability on all the board squares - if this is still here.
                    this.scEventHandlers.onPlaceCardHandlers.forEach( dojo.disconnect);

                    //also double check to remove any selections made. - hopefully handles very intermittent bug of these showing up.
                    dojo.query(".selectable_tile").removeClass('selectable_tile');
                    this.scEventHandlers.onSelectedNodeHandlers.forEach(dojo.disconnect);
                    
                    //delay this to allow for animations.
                    setTimeout(function() {this.updateBoardState(args.args.players, args.args.stackCount)}.bind(this),450);

                      
                    break;
                case "selectDie":
                    console.log('selectDie');

                    this.updateBoardState(args.args.players, args.args.stackCount);
                    this.showDice(null, null);
                   
                    break;
                case "moveTrain":
                    console.log('moveTrain');

                    this.updateBoardState(args.args.players, args.args.stackCount);
                    this.showDice(args.args.curDie,args.args.curDieIdx);
                    break;
           
                case 'dummmy':
                    break;
            }
        },

        updateBoardState : function (players,stackCount)
        {
            this.updatePlayers(players);
            this.updateTracks();
            this.updateLastTilesPlacedHighlighting(players);
            this.updateStops();
            this.updateStackCounter(stackCount);
        },

        setGamestateDescription: function (property) {
            if (property === void 0) { property = ''; }
            var originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
            this.gamedatas.gamestate.descriptionmyturn = "".concat(originalState['descriptionmyturn' + property]);
            this.updatePageTitle();
        },
        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
            if (!$('extra_actions'))
            { 
                
                dojo.place("<div id='extra_actions' class='extra_actions'></div>",'generalactions');
                dojo.place('<div id="dice" class="dice"></div>','extra_actions');
            }
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'firstAction':
                    case 'secondAction':
                        if (this.scRouting.curRoute != null && this.scRouting.curRoute.isComplete)
                        {
                            this.addActionButton( 'begin_trip_button', _('Begin Inaugural Trip'), 'onBeginTrip');
                        }
                        break;
                    case 'rollDice':
                        //These buttons just move us into next state.
                        this.addActionButton( 'roll_dice_button', _('Roll Dice'), 'onRollDice');
                        this.addActionButton( 'done_with_turn_button', _('Done With Turn'), 'onDoneWithTurn');
                        
                        break;
                }
            }
        },
        
       /**
        * Send Placed Tiles to Server for recording
        */
        sendTrackPlacementToServer()
        {
            availableCardsOwner = this.selectedTrack.player_id;
            availableCards = this.gamedatas.gamestate.args.players.filter(p =>parseInt(p.id)==availableCardsOwner)[0]['available_cards'];

            //list of available cards cannot be sent as [0,2,3...], but as a comma delimited string of nums.
            //So we need to strip the brackets
            availableCards = availableCards.slice(1,availableCards.length-1);

            paramList =
            {   
                r1 : this.rotation,
                x1 : this.posx,
                y1 : this.posy,
                c1 : this.selectedTrack.card,
                directions_free : this.directions_free,
                availableCards : availableCards,
                availableCardsOwner  : availableCardsOwner,
            };
            
            //clear buttons
            dojo.destroy('reset_button');
            dojo.destroy('begin_trip_button');
            
            $('pagemaintitletext').innerHTML = 'Sending move to server...';

            //actually put the tiles on the board.
            dojo.place( this.format_block( 'jstpl_track', {
                id: "board_"+paramList.c1,
                offsetx:-parseInt(paramList.c1)*100,
                rotate:paramList.r1
            } ) , 'square_'+paramList.x1+"_"+paramList.y1);

            //remove temp track
            dojo.destroy('placed_track');
            this.removeFirstPlacedTrackStyling();
            

            this.ajaxcall( "/linenumberone/linenumberone/placeTrack.html",paramList, this, function( result ) {} );
        },

        removeFirstPlacedTrackStyling()
        {
            //remove highlighting from previous placement, if it is there
            if (this.firstPlacementData != null)
            {
                firstPlacementDiv = 'square_'+this.firstPlacementData.posx+'_'+this.firstPlacementData.posy;
                dojo.style(firstPlacementDiv,"border-color",null);
                dojo.removeClass(firstPlacementDiv,'track_placement');
            }
        },

        /**
         * Updates the player boards
         * @param {Array} players 
         */
        updatePlayers(players){
            
            //delete previous tracks on player board
            dojo.query('.playertrack').orphan();
            
            curPlayer = null;
            players.forEach(player => {
                //dojo.empty('track_'+player.id)
                if(player.id == this.player_id) curPlayer = player;
                this.showPlayerBoard(player);
            });
            
            //do this here after all playerboards are set up.
            //if this is spectator, curPlayer will be null.
            if(curPlayer != null && curPlayer.trainposition==null)
            {
                //allow selection of train pieces for placement
                dojo.query( '.playertrack' ).connect( 'onclick', this, 'onSelectCard');
            }
            
        },
        
        /**
         * Redraws all the tracks on the board.
         */
        updateTracks() {

            //delete previous tracks
            dojo.query('.square > .track').orphan();
            let board = this.gamedatas.gamestate.args.board;
            let tracks = this.gamedatas.gamestate.args.tracks;
            let rotations = this.gamedatas.gamestate.args.rotations;
            for(var x = 1; x<=12; x++){
                for(var y = 1; y<=12; y++){
                    if(board[x][y]!='[]'){
                        dojo.place( this.format_block( 'jstpl_track', {
                            id: "board_"+tracks[x][y],
                            offsetx:-parseInt(tracks[x][y])*100,
                            rotate:rotations[x][y]
                        } ) , 'square_'+x+"_"+y);   
                        
                    }
                }                
            }    
        },

        /**
         * Highlights tiles that have been played by other players
         */
        updateLastTilesPlacedHighlighting(players)
        {
            for(j = 0; j <players.length;j++)
            {
                let player = players[j];
                let highlightClass = 'highlight_'+player.color;
                dojo.query('.'+highlightClass).removeClass(highlightClass);

                if(player.id != this.player_id && player.lasttileplacementinformation != null) 
                {
                    //Show highlighting
                    for (i=0; i < player.lasttileplacementinformation.length; i++)
                    {
                        dojo.query('#'+player.lasttileplacementinformation[i]['destination']+ '> .track').addClass(highlightClass);
                    }
                }
            }
        },

        /**
         * puts the stop indicator on the tile if there is a tile next to the stop.
         */
        updateStops() {
            let stops = this.gamedatas.gamestate.args.stops;
            for(var x = 1; x<=12; x++){
                for(var y = 1; y<=12; y++){
                    if(stops[x][y]!='' && stops[x][y]!=null){
                        dojo.destroy('stoplocation_'+stops[x][y])
                        var html=""
                        if(this.scUtility.validCoordinates(x,y+1) && this.gamedatas.initialStops.filter(l => l.row==y+1 && l.col==x).length>0){
                            html = "<div class='goallocation stop_N' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        if(this.scUtility.validCoordinates(x,y-1) && this.gamedatas.initialStops.filter(l => l.row==y-1 && l.col==x).length>0){
                            html = "<div class='goallocation stop_S' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        if(this.scUtility.validCoordinates(x+1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x+1).length>0){
                            html = "<div class='goallocation stop_E' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        if(this.scUtility.validCoordinates(x-1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x-1).length>0){
                            html = "<div class='goallocation stop_W' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        $('stops_'+x+"_"+y).innerHTML=html;
                    }
                }
            }
        },

        updateStackCounter(stackCount) {
            this.stackCounter.toValue(stackCount);
        },

         /**
         * 
         * Displays the train on the board for a given person.
         * @param Integer linenum Line designation on train
         * @param Integer player_id player_id of owner of train
         * @param String nodeID x_y_d location of train
         * @param String traindirection facing - NESW.
         * @returns null
         */
         showTrain : function(linenum,player_id,nodeID,traindirection)
         {
             //if nodeID is null, there is no train to show
             if (nodeID==null) return;
 
             trainXYD = this.scUtility.extractXYD(nodeID);
             
             tileID = 'square_'+trainXYD.x+"_"+trainXYD.y;
             rotation = this.scUtility.getRotationFromDirection(traindirection);
             
             dojo.destroy("train_"+player_id);
             dojo.place( this.format_block( 'jstpl_train', {
                 id: player_id,
                 offsetx:(-100)*(parseInt(linenum)-1),
                 rotate: rotation,
             } ) , tileID);
 
         },
 
         /**
          * Draws the player board for the player passed as a parameter
          * @param {Object} player 
          * @returns 
          */
         showPlayerBoard(player)
         {
             if(player.id == this.player_id) //active player
             {
                //show the "shortest route" button
                dojo.style('shortestRouteButton_'+player.id,'display','block');
 
                //Highlight goals on board 
                dojo.query(".stopOnRoute").removeClass('stopOnRoute');
                player.goals.forEach(goal => {
                     let location = this.gamedatas.initialStops.filter(l => l.code== goal)[0];
                     dojo.addClass( 'stops_'+location.col+"_"+location.row, 'stopOnRoute' );
                 });
 
                 if (!(this.scRouting.curRoute==null) && this.scRouting.curRoute.isComplete)
                 {
                         dojo.style('completedMsg_'+player.id,'display','inline-block');
                         dojo.addClass('start_'+player.id,'linenum_completed');
                 } 
             }
             else //non-active players
             {
                 if (player.trainposition == null)
                 {
                     //none of this player's information should be shown. 
                     return;
                 }
     
                 //This player has completed their route.
                 dojo.style('completedMsg_'+player.id,'display','inline-block');
                 dojo.addClass('start_'+player.id,'linenum_completed');
             }
             
 
             //All players
 
             //show linenum
             dojo.style( 'start_'+player.id, 'background-position', (parseInt(player.linenum)-1)*-50+'px 0px');
             dojo.style('start_'+player.id,'display','inline-block');
 
             let html = "";
 
             //show completed goals
             player.goalsfinished.forEach(goalfinished =>{
                 html += "<div class='goallocation goalreached' id='goallocation_"+goalfinished+"'>"+goalfinished+"</div>"
             });
 
             //show goals
             player.goals.forEach(goal => 
             {
                 html += "<div class='goallocation' id='goallocation_"+goal+"'>"+goal+"</div>";
             });
 
             $('goal_'+player.id).innerHTML=html;
 
             let available_cards = JSON.parse(player["available_cards"])
         
             available_cards.forEach((s,c) => {
                 dojo.place( this.format_block( 'jstpl_track_player', {
                     id: s+"_"+player.id+"_"+c,
                     offsetx:-parseInt(s)*100,
                 } ) , 'track_'+player.id);    
             });
         },
        
        /**
         * 
         * @param {integer} curDie - if a die is selected, this is its value, otherwise null
         * @param {integer} curDieIdx - if a die is selected, this is its index, otherwise null
         */
        showDice(curDie,curDieIdx)
        {
            var activePlayer = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.getActivePlayerId())[0];
            
            // show dice
            dojo.style( 'dice', 'display', 'inline-flex' );
            $('dice').innerHTML= "";
            dice = JSON.parse(activePlayer['dice']);

            for(i=0;i<dice.length;i++)
            {
                dojo.place( this.format_block( 'jstpl_die', {
                    id: i + '_' + (dice[i]),
                    offsetx:-80*(dice[i]-1),
                    rotate:0
                } ) , 'dice'); 
            }

            if (this.isCurrentPlayerActive())
            {
                dojo.query('.die').connect( 'onclick', this, 'onSelectDie' );
            }

            dojo.query(".die_selected").removeClass('die_selected');
            if(curDie !== null)
            {   
                dojo.addClass('die_'+curDieIdx+'_'+curDie,'die_selected');
            }
        },

        /**
         * Highlights the possible places the train could go for selection by player
         * @param {array<string>} nodeIDs - nodeIDs (really tiles) that should be highlighted.
         * @param {string} clickMethod - a text name of what should happen should the player click on one of the destinations.
         * @returns 
         */
        showTrainDestinations(nodeIDs,clickMethod)
        {
             //First check if there are any to show
            if (nodeIDs==null) return;
            
            if (this.isCurrentPlayerActive())
            {
                //clear previous selections, if any
                dojo.query(".selectable_tile").removeClass('selectable_tile');
                
                this.selectedNodes = [];
                this.scEventHandlers.onSelectedNodeHandlers.forEach(dojo.disconnect);
                nodeIDs.forEach(nodeID => {
                    xydNode = this.scUtility.extractXYD(nodeID);
                    this.selectedNodes.push(xydNode); //save direction info.
                    boardID = ('square_'+xydNode.x+'_'+xydNode.y).toString(); //string conversion needed, don't know why.
                    
                    handler = dojo.connect($(boardID),'onclick', this, clickMethod);
                    this.scEventHandlers.onSelectedNodeHandlers.push(handler);
                    dojo.addClass(boardID,'selectable_tile');
                 }); 
             }
        },
        
        setupNotifications: function()
        {
            // 
            dojo.subscribe( 'placedTrack', this, "notif_placedTrack" );
            dojo.subscribe( 'updateRoute',this,'notif_updateRoute');
            dojo.subscribe( 'placedTrain', this, 'notif_placedTrain');
            dojo.subscribe( 'rolledDice', this, 'notif_rolledDice');
            dojo.subscribe( 'selectedDie', this, 'notif_selectedDie');
            dojo.subscribe( 'moveTrain', this, 'notif_moveTrain');
            dojo.subscribe( 'endOfGame', this, 'notif_endOfGame');
            this.notifqueue.setSynchronous( 'endOfGame', 1500 );
            //this.notifqueue.setSynchronous( 'placedTrack', 500 );
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        notif_placedTrack: function( notif )
        {
            placedTile = notif.args.placedTile;

            //animate track placement for non-active players
            if (!this.isCurrentPlayerActive())
            {
                //put new track on board.
                dojo.place( this.format_block( 'jstpl_track', 
                {
                    id: 'placing',
                    offsetx:-100* placedTile['card'],
                    rotate:placedTile['rotation']
                } ) , 'overall_player_board_'+placedTile['ownerID']);

                dojo.style('placing','z-index',1000);
                this.slideToObjectAndDestroy('placing',placedTile['destination']);
            }

            //animate tiles coming from board to player board for non-current players.
            destination = 'overall_player_board_'+placedTile['ownerID'];
                
            if (!this.isCurrentPlayerActive() && notif.args.isSwap)
            {
                //tile is coming from board. Already animated for current player
                //extract data about underlying tile and move the copy. Moving current tile is proving buggy.
                sourceXY = this.scUtility.extractXY(placedTile['destination']);
                sourceRotation = this.gamedatas.gamestate.args.rotations[sourceXY.x][sourceXY.y];
                sourceCard = this.gamedatas.gamestate.args.tracks[sourceXY.x][sourceXY.y];

                //place a copy of the tile on the square and slide that for the animation.
                dojo.place( this.format_block( 'jstpl_track', 
                    {
                        id: 'replacing',
                        offsetx:-100* sourceCard,
                        rotate: sourceRotation
                    } ) , placedTile['destination']);

                    dojo.style('replacing','z-index',1000);
                    this.slideToObjectAndDestroy('replacing',destination);
            }
            

            
            //animate tile coming from stack to player board - after secondAction
            if (this.gamedatas.gamestate.name != "firstAction" && !notif.args.isSwap)
            {
                destination = 'overall_player_board_'+placedTile['ownerID'];
                dojo.place( this.format_block( 'jstpl_track_tile_back_animation', 
                {
                    id: 'tile_back',
                } ) , 'wrapper');
                    
                this.slideToObjectAndDestroy('tile_back',destination);
            }

            //update global gamestate
            this.gamedatas.gamestate.args.stops=notif.args.stops;
            this.gamedatas.gamestate.args.rotations=notif.args.rotations;
            this.gamedatas.gamestate.args.board=notif.args.board;
            this.gamedatas.gamestate.args.tracks=notif.args.tracks;
        },

        notif_placedTrain : function(notif)
        {
            this.showTrain(notif.args.linenum,notif.args.player_id,notif.args.trainStartNodeID,notif.args.traindirection);
        },

        notif_updateRoute: function( notif )
        {
            this.scRouting.updateRoutes(notif.args.routes);
        },

        notif_rolledDice: function( notif )
        {
            //this info is handled elsewhere, but the message still needs to come across.
            return;
        },

        notif_selectedDie: function( notif )
        {
            this.showTrainDestinations(notif.args.possibleTrainMoves,'onSelectTrainDestination');
        },

        notif_moveTrain : function( notif )
        {
            if (this.isCurrentPlayerActive())
            {
                this.scRouting.curRoute = (notif.args.routes==null) ? null : notif.args.routes[0];
                this.scRouting.showRoute();
            }
            this.animateTrainMovement(notif.args.player_id,notif.args.moveRoute,notif.args.traindirection);
        },

        animateTrainMovement(player_id,moveRoute,endDirection)
        {
            if (moveRoute == null) return;

            trainDiv =  "train_"+player_id;
            anims = new Array();

            curZoom = this.scZoom.zoomLevelIdx;
            this.scZoom.setZoom(this.scZoom.zoomLevels.length-1, false);
            
            activePlayer = this.gamedatas.gamestate.args.players.filter(p =>parseInt(p.id)==player_id)[0];
            curTrainRotation = this.scUtility.getRotationFromDirection(activePlayer.traindirection);
            curNode = moveRoute.startNodeID+'_'+moveRoute.routeID;

            //only execute if the current node has a child in the route.
            while(moveRoute.routeNodes.hasOwnProperty(curNode))
            {
                //rotate train, if necessary
                newRotation = this.getTrainRotation(curNode, moveRoute);

                //if we are moving into the last node of the route or facing direction is the same, do not rotate.
                if (newRotation != null && curTrainRotation != newRotation)
                {
                    anims.push(this.scUtility.getRotationAnimation(curTrainRotation,newRotation,trainDiv));
                    curTrainRotation = newRotation;
                }

                curNode = moveRoute.routeNodes[curNode];
                //move train to next spot.
                curNodeXY = this.scRouting.getPixelLocationBasedOnNodeID(curNode);
                anim = this.slideToObjectPos(trainDiv, "board", curNodeXY['x'], curNodeXY['y']);
                anims.push(anim);
            }

            //add final rotation, if necessary.
            finalRotation = this.scUtility.getRotationFromDirection(endDirection);
            if (finalRotation != curTrainRotation)
            {
                anims.push(this.scUtility.getRotationAnimation(curTrainRotation,finalRotation,trainDiv));
            }

            dojo.fx.chain(anims).play();
            this.scZoom.setZoom(curZoom, false);
        },
        

        /**
         * 
         * @param {string} trainPositionNodeID this will be a XYDR node from the routeNodes of the route.
         * @param {scRoute} route the route the train is following.
         * @returns {integer} degrees of rotation.
         */
        getTrainRotation(trainPositionNodeID, route)
        {   
            //check for no next node
            if (!route.routeNodes.hasOwnProperty(trainPositionNodeID))
            {
                //we've reached the last route node - direction is defined elsewhere (derived from curRoute, but that is handled in PHP)
                return null;
            }
            nextRouteNodeID = route.routeNodes[trainPositionNodeID];
            nextRouteNodeXYD = this.scUtility.extractXYD(nextRouteNodeID);
            trainPositionNodeXYD = this.scUtility.extractXYD(trainPositionNodeID);

            direction = this.scUtility.getDirectionOfTileFromCoords(trainPositionNodeXYD.x, trainPositionNodeXYD.y,nextRouteNodeXYD.x,nextRouteNodeXYD.y)
            
            return this.scUtility.getRotationFromDirection(direction);
        },

        notif_endOfGame: function( notif )
	    {
            // Update score
            this.scoreCtrl[ notif.args.player_id ].incValue( notif.args.score_delta );
        },

        //Have to put stubs here to pass game object (???don't know why).
        onSelectCard(evt)
        {
            this.scEventHandlers.onSelectCard(evt, this);
        },

        onPlaceCard(evt)
        {
            this.scEventHandlers.onPlaceCard(evt,this);
        },

        onBeginTrip()
        {
            this.scEventHandlers.onBeginTrip(this);
        },

        onToggleShowRoute(evt)
        {
            this.scEventHandlers.onToggleShowRoute(evt,this.scRouting);
        },

        onRollDice()
        {
            this.scEventHandlers.onRollDice();
        },

        onDoneWithTurn()
        {
            this.scEventHandlers.onDoneWithTurn();
        },

        onSelectDie(evt)
        {
            this.scEventHandlers.onSelectDie(evt);
        },

        onSelectTrainDestination(evt)
        {
            this.scEventHandlers.onSelectTrainDestination(evt, this.selectedNodes);
        },
   });             
});
