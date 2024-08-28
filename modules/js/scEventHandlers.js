/* Javascript event handlers */

define([
    "dojo", "dojo/_base/declare",
], function( dojo, declare )
{
return declare("bgagame.scEventHandlers", null, { 
    game: null,
    scUtility : null,

    constructor: function (game) {
        this.game = game;
        this.scUtility = this.game.scUtility;
    },
        test : function(evt)
        {
            this.scUtility.test();
        },
    });
});
