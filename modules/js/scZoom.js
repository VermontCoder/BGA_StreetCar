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
        
        constructor: function(divToZoom,zoomInDiv,zoomOutDiv)
        {
            this.zoomLevels = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
            this.divToZoom = divToZoom;
            this.zoomInDiv = zoomInDiv;
            this.zoomOutDiv = zoomOutDiv;

            if (localStorage.zoomLevelIdx)
            {
                this.setZoom(Number(localStorage.getItem('zoomLevelIdx')));
            }
            else
            {
                this.setZoom(this.zoomLevels.length-1);
            }
            
           
            dojo.connect($(zoomInDiv), 'onclick', this, 'zoomIn');
            dojo.connect($(zoomOutDiv), 'onclick', this, 'zoomOut');
        },

        zoomIn()
        {
            this.setZoom(Number(localStorage.getItem('zoomLevelIdx'))-1);
            
        },

        zoomOut()
        {
            this.setZoom(Number(localStorage.getItem('zoomLevelIdx'))+1);
        },

        setZoom(newZoomLevel, saveZoom = true)
        {
            if (newZoomLevel > this.zoomLevels.length-1 || newZoomLevel < 0) return;
            this.zoomLevelIdx = newZoomLevel;
            dojo.style(this.divToZoom, 'transform','scale('+this.zoomLevels[this.zoomLevelIdx]+')');
            if (saveZoom)
            {
                localStorage.setItem('zoomLevelIdx', String(this.zoomLevelIdx));
            }

            //denote disabled buttons, if necessary
            if (this.zoomLevelIdx == 0)
            {
                dojo.style(this.zoomInDiv,'opacity',0.3);
                dojo.style(this.zoomOutDiv,'opacity',1.0);
            }
            else if (this.zoomLevelIdx == this.zoomLevels.length-1)
            {
                dojo.style(this.zoomInDiv,'opacity',1.0);
                dojo.style(this.zoomOutDiv,'opacity',0.3);
            }
            else
            {
                dojo.style(this.zoomInDiv,'opacity',1.0);
                dojo.style(this.zoomOutDiv,'opacity',1.0);
            }
        }
    });
});
