define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )
{
return declare("bgagame.scRouting", null, 
    {    
        constructor: function(game)
        {
            this.nesw = ["N","E","S","W"];
            this.game = game;
        },
    });
});