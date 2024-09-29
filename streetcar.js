/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Streetcar implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * streetcar.js
 *
 * Streetcar user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

 define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/js/scLines.js",
    g_gamethemeurl + "modules/js/scUtility.js",
    g_gamethemeurl + "modules/js/scEventHandlers.js",
    g_gamethemeurl + "modules/js/scRouting.js"
],
function (dojo, declare) {
    return declare("bgagame.streetcar", ebg.core.gamegui, {
        constructor: function(){
            console.log('streetcar constructor');
              
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
            console.log( "Starting game setup" , gamedatas);
            
            this.nesw = ["N","E","S","W"];
            this.scLines =  new bgagame.scLines();
            this.scUtility = new bgagame.scUtility();
            this.scEventHandlers = new bgagame.scEventHandlers(this);
            this.scRouting = new bgagame.scRouting(this,gamedatas.routes);
            

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
            this.isFirstSelection = true;
            this.traceTrack = false;

            // show stops
            gamedatas.initialStops.forEach(l=>{
                // dojo.destroy('stoplocation_'+stops[x][y])
                html = "<div class='goallocation goalstart' id='stoplocation_"+l.code+"'>"+l.code+"</div><div class='goalname' id='goalname_"+l.code+"'>"+l.name+"</div>";
                $('stops_'+l.col+"_"+l.row).innerHTML=html;
            });
                        
            //wire up show route button.
            dojo.query( '.goalcheck' ).connect( 'onclick', this, 'onToggleShowRoute' );

            //if, after die roll, user refreshes, this will contain the possible destinations they can send the train to.
            this.showTrainDestinations(gamedatas.curTrainDestinationsSelection);

            this.stackCounter = new ebg.counter();
            this.stackCounter.create('stack_count');

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
                case "placeTrack":
                    this.selectedTrack = null;
                    this.isFirstSelection = true;
                    this.firstPlacementData = {};
                    //this.scRouting = new bgagame.scRouting(this,args.args.routes);

                    this.updateBoardState(args.args.players, args.args.stackCount);

                    //clear out previous clickhandlers, if they exist
                    this.scEventHandlers.onPlaceCardHandlers.forEach( dojo.disconnect);
                     //do it this way so we can later destroy the click handlers.
                    for(x=1;x<=12;x++)
                        for(y=1;y<=12;y++)
                        { 
                            this.scEventHandlers.onPlaceCardHandlers.push(dojo.connect($('square_'+x+'_'+y), 'onclick', this, 'onPlaceCard'));
                        }
                            
                    
                    break;
                case "rollDice":
                    console.log('rollDice');

                     //remove click ability on all the board squares - if this is still here.
                    this.scEventHandlers.onPlaceCardHandlers.forEach( dojo.disconnect);

                    //also double check to remove any selections made. - hopefully handles very intermittent bug of these showing up.
                    dojo.query(".selectable_tile").removeClass('selectable_tile');
                    this.scEventHandlers.onSelectedNodeHandlers.forEach(dojo.disconnect);
                    
                    this.updateBoardState(args.args.players, args.args.stackCount);
                      
                    break;
                case "selectDie":
                    console.log('selectDie');

                    this.updateBoardState(args.args.players, args.args.stackCount);
                    this.showDice();
                   
                    break;
                case "moveTrain":
                    console.log('moveTrain');

                    this.updateBoardState(args.args.players, args.args.stackCount);
                    break;
                
                case "selectDirection":
                    console.log('selectDirection');

                    this.updateBoardState(args.args.players, args.args.stackCount);
                    break;
           
                case 'dummmy':
                    break;
            }
        },

        updateBoardState : function (players,stackCount)
        {
            this.updatePlayers(players);
            this.updateTracks();
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
                // j = this.format_block(jstpl_dice, {});
                // alert(JSON.stringify(j));
                dojo.place('<div id="dice" class="dice"></div>','extra_actions');
            }
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'placeTrack':
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
                    case 'moveTrain':
                        this.addActionButton( 'choose_different_die', _('Choose a different die'), 'onChooseDifferentDie')
                }
            }
        },
        
       /**
        * Send Placed Tiles to Server for recording
        */
        sendMovesToServer()
        {
            availableCardsOwner1 = this.firstPlacementData.selectedTrack.player_id;
            availableCards1 = this.gamedatas.gamestate.args.players.filter(p =>parseInt(p.id)==availableCardsOwner1)[0]['available_cards'];
            
            availableCardsOwner2 = this.selectedTrack.player_id;
            availableCards2 = this.gamedatas.gamestate.args.players.filter(p =>parseInt(p.id)==availableCardsOwner2)[0]['available_cards'];


            //list of available cards cannot be sent as [0,2,3...], but as a comma delimited string of nums.
            //So we need to strip the brackets
            availableCards1 = availableCards1.slice(1,availableCards1.length-1);
            availableCards2 = availableCards2.slice(1,availableCards2.length-1);

            paramList =
            {   
                r1 : this.firstPlacementData.rotation,
                x1 : this.firstPlacementData.posx,
                y1 : this.firstPlacementData.posy,
                c1 : this.firstPlacementData.selectedTrack.card,
                directions_free1 : this.firstPlacementData.directions_free,
                availableCards1 : availableCards1,
                availableCardsOwner1  : availableCardsOwner1,
                r2 : this.rotation,
                x2 : this.posx,
                y2 : this.posy,
                c2 : this.selectedTrack.card,
                directions_free2 : this.directions_free,
                availableCards2 : availableCards2,
                availableCardsOwner2  : availableCardsOwner2,
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

            dojo.place( this.format_block( 'jstpl_track', {
                id: "board_"+paramList.c2,
                offsetx:-parseInt(paramList.c2)*100,
                rotate:paramList.r2
            } ) , 'square_'+paramList.x2+"_"+paramList.y2);

            //remove temp track
            dojo.destroy(this.scUtility.getPlacedTrackId(true));
            dojo.destroy(this.scUtility.getPlacedTrackId(false));

            //clear firstPlacementData
            this.firstPlacementData = {};
            this.ajaxcall( "/streetcar/streetcar/placeTracks.html",paramList, this, function( result ) {} );
        },

        updatePlayers(players){
            //update player boards
            //delete previous tracks on player board
            dojo.query('.playertrack').orphan();
            
            curPlayer = null;
            players.forEach(player => {
                //dojo.empty('track_'+player.id)
                if(player.id == this.player_id) curPlayer = player;
                this.showPlayerBoard(player);
            });
            
            //do this here after all playerboards are set up.
            if(curPlayer.trainposition==null)
            {
                //allow selection of train pieces for placement
                dojo.query( '.playertrack' ).connect( 'onclick', this, 'onSelectCard');
            }  
            
        },
        
        
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
        updateStops() {
            let stops = this.gamedatas.gamestate.args.stops;
            for(var x = 1; x<=12; x++){
                for(var y = 1; y<=12; y++){
                    if(stops[x][y]!='' && stops[x][y]!=null){
                        dojo.destroy('stoplocation_'+stops[x][y])
                        var html=""
                        if(this.scUtility.validCoordinates(x,y+1) && this.gamedatas.initialStops.filter(l => l.row==y+1 && l.col==x).length>0){
                            html = "<div class='goallocation stopN' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        if(this.scUtility.validCoordinates(x,y-1) && this.gamedatas.initialStops.filter(l => l.row==y-1 && l.col==x).length>0){
                            html = "<div class='goallocation stopS' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        if(this.scUtility.validCoordinates(x+1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x+1).length>0){
                            html = "<div class='goallocation stopE' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
                        }
                        if(this.scUtility.validCoordinates(x-1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x-1).length>0){
                            html = "<div class='goallocation stopW' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>";
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
             //console.log ('Params','linenum: '+linenum+'\nplayer_id: ' + player_id+'\ntileID:'+tileID+'\ndirection:'+traindirection+'\nrotation:'+rotation);
             console.log(traindirection+'_'+player_id);
             dojo.destroy("train_"+player_id);
             dojo.place( this.format_block( 'jstpl_train', {
                 id: player_id,
                 offsetx:(-100)*(parseInt(linenum)-1),
                 rotate: rotation,
             } ) , tileID);
 
         },
 
         showPlayerBoard(player)
         {
             if(player.id == this.player_id) //active player
             {
                  //show the "shortest route" button
                  dojo.style('checktrack_'+player.id,'display','block');
 
                  //Highlight goals on board 
                 player.goals.forEach(goal => {
                     let location = this.gamedatas.initialStops.filter(l => l.code== goal)[0]
                     dojo.style( 'stops_'+location.col+"_"+location.row, 'border', 'solid 4px #FCDF00' );
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
        
        showDice()
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
        },

        showSelectableTiles(nodeIDs,clickMethod)
        {
            //First check if there are any to show
            if (nodeIDs==null) return;

            if (this.isCurrentPlayerActive())
            {
                this.selectedNodes = [];
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

        showTrainDestinations(trainMoveNodeIDs)
        {
            this.showSelectableTiles(trainMoveNodeIDs, 'onSelectTrainDestination');
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
            console.log("notif_placedTrack", notif);
            this.gamedatas.gamestate.args.stops=notif.args.stops;
            this.gamedatas.gamestate.args.rotations=notif.args.rotations;
            this.gamedatas.gamestate.args.board=notif.args.board;
            this.gamedatas.gamestate.args.tracks=notif.args.tracks;
            this.updateStops();
            this.updateTracks();
        },

        notif_placedTrain : function(notif)
        {
            console.log("notif_placedTrain", notif);
            this.showTrain(notif.args.linenum,notif.args.player_id,notif.args.trainStartNodeID,notif.args.traindirection);
        },

        notif_updateRoute: function( notif )
        {
            console.log('notif_updateRoute',notif.args.player_id);
            this.scRouting.updateRoutes(notif.args.routes);
        },

        notif_rolledDice: function( notif )
        {
            console.log('notif_rolledDice: ',notif.args.throw);
        },

        notif_selectedDie: function( notif )
        {
            console.log('notif_selectedDie', JSON.stringify(notif));
            this.showTrainDestinations(notif.args.possibleTrainMoves);
        },

        notif_moveTrain : function( notif )
        {
            console.log('notif_moveTrain', JSON.stringify(notif));
            if (this.isCurrentPlayerActive())
            {
                this.scRouting.curRoute = (notif.args.routes==null) ? null : notif.args.routes[0];

                //TO DO animate train moving using this.scRouting.curRoute = notif.args.moveRoute;
                //this.scRouting.curRoute = notif.args.moveRoute;
                this.scRouting.showRoute();
            }

            this.showTrain(notif.args.linenum,notif.args.player_id,notif.args.nodeID, notif.args.traindirection);
           
            
            
        },

        notif_endOfGame: function( notif )
	    {
	        console.log( '**** Notification : finalScore' );
	        console.log( notif );
	      
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

        onChooseDifferentDie()
        {
            //send back to select die state.
            this.scEventHandlers.onChooseDifferentDie();
        },

        onSelectTrainDestination(evt)
        {
            this.scEventHandlers.onSelectTrainDestination(evt, this.selectedNodes);
        },

        // getTrainRotation(trainPositionNodeID)
        // {   
        //     //This relies on the fact that the routeID of the curRoute is the first routeID of the merge constructed route. 
        //     //So the train is always at the begining of the route, and its routeID will be whatever the route ID is of the current route,
        //     //even though it may be composed of multiple routes.
        //     routeNodeID = trainPositionNodeID + '_' + this.scRouting.curRoute.routeID;
        //     nextRouteNodeID = this.scRouting.curRoute.routeNodes[routeNodeID];
        //     console.log(JSON.stringify(this.scRouting.curRoute.routeNodes));

        //     nextRouteNodeDirection = this.scUtility.extractXYD(nextRouteNodeID);
            
        //     //this is 180 degrees from the nextRouteNodeDirection, as the train will be entering from that side - it is facing opposite.
        //     switch(nextRouteNodeDirection['d'])
        //     {
        //         case "N": return 180;
        //         case "E": return 270;
        //         case "S": return 0;
        //         case "W": return 90;
            
        //     }
        // },
        
   });             
});
