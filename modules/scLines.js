/* Code to draw lines on board */

define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )
{
return declare("bgagame.scLines", null, { // null here if we don't want to inherit from anything
        constructor: function(){},
        createLineElement: function (x, y, length, angle, color) {
            var line = document.createElement("div");
            var styles = 'width: ' + length + 'px; '
                        + 'border-color: ' + color + '; '
                        + '-moz-transform: rotate(' + angle + 'rad); '
                        + '-webkit-transform: rotate(' + angle + 'rad); '
                        + '-o-transform: rotate(' + angle + 'rad); '
                        + '-ms-transform: rotate(' + angle + 'rad); '
                        + 'top: ' + y + 'px; '
                        + 'left: ' + x + 'px; ';
            line.setAttribute('style', styles);
            line.setAttribute('class', 'route_line')
            return line;
        },
        /**
         * Creates element which represents line from point [x1, y1] to [x2, y2].
         * It is html div element with minimal height and width corresponding to line length.
         * It's position and rotation is calculated below.
         */
        createLine: function (x1, y1, x2, y2, color='black') {
            var a = x1 - x2,
                b = y1 - y2,
                c = Math.sqrt(a * a + b * b);

            var sx = (x1 + x2) / 2,
                sy = (y1 + y2) / 2;

            var x = sx - c / 2,
                y = sy;

            var alpha = Math.PI - Math.atan2(-b, a);

            return this.createLineElement(x, y, c, alpha, color);
        }
    });
        
});



/**
 * Creates element which represents line from point [x1, y1] to [x2, y2].
 * It is html div element with minimal height and width corresponding to line length.
 * It's position and rotation is calculated below.
 */
function createLine(x1, y1, x2, y2) {
    var a = x1 - x2,
        b = y1 - y2,
        c = Math.sqrt(a * a + b * b);

    var sx = (x1 + x2) / 2,
        sy = (y1 + y2) / 2;

    var x = sx - c / 2,
        y = sy;

    var alpha = Math.PI - Math.atan2(-b, a);

    return createLineElement(x, y, c, alpha);
}