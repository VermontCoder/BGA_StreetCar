/* Javascript event handlers */

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
         * The first placed track id is _0, the other _1
         * @param {*} isFirstSelection 
         * @returns {String} id for placed Track.
         */
        getPlacedTrackId(isFirstSelection)
        {
            return 'placed_track_' + (isFirstSelection ? "0" : "1");
        },

        /**
         * Returns True if tile coords are on the board, not the border.
         * @param {Int} row 
         * @param {Int} col 
         * @returns 
         */
        validCoordinates(row, col)
        {
            // console.log(">>vc",row,col)
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


    });
});
