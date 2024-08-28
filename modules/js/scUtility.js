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
         * @param {int} rotation- 90,180,270, 0.
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
    });
});
