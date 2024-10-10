define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )
{
return declare("bgagame.scRouting", null, 
    {    
        constructor: function(game, routes)
        {
            this.nesw = ["N","E","S","W"];
            this.game = game;
            this.scUtility = game.scUtility;
            this.scLines = game.scLines;
            this.scEventHandlers = game.scEventHandlers;
            
            this.updateRoutes(routes);
        },

        updateRoutes(newRoutes)
        {
            this.routes = newRoutes;
            this.curRoute = (this.routes != null) ? this.routes[0] : null;
            this.showRoute();
        },
        showRoute()
        {
            //delete previous route
            dojo.query('.route_line').orphan();

            //if we are not showing the route, we are done.
            if (!this.scEventHandlers.isShowRoute) return;
            
            //no route to show.
            if (this.curRoute == null) return;

            let route = this.curRoute.routeNodes; //will be null if there is no route.

            for (var parentID in route) 
            {
                if (Object.prototype.hasOwnProperty.call(route, parentID))
                {
                    childID = route[parentID];
                    
                    parentPixelXY = this.getPixelLocationBasedOnNodeID(parentID);
                    childPixelXY = this.getPixelLocationBasedOnNodeID(childID);
                    $('wrapper').appendChild(this.scLines.createLine(parentPixelXY['x'], parentPixelXY['y'], childPixelXY['x'], childPixelXY['y'],'red'));
                }
            }
        },

        getPixelLocationBasedOnNodeID(nodeID, fromTopLeft = false)
        {
            xOrigin = 42;
            yOrigin = 45;

            parsedNodeID = this.scUtility.extractXYD(nodeID);

            //move train calc
            if (fromTopLeft)
            {
                return {
                    'x': parseInt(xOrigin + parsedNodeID['x']*100),
                    'y': parseInt(yOrigin + parsedNodeID['y']*100),
                };
            }

            //otherwise this is routing line calc.

            xOffset =0;
            yOffset =0;

            switch(parsedNodeID['d'])
            {
                case "N":
                    yOffset = -25;
                    break;
                case "E":
                    xOffset = 25;
                    break;
                case "S":
                    yOffset = 25;
                    break;
                case "W":
                    xOffset = -25;
                    break;
            }

            return {
                //50 centers the location in the tile
                'x': parseInt(xOrigin + 50 + xOffset + parsedNodeID['x']*100),
                'y': parseInt(yOrigin + 50 +yOffset + parsedNodeID['y']*100),
            };
            
        },
    });
});