/* Javascript event handlers */

define([
    "dojo", "dojo/_base/declare",
], function( dojo, declare )
{
    return declare("bgagame.scEventHandlers", null, { 
        
        constructor: function (game) {
            this.game = game; //DOES NOT PERSIST IN EVENT HANDLER CALLS????
            this.scUtility = this.game.scUtility;
            this.nesw = this.game.nesw;
            this.onPlaceCardHandlers = [];
            this.onSelectedNodeHandlers = [];
            this.isShowRoute = false;
        },


        /*********************************************************************************** */
        /*              PLACING CARD                                                        */
        /*********************************************************************************** */

        onSelectCard(evt, game)
        {
            this.game = game; //HAVE TO REASSIGN THIS???
            dojo.stopEvent( evt );
            dojo.destroy('place_card_action_button'); //cannot place an unplaced track.
            dojo.query( '.playertrack' ).removeClass('trackselected')
            
            placedTrackID = this.scUtility.getPlacedTrackId(this.game.isFirstSelection); //tile on board
           //if this is a reselection of tile, show the animation of the tile returning to the playerboard.
            if (this.game.selectedTrack != null && $(placedTrackID))
            {
                selectedTrackID = this.scUtility.getSelectedTrackIDFromDataObj(this.game.selectedTrack); // currently invisible tile on player board.
                returnAnim = this.game.slideToObject( placedTrackID, 'track_'+this.game.selectedTrack.player_id);

                dojo.connect(returnAnim, "onEnd", function(){
                    // destroy previous selected track on the board- user has selected a different card.
                    dojo.destroy(placedTrackID);

                     //reveal previous card that wasn't placed.
                    dojo.style(selectedTrackID,"display","");
                });

                //if the player rotated the returning tile, we want to forget that
                this.game.rotation = 0;
                returnAnim.play(); // start it up
            }
            
            //even if there is no card returning to the deck, this needs to happen.
            this.game.selectedTrack = this.scUtility.createSelectedTrackDataObj(evt.currentTarget.id);
            dojo.addClass( evt.currentTarget.id, 'trackselected' );
            
        },

        onPlaceCard( evt, game )
        {
            //HAVE TO REASSIGN THIS???
            this.game = game;
            // Stop this event propagation
            dojo.stopEvent( evt );
            
            if( this.game.checkAction( 'placeTrack' ))
            {
                if(this.game.selectedTrack==null){
                    this.game.showMessage( _("Select track part you want to place."), 'error');	
                    return;
                }
               
                stackLen = this.game.gamedatas.gamestate.args.stackCount;
                if(this.game.selectedTrack.player_id != this.game.getActivePlayerId() && stackLen >0)
                {
                    this.game.showMessage( _("You cannot play with other player's tiles until the tile stack is depleted."), 'error');	
                    return;
                }

                var coords = evt.currentTarget.id.split('_');
                if (coords[1] == this.game.firstPlacementData.posx && coords[2]== this.game.firstPlacementData.posy)
                {
                    this.game.showMessage( _("You cannot play on your first placement."), 'error');	
                    return;
                }
                
                this.game.posx =parseInt(coords[1]);
                this.game.posy =parseInt(coords[2]);

                if(parseInt(this.game.gamedatas.gamestate.args.tracks[this.game.posx][this.game.posy])>=6)
                {
                    this.game.showMessage( _("This track can not be replaced."), 'error');	
                    dojo.destroy('place_card_action_button'); //eliminates place card button in action buttons.
                    return;
                }

                let isStop = this.game.gamedatas.initialStops.filter(l => l.row==this.game.posy && l.col==this.game.posx).length>0
                if(isStop) 
                {
                    this.game.showMessage( _("Cannot put track on stop."), 'error');
                    dojo.destroy('place_card_action_button'); //deletes place track button
                    return;
                }

                //card can be legally placed

                placedTrackID = this.scUtility.getPlacedTrackId(this.game.isFirstSelection);
                
                if(!$(placedTrackID))
                {
                    // hide selected track on player board
                    dojo.style(this.scUtility.getSelectedTrackIDFromDataObj(this.game.selectedTrack),"display","none");

                    //put new track on board.
                    dojo.place( this.game.format_block( 'jstpl_track', 
                    {
                        id: placedTrackID,
                        offsetx:-100* this.game.selectedTrack.card,
                        rotate:this.game.rotation
                    } ) , 'track_'+this.game.selectedTrack.player_id,'after');
                    this.rotationClickHandler = dojo.connect($(placedTrackID), 'onclick', this, 'onRotateCard' );
                } 
                anim = this.game.slideToObject( placedTrackID, "square_"+this.game.posx+"_"+this.game.posy);

                dojo.connect(anim, "onEnd", function(){
                    // put in proper place in DOM heirarchy
                    dojo.place($(placedTrackID),"square_"+this.game.posx+"_"+this.game.posy);
                    //style top and left refer to the player board, which is no longer the parent. So remove these movements from style.
                    dojo.style($(placedTrackID), 'top', '0px');
                    dojo.style($(placedTrackID), 'left','0px');
                }.bind(this));

                anim.play();
                
                
                badDirections = this.fitCardOnBoard();
                this.showPlaceCardActionButton(badDirections);
            }
        },   
        onRotateCard(evt)
        {
            // Stop this event propagation
            dojo.stopEvent( evt );
        
            console.log('ROTATE: ' + this.game.rotation);
            this.game.rotation = (this.game.rotation + 90) % 360;
            this.game.rotateTo(this.scUtility.getPlacedTrackId(this.game.isFirstSelection), this.game.rotation);
            console.log('ROTATE2: ' + this.game.rotation);
            badDirections = this.fitCardOnBoard();
            this.showPlaceCardActionButton(badDirections);
           
        },
        fitCardOnBoard()
        {
            dojo.destroy('place_card_action_button');
            badDirections = this.fitTrack(this.game.gamedatas.tracks[this.game.selectedTrack.card][0],
                this.game.rotation, parseInt(this.game.posx), parseInt(this.game.posy));

            dojo.addClass(this.scUtility.getPlacedTrackId(this.game.isFirstSelection),this.game.isFirstSelection ? 'track_placement' : 'track_placement2');
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
                    rotationOffset = this.game.rotation/90;
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
            
            dojo.style(this.scUtility.getPlacedTrackId(this.game.isFirstSelection),"border-color",borderColorString.trimEnd());
           
            return badDirections;
        },
        showPlaceCardActionButton(badDirections)
        {
            if (badDirections.includes('x')) return; //case where player tried to place on non-conforming space.
            if (this.game.isFirstSelection && badDirections.length <= 1)
            {
                //Allow the placement with one bad direction. The user could fix it next placement.
                this.game.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard() );
                return;
            }

            if (badDirections.length == 0 && this.game.firstPlacementData.badDirections.length == 0)
            {
                this.game.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard() );
                return;
            }

            if (badDirections.length == 0 && this.game.firstPlacementData.badDirections.length == 1)
            {
                //This is a special case - only show the place button *if* the badDirection of the first tile points at the 2nd tile.
                //If so, then the new placement fixed the problem (because it doesn't have any bad sides)
                showPlaceActionButton = false;
                switch(this.game.firstPlacementData.badDirections[0])
                {
                    case "N":
                        showPlaceActionButton = (this.game.posx == this.game.firstPlacementData.posx) && (this.game.posy == this.game.firstPlacementData.posy-1);
                        break;
                    case "E":
                        showPlaceActionButton = (this.game.posx  == this.game.firstPlacementData.posx+ 1) && (this.game.posy == this.game.firstPlacementData.posy);
                        break;
                    case "S":
                        showPlaceActionButton = (this.game.posx == this.game.firstPlacementData.posx) && (this.game.posy == this.game.firstPlacementData.posy+1);
                        break;
                    case "W":
                        showPlaceActionButton = (this.game.posx  == this.game.firstPlacementData.posx- 1) && (this.game.posy == this.game.firstPlacementData.posy);
                }

                if (showPlaceActionButton)
                {
                    this.game.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard() );
                    return;
                }
                
            }

            //none of these are valid - do not show place card
            dojo.destroy('place_card_action_button');
        },

         //user has decided to actually put card down.
         onPlacedCard()
         {
            dojo.destroy('place_card_action_button');
            dojo.destroy('begin_trip_button');
 
            let trackcard = this.game.gamedatas.tracks[this.game.selectedTrack.card][0];
            let directions_free = this.scUtility.getDirections_free(trackcard, this.game.rotation);
            let sourceOfCard = this.game.selectedTrack.player_id; 
 
             // remove from available cards.
            var player = this.game.gamedatas.gamestate.args.players.filter(p =>p.id==sourceOfCard)[0];
             
            let availableCards = JSON.parse(player["available_cards"])
            var index = availableCards.indexOf(parseInt(this.game.selectedTrack.card));
            if (index !== -1) 
            {
                availableCards.splice(index, 1);
            }    
 
            //if this track is replacing a track on the board, move it to the player's available cards.
            trackOnBoardID = this.game.gamedatas.gamestate.args.tracks[this.game.posx][this.game.posy];
            isReplacing = this.game.gamedatas.gamestate.args.board[this.game.posx][this.game.posy] != '[]';
            if (isReplacing)
            {
                availableCards.push(parseInt(trackOnBoardID));
                player["available_cards"] = JSON.stringify(availableCards);
                tileReturning = dojo.query('#square_'+this.game.posx+'_'+this.game.posy+' > .track')[0];
                returnAnim = this.game.slideToObject(tileReturning, 'track_'+ sourceOfCard);

                //we need to give this a local name so it can be used in the anonymous function.
                g = this.game;

                dojo.connect(returnAnim, "onEnd", function(){
                    // destroy previous selected track on the board- user has selected a different card.
                    dojo.destroy(tileReturning);
                    g.updatePlayers(g.gamedatas.gamestate.args.players);
                });

                returnAnim.play();
            }
            else
            {
                player["available_cards"] = JSON.stringify(availableCards);                
                this.game.updatePlayers(this.game.gamedatas.gamestate.args.players);
            }

            if (this.game.isFirstSelection)
            {
                //save data from first placement
                this.game.firstPlacementData.directions_free = directions_free;
                this.game.firstPlacementData.rotation = this.game.rotation;
                this.game.firstPlacementData.selectedTrack = this.game.selectedTrack;
                this.game.firstPlacementData.posx = this.game.posx;
                this.game.firstPlacementData.posy = this.game.posy;
                this.game.firstPlacementData.badDirections = this.fitCardOnBoard();

                //write selected track data to underlying board
                this.game.gamedatas.gamestate.args.board[this.game.posx][this.game.posy]= directions_free;
                this.game.gamedatas.gamestate.args.rotations[this.game.posx][this.game.posy] = this.game.rotation;
                this.game.gamedatas.gamestate.args.tracks[this.game.posx][this.game.posy] = this.game.selectedTrack.card;


                //reset so user can select another piece
                this.game.selectedTrack = null;
                this.game.rotation = 0;

                this.game.isFirstSelection = false;

                //make the tile unrotatable.
                dojo.disconnect(this.rotationClickHandler);

                //add ability to reset turn
                if(!$('reset_button'))
                {
                    this.game.addActionButton('reset_button', _('Reset'), () => this.onReset());
                }
            }
            else
            {
                this.game.directions_free = directions_free; //pass this along
                //Since this the 2nd placement, we are good to go.
                this.game.sendMovesToServer();
            } 
 
             
         },

         /* Returns true if the new track supports movement in as many ways or more than the track it is replacing. */
        checktrackmatch(currenttrack, newtrack)
        {
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
           
            if(this.game.gamedatas.gamestate.args.board[x][y] !='[]') 
            {
                //This card has been placed on another card. Check it for compatibility.
                let cardOnBoardTrackID = this.game.gamedatas.gamestate.args.tracks[x][y];
                let rotationOfCardOnBoard = this.game.gamedatas.gamestate.args.rotations[x][y];
                let cardOnBoard = this.game.gamedatas.tracks[cardOnBoardTrackID][rotationOfCardOnBoard/90];
                let trackcardcheck =  this.game.gamedatas.tracks[this.game.selectedTrack.card][parseInt(rotation)/90];
                if(!this.checktrackmatch(cardOnBoard, trackcardcheck)){
                    this.game.showMessage( _("Existing paths need to remain the same."), 'info');	                    
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

                trackcheck = this.game.gamedatas.gamestate.args.board[xcheck ][ycheck];

                if(directions_free.indexOf(direction)!=-1)
                {
                    //check for a stop
                    if (this.game.gamedatas.initialStops.filter(l => l.row==ycheck && l.col==xcheck).length>0)
                    {
                        badDirections.push(direction);
                        return; //acts like a "continue"
                    }

                    //check for invalid border square
                    if (trackcheck == 'X')
                    {
                        badDirections.push(direction);
                        return;
                    }
                }

                //check for empty square in this direction
                if (trackcheck == '[]')
                    //direction is good, empty square
                    return; //acts like a "continue"
                
                
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

        /********************************************************************************* */
        /*                      Train Placement                                             */
        /********************************************************************************* */
        
        /**
         * User has clicked on start inaugural trip.
         **/

        onBeginTrip(game)
        {
            this.game = game;
            //setup ui to record person's choice of train start
            dojo.destroy('place_card_action_button');
            dojo.destroy('begin_trip_button');
            
            this.game.addActionButton('reset_button', _('Reset'), () => this.onReset());
            $('pagemaintitletext').innerHTML = _('Select train starting location.');

            //remove click ability on all the board squares
            this.onPlaceCardHandlers.forEach( dojo.disconnect);

            game.showTrainDestinations([this.game.scRouting.curRoute.startNodeID,this.game.scRouting.curRoute.endNodeID], (evt) => this.onPlaceTrain(evt));
        },

        /**
         * User has selected a square to start the trip from.
         * @param {Object} evt 
         */
        onPlaceTrain(evt)
        {
            selectedTrainLoc = this.scUtility.extractXY(evt.currentTarget.id);
            trainStartNodeID = '';
            trainEndNodeID ='';

            //find right route - may have clicked on the end of the route, so find the corresponding route with this as the start of route.
            for(i=0;i<this.game.scRouting.routes.length;i++)
            {
                routeStartNodeLoc = this.scUtility.extractXYD(this.game.scRouting.routes[i].startNodeID);
                if (routeStartNodeLoc.x == selectedTrainLoc.x && routeStartNodeLoc.y == selectedTrainLoc.y )
                {
                    trainStartNodeID = this.game.scRouting.routes[i].startNodeID;
                    trainEndNodeID = this.game.scRouting.routes[i].endNodeID;
                    this.curRoute = this.game.scRouting.routes[i];
                    break;
                }
            }

           //remove highlighting & clickability
           dojo.query(".selectable_tile").removeClass('selectable_tile');
           this.onSelectedNodeHandlers.forEach(dojo.disconnect);

            players = this.game.gamedatas.gamestate.args.players;
            linenum = parseInt(players.filter(p =>p.id==this.game.player_id)[0]['linenum']);
            this.game.ajaxcall( "/streetcar/streetcar/placeTrain.html",{linenum: linenum, trainStartNodeID: trainStartNodeID, trainEndNodeID: trainEndNodeID}, this.game, function( result ) {} );
        },
        

        /**
         * User clicked on the show route/ Hide route button. 
         * @param {Object} evt 
         */

        onToggleShowRoute(evt,scRouting)
        {
            //Don't toggle if no route
            if (scRouting.curRoute == null)
            {
                this.game.showMessage( _("No stations connect with goal stops."), 'info'); 
                return;
            }
            this.isShowRoute = this.isShowRoute ? false : true;
            $(evt.currentTarget.id).innerHTML = this.isShowRoute ? 'Hide Route' : 'Shortest Route';
            scRouting.showRoute();
        },
         /*********************************************************************************** */
        /*             RESET                                                                  */
        /*********************************************************************************** */

        onReset()
        {   
            //reload page.
            dojo.destroy('reset_button')
            location.reload();
        },

        /*********************************************************************************** */
        /*              DICE ROLLING                                                        */
        /********************************************************************************** */
        onRollDice()
        {
            this.game.ajaxcall( "/streetcar/streetcar/rollDice.html",{}, this.game, function( result ) {} );
        },

        onDoneWithTurn()
        {
            this.game.ajaxcall( "/streetcar/streetcar/doneWithTurn.html",{}, this.game, function( result ) {} );
        },

        onSelectDie(evt )
        {
            // Stop this event propagation
            dojo.stopEvent( evt )
            var coords = evt.currentTarget.id.split('_');
            var die = parseInt(coords[2]);
            var dieIdx = parseInt(coords[1]);
            console.log("onSelectDie", die);
           
            this.game.ajaxcall( "/streetcar/streetcar/selectDie.html",{'dieIdx':dieIdx,'die':die}, this.game, function( result ) {} );
        },

        /*********************************************************************************** */
        /*             TRAIN DESTINATION                                                        */
        /********************************************************************************** */
        onSelectTrainDestination(evt, destinationNodes)
        {
            destinationNode = null;
            for (i=0; i < destinationNodes.length; i++)
            {
                xyTarget = this.scUtility.extractXY(evt.currentTarget.id);
                xyNode = destinationNodes[i];
                if ((xyTarget.x == xyNode.x) && (xyTarget.y == xyNode.y))
                {
                    destinationNode = this.scUtility.XYDtoKey(destinationNodes[i]);
                    break;
                }
            }
            //determine which destinationNode was clicked on
            
            //remove highlighting & clickability
            dojo.query(".selectable_tile").removeClass('selectable_tile');
            dojo.query(".die_selected").removeClass('die_selected');
            this.onSelectedNodeHandlers.forEach(dojo.disconnect);
            
            this.game.ajaxcall( "/streetcar/streetcar/selectTrainDestination.html",{'destinationNode':destinationNode}, this.game, function( result ) {} );
        },
    });
});
