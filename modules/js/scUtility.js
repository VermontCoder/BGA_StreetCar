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
        /**
         * As border tiles are a special case, we need to do this here.
         * Looking to deprecate!!!
         * @param {Int} xcheck 
         * @param {Int} ycheck 
         * @returns 
         */
        borderTracksDirections_free(xcheck, ycheck)
        {
            if(ycheck==0){
                if([2,6,10].indexOf(xcheck)!=-1)
                {
                    return 'SE';
                }
                else if([3,7,11].indexOf(xcheck)!=-1)
                {
                    return 'Sw';
                } 
                else 
                {
                    return 'EW';
                }
            }

            if(ycheck==13){
                if([2,6,10].indexOf(xcheck)!=-1)
                {
                    return 'NE';
                }
                else if([3,7,11].indexOf(xcheck)!=-1)
                {
                    return 'NW';
                } 
                else 
                {
                    return 'EW';
                }
            }

            if(xcheck==0){
                if([2,6,10].indexOf(ycheck)!=-1)
                {
                    return 'SE';
                }
                else if ([3,7,11].indexOf(ycheck)!=-1)
                {
                    return 'NE';
                } 
                else 
                {
                    return 'NS'
                }
            }
            if(xcheck==13){
                if([2,6,10].indexOf(ycheck)!=-1)
                {
                    return 'SW';
                }
                else if ([3,7,11].indexOf(ycheck)!=-1)
                {
                    return 'NW';
                } 
                else 
                {
                    return 'NS'
                }
            }
            return '[]';
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
