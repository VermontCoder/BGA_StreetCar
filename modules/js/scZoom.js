define([
    "dojo", "dojo/_base/declare",
], function( dojo, declare )
{
    return declare("bgagame.scZoom", null, { 

        /**
         * 
         * @param {string} divToZoom text name of div we are zooming.
         * @param {string} zoomInDiv text name of div that handles clicks to zoom in
         * @param {string} zoomOutDiv text name of div that handles clicks to zoom out
         * 
         */
        
        constructor: function(divToZoom,zoomInDiv,zoomOutDiv,curWindow)
        {
            this.zoomLevels = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
            if (localStorage.zoomLevelIdx)
            {
                this.zoomLevelIdx = Number(localStorage.getItem('zoomLevelIdx'));
            }
            else
            {
                this.zoomLevelIdx = 6;
                localStorage.setItem('zoomLevelIdx', String(this.zoomLevelIdx));
            }
            this.divToZoom = divToZoom;
            //dojo.connect($(zoomInDiv), 'onclick', this, 'zoomIn');
            dojo.connect($(zoomOutDiv), 'onclick', this, 'zoomOut');
        },

        zoomIn()
        {
            this.zoomLevelIdx = Number(localStorage.getItem('zoomLevelIdx'));
            if (this.zoomLevelIdx -1 < 0) return;
            this.zoomLevelIdx=--this.zoomLevelIdx;
            dojo.style(this.divToZoom, 'transform','scale('+this.zoomLevels[this.zoomLevelIdx]+')');
            localStorage.setItem('zoomLevelIdx', String(this.zoomLevelIdx));
            
        },

        zoomOut()
        {
            this.zoomLevelIdx = Number(localStorage.getItem('zoomLevelIdx'));
            if (this.zoomLevelIdx + 1 > this.zoomLevels.length-1) return;
            this.zoomLevelIdx = ++this.zoomLevelIdx;
            dojo.style(this.divToZoom, 'transform','scale('+this.zoomLevels[this.zoomLevelIdx]+')');
            localStorage.setItem('zoomLevelIdx', String(this.zoomLevelIdx));
        },
    });
});
