{OVERALL_GAME_HEADER}
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:700">
<div id="wrapper" style="transform-origin: top left; translateX:-100%;">
    
    <div id="board" class="board_wrap bg_img"> 
        <div id="stack_icon_wrapper" class="stack_icon">
            <div id="stack_icon" class="over">
                <div id="stack_count" class="stack_count">99</div>
            </div>
        </div>
        <div id="zoom_controls" class="zoom_controls">
            <div id="zoom_in" class="zoom_in_icon"></div>
            <div id="zoom_out" class="zoom_out_icon"></div>
        </div>
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
var jstpl_track_tile_back_animation='<div class="track_tile_back_animation" id="${id}" style="position: absolute;"></div>';
var jstpl_track='<div class="track" id="${id}" style="position: absolute; transform:rotate(${rotate}deg); background-position: ${offsetx}px 0px;"></div>';
var jstpl_track_player='<div class="track playertrack" id="track_${id}" style="background-position: ${offsetx}px 0px;"> </div>';

var jstpl_train='<div class="train" id="train_${id}" style="position: absolute; transform:rotate(${rotate}deg); background-position: ${offsetx}px 0px;"></div>';
var jstpl_die='<div class="die" id="die_${id}" style="background-position: ${offsetx}px 0px;"></div>';

var jstpl_direction='<div class="direction" id="direction_${px}_${py}_${d}" ></div>';

var jstpl_player_board='<div class="boardblock">\
            <div id="top_line" class="container2">\
            <div id="start_${id}" class="linenum"></div>\
            <div id="completedMsg_${id}" class="completed_msg">_(Completed!)</div>\
            </div>\
            <div id="goal_${id}" class="goalsholder"></div>\
            <div id="shortestRouteButton_${id}" class="shortestRouteButton" >_(Show Shortest Route)</div>\
            <div id="track_${id}" class="trackholder"></div>\
            </div>';
            
var jstpl_dice = '<div id="dice" class="dice"></div>';
</script>  


{OVERALL_GAME_FOOTER}
