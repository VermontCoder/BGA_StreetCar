/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * LineNumberOne implementation : © David Felcan dfelcan@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * /

/* Generally useful Utility functions */

define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )
{
return declare("bgagame.scUtility", null, { 
        
        constructor: function()
        {
            this.nesw = ["N","E","S","W"];
        },
        
        /**
         * Based on the rotation of the card and trackcard array, find the directions this card can go.
         * @param {Object} trackcard directions free array from game->tracks
         * @param {Int} rotation- 90,180,270, 0.
         */
        
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

        /**
         * Returns True if tile coords are on the board, not the border.
         * @param {Int} row 
         * @param {Int} col 
         * @returns bool 
         */
        validCoordinates(row, col)
        {
            return (row >= 1 && row < 13 && col >= 1 && col < 13);
        },
        
        /**
         * Get data of route node
         * @param {String} nodeID 
         * @returns {x: xCoord, y: yCoord, d: NESW}
         */
        extractXYD(nodeID)
        {
            splitNodeID = nodeID.split('_');
            return {'x': parseInt(splitNodeID[0]),
                'y': parseInt(splitNodeID[1]),
                'd': splitNodeID[2],
            };
        },

        /**
         * From data get nodeID
         * @param {x: xCoord, y: yCoord, d: NESW} nodeData
         * @returns {String} nodeID
         */
        XYDtoKey(nodeData)
        {
            return nodeData.x +'_'+nodeData.y+'_'+nodeData.d;
        },

        /**
         * Use this for squares or stops
         * @param {String} nodeID 
         * @returns {x: xCoord, y: yCoord}
         */
        
        extractXY(nodeID)
        {
            splitNodeID = nodeID.split('_');
            //skip over 'square_' or 'stop_'
            return {'x': parseInt(splitNodeID[1]),
                'y': parseInt(splitNodeID[2]),
            };
        },

        /** 
        * @param integer $startTileX
        * @param integer $startTileY
        * @param integer $endTileX
        * @param integer $endTileY
        * @return string direction - NESW.
        */
        getDirectionOfTileFromCoords(startTileX, startTileY, endTileX, endTileY)
        {
            xDelta = startTileX-endTileX;
            yDelta = startTileY-endTileY;

            if (xDelta == 1) return "W";
            if (xDelta == -1) return "E";
            if (yDelta == 1) return "N";
            if (yDelta == -1) return "S";
        },

        createSelectedTrackDataObj(id)
        {
            var coords = id.split('_');
            return { domID : coords[0], //should always be 'track_'
                card: parseInt(coords[1]),
                player_id: parseInt(coords[2]),
                idx: parseInt(coords[3]),
            }
        },
        

        getSelectedTrackIDFromDataObj(selectedTrackDataObj)
        {
            return selectedTrackDataObj.domID+'_'+
                selectedTrackDataObj.card+'_'+
                selectedTrackDataObj.player_id+'_'+
                selectedTrackDataObj.idx;
        },

        /**
         * 
         * @param {*} from starting angle of rotation
         * @param {*} to  ending angle of rotation
         * @param {*} divID  div to be rotated.
         * @returns animation
         */
        getRotationAnimation(from,to,divID)
        {

            //to rotate in the correct direction, we must treat "north" as either zero or 360 such that the difference between the rotations are minimized.
            rotationDelta = from-to;
            if (rotationDelta > 180)
            {
                from = from == 360 ? 0 : from;
                to = to == 0 ? 360 : to;
            }

            if (rotationDelta < -180)
            {
                from = from == 0 ? 360 : from;
                to = to == 360 ? 0 : to;
            }
            
            var animation = new dojo.Animation({
			    curve: [from, to],
			    onAnimate: (v) => {
				    $(divID).style.transform = 'rotate(' + v + 'deg)';
			    } 
		    });
		    
		    return animation;
        },
    });
});
