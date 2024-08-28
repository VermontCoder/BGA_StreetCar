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
    g_gamethemeurl + "modules/js/scEventHandlers.js"
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
            
            //routing - must come before placing trains.
            this.routes= gamedatas.routes;
            this.curRoute = (this.routes != null) ? this.routes[0] : null;
            this.isShowRoute = false;

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
            this.selectedTrack = -1;
            this.firstPlacementData = {};
            this.isFirstSelection = true;
            this.traceTrack = false;
            // show stops
           
            gamedatas.initialStops.forEach(l=>{
                // dojo.destroy('stoplocation_'+stops[x][y])
                html = "<div class='goallocation goalstart' id='stoplocation_"+l.code+"'>"+l.code+"</div><div class='goalname' id='goalname_"+l.code+"'>"+l.name+"</div>";
                $('stops_'+l.col+"_"+l.row).innerHTML=html;
            });

            

            this.onPlaceCardHandlers = [];
            
            //do it this way so we can later destroy the click handlers.
            for(x=1;x<=12;x++)
                for(y=1;y<=12;y++)
                    this.onPlaceCardHandlers.push(dojo.connect($('square_'+x+'_'+y),'onclick',this,'onPlaceCard'));
            // this.onPlaceCardHandler = dojo.query( '.square' ).connect( 'onclick', this, 'onPlaceCard' );
            
            dojo.query( '.goalcheck' ).connect( 'onclick', this, 'onToggleShowRoute' );
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
                    this.selectedTrack = -1;
                    this.isFirstSelection = true;
                    this.firstPlacementData = {};

                    this.updatePlayers(args.args.players);
                    this.updateTracks();
                    this.updateStops();
                   
                    break;
                case "moveTrain":
                    this.updatePlayers(args.args.players);
                    this.updateTracks();
                    this.updateStops();
                    
                    var itsme = args.args.players.filter(p =>p.id==this.player_id)[0]
                    // if (itsme.trainposition != null)
                    // {
                    //     this.placeTrain(itsme.linenum,this.player_id,itsme.trainposition);
                    // }        
                    break;

            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }
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
            if (!$('extra_actions')) dojo.place("<div id='extra_actions'></div>",'generalactions');
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'placeTrack':
                        if (this.curRoute != null && this.curRoute.isComplete)
                        {
                            this.addActionButton( 'begin_trip_button', _('Begin Inaugural Trip'), 'onBeginTrip');
                        }
                        break;
/*                      
                 
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
            }
        },        
        onPlaceCard: function( evt )
        {
            // Stop this event propagation
            dojo.stopEvent( evt );
            
            if( this.checkAction( 'playTrack' ))
            {
                if(this.selectedTrack==-1){
                    this.showMessage( _("Select track part you want to place."), 'error');	
                    return;
                }
                console.log("placecard");
                var coords = evt.currentTarget.id.split('_');
                if (coords[1] == this.firstPlacementData.posx && coords[2]== this.firstPlacementData.posy)
                {
                    this.showMessage( _("You cannot play on your first placement."), 'error');	
                    return;
                }
                
                this.posx =parseInt(coords[1]);
                this.posy =parseInt(coords[2]);

                if(parseInt(this.gamedatas.gamestate.args.tracks[this.posx][this.posy])>=6)
                {
                    this.showMessage( _("This track can not be replaced."), 'error');	
                    dojo.destroy('place_card_action_button'); //eliminates place card button in action buttons.
                    return;
                }

                let isStop = this.gamedatas.initialStops.filter(l => l.row==this.posy && l.col==this.posx).length>0
                if(!isStop) 
                {
                    dojo.destroy(this.scUtility.getPlacedTrackId(this.isFirstSelection));
                    dojo.place( this.format_block( 'jstpl_track', {
                        id: this.scUtility.getPlacedTrackId(this.isFirstSelection),
                        offsetx:-100* this.selectedTrack,
                        rotate:this.rotation
                    } ) , "square_"+this.posx+"_"+this.posy);

                    badDirections = this.fitCardOnBoard();
                    this.showPlaceCardActionButton(badDirections);
                    
                    this.rotationClickHandler = dojo.connect($(this.scUtility.getPlacedTrackId(this.isFirstSelection)), 'onclick', this, 'onRotateCard' );
                }
                else
                {
                    this.showMessage( _("Cannot put track on stop."), 'error');
                    dojo.destroy('place_card_action_button'); //deletes place track button.
                }   
                    
            }
        },   
        onReset()
        {   
            //reload page.
            dojo.destroy('reset_button')
            location.reload();
        },
        onRotateCard(evt)
        {
            this.rotation = (this.rotation + 90) % 360;
            
            this.rotateTo(this.scUtility.getPlacedTrackId(this.isFirstSelection), this.rotation);
            badDirections = this.fitCardOnBoard();
            this.showPlaceCardActionButton(badDirections);
        },             
        fitCardOnBoard()
        {
            dojo.destroy('place_card_action_button');
            badDirections = this.fitTrack(this.gamedatas.tracks[this.selectedTrack][0],
                this.rotation, parseInt(this.posx), parseInt(this.posy));

            dojo.addClass(this.scUtility.getPlacedTrackId(this.isFirstSelection),this.isFirstSelection ? 'track_placement' : 'track_placement2');
            borderColorString = '';
            if (badDirections.includes('x'))
            {
                //track on board is not compatible with track being placed
                borderColorString = 'red red red red ';
            }
            else
            { 
                //color border green if the direction is ok, red if not.
                this.nesw.forEach((direction,idx) => {
                    //so the borders of the card are *also* rotated.
                    //that means we have to conform to the rotated position when creating the borderColorString
                    rotationOffset = this.rotation/90;
                    direction = this.nesw[(idx + rotationOffset)%4];
                    if (badDirections.includes(direction))
                    {
                        borderColorString += 'red ';
                    }
                    else
                    {
                        borderColorString += 'green ';
                    }
                });
            }
            
            dojo.style(this.scUtility.getPlacedTrackId(this.isFirstSelection),"border-color",borderColorString.trimEnd());
           
            return badDirections;
        },
        showPlaceCardActionButton(badDirections)
        {
            if (badDirections.includes('x')) return; //case where player tried to place on non-conforming space.
            if (this.isFirstSelection && badDirections.length <= 1)
            {
                //Allow the placement with one bad direction. The user could fix it next placement.
                this.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard() );
                return;
            }

            if (badDirections.length == 0 && this.firstPlacementData.badDirections.length == 0)
            {
                this.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard() );
                return;
            }

            if (badDirections.length == 0 && this.firstPlacementData.badDirections.length == 1)
            {
                //This is a special case - only show the place button *if* the badDirection of the first tile points at the 2nd tile.
                //If so, then the new placement fixed the problem (because it doesn't have any bad sides)
                showPlaceActionButton = false;
                switch(this.firstPlacementData.badDirections[0])
                {
                    case "N":
                        showPlaceActionButton = (this.posx == this.firstPlacementData.posx) && (this.posy == this.firstPlacementData.posy-1);
                        break;
                    case "E":
                        showPlaceActionButton = (this.posx  == this.firstPlacementData.posx+ 1) && (this.posy == this.firstPlacementData.posy);
                        break;
                    case "S":
                        showPlaceActionButton = (this.posx == this.firstPlacementData.posx) && (this.posy == this.firstPlacementData.posy+1);
                        break;
                    case "W":
                        showPlaceActionButton = (this.posx  == this.firstPlacementData.posx- 1) && (this.posy == this.firstPlacementData.posy);
                }

                if (showPlaceActionButton)
                {
                    this.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard() );
                    return;
                }
                
            }

            //none of these are valid - do not show place card
            dojo.destroy('place_card_action_button');
        },
        onPlaceTrain(evt)
        {
            selectedTrainLoc = this.scUtility.extractXY(evt.currentTarget.id);
            trainStartNodeID = '';

            //find right route - may have clicked on the end of the route, so find the corresponding route with this as the start of route.
            for(i=0;i<this.routes.length;i++)
            {
                routeStartNodeLoc = this.scUtility.extractXYD(this.routes[i].startNodeID);
                if (routeStartNodeLoc.x == selectedTrainLoc.x && routeStartNodeLoc.y == selectedTrainLoc.y )
                {
                    trainStartNodeID = this.routes[i].startNodeID;
                    this.curRoute = this.routes[i];
                    break;
                }
            }

            //alert(JSON.stringify(trainStartNodeID));
            //break down selection UI
            dojo.disconnect(this.placeTrainHandlers[0]);
            dojo.disconnect(this.placeTrainHandlers[1]);
            dojo.query(".selectable_train_start_location").removeClass('selectable_train_start_location');

            players = this.gamedatas.gamestate.args.players;
            linenum = parseInt(players.filter(p =>p.id==this.player_id)[0]['linenum']);
            this.ajaxcall( "/streetcar/streetcar/placeTrain.html",{linenum: linenum, trainStartNodeID: trainStartNodeID}, this, function( result ) {} );
        },
        onBeginTrip()
        {
            //setup ui to record person's choice of train start
            dojo.destroy('place_card_action_button');
            dojo.destroy('begin_trip_button');
            
            this.addActionButton('reset_button', _('Reset'), () => this.onReset());
            $('pagemaintitletext').innerHTML = _('Select train starting location.');

            //dojo.disconnect( this.onPlaceCardHandler );
            //remove click ability on all the board squares
            this.onPlaceCardHandlers.forEach( dojo.disconnect);

            xyStart = this.scUtility.extractXYD(this.curRoute.startNodeID);
            xyEnd = this.scUtility.extractXYD(this.curRoute.endNodeID);
            
            xyStartSquareID = 'route_'+xyStart.x + '_'+xyStart.y;
            xyEndSquareID = 'route_'+xyEnd.x + '_'+xyEnd.y;
            
            //save handlers to be removed after they click.
            this.placeTrainHandlers = [];
            this.placeTrainHandlers.push(dojo.connect($(xyStartSquareID), 'onclick', this, 'onPlaceTrain' ));
            this.placeTrainHandlers.push(dojo.connect($(xyEndSquareID), 'onclick', this, 'onPlaceTrain' ));
            
            dojo.addClass(xyStartSquareID, 'selectable_train_start_location');
            dojo.addClass(xyEndSquareID, 'selectable_train_start_location');
        },
        sendMovesToServer()
        {
            //list of available cards cannot be sent as [0,2,3...], but as a comma delimited string of nums.
            //So we need to strip the brackets
            available_cards = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]['available_cards'];
            available_cards = available_cards.slice(1,available_cards.length-1);

            paramList =
            {   
                r1 : this.firstPlacementData.rotation,
                x1 : this.firstPlacementData.posx,
                y1 : this.firstPlacementData.posy,
                c1 : this.firstPlacementData.selectedTrack,
                directions_free1 : this.firstPlacementData.directions_free,
                r2 : this.rotation,
                x2 : this.posx,
                y2 : this.posy,
                c2 : this.selectedTrack,
                directions_free2 : this.directions_free,
                available_cards : available_cards
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

        //user has decided to actually put card down.
        onPlacedCard()
        {
            dojo.destroy('place_card_action_button');
            dojo.destroy('begin_trip_button');

            let trackcard = this.gamedatas.tracks[this.selectedTrack][0];
            let directions_free = this.scUtility.getDirections_free(trackcard, this.rotation);
            //console.log("place it", trackcard, this.rotation, this.posx,this.posy,directions_free,this.gamedatas.gamestate.args.board);

            // remove from available cards.
            var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0];
            
            let availableCards = JSON.parse(itsme["available_cards"])
            var index = availableCards.indexOf(parseInt(this.selectedTrack));
            if (index !== -1) {
                availableCards.splice(index, 1);
            }    

            //if this track is replacing a track on the board, move it to the player's available cards.
            trackOnBoardID = this.gamedatas.gamestate.args.tracks[this.posx][this.posy];
            isReplacing = this.gamedatas.gamestate.args.board[this.posx][this.posy] != '[]';
            if (isReplacing)
            {
                availableCards.push(parseInt(trackOnBoardID));
            }

            itsme["available_cards"] = JSON.stringify(availableCards);
            
            this.updatePlayers(this.gamedatas.gamestate.args.players);

            if (this.isFirstSelection)
            {
                //save data from first placement
                this.firstPlacementData.directions_free = directions_free;
                this.firstPlacementData.rotation = this.rotation;
                this.firstPlacementData.selectedTrack = this.selectedTrack;
                this.firstPlacementData.posx = this.posx;
                this.firstPlacementData.posy = this.posy;
                this.firstPlacementData.badDirections = this.fitCardOnBoard();

                //write selected track data to underlying board
                this.gamedatas.gamestate.args.board[this.posx][this.posy]= directions_free;
                this.gamedatas.gamestate.args.rotations[this.posx][this.posy] = this.rotation;
                this.gamedatas.gamestate.args.tracks[this.posx][this.posy] = this.selectedTrack;


                //reset so user can select another piece
                this.selectedTrack =-1;
                this.rotation = 0;

                this.isFirstSelection = false;

                //make the tile unrotatable.
                dojo.disconnect(this.rotationClickHandler);

                //add ability to reset turn
                if(!$('reset_button'))
                {
                    this.addActionButton('reset_button', _('Reset'), () => this.onReset());
                }
            }
            else
            {
                this.directions_free = directions_free; //pass this along
                //Since this the 2nd placement, we are good to go.
                this.sendMovesToServer();
            } 
        },

        //Based on current card rotation, establish the directions free now
        getDirections_free(trackcard, rotation)
        {
            let directions_free = ""

            //process each direction on the track card and add to the directions free based on the rotation.
            this.nesw.forEach(direction =>{
                if (trackcard[direction] != '')
                {
                    offset = this.nesw.indexOf(direction)*90; //this changes the index in the nwse array. This *90 is the amount of additional rotation we need.
                    directions_free += this.nesw[(((rotation+offset)%360)/90)];
                }
            });
            
            return directions_free                

        },

        /* Returns true if the new track supports movement in as many ways or more than the track it is replacing. */
        checktrackmatch(currenttrack, newtrack){
            let match = true

            this.nesw.forEach( direction =>{
                for (var i = 0; i < currenttrack[direction].length; i++) {
                    if(match){
                        match = newtrack[direction].indexOf(currenttrack[direction].charAt(i))!=-1;
                    }
                }
            });                         
            return match
        },

        //Does this track fit in this location on the board?
        //If yes, an empty array is returned.
        //If no the cardinal directions which are not a good fit are returned.
        //If placed on an existing track and it does not conform to the directions, function returns 'x'
        fitTrack(trackcard, rotation, x, y)
        {
            directions_free = this.scUtility.getDirections_free(trackcard, rotation);
            badDirections = [];
           
            if(this.gamedatas.gamestate.args.board[x][y] !='[]') 
            {
                //This card has been placed on another card. Check it for compatibility.
                let cardOnBoardTrackID = this.gamedatas.gamestate.args.tracks[x][y];
                let rotationOfCardOnBoard = this.gamedatas.gamestate.args.rotations[x][y];
                let cardOnBoard = this.gamedatas.tracks[cardOnBoardTrackID][rotationOfCardOnBoard/90];
                let trackcardcheck =  this.gamedatas.tracks[this.selectedTrack][parseInt(rotation)/90];
                if(!this.checktrackmatch(cardOnBoard, trackcardcheck)){
                    this.showMessage( _("Existing paths need to remain the same."), 'info');	                    
                    return ['x']; //new track is incompatible with track on board
                }
            }

            this.nesw.forEach(direction =>{
                switch(direction)
                {
                    case "N":
                        var xcheck = x;
                        var ycheck = y-1;
                        break;
                    case "E":
                        var xcheck = x+1;
                        var ycheck = y;
                        break;
                    case "S":
                        var xcheck = x;
                        var ycheck = y+1;
                        break;
                    case "W":
                        var xcheck = x-1;
                        var ycheck = y;
                        break;
                }

                
                if(directions_free.indexOf(direction)!=-1)
                {
                    //check for a stop
                    if (this.gamedatas.initialStops.filter(l => l.row==ycheck && l.col==xcheck).length>0)
                    {
                        badDirections.push(direction);
                        return; //acts like a "continue"
                    }
                }

                trackcheck = '[]';
                if(xcheck>=1 && xcheck<=12 && ycheck>=1 && ycheck<=12){
                    //check for empty square in this direction
                    trackcheck = this.gamedatas.gamestate.args.board[xcheck ][ycheck];
                    if (trackcheck == '[]')
                        //direction is good, empty square
                        return; //acts like a "continue"
                } else {
                    trackcheck = this.scUtility.borderTracksDirections_free(xcheck, ycheck);
                }

                //180 degree rotation - if we are looking North from the selected, this will look south from the north track.
                directionFromTrackcheck = this.nesw[(this.nesw.indexOf(direction)+2)%4];

                //if both true or both false, we don't want to record this direction as bad. Otherwise we do. XOR.
                isSideFreeAtSelectedTrack = trackcheck.indexOf(directionFromTrackcheck) != -1;
                isSelectedTrackFreeTowardThisTrack = directions_free.indexOf(direction)!=-1
                if(isSideFreeAtSelectedTrack ? !isSelectedTrackFreeTowardThisTrack :isSelectedTrackFreeTowardThisTrack){
                        badDirections.push(direction);
                }  
            });

            return badDirections;
        },
       
        updatePlayers: function(players, defaultscoring){
            //update player boards
            //delete previous tracks on player board
            dojo.query('.playertrack').orphan();
            
            players.forEach(player => {
                dojo.empty('track_'+player.id)
                if(player.id==this.player_id){
                    dojo.style( 'start_'+player.id, 'background-position', (parseInt(player.linenum)-1)*-50+'px 0px');
                    let html = ""
                    this.gamedatas.goals[parseInt(player.goals)-1][parseInt(player.linenum)-1].forEach(goal => {
                        html += "<div class='goallocation' id='goallocation_"+goal+"'>"+goal+"</div>"
                        let location = this.gamedatas.initialStops.filter(l => l.code== goal)[0]
                        dojo.style( 'stops_'+location.col+"_"+location.row, 'border', 'solid 4px #FCDF00' );

                    });

                    dojo.style('checktrack_'+player.id,'display','block');
                    if (!(this.curRoute==null) && this.curRoute.isComplete)
                    {
                        dojo.style('completedMsg_'+player.id,'display','inline-block');
                        dojo.addClass('start_'+player.id,'linenum_completed');
                    }

                    
                    $('goal_'+player.id).innerHTML=html
                    let available_cards = JSON.parse(player["available_cards"])
                
                    available_cards.forEach((s,c) => {
                        dojo.place( this.format_block( 'jstpl_track_player', {
                            id: s+"_"+player.id+"_"+c,
                            offsetx:-parseInt(s)*100,
                        } ) , 'track_'+player.id);    
                    });
                } else {
                    dojo.destroy('start_'+player.id)
                }
            })
            dojo.query( '.playertrack' ).connect( 'onclick', this, 'onSelectTrack' );
            //dojo.query( '.playertrack' ).connect( 'onclick', this, this.scEventHandlers.test() )
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
                            html = "<div class='goallocation stopN' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.scUtility.validCoordinates(x,y-1) && this.gamedatas.initialStops.filter(l => l.row==y-1 && l.col==x).length>0){
                            html = "<div class='goallocation stopS' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.scUtility.validCoordinates(x+1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x+1).length>0){
                            html = "<div class='goallocation stopE' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.scUtility.validCoordinates(x-1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x-1).length>0){
                            html = "<div class='goallocation stopW' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        $('stops_'+x+"_"+y).innerHTML=html

                    }
                }
            }
        },
        
        onToggleShowRoute(evt)
        {
            //Don't toggle if no route
            dojo.stopEvent(evt);
            if (this.curRoute == null)
            {
                this.showMessage( _("No stations connect with goal stops."), 'info'); 
                return;
            }
            this.isShowRoute = this.isShowRoute ? false : true;
            $(evt.currentTarget.id).innerHTML = this.isShowRoute ? 'Hide Route' : 'Show Route';
            this.showRoute()
        },

        //Use this for route nodes.
       
        getPixelLocationBasedOnNodeID(nodeID)
        {
            xOrigin = 42+50; //+50 is center of tiles
            yOrigin = 45+50;

            parsedNodeID = this.scUtility.extractXYD(nodeID);

            xOffset =0;
            yOffset =0;

            switch(parsedNodeID['d'])
            {
                case "N":
                    yOffset = -25;
                    break;
                case "E":
                    xOffset = 25;
                    break;
                case "S":
                    yOffset = 25;
                    break;
                case "W":
                    xOffset = -25;
                    break;
            }

            return {
                'x': parseInt(xOrigin + xOffset + parsedNodeID['x']*100),
                'y': parseInt(yOrigin + yOffset + parsedNodeID['y']*100),
            };
        },
        showRoute()
        {
            //delete previous route
            dojo.query('.route_line').orphan();

            console.log(JSON.stringify(this.curRoute));

            //if we are not showing the route, we are done.
            if (!this.isShowRoute) return;
            
            //no route to show.
            if (this.curRoute == null) return;

            
            let route = this.curRoute.routeNodes; //will be null if there is no route.
            
            //console.debug(JSON.stringify(route));

            for (var parentID in route) 
            {
                if (Object.prototype.hasOwnProperty.call(route, parentID))
                {
                    childID = route[parentID];
                    
                    parentPixelXY = this.getPixelLocationBasedOnNodeID(parentID);
                    childPixelXY = this.getPixelLocationBasedOnNodeID(childID);
                    $('wrapper').appendChild(this.scLines.createLine(parentPixelXY['x'], parentPixelXY['y'], childPixelXY['x'], childPixelXY['y'],'red'));
                }
            }
            

           // let graph = this.gamedatas.gamestate.args.connectivityGraph;
            //console.debug(JSON.stringify(graph));

        },
        

        onSelectTrack(evt){
            dojo.stopEvent( evt );
            dojo.destroy('place_card_action_button'); //cannot place an unplaced track.
            var coords = evt.currentTarget.id.split('_');
            dojo.query( '.playertrack' ).removeClass('trackselected')
            
            // destroy previous selected track
            dojo.destroy(this.scUtility.getPlacedTrackId(this.isFirstSelection));
            if(coords[2]==this.player_id){
                this.selectedTrack = parseInt(coords[1]);
                dojo.addClass( evt.currentTarget.id, 'trackselected' );
            }
        },
        
        showDice(){
            this.setGamestateDescription('choosedie');

            var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
            //draw train on location
            let location = JSON.parse(itsme.trainposition)
            
            // show dice
            dojo.style( 'dice', 'display', 'inline-flex' );
            $('dice').innerHTML= ""
            let die = JSON.parse(itsme['dice'])
            console.log(die)
            die.forEach(d =>{
                let v = parseInt(d)-1
                console.log(d, v)
                dojo.place( this.format_block( 'jstpl_die', {
                    id: d,
                    offsetx:-80*v,
                    rotate:0
                } ) , 'dice'); 

            })
            dojo.query('.die').connect( 'onclick', this, 'onSelectDie' );
        },
        onSelectDie(evt )
        {
            var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]

            // Stop this event propagation
            dojo.stopEvent( evt )
            var coords = evt.currentTarget.id.split('_');
            var die = parseInt(coords[1])
            console.log("onSelectDie", die)
            dojo.style( 'dice', 'display', 'none' );

        },
        
        setupNotifications: function()
        {
             // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
            dojo.subscribe( 'placedTrack', this, "notif_placedTrack" );
            dojo.subscribe( 'updateRoute',this,'notif_updateRoute');
            dojo.subscribe( 'placedTrain', this, 'notif_placedTrain');
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

        // getTrainRotation(trainPositionNodeID)
        // {   
        //     //This relies on the fact that the routeID of the curRoute is the first routeID of the merge constructed route. 
        //     //So the train is always at the begining of the route, and its routeID will be whatever the route ID is of the current route,
        //     //even though it may be composed of multiple routes.
        //     routeNodeID = trainPositionNodeID + '_' + this.curRoute.routeID;
        //     nextRouteNodeID = this.curRoute.routeNodes[routeNodeID];
        //     console.log(JSON.stringify(this.curRoute.routeNodes));

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
        getRotationFromDirection(direction)
        {
            switch(direction)
            {
                case "N": return 0;
                case "E": return 90;
                case "S": return 180;
                case "W": return 270;
            }
        },
        showTrain : function(linenum,player_id,nodeID,traindirection)
        {
            //if nodeID is null, there is no train to show
            if (nodeID==null) return;

            trainXYD = this.scUtility.extractXYD(nodeID);
            
            //if this is a border place those are denoted by route_, otherwise its a square_
            tileID = this.scUtility.validCoordinates(trainXYD.y,trainXYD.x) ? 'square_'+trainXYD.x+"_"+trainXYD.y : 'route_'+trainXYD.x+"_"+trainXYD.y;
            rotation = this.getRotationFromDirection(traindirection);
            console.log ('Params','linenum: '+linenum+'\nplayer_id: ' + player_id+'\ntileID:'+tileID+'\ndirection:'+traindirection+'\nrotation:'+rotation);
            
            dojo.destroy("train_"+player_id);
            dojo.place( this.format_block( 'jstpl_train', {
                id: "train_"+player_id,
                offsetx:(-100)*(parseInt(linenum)-1),
                rotate: rotation,
            } ) , tileID);

        },
        notif_updateRoute: function( notif )
        {
            console.log('notif_updateRoute',notif.args.player_id);
            this.routes = notif.args.routes;
            this.curRoute = (this.routes != null) ? this.routes[0] : null;
            this.showRoute();
        },
   });             
});
