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
    g_gamethemeurl + "modules/scLines.js"
],
function (dojo, declare) {
    return declare("bgagame.streetcar", ebg.core.gamegui, {
        constructor: function(){
            console.log('streetcar constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            this.nesw = ["N","E","S","W"];
            this.scLines =  new bgagame.scLines();

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

            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
                var player_board_div = $('player_board_'+player_id);

                dojo.place( this.format_block('jstpl_player_board', player ), player_board_div );                 
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            
            
            //dojo.query( '.route' ).connect( 'onclick', this, 'onClickRoute' );
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

            //routing
            this.curRoute= gamedatas.route;
            this.isShowRoute = false;
            
            dojo.query( '.square' ).connect( 'onclick', this, 'onPlaceCard' );
            
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
                    this.setStartLocation = false
                    dojo.query( '.route' ).removeClass( 'noclick' );                        

                    if(itsme.trainposition=='[]'){
                        this.setGamestateDescription('choosestart');
                        this.setStartLocation = true
                        start = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["start"]
                        start.forEach(point=>{
                            dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
                        })
                        end = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["end"]
                        end.forEach(point=>{
                            dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
                        })            
                    } else {
                        this.showDice()

                    }                
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

        ///////////////////////////////////////////////////
        //// Utility methods
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
                    dojo.destroy(this.getPlacedTrackId(this.isFirstSelection));
                    dojo.place( this.format_block( 'jstpl_track', {
                        id: this.getPlacedTrackId(this.isFirstSelection),
                        offsetx:-100* this.selectedTrack,
                        rotate:this.rotation
                    } ) , "square_"+this.posx+"_"+this.posy);

                    badDirections = this.fitCardOnBoard();
                    this.showPlaceCardActionButton(badDirections);
                    
                    this.rotationClickHandler = dojo.connect($(this.getPlacedTrackId(this.isFirstSelection)), 'onclick', this, 'onRotateCard' );
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
            dojo.destroy('reset')
            location.reload();
        },
        onRotateCard(evt)
        {
            this.rotation = (this.rotation + 90) % 360;
            
            this.rotateTo(this.getPlacedTrackId(this.isFirstSelection), this.rotation);
            badDirections = this.fitCardOnBoard();
            this.showPlaceCardActionButton(badDirections);
        },             
        fitCardOnBoard()
        {
            dojo.destroy('place_card_action_button');
            badDirections = this.fitTrack(this.gamedatas.tracks[this.selectedTrack][0],
                this.rotation, parseInt(this.posx), parseInt(this.posy));

            dojo.addClass(this.getPlacedTrackId(this.isFirstSelection),this.isFirstSelection ? 'track_placement' : 'track_placement2');
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
            
            dojo.style(this.getPlacedTrackId(this.isFirstSelection),"border-color",borderColorString.trimEnd());
           
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
            if($('place_card_action_button'))
            {
                dojo.destroy('place_card_action_button');
            }

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
            
            dojo.destroy('reset');
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
            dojo.destroy(this.getPlacedTrackId(true));
            dojo.destroy(this.getPlacedTrackId(false));

            //clear firstPlacementData
            this.firstPlacementData = {};
            this.ajaxcall( "/streetcar/streetcar/placeTracks.html",paramList, this, function( result ) {} );
        },

        //user has decided to actually put card down.
        onPlacedCard()
        {
            dojo.destroy('place_card_action_button')

            let trackcard = this.gamedatas.tracks[this.selectedTrack][0];
            let directions_free = this.getDirections_free(trackcard, this.rotation);
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
                if(!$('reset'))
                {
                    this.addActionButton('reset', _('Reset'), () => this.onReset());
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
            directions_free = this.getDirections_free(trackcard, rotation);
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
                    trackcheck = this.borderTracksDirections_free(xcheck, ycheck);
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
        borderTracksDirections_free(xcheck, ycheck){
            if(ycheck==0){
                if([2,3,6,7,10,11].indexOf(xcheck)!=-1){
                    return 'S'
                } else {
                    return 'EW'
                }
            }
            if(ycheck==13){
                if([2,3,6,7,10,11].indexOf(xcheck)!=-1){
                    return 'N'
                } else {
                    return 'EW'
                }
            }
            if(xcheck==0){
                if([2,3,6,7,10,11].indexOf(ycheck)!=-1){
                    return 'E'
                } else {
                    return 'NS'
                }
            }
            if(xcheck==13){
                if([2,3,6,7,10,11].indexOf(ycheck)!=-1){
                    return 'W'
                } else {
                    return 'NS'
                }
            }
            return '[]'

        },
        getPlacedTrackId(isFirstSelection)
        {
            //isFirstSelection is a parameter because sometimes even when we are in 2nd selection, we want to know
            //the id of the first selection.
            return 'placed_track_' + (isFirstSelection ? "0" : "1");
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
                    //html += "<div class='goalcheck' id='checktrack"+player.id+"'>Test track</div>"

                    
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
                        if(this.validCoordinates(x,y+1) && this.gamedatas.initialStops.filter(l => l.row==y+1 && l.col==x).length>0){
                            html = "<div class='goallocation stopN' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.validCoordinates(x,y-1) && this.gamedatas.initialStops.filter(l => l.row==y-1 && l.col==x).length>0){
                            html = "<div class='goallocation stopS' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.validCoordinates(x+1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x+1).length>0){
                            html = "<div class='goallocation stopE' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.validCoordinates(x-1,y) && this.gamedatas.initialStops.filter(l => l.row==y && l.col==x-1).length>0){
                            html = "<div class='goallocation stopW' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        $('stops_'+x+"_"+y).innerHTML=html

                    }
                }
            }
        },
        validCoordinates(row, col)
        {
            // console.log(">>vc",row,col)
            return (row >= 1 && row < 13 && col >= 1 && col < 13);
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
        showRoute()
        {
            function extractXYD(nodeID)
            {
                splitNodeID = nodeID.split('_');
                return {'x': parseInt(splitNodeID[0]),
                    'y': parseInt(splitNodeID[1]),
                    'd': splitNodeID[2],
                };
            }

            function getPixelLocationBasedOnNodeID(nodeID)
            {
                xOrigin = 42+50; //+50 is center of tiles
                yOrigin = 45+50;

                parsedNodeID = extractXYD(nodeID);

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
            }

            //delete previous route
            dojo.query('.route_line').orphan();

            console.debug(JSON.stringify(this.curRoute));

            //if we are not showing the route, we are done.
            if (!this.isShowRoute) return;
            
            //no route to show.
            if (this.curRoute == null) return;

            for(i=0;i<this.curRoute.length;i++)
            {
                let route = this.curRoute[i].routeNodes; //will be null if there is no route.
                
                //console.debug(JSON.stringify(route));

                for (var parentID in route) 
                {
                    if (Object.prototype.hasOwnProperty.call(route, parentID))
                    {
                        childID = route[parentID];
                        
                        parentPixelXY = getPixelLocationBasedOnNodeID(parentID);
                        childPixelXY = getPixelLocationBasedOnNodeID(childID);
                        $('wrapper').appendChild(this.scLines.createLine(parentPixelXY['x'], parentPixelXY['y']+i*2, childPixelXY['x'], childPixelXY['y']+i*2,'red'));
                    }
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
            dojo.destroy(this.getPlacedTrackId(this.isFirstSelection));
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
            dojo.place( this.format_block( 'jstpl_train', {
                id: "train_"+itsme["id"],
                offsetx:-100*(parseInt(itsme["linenum"])-1),
                rotate:0
            } ) , 'route_'+location[0]+"_"+location[1]); 
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
            console.log("onSelectDie", die, itsme["traveldirection"])
            dojo.style( 'dice', 'display', 'none' );

            // if(itsme["traveldirection"]==""){
            //     console.log("enable neighbour")
            //     let location = JSON.parse(itsme.trainposition)
            //     this.enableNeighbours(location[0],location[1])
            //     this.routestartX = location[0]
            //     this.routestartY = location[1]
            // } else {

            // }

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
            this.notifqueue.setSynchronous( 'placedTrack', 500 );
            
           
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        notif_placedTrack: function( notif )
        {
            console.log("notif_placedTracknotif_placedTracknotif_placedTracknotif_placedTracknotif_placedTrack", notif)
            // for( var player_id in notif.args.scores )
            // {
            //     var newScore = notif.args.scores[ player_id ];
            //     this.scoreCtrl[ player_id ].toValue( newScore );
            // }
            this.gamedatas.gamestate.args.stops=notif.args.stops;
            this.gamedatas.gamestate.args.rotations=notif.args.rotations;
            this.gamedatas.gamestate.args.board=notif.args.board;
            this.gamedatas.gamestate.args.tracks=notif.args.tracks;
            this.updateStops();
            this.updateTracks();
        },
        
        notif_updateRoute: function( notif )
        {
            console.log('notif_updateRoute',notif.args.player_id);
            this.curRoute = notif.args.route;
            this.showRoute();
        }

        // onClickRoute: function( evt )
        // {
        //     // Stop this event propagation
        //     dojo.stopEvent( evt )
        //     console.log( "onClickRoute")
        //     var coords = evt.currentTarget.id.split('_');
        //     var x = parseInt(coords[1])
        //     var y = parseInt(coords[2]);
        //     let tracks = this.gamedatas.gamestate.args.tracks;
        //     let rotations = this.gamedatas.gamestate.args.rotations;
        //     let board = this.gamedatas.gamestate.args.board;
        //     let directions = this.gamedatas.tracks[tracks[x][y]][[0,90,180,270].indexOf(parseInt(rotations[x][y]))]
        //     //find direction
        //     let traveled = 'N'
        //     if(this.routestartX == x){
        //         if(this.routestartY>y){
        //             traveled ='S'
        //         } else {
        //             traveled = 'N'
        //         }
        //     } else {
        //         if(this.routestartX>x){
        //             traveled ='E'
        //         } else {
        //             traveled = 'W'
        //         }                
        //     }
        //     var optionsactive = 0
           
        //     console.log("place train",x,y,this.currentState)
        //     //movetrain?
        //     if(this.currentState == 'moveTrain' && this.checkAction( 'moveTrain') && dojo.hasClass(evt.currentTarget.id, "option-border")){
        //         if(this.setStartLocation){
        //             //just set startlocation 
        //             this.ajaxcall( "/streetcar/streetcar/setTrainLocation.html",{ x:x, y:y}, this, function( result ) {} );
        //             this.showDice()

        //         } else {
        //             console.log("HIERO!!!", traveled)
        //             this.ajaxcall( "/streetcar/streetcar/setTrainLocation.html",{ x:x, y:y}, this, function( result ) {
        //                 this.ajaxcall( "/streetcar/streetcar/setTrainDirection.html",{ d:traveled}, this, function( result ) {} );
        //             } );
        //         }
        //     } else {
        //         if(this.routestartX==-1 && this.routestartY==-1){
        //             if(dojo.hasClass(evt.currentTarget.id, "option-border")){
        //                 console.log("---TRAVELDIR", traveled)
        //                 // this.route[parseInt(x)][parseInt(y)] = 1
        //                 console.log(x,y,this.routestartX,this.routestartY)
        //                 dojo.query( '.route' ).removeClass( 'option-border' );
        //                 if(directions.N!='' ){
        //                     let newx = parseInt(parseInt(x))
        //                     let newy = parseInt(parseInt(y)-1)
        //                     console.log(">>ADD N>>",'route_'+newx+'_'+newy,directions.N)
        //                     let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                     if(neighbour.S!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

        //                         dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                         optionsactive++
        //                     }

        //                 }
        //                 if(directions.E!=''){
        //                     let newx = parseInt(parseInt(x)+1)
        //                     let newy = parseInt(parseInt(y))
        //                     console.log(">>ADD E>>",'route_'+newx+'_'+newy,directions.E);
        //                     let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                     if(neighbour.W!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
        //                         dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                         optionsactive++
        //                     }
        //                 }
        //                 if(directions.S!=''){
        //                     let newx = parseInt(parseInt(x))
        //                     let newy = parseInt(parseInt(y)+1)
        //                     console.log(">>ADD S>>",'route_'+newx+'_'+newy,directions.S)
        //                     let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                     if(neighbour.N!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

        //                         dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                         optionsactive++
        //                     }
        //                 }                
        //                 if(directions.W!=''){
        //                     let newx = parseInt(parseInt(x)-1)
        //                     let newy = parseInt(parseInt(y))
        //                     console.log(">>ADD W>>",'route_'+newx+'_'+newy,directions.W)
        //                     let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                     if(neighbour.E!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
        //                         dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                         optionsactive++
        //                     }

        //                 }
        //                 this.routestartX = x 
        //                 this.routestartY = y
        //                 this.routestarted = [x,y]
        //             }
        //         } else {
        //         if(dojo.hasClass(evt.currentTarget.id, "option-border")){
        //             console.log("TRAVELDIR", traveled, directions[traveled])
        //             // this.route[parseInt(x)][parseInt(y)] = 1
        //             console.log(x,y,this.routestartX,this.routestartY)
        //             dojo.query( '.route' ).removeClass( 'option-border' );
        //             if(directions[traveled].indexOf('N')!=-1){
        //                 let newx = parseInt(parseInt(x))
        //                 let newy = parseInt(parseInt(y)-1)
        //                 console.log(">>ADD N>>",'route_'+newx+'_'+newy,directions.N)
        //                 let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                 if(neighbour.S!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

        //                     dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                     optionsactive++
        //                 }

        //             }
        //             if(directions[traveled].indexOf('E')!=-1){
        //                 let newx = parseInt(parseInt(x)+1)
        //                 let newy = parseInt(parseInt(y))
        //                 console.log(">>ADD E>>",'route_'+newx+'_'+newy,directions.E);
        //                 let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                 if(neighbour.W!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
        //                     dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                     optionsactive++
        //                 }
        //             }
        //             if(directions[traveled].indexOf('S')!=-1){
        //                 let newx = parseInt(parseInt(x))
        //                 let newy = parseInt(parseInt(y)+1)
        //                 console.log(">>ADD S>>",'route_'+newx+'_'+newy,directions.S)
        //                 let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                 if(neighbour.N!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

        //                     dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                     optionsactive++
        //                 }
        //             }                
        //             if(directions[traveled].indexOf('W')!=-1){
        //                 let newx = parseInt(parseInt(x)-1)
        //                 let newy = parseInt(parseInt(y))
        //                 console.log(">>ADD W>>",'route_'+newx+'_'+newy,directions.W)
        //                 let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //                 if(neighbour.E!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
        //                     dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //                     optionsactive++
        //                 }

        //             }
        //             this.routestartX = x 
        //             this.routestartY = y
        //             // check if we reach goals or end
        //             isLocation = this.gamedatas.gamestate.args.stops[x][y]
        //             console.log("goalreached", isLocation)
        //             var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
        //             let goals = this.gamedatas.goals[parseInt(itsme.goals)-1][parseInt(itsme.linenum)-1]

        //             if(isLocation!='' && isLocation!=null){
        //                 goals.forEach(g =>{
        //                     console.log("COMPARE goals", g, isLocation)
        //                         if(g===isLocation){
        //                             dojo.addClass( 'goallocation_'+isLocation, 'goalreached')
        //                             this.goalsReached ++
        //                             console.log("plusgoal")
        //                         }
        //                     })

        //             }
        //             // endpoint
        //             let endpoint = false
        //             start = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["start"]
        //             start.forEach(point=>{
        //                 if(this.routestarted[0] != point[0] && this.routestarted[1]!= point[1] && point[0]==x && point[1]==y){
        //                     endpoint = true
        //                 }
        //             })
        //             end = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["end"]
        //             end.forEach(point=>{
        //                 if(this.routestarted[0] != point[0] && this.routestarted[1]!= point[1] && point[0]==x && point[1]==y){
        //                     endpoint = true
        //                 }
        //             })
        //             console.log("cjeckEND ", endpoint, this.goalsReached, goals.length)
        //             if(endpoint && this.goalsReached == goals.length){
        //                 console.log("route complete, travel it")
        //                 this.showMessage( _("You completed your route. Moving to travel state."), 'info');	
        //                 this.ajaxcall( "/streetcar/streetcar/trackDone.html",{}, this, function( result ) {})

        //             } else {
        //                 if(optionsactive==0){
        //                     this.showMessage( _("No more options to travel."), 'info');	
        //                     this.onGoalCheck();
        //                     dojo.query( '.goallocation' ).removeClass('goalreached')
        //                     dojo.query( '.route' ).removeClass( 'option-border' );
        //                 }     
        //             }              

        //         }     

        //         this.previoustraveled = traveled
        //     }
    
        //     }

        //     //
        // },
       
        // enableNeighbours(x,y){
        //     let tracks = this.gamedatas.gamestate.args.tracks;
        //     let rotations = this.gamedatas.gamestate.args.rotations;
        //     let board = this.gamedatas.gamestate.args.board;
        //     let directions = this.gamedatas.tracks[tracks[x][y]][[0,90,180,270].indexOf(parseInt(rotations[x][y]))]
        //     var optionsactive = 0
        //     if(directions.N!='' ){
        //         let newx = parseInt(parseInt(x))
        //         let newy = parseInt(parseInt(y)-1)
        //         console.log(">>ADD N>>",'route_'+newx+'_'+newy,directions.N)
        //         let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //         if(neighbour.S!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

        //             dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //             optionsactive++
        //         }

        //     }
        //     if(directions.E!=''){
        //         let newx = parseInt(parseInt(x)+1)
        //         let newy = parseInt(parseInt(y))
        //         console.log(">>ADD E>>",'route_'+newx+'_'+newy,directions.E);
        //         let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //         if(neighbour.W!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
        //             dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //             optionsactive++
        //         }
        //     }
        //     if(directions.S!=''){
        //         let newx = parseInt(parseInt(x))
        //         let newy = parseInt(parseInt(y)+1)
        //         console.log(">>ADD S>>",'route_'+newx+'_'+newy,directions.S)
        //         let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //         if(neighbour.N!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

        //             dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //             optionsactive++
        //         }
        //     }                
        //     if(directions.W!=''){
        //         let newx = parseInt(parseInt(x)-1)
        //         let newy = parseInt(parseInt(y))
        //         console.log(">>ADD W>>",'route_'+newx+'_'+newy,directions.W)
        //         let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
        //         if(neighbour.E!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
        //             dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
        //             optionsactive++
        //         }

        //     }            
        // },
        // showDirection(){
        //     let board = this.gamedatas.gamestate.args.board;
        //     let tracks = this.gamedatas.gamestate.args.tracks;
        //     let rotations = this.gamedatas.gamestate.args.rotations;
        //     for(var x = 1; x<=12; x++){
        //         for(var y = 1; y<=12; y++){
        //             if(board[x][y]!='[]'){
        //                 let track = tracks[x][y];
        //                 let trackcard =  this.gamedatas.tracks[track][["0","90","180","270"].indexOf(rotations[x][y])]                
        //                  if(trackcard.N!=''){
        //                     dojo.place( this.format_block( 'jstpl_direction', {
        //                         d: "N",
        //                         px:x,
        //                         py:y,
        //                     } ) , 'route_'+x+"_"+y);  
        //                     dojo.addClass( 'direction_'+x+'_'+y+'_N', 'stopN' );
        //                 }
        //                 if(trackcard.E!=''){
        //                     dojo.place( this.format_block( 'jstpl_direction', {
        //                         d: "E",
        //                         px:x,
        //                         py:y,
        //                     } ) , 'route_'+x+"_"+y);  
        //                     dojo.addClass( 'direction_'+x+'_'+y+'_E', 'stopE' );
        //                 }                        
        //                 if(trackcard.S!=''){
        //                     dojo.place( this.format_block( 'jstpl_direction', {
        //                         d: "S",
        //                         px:x,
        //                         py:y,
        //                     } ) , 'route_'+x+"_"+y);  
        //                     dojo.addClass( 'direction_'+x+'_'+y+'_S', 'stopS' );
        //                 } 
        //                 if(trackcard.W!=''){
        //                     dojo.place( this.format_block( 'jstpl_direction', {
        //                         d: "W",
        //                         px:x,
        //                         py:y,
        //                     } ) , 'route_'+x+"_"+y);  
        //                     dojo.addClass( 'direction_'+x+'_'+y+'_W', 'stopW' );
        //                 }                         
        //             }

        //         }
        //     }
        // },
        // async checkTrack(){
        //     if( this.isCurrentPlayerActive() ) {
        //         var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
        //         start = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["start"]
        //         this.endlocations = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["end"]
        //         console.log(this.endlocations)
        //         if(parseInt(itsme["linenum"])<=3){
        //             this.endpointDestination = "N"
        //         } else {
        //             this.endpointDestination = "E"
        //         }
        //         this.locationsToReach = this.gamedatas.goals[parseInt(itsme.goals)-1][parseInt(itsme.linenum)-1]
        //         this.fillStack = Array()
        //         this.genCheckMatrix()
        //         //await this.canReachEnd(start[0][0],start[0][1])
        //         // console.log(">>>>>>>>>>>>>>", this.gamedatas.tracks)
        //     }
        // },
        // genCheckMatrix(){
        //     this.checkMatrix = new Array();
        //     for(var x =1;x<13;x++){
        //         this.genCheckMatrix[x]= new Array()
        //         for(var y =1; y<13;y++){
        //             this.genCheckMatrix[x][y] = 0;
        //         }
        //     }
        // },
       
        
        
        // onGoalCheck(){
        //     console.log("onGoalCheck",this.traceTrack)
        //     if(!this.traceTrack){
        //         var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
        //         start = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["start"]
        //         start.forEach(point=>{
        //             dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
        //         })
        //         end = this.gamedatas.routeEndPoints[parseInt(itsme["linenum"])-1]["end"]
        //         end.forEach(point=>{
        //             dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
        //         })            
        //         dojo.query( '.route' ).removeClass( 'noclick' );
        //         this.traceTrack = true
        //         this.goalsReached = 0
        //     } else {
        //         dojo.query( '.route' ).addClass( 'noclick' );
        //         this.traceTrack = false
        //     }

        //     this.route = new Array()
        //     for (var i=0;i<14;i++){
        //         this.route[i]= new Array()
        //         for(var j=0;j<14;j++){
        //             this.route[i][j] = 0;
        //         }
        //     }
        //     this.routestartX = -1;
        //     this.routestartY = -1;

        // },
        ///////////////////////////////////////////////////
        //// Player's action
        // onShowLocation(evt){
        //     var coords =evt.currentTarget.id.split('_');
        //     let location = this.gamedatas.initialStops.filter(l => l.code== coords[1])[0]
        //     dojo.style( 'stops_'+location.col+"_"+location.row, 'border', 'solid 2px white' );

        // },
        // onHideLocation(evt){
        //     var coords =evt.currentTarget.id.split('_');
        //     let location = this.gamedatas.initialStops.filter(l => l.code== coords[1])[0]
        //     dojo.style( 'stops_'+location.col+"_"+location.row, 'border', '' );
        // },
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/streetcar/streetcar/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */

        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your streetcar.game.php file.
        
        */
        
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */
   });             
});
