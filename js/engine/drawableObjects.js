/**
 * 
 */
var engine = engine || {},
    drawableObjectBase = {
        _canvasContext : null,
        /**
         * Method to draw an object
         */
        drawMethod : function () {
            this._canvasContext.beginPath();
            this._canvasContext.arc(this.position[0], this.position[1],10,0,2*Math.PI);
            this._canvasContext.stroke();
        },
        move_force: 1,
        /**
         * Moves the object, 
         * recives a list of keys pressed and decides what 
         * to do whit it.  
         * */ 
        move: function (keysPresed) {
            if (keysPresed.left){
                this.position[0] = this.position[0]-1;
            }
            if (keysPresed.right){
                this.position[0] = this.position[0]+1;
            }
            if (keysPresed.up) {
                this.move_force=Math.min(this.move_force*1.0175, 4);
                this.position[1] = this.position[1]-this.move_force;
            } 
            if (!keysPresed.up) {
               this.move_force=1;
            }
            
        }
    };
    
engine.drawableObject =function(pCanvasContext) {
        _.extend(this, new Object(phObject.prototype));
        
        if(pCanvasContext) {
            this._canvasContext = pCanvasContext;
        };
        
        this.isDrawable = true;
        this.isPlayable = true;
        this.reaction_should_react = false;
        
        if(this._initialize) {
            this._initialize();
        }
        this.boundariesArray[0] = 10;
        this.boundariesArray[1] = 10;    
        this.boundariesArray[2] = 10;    
        this.boundariesArray[3] = 10;
    };
    
engine.drawableObject.prototype = Object.create(drawableObjectBase);
