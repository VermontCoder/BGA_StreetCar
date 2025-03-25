/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Streetcar implementation : © David Felcan dfelcan@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----*/

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

            let routeNodes = this.curRoute.routeNodes; //will be null if there is no route.

            if (routeNodes == null) return;

            for (var parentID in routeNodes) 
            {
                //only draw route nodes that have children.
                if (Object.prototype.hasOwnProperty.call(routeNodes, parentID))
                {
                    childID = routeNodes[parentID];
                    
                    this.drawRouteDiv(parentID,childID, this.isTerminalNode(this.curRoute,parentID));

                    //There will be a terminal node that doesn't have a child and so won't appear as a key.
                    if (this.isTerminalNode(this.curRoute, childID))
                    {
                        this.drawRouteDiv(childID,null, true);
                    }
                }
            }
        },

        isTerminalNode(route, nodeID)
        {
            nodeIDJSON = JSON.stringify(this.scUtility.extractXYD(nodeID));
            startJSON = JSON.stringify(this.scUtility.extractXYD(route.startNodeID));
            endJSON = JSON.stringify(this.scUtility.extractXYD(route.endNodeID));

            return (nodeIDJSON === startJSON || nodeIDJSON === endJSON)
        },

        drawRouteDiv(parentID,childID, isTerminalNode = false)
        {
            parentPixelXYD = this.getPixelLocationBasedOnNodeID(parentID);
            childPixelXYD = this.getPixelLocationBasedOnNodeID(childID);

            angle = 0;
            spriteOffset = 0;
            const curveOffset = -100;
            const straightOffset = -200;
            const terminalOffset = -300;

            if (isTerminalNode)
            {
                spriteOffset = terminalOffset;

                if (childID == null)
                {
                    //This is a childless node. The direction is from the 'd' in the node.
                    angle = this.scUtility.getRotationFromDirection(parentPixelXYD['d']);
                }
                else
                {
                    //This is a parent node. The end piece is angled based on the 180 from the entry direction to the child.
                    angle = this.scUtility.getRotationFromDirection(childPixelXYD['d']);
                    angle = (angle+180)%360;
                }
            }
            else
            {

                var directionFromTo = parentPixelXYD['d']+childPixelXYD['d'];

                //knowing the origin node d and the destination node d, we can determine whether a straight or curved piece
                //is required and at what angle it should be rotated to.

                switch(directionFromTo)
                {
                    case "SW":
                    case "EN":
                        angle = 270;
                        spriteOffset = curveOffset;
                        break;
                    case "SE":
                    case "WN":
                        angle = 0;
                        spriteOffset = curveOffset;
                        break;
                    case "WS":
                    case "NE":
                        angle = 90;
                        spriteOffset = curveOffset;
                        break;
                    case "ES":
                    case "NW":
                        angle = 180;
                        spriteOffset = curveOffset;
                        break;
                    case "EE":
                    case "WW":
                        angle = 90;
                        spriteOffset = straightOffset;
                        break;
                    case "SS":
                    case "NN":
                        angle = 0;
                        spriteOffset = straightOffset;
                        break;
                    
                }
            }   
            
            
            var routeDiv = document.createElement("div");
            var styles =  'transform: rotate('+ angle +'deg); '
                        + 'top: ' + parentPixelXYD['y'] + 'px; '
                        + 'left: ' + parentPixelXYD['x'] + 'px; '
                        + 'background-position: ' + spriteOffset+ 'px 0px;';

            routeDiv.setAttribute('style', styles);
            routeDiv.setAttribute('class', 'route_line');
            $('wrapper').appendChild(routeDiv);
        },

        getPixelLocationBasedOnNodeID(nodeID)
        {
            if (nodeID==null) return null;
            xOrigin = 42;
            yOrigin = 45;

            parsedNodeID = this.scUtility.extractXYD(nodeID);
            
            return {
                'x': parseInt(xOrigin + parsedNodeID['x']*100),
                'y': parseInt(yOrigin + parsedNodeID['y']*100),
                'd': parsedNodeID['d']
            };
        },
    });
});