CanvasRenderingContext2D.prototype.clear = 
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }           
};
var tolerance = 0.1;


var getDrawableObjectInstance =function(pCanvasContext) {
        var theFunction = function () {
            _.extend(this, new Object(phObject.prototype));
        },
        drawableObjectBase = {
            _canvasContext : null,
            _initialize : function () {
                this.boundaries.top = 10;
                this.boundaries.right = 10;    
            },
            drawMethod : function () {
                this._canvasContext.beginPath();
                this._canvasContext.arc(this.position[0], this.position[1],10,0,2*Math.PI);
                this._canvasContext.stroke();
            }, 
            move: function (keysPresed) {
                if (keysPresed.left){
                    this.position[0] = this.position[0]+1;
                }
                if (keysPresed.right){
                    this.position[0] = this.position[0]-1;
                }
            }
        }
        theFunction.prototype = new Object(drawableObjectBase);
        
        
        var oRet = new theFunction();
        if(pCanvasContext) {
            oRet._canvasContext = pCanvasContext;
        }
        oRet._initialize();
            
        return oRet;
    };

var world = function () {},
    worldBase = {
        creationTime : (new Date()).getTime(),
        objectCollection : [],
        solidCollection : [],
        gravity : {
            velocity: 0.049,//9.8
            directionVector: [0,1] 
        },
    /**
     * aply gravity to every object in the world
     */
    aplyGravity : function (pTimePassedSeconds) {
        var i = 0, j = 0
            l = this.objectCollection.length,
            lSolids = this.solidCollection.length,
            oTmp = null, 
            aPosTmp= null;
            
        for (i = 0; i < l; i = i + 1) {
            oTmp = this.objectCollection[i];
            oTmp.backup();
            
            oTmp.velocity.value =  this.finalVelocity( oTmp.velocity.value, pTimePassedSeconds);
            oTmp.velocity.directionVector = vectorLib.sum(oTmp.velocity.directionVector,  vectorLib.scale(this.gravity.directionVector, oTmp.velocity.value));
            if( vectorLib.isCeroTolerated(oTmp.velocity.directionVector)) {
                oTmp.restore();
                continue;
            }
            
            aPosTmp = vectorLib.sum(oTmp.position, oTmp.velocity.directionVector);
            
            //we check for collisions
            for (j = 0; j < lSolids; j+= 1) {
                if(this.solidCollection[j].solid_isColiding(aPosTmp, oTmp.boundaries, this.gravity.directionVector)) {
                    oTmp.reaction_react();
                    aPosTmp = vectorLib.sum(aPosTmp, oTmp.velocity.directionVector);                        
                    break;
                }
            }
            //if not coliding, then we apply gravity
            if(vectorLib.isCeroTolerated(oTmp.velocity.directionVector)) {
                oTmp.restore();
            } else  {
                oTmp.position = aPosTmp;
            }            
        }
    },
    /**
     * perform an iteration in the world according to the time passed,
     * first aply gravity
     * 
     * @return {Array} Objects collection with positions updated
     */
    performIteration : function(pTimePassedSeconds) {
        this.aplyGravity(pTimePassedSeconds);
        
        return this.objectCollection;
    },
    /**
     * 
     */
    addObject : function (pObject) {
        this.objectCollection.push(pObject);
    },
    /**
     * 
     */
    solids_addSolid: function (pObject) {
            this.solidCollection.push(pObject);
        },
    
    solids_addHSolid:function (pHorizontalCoordinate) {
            var oTmp = new phHSolidObject();
            oTmp.solid_hCoordinate = pHorizontalCoordinate;
            this.solids_addSolid(oTmp);
    },
    /**
     * 
     */
    getObjects : function () {
        return this.objectCollection.slice();
    },
    
    finalVelocity : function(pVi, pTime) {
        if(!pTime) {
            pTime = ((new Date()).getTime() - this.creationTime) / 1000; //mili seconds to seconds
        }
        
        return pVi + (this.gravity.velocity*pTime);
    },
    
    startInterval : function (startingTime, fn) {
        if (!startingTime) {
            startingTime = this.creationTime;
        }
        
        setTimeout(_.bind(function (){
            var now = (new Date()).getTime(),
                passed = now - startingTime;
                fn(passed);
                this.startInterval(now, fn);
        }, this),0);
    }
};

world.prototype = new Object(worldBase);




var init = function () {
    var myCanvas = document.getElementById('myCanvas'),
        ctx = myCanvas.getContext("2d"),
        mundo = new world(),
        cosa = getDrawableObjectInstance(ctx),
        jugador = new player(),
        atmp;
        
        jugador.setKeyboardListener();
        
        cosa.velocity.value = 0;
        cosa.position=[30,30];
        mundo.addObject(cosa);
        mundo.solids_addHSolid(500);
        
        mundo.startInterval(null, _.bind(function(timePassed){
            ctx.clear();
            var tpSeconds = timePassed/1000 || 0;
            
            cosa.move(jugador.keysPresed);
            atmp = mundo.performIteration(tpSeconds);
            atmp[0].drawMethod();
              
        }, this))
}




