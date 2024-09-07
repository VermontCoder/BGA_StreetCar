{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- Streetcar implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    streetcar_streetcar.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->
<div id="wrapper"> 
    <div id="board" class="board_wrap bg_img"> 
        <!-- BEGIN board -->
            <div id="square_{X}_{Y}" class="square" style="left: {LEFT}px; top: {TOP}px;">
                <div id="stops_{X}_{Y}" class="stops" style="left: 0px; top: 0px;">
                </div>
            </div>
        <!-- END board -->
    </div>
</div>
<script type="text/javascript">

// Javascript HTML templates
var jstpl_track='<div class="track" id="${id}" style="position: absolute; transform:rotate(${rotate}deg); background-position: ${offsetx}px 0px;"></div>';
var jstpl_track_player='<div class="track playertrack" id="track_${id}" style="background-position: ${offsetx}px 0px;"> </div>';

var jstpl_train='<div class="train" id="train_${id}" style="position: absolute; transform:rotate(${rotate}deg); background-position: ${offsetx}px 0px;"></div>';
var jstpl_die='<div class="die" id="die_${id}" style="background-position: ${offsetx}px 0px;"></div>';

var jstpl_direction='<div class="direction" id="direction_${px}_${py}_${d}" ></div>';

var jstpl_player_board='<div class="boardblock">\
            <div id="top_line" class="container">\
            <div id="start_${id}" class="linenum"></div>\
            <div id="completedMsg_${id}" class="completed_msg">Completed!</div>\
            </div>\
            <div id="goal_${id}" class="goalsholder"></div>\
            <div id="checktrack_${id}" class="goalcheck" >Shortest Route</div>\
            <div id="track_${id}" class="trackholder"></div>\
            </div>';
            
var jstpl_dice = '<div id="dice" class="dice"></div>';
</script>  


{OVERALL_GAME_FOOTER}
