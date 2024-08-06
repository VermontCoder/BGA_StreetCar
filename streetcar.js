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
    "ebg/counter"
],
function (dojo, declare) {
    return declare("bgagame.streetcar", ebg.core.gamegui, {
        constructor: function(){
            console.log('streetcar constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            this.nesw = ["N","E","S","W"];

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
            
            dojo.subscribe( 'placedTrack', this, "notif_placedTrack" );
            this.notifqueue.setSynchronous( 'placedTrack', 500 );

            this.debug = false

            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
                var player_board_div = $('player_board_'+player_id);

                dojo.place( this.format_block('jstpl_player_board', player ), player_board_div );                 
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            dojo.query( '.square' ).connect( 'onclick', this, 'onPlaceCard' );
            dojo.query( '.route' ).connect( 'onclick', this, 'onClickRoute' );
            this.rotation = 0;
            this.selectedTrack = 0;
            this.traceTrack = false;
            // show stops
           
            let i = 0;
            gamedatas.stops.forEach(l=>{
                // dojo.destroy('stoplocation_'+stops[x][y])
                html = "<div class='goallocation goalstart' id='stoplocation_"+l.code+"'>"+l.code+"</div><div class='goalname' id='goalname_"+l.code+"'>"+l.name+"</div>"
                $('stops_'+l.col+"_"+l.row).innerHTML=html
                i++
            })
            
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

                    this.updatePlayers(args.args.players)
                    this.updateTracks()
                    this.updateStops()
                    // this.checkTrack()
                    // this.showDirection()
                    break;
                case "moveTrain":
                    this.updatePlayers(args.args.players)
                    this.updateTracks()
                    this.updateStops()
                    var itsme = args.args.players.filter(p =>p.id==this.player_id)[0]
                    this.setStartLocation = false
                    dojo.query( '.route' ).removeClass( 'noclick' );                        

                    if(itsme.trainposition=='[]'){
                        this.setGamestateDescription('choosestart');
                        this.setStartLocation = true
                        start = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["start"]
                        start.forEach(point=>{
                            dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
                        })
                        end = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["end"]
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
            //this.gamedatas.gamestate.description = `${originalState['description' + property]}`; 
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
            dojo.stopEvent( evt )
            console.log("placecard dingus")
            if( this.checkAction( 'playTrack' ) && this.selectedTrack!=-1 ){
                console.log("placecard")
                var coords = evt.currentTarget.id.split('_');
                
                //this.placeCard = true
                this.posx =coords[1];
                this.posy =coords[2];
                if(parseInt(this.gamedatas.gamestate.args.tracks[this.posx][this.posy])>=6){
                    this.showMessage( _("This track can not be replaced."), 'info');	
                    dojo.destroy('place_card_action_button'); //eliminates place card button in action buttons.

                } else 
                {
                    let isStop = this.gamedatas.stops.filter(l => l.row==this.posy && l.col==this.posx).length>0
                    if(!isStop) 
                    {
                        dojo.destroy('track_'+this.selectedTrack);
                        dojo.place( this.format_block( 'jstpl_track', {
                            id: this.selectedTrack,
                            offsetx:-100* this.selectedTrack,
                            rotate:this.rotation
                        } ) , "square_"+this.posx+"_"+this.posy);

                        
                        this.placeCardButton();
                        this.addRotationOnClick()
                    }
                    else
                    {
                        this.showMessage( _("Cannot put track on station."), 'info');
                        dojo.destroy('place_card_action_button'); //deletes place track button.
                    }   
                    
                }
            }
            if(this.selectedTrack==-1){
                this.showMessage( _("Select track part you want to place."), 'info');	

            }
            
        } ,   
        onClickRoute: function( evt )
        {
            // Stop this event propagation
            dojo.stopEvent( evt )
            console.log( "onClickRoute")
            var coords = evt.currentTarget.id.split('_');
            var x = parseInt(coords[1])
            var y = parseInt(coords[2]);
            let tracks = this.gamedatas.gamestate.args.tracks;
            let rotations = this.gamedatas.gamestate.args.rotations;
            let board = this.gamedatas.gamestate.args.board;
            let directions = this.gamedatas.tracks[tracks[x][y]][[0,90,180,270].indexOf(parseInt(rotations[x][y]))]
            //find direction
            let traveled = 'N'
            if(this.routestartX == x){
                if(this.routestartY>y){
                    traveled ='S'
                } else {
                    traveled = 'N'
                }
            } else {
                if(this.routestartX>x){
                    traveled ='E'
                } else {
                    traveled = 'W'
                }                
            }
            var optionsactive = 0
            // var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]

                


            // dojo.place( this.format_block( 'jstpl_train', {
            //     id: "board_",
            //     offsetx:-100*(parseInt(itsme["startposition"])-1),
            //     rotate:0
            // } ) , 'route_'+x+"_"+y); 
            console.log("place train",x,y,this.currentState)
            //movetrain?
            if(this.currentState == 'moveTrain' && this.checkAction( 'moveTrain') && dojo.hasClass(evt.currentTarget.id, "option-border")){
                if(this.setStartLocation){
                    //just set startlocation 
                    this.ajaxcall( "/streetcar/streetcar/setTrainLocation.html",{ x:x, y:y}, this, function( result ) {} );
                    this.showDice()

                } else {
                    console.log("HIERO!!!", traveled)
                    this.ajaxcall( "/streetcar/streetcar/setTrainLocation.html",{ x:x, y:y}, this, function( result ) {
                        this.ajaxcall( "/streetcar/streetcar/setTrainDirection.html",{ d:traveled}, this, function( result ) {} );
                    } );
                }
            } else {
                if(this.routestartX==-1 && this.routestartY==-1){
                    if(dojo.hasClass(evt.currentTarget.id, "option-border")){
                        console.log("---TRAVELDIR", traveled)
                        // this.route[parseInt(x)][parseInt(y)] = 1
                        console.log(x,y,this.routestartX,this.routestartY)
                        dojo.query( '.route' ).removeClass( 'option-border' );
                        if(directions.N!='' ){
                            let newx = parseInt(parseInt(x))
                            let newy = parseInt(parseInt(y)-1)
                            console.log(">>ADD N>>",'route_'+newx+'_'+newy,directions.N)
                            let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                            if(neighbour.S!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

                                dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                                optionsactive++
                            }

                        }
                        if(directions.E!=''){
                            let newx = parseInt(parseInt(x)+1)
                            let newy = parseInt(parseInt(y))
                            console.log(">>ADD E>>",'route_'+newx+'_'+newy,directions.E);
                            let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                            if(neighbour.W!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
                                dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                                optionsactive++
                            }
                        }
                        if(directions.S!=''){
                            let newx = parseInt(parseInt(x))
                            let newy = parseInt(parseInt(y)+1)
                            console.log(">>ADD S>>",'route_'+newx+'_'+newy,directions.S)
                            let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                            if(neighbour.N!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

                                dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                                optionsactive++
                            }
                        }                
                        if(directions.W!=''){
                            let newx = parseInt(parseInt(x)-1)
                            let newy = parseInt(parseInt(y))
                            console.log(">>ADD W>>",'route_'+newx+'_'+newy,directions.W)
                            let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                            if(neighbour.E!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
                                dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                                optionsactive++
                            }

                        }
                        this.routestartX = x 
                        this.routestartY = y
                        this.routestarted = [x,y]
                    }
                } else {
                if(dojo.hasClass(evt.currentTarget.id, "option-border")){
                    console.log("TRAVELDIR", traveled, directions[traveled])
                    // this.route[parseInt(x)][parseInt(y)] = 1
                    console.log(x,y,this.routestartX,this.routestartY)
                    dojo.query( '.route' ).removeClass( 'option-border' );
                    if(directions[traveled].indexOf('N')!=-1){
                        let newx = parseInt(parseInt(x))
                        let newy = parseInt(parseInt(y)-1)
                        console.log(">>ADD N>>",'route_'+newx+'_'+newy,directions.N)
                        let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                        if(neighbour.S!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

                            dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                            optionsactive++
                        }

                    }
                    if(directions[traveled].indexOf('E')!=-1){
                        let newx = parseInt(parseInt(x)+1)
                        let newy = parseInt(parseInt(y))
                        console.log(">>ADD E>>",'route_'+newx+'_'+newy,directions.E);
                        let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                        if(neighbour.W!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
                            dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                            optionsactive++
                        }
                    }
                    if(directions[traveled].indexOf('S')!=-1){
                        let newx = parseInt(parseInt(x))
                        let newy = parseInt(parseInt(y)+1)
                        console.log(">>ADD S>>",'route_'+newx+'_'+newy,directions.S)
                        let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                        if(neighbour.N!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

                            dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                            optionsactive++
                        }
                    }                
                    if(directions[traveled].indexOf('W')!=-1){
                        let newx = parseInt(parseInt(x)-1)
                        let newy = parseInt(parseInt(y))
                        console.log(">>ADD W>>",'route_'+newx+'_'+newy,directions.W)
                        let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                        if(neighbour.E!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
                            dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                            optionsactive++
                        }

                    }
                    this.routestartX = x 
                    this.routestartY = y
                    // check if we reach goals or end
                    isLocation = this.gamedatas.gamestate.args.stops[x][y]
                    console.log("goalreached", isLocation)
                    var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
                    let goals = this.gamedatas.goals[parseInt(itsme.goals)-1][parseInt(itsme.startposition)-1]

                    if(isLocation!='' && isLocation!=null){
                        goals.forEach(g =>{
                            console.log("COMPARE goals", g, isLocation)
                                if(g===isLocation){
                                    dojo.addClass( 'goallocation_'+isLocation, 'goalreached')
                                    this.goalsReached ++
                                    console.log("plusgoal")
                                }
                            })

                    }
                    // endpoint
                    let endpoint = false
                    start = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["start"]
                    start.forEach(point=>{
                        if(this.routestarted[0] != point[0] && this.routestarted[1]!= point[1] && point[0]==x && point[1]==y){
                            endpoint = true
                        }
                    })
                    end = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["end"]
                    end.forEach(point=>{
                        if(this.routestarted[0] != point[0] && this.routestarted[1]!= point[1] && point[0]==x && point[1]==y){
                            endpoint = true
                        }
                    })
                    console.log("cjeckEND ", endpoint, this.goalsReached, goals.length)
                    if(endpoint && this.goalsReached == goals.length){
                        console.log("route complete, travel it")
                        this.showMessage( _("You completed your route. Moving to travel state."), 'info');	
                        this.ajaxcall( "/streetcar/streetcar/trackDone.html",{}, this, function( result ) {})

                    } else {
                        if(optionsactive==0){
                            this.showMessage( _("No more options to travel."), 'info');	
                            this.onGoalCheck();
                            dojo.query( '.goallocation' ).removeClass('goalreached')
                            dojo.query( '.route' ).removeClass( 'option-border' );
                        }     
                    }              

                }     

                this.previoustraveled = traveled
            }
    
            }

            //
        },
        showDice(){
            this.setGamestateDescription('choosedie');

            var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
            //draw train on location
            let location = JSON.parse(itsme.trainposition)
            dojo.place( this.format_block( 'jstpl_train', {
                id: "train_"+itsme["id"],
                offsetx:-100*(parseInt(itsme["startposition"])-1),
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

            if(itsme["traveldirection"]==""){
                console.log("enable neighbour")
                let location = JSON.parse(itsme.trainposition)
                this.enableNeighbours(location[0],location[1])
                this.routestartX = location[0]
                this.routestartY = location[1]
            } else {

            }

        },
        enableNeighbours(x,y){
            let tracks = this.gamedatas.gamestate.args.tracks;
            let rotations = this.gamedatas.gamestate.args.rotations;
            let board = this.gamedatas.gamestate.args.board;
            let directions = this.gamedatas.tracks[tracks[x][y]][[0,90,180,270].indexOf(parseInt(rotations[x][y]))]
            var optionsactive = 0
            if(directions.N!='' ){
                let newx = parseInt(parseInt(x))
                let newy = parseInt(parseInt(y)-1)
                console.log(">>ADD N>>",'route_'+newx+'_'+newy,directions.N)
                let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                if(neighbour.S!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

                    dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                    optionsactive++
                }

            }
            if(directions.E!=''){
                let newx = parseInt(parseInt(x)+1)
                let newy = parseInt(parseInt(y))
                console.log(">>ADD E>>",'route_'+newx+'_'+newy,directions.E);
                let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                if(neighbour.W!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
                    dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                    optionsactive++
                }
            }
            if(directions.S!=''){
                let newx = parseInt(parseInt(x))
                let newy = parseInt(parseInt(y)+1)
                console.log(">>ADD S>>",'route_'+newx+'_'+newy,directions.S)
                let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                if(neighbour.N!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){

                    dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                    optionsactive++
                }
            }                
            if(directions.W!=''){
                let newx = parseInt(parseInt(x)-1)
                let newy = parseInt(parseInt(y))
                console.log(">>ADD W>>",'route_'+newx+'_'+newy,directions.W)
                let neighbour = this.gamedatas.tracks[tracks[newx][newy]][[0,90,180,270].indexOf(parseInt(rotations[newx][newy]))]
                if(neighbour.E!='' && board[newx][newy]!='[]' && (this.routestartX != newx || this.routestartY!=newy)){
                    dojo.addClass( 'route_'+newx+'_'+newy, 'option-border' );
                    optionsactive++
                }

            }            
        },
        addRotationOnClick(){
           
            dojo.connect($('track_'+this.selectedTrack), 'onclick', this, 'onRotateCard' );
        },
        onRotateCard(evt){
            this.rotation = (this.rotation + 90) % 360;
            
            this.rotateTo('track_'+this.selectedTrack, this.rotation)
            this.placeCardButton();
        },             
        placeCardButton(){
            dojo.destroy('place_card_action_button');
            badDirections = this.fitTrack(this.gamedatas.tracks[this.selectedTrack][0],this.rotation, this.posx, this.posy);

            dojo.addClass('track_'+this.selectedTrack,'track_placement');
            borderColorString = '';
            if (badDirections.includes('x'))
            {
                //track on board is not compatible with track being placed
                borderColorString = 'red red red red ';
            }
            else
            { 
                this.addActionButton( 'place_card_action_button', _('Place track'), () => this.onPlacedCard(),'extra_actions' );

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
            
            dojo.style('track_'+this.selectedTrack,"border-color",borderColorString.trimEnd());
           
        },  
        onPlacedCard()
        {
            dojo.destroy('place_card_action_button')

            let trackcard = this.gamedatas.tracks[this.selectedTrack][0];
            let directions_free = this.getDirections_free(trackcard, this.rotation);
            console.log("place it", trackcard, this.rotation, this.posx,this.posy,directions_free,this.gamedatas.gamestate.args.board)
            this.gamedatas.gamestate.args.board[this.posx][this.posy]= directions_free
            this.ajaxcall( "/streetcar/streetcar/placeTrack.html",{r:this.rotation, x:this.posx, y:this.posy,c: this.selectedTrack,o:directions_free}, this, function( result ) {} );
            //remove temp track and replace
            dojo.destroy('track_'+this.selectedTrack)
            dojo.place( this.format_block( 'jstpl_track', {
                id: "board_"+this.selectedTrack,
                offsetx:-parseInt(this.selectedTrack)*100,
                rotate:this.rotation
            } ) , 'square_'+this.posx+"_"+this.posy);   

            // remove
            var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
            if(itsme){
                let trackcards = JSON.parse(itsme["available_cards"])
                var index = trackcards.indexOf(parseInt(this.selectedTrack));
                if (index !== -1) {
                    trackcards.splice(index, 1);
                }
                itsme["available_cards"] = JSON.stringify(trackcards)
                // console.log(trackcards)
                // if(trackcards.length)
            }
            this.updatePlayers(this.gamedatas.gamestate.args.players)
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
                let trackcardcheck =  this.gamedatas.tracks[this.selectedTrack][[0,90,180,270].indexOf(parseInt(rotation))];
                if(!this.checktrackmatch(cardOnBoard, trackcardcheck)){
                    this.showMessage( _("Existing trails need to remain the same."), 'info');	
                    
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
                    if (this.gamedatas.stops.filter(l => l.row==ycheck && l.col==xcheck).length>0)
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
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */

        updatePlayers: function(players, defaultscoring){
            //update player boards
            players.forEach(player => {
                dojo.empty('track_'+player.id)
                if(player.id==this.player_id){
                    dojo.style( 'start_'+player.id, 'background-position', (parseInt(player.startposition)-1)*-50+'px 0px');
                    let html = ""
                    this.gamedatas.goals[parseInt(player.goals)-1][parseInt(player.startposition)-1].forEach(goal => {
                        html += "<div class='goallocation' id='goallocation_"+goal+"'>"+goal+"</div>"
                        let location = this.gamedatas.stops.filter(l => l.code== goal)[0]
                        dojo.style( 'stops_'+location.col+"_"+location.row, 'border', 'solid 4px #FCDF00' );

                    })
                    html += "<div class='goalcheck' id='checktrack"+player.id+"'>Test track</div>"

                    $('goal_'+player.id).innerHTML=html
                    let available_cards = JSON.parse(player["available_cards"])
                    let c=0
                    available_cards.forEach(s => {
                        dojo.place( this.format_block( 'jstpl_track_player', {
                            id: s+"_"+player.id+"_"+c,
                            offsetx:-parseInt(s)*100,
                        } ) , 'track_'+player.id);    
                        c++
                    })
                } else {
                    dojo.destroy('start_'+player.id)
                }
            })
            dojo.query( '.playertrack' ).connect( 'onclick', this, 'onSelectTrack' );
            dojo.query( '.goalcheck' ).connect( 'onclick', this, 'onGoalCheck' );
        }, 
        updateTracks() {
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
            if(this.debug){
                for(var x = 0; x<=13; x++){
                    for(var y = 0; y<=13; y++){
                        if(board[x][y]!='[]' && board[x][y]!=undefined &&(x==0||x==13||y==0||y==13)){
                            console.log(tracks[x][y],rotations[x][y])
                            dojo.place( this.format_block( 'jstpl_track', {
                                id: "board_"+tracks[x][y],
                                offsetx:-parseInt(tracks[x][y])*100,
                                rotate:rotations[x][y]
                            } ) , 'route_'+x+"_"+y);   
                            
                        }
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
                        if(this.validCoordinates(x,y+1) && this.gamedatas.stops.filter(l => l.row==y+1 && l.col==x).length>0){
                            html = "<div class='goallocation stopN' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.validCoordinates(x,y-1) && this.gamedatas.stops.filter(l => l.row==y-1 && l.col==x).length>0){
                            html = "<div class='goallocation stopS' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.validCoordinates(x+1,y) && this.gamedatas.stops.filter(l => l.row==y && l.col==x+1).length>0){
                            html = "<div class='goallocation stopE' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        if(this.validCoordinates(x-1,y) && this.gamedatas.stops.filter(l => l.row==y && l.col==x-1).length>0){
                            html = "<div class='goallocation stopW' id='stoplocation_"+stops[x][y]+"'>"+stops[x][y]+"</div>"
                        }
                        $('stops_'+x+"_"+y).innerHTML=html

                    }
                }
            }
        },
        showDirection(){
            let board = this.gamedatas.gamestate.args.board;
            let tracks = this.gamedatas.gamestate.args.tracks;
            let rotations = this.gamedatas.gamestate.args.rotations;
            for(var x = 1; x<=12; x++){
                for(var y = 1; y<=12; y++){
                    if(board[x][y]!='[]'){
                        let track = tracks[x][y];
                        let trackcard =  this.gamedatas.tracks[track][["0","90","180","270"].indexOf(rotations[x][y])]                
                         if(trackcard.N!=''){
                            dojo.place( this.format_block( 'jstpl_direction', {
                                d: "N",
                                px:x,
                                py:y,
                            } ) , 'route_'+x+"_"+y);  
                            dojo.addClass( 'direction_'+x+'_'+y+'_N', 'stopN' );
                        }
                        if(trackcard.E!=''){
                            dojo.place( this.format_block( 'jstpl_direction', {
                                d: "E",
                                px:x,
                                py:y,
                            } ) , 'route_'+x+"_"+y);  
                            dojo.addClass( 'direction_'+x+'_'+y+'_E', 'stopE' );
                        }                        
                        if(trackcard.S!=''){
                            dojo.place( this.format_block( 'jstpl_direction', {
                                d: "S",
                                px:x,
                                py:y,
                            } ) , 'route_'+x+"_"+y);  
                            dojo.addClass( 'direction_'+x+'_'+y+'_S', 'stopS' );
                        } 
                        if(trackcard.W!=''){
                            dojo.place( this.format_block( 'jstpl_direction', {
                                d: "W",
                                px:x,
                                py:y,
                            } ) , 'route_'+x+"_"+y);  
                            dojo.addClass( 'direction_'+x+'_'+y+'_W', 'stopW' );
                        }                         
                    }

                }
            }
        },
        async checkTrack(){
            if( this.isCurrentPlayerActive() ) {
                var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
                start = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["start"]
                this.endlocations = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["end"]
                console.log(this.endlocations)
                if(parseInt(itsme["startposition"])<=3){
                    this.endpointDestination = "N"
                } else {
                    this.endpointDestination = "E"
                }
                this.locationsToReach = this.gamedatas.goals[parseInt(itsme.goals)-1][parseInt(itsme.startposition)-1]
                this.fillStack = Array()
                this.genCheckMatrix()
                //await this.canReachEnd(start[0][0],start[0][1])
                // console.log(">>>>>>>>>>>>>>", this.gamedatas.tracks)
            }
        },
        genCheckMatrix(){
            this.checkMatrix = new Array();
            for(var x =1;x<13;x++){
                this.genCheckMatrix[x]= new Array()
                for(var y =1; y<13;y++){
                    this.genCheckMatrix[x][y] = 0;
                }
            }
        },
        // async canReachEnd(x,y){

        //     this.fillStack.push([x, y]);
        //     while(this.fillStack.length > 0)
        //     {
        //         var [row, col] = this.fillStack.pop();
        //         if (!this.validCoordinates(row, col))
        //             continue;
        //             // console.log("Check ",row, col, this.fillStack)
        //             // console.log("Check ",this.gamedatas.gamestate.args.board[row][col])
                
        //             this.genCheckMatrix[row][col] = 1;

        //         if(this.gamedatas.gamestate.args.board[row][col].indexOf('N')!=-1){
        //             let nrow = row
        //             let ncol = col-1 
        //             if (this.validCoordinates(nrow, ncol)) {
        //             // check if we reached one of the end locations
        //                 if(this.endlocations.filter(e=>e[0]==nrow && e[1]==ncol).length>0 && this.gamedatas.gamestate.args.board[nrow][ncol].indexOf(this.endpointDestination)!=-1){
        //                     console.log("ËNDLOCATIONREACHED", nrow,ncol)
        //                 } else {
        //                     if(this.genCheckMatrix[nrow][ncol]==0){
        //                         // console.log("Add to stack N", nrow,ncol)
        //                         this.fillStack.push([nrow, ncol]);
        //                     }
        //                 }
        //             }
        //         }
        //         if(this.gamedatas.gamestate.args.board[row][col].indexOf('E')!=-1){
        //             let nrow = row+1
        //             let ncol = col 
        //             // check if we reached one of the end locations
                    
        //             if (this.validCoordinates(nrow, ncol)) {
        //                 if(this.endlocations.filter(e=>e[0]==nrow && e[1]==ncol).length>0 && this.gamedatas.gamestate.args.board[nrow][ncol].indexOf(this.endpointDestination)!=-1){
        //                     console.log("ËNDLOCATIONREACHED", nrow,ncol)
        //                 } else {
        //                     if(this.genCheckMatrix[nrow][ncol]==0){
        //                         // console.log("Add to stack E", nrow,ncol)
        //                         this.fillStack.push([nrow, ncol]);
        //                     }
        //                 }
        //             }
        //         }  
        //         if(this.gamedatas.gamestate.args.board[row][col].indexOf('S')!=-1){
        //             let nrow = row
        //             let ncol = col+1 
        //             // check if we reached one of the end locations
        //             if (this.validCoordinates(nrow, ncol)) {
        //                 if(this.endlocations.filter(e=>e[0]==nrow && e[1]==ncol).length>0 && this.gamedatas.gamestate.args.board[nrow][ ncol].indexOf(this.endpointDestination)!=-1){
        //                     console.log("ËNDLOCATIONREACHED", nrow,ncol)
        //                 } else {
        //                     if(this.genCheckMatrix[nrow][ncol]==0){
        //                         // console.log("Add to stack S", nrow,ncol)
        //                         this.fillStack.push([nrow, ncol]);
        //                     }
        //                 }
        //             }
        //         }                              
        //         if(this.gamedatas.gamestate.args.board[row][col].indexOf('W')!=-1){
        //             let nrow = row-1
        //             let ncol = col 
        //             // check if we reached one of the end locations
        //             if (this.validCoordinates(nrow, ncol)) {
        //                 if(this.endlocations.filter(e=>e[0]==nrow && e[1]==ncol).length>0 && this.gamedatas.gamestate.args.board[nrow][ ncol].indexOf(this.endpointDestination)!=-1){
        //                     console.log("ËNDLOCATIONREACHED", nrow,ncol)
        //                 } else {
        //                     if(this.genCheckMatrix[nrow][ncol]==0){
        //                         this.fillStack.push([nrow, ncol]);
        //                     }
        //                 }
        //             }
        //         } 
        //     }

        // },
        validCoordinates(row, col)
        {
            // console.log(">>vc",row,col)
            return (row >= 1 && row < 13 && col >= 1 && col < 13);
        }, 
        onSelectTrack(evt){
            dojo.stopEvent( evt )
            var coords = evt.currentTarget.id.split('_');
            dojo.query( '.playertrack' ).removeClass('trackselected')
            // destroy previous selected track
            dojo.destroy('track_'+this.selectedTrack)
            if(coords[2]==this.player_id){
                this.selectedTrack = coords[1]
                dojo.addClass( evt.currentTarget.id, 'trackselected' );
            }
        },
        onGoalCheck(){
            console.log("onGoalCheck",this.traceTrack)
            if(!this.traceTrack){
                var itsme = this.gamedatas.gamestate.args.players.filter(p =>p.id==this.player_id)[0]
                start = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["start"]
                start.forEach(point=>{
                    dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
                })
                end = this.gamedatas.routepoints[parseInt(itsme["startposition"])-1]["end"]
                end.forEach(point=>{
                    dojo.addClass( 'route_'+point[0]+'_'+point[1]+'', 'option-border' );
                })            
                dojo.query( '.route' ).removeClass( 'noclick' );
                this.traceTrack = true
                this.goalsReached = 0
            } else {
                dojo.query( '.route' ).addClass( 'noclick' );
                this.traceTrack = false
            }

            this.route = new Array()
            for (var i=0;i<14;i++){
                this.route[i]= new Array()
                for(var j=0;j<14;j++){
                    this.route[i][j] = 0;
                }
            }
            this.routestartX = -1;
            this.routestartY = -1;

        },
        ///////////////////////////////////////////////////
        //// Player's action
        onShowLocation(evt){
            var coords =evt.currentTarget.id.split('_');
            let location = this.gamedatas.stops.filter(l => l.code== coords[1])[0]
            dojo.style( 'stops_'+location.col+"_"+location.row, 'border', 'solid 2px white' );

        },
        onHideLocation(evt){
            var coords =evt.currentTarget.id.split('_');
            let location = this.gamedatas.stops.filter(l => l.code== coords[1])[0]
            dojo.style( 'stops_'+location.col+"_"+location.row, 'border', '' );
        },
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
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
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
            this.checkTrack();

        },           
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
