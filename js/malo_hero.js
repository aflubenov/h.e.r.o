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

var vectorLib = {
    tolerance: 0.0,
    module: function (pVector) {
        var i = 0,
            l = pVector.length,
            iSum = 0;
            
            for (i = 0; i < l; i += 1) {
                iSum = iSum + (pVector[i]*pVector[i]);
            }
            
            return Math.sqrt(iSum);
    },
    isCeroTolerated: function (pVector) {
        //console.log ('cerotolerated: ', vectorLib.module(pVector));
        return vectorLib.module(pVector) <= vectorLib.tolerance;   
    },
    isCero: function (pVector) {
        var i = 0,
            l = pVector.length;
            
        for( i = 0; i < l; i += 1) {
            if(pVector[i] !== 0) {
                return false;
            }
        }
        
        return true;
    },
    scale: function (pVector, pScalar) {
        var i = 0,
            l = pVector.length,
            aRet = pVector.slice();
            
        for (i = 0; i < l; i += 1) {
            aRet[i] = pVector[i]*pScalar;
        }
        
        return aRet;
    },
    
    sum: function (pVector1, pVector2) {
        var i = 0,
            l = pVector1.length,
            aRet = pVector1.slice();
            
            
        for (i = 0; i < l; i += 1) {
            aRet[i] = pVector1[i] + pVector2[i];
        }
        
        return aRet;
    }
};

var phObject = function () {
    var _this = this;
    this.type = "generic"; //generic, hSolid, vSolid
    this.position = [0,0];
    this.backup = {};
    /**
     * 
     */
    this.backup = function () {
         _this.backup.velocity = {
             value: _this.velocity.value,
             directionVector: _this.velocity.directionVector.slice()
         }
    }
    /**
     * 
     */
    this.restore = function () {
       _this.velocity.value = _this.backup.velocity.value;
       _this.velocity.directionVector = _this.backup.velocity.directionVector.slice(); 
    }
    
    this.velocity = {
        value: 0,
        directionVector: [0,0]
    }
    this.reaction = {
        react: function () {
            _this.velocity.directionVector = vectorLib.scale(_this.velocity.directionVector, -0.8);
            if(vectorLib.module(_this.velocity.directionVector) <= tolerance) {
                _this.velocity.directionVector =[0,0];
            }
            //console.log(_this.velocity.directionVector);
        }
    }
    this.boundaries = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    this.solid = {
        hCoordinate: 0
    }
}

var phHSolidObject = function () {
    var _this = this;
    _.extend(this, new phObject());
    
    this.type = "hSolid";
    this.solid = {
        hCoordinate: 0,
        isColiding: function (aPosition, squareBoundaries, pGravityVertDirection) {
            var bottomHit = (aPosition[1] + squareBoundaries.bottom - _this.solid.hCoordinate)*pGravityVertDirection[1] >= tolerance;
            var topHit = (aPosition[1] - squareBoundaries.top - _this.solid.hCoordinate)*pGravityVertDirection[1] >= tolerance;
            return (bottomHit || topHit);
        }
    }
}

var drawableObject =function(pCanvasContext) {    
    var _this = this,
        _canvasContext = pCanvasContext;
    _.extend(this, new phObject());
    
    this.boundaries.top = 10;
    this.boundaries.right = 10;
    
    
    this.drawMethod = function () {
        _canvasContext.beginPath();
        _canvasContext.arc(_this.position[0], _this.position[1],10,0,2*Math.PI);
        _canvasContext.stroke();
    }
    
} 

var world = function () {
    var _this = this,
        creationTime = (new Date()).getTime(),
        objectCollection = [],
        solidCollection = [],
        aplyGravity;
        
        
    this.gravity = {
        velocity: 0.049,//9.8
        directionVector: [0,1] 
    }
    
    /**
     * aply gravity to every object in the world
     */
    aplyGravity = function (pTimePassedSeconds) {
        var i = 0, j = 0
            l = objectCollection.length,
            lSolids = solidCollection.length,
            oTmp = null, 
            aPosTmp= null;
            
        for (i = 0; i < l; i = i + 1) {
            oTmp = objectCollection[i];
            oTmp.backup();
            
            oTmp.velocity.value =  this.finalVelocity( oTmp.velocity.value, pTimePassedSeconds);
            oTmp.velocity.directionVector = vectorLib.sum(oTmp.velocity.directionVector,  vectorLib.scale(_this.gravity.directionVector, oTmp.velocity.value));
            if( vectorLib.isCeroTolerated(oTmp.velocity.directionVector)) {
                oTmp.restore();
                continue;
            }
            
            aPosTmp = vectorLib.sum(oTmp.position, oTmp.velocity.directionVector);
            
            //we check for collisions
            for (j = 0; j < lSolids; j+= 1) {
                if(solidCollection[j].solid.isColiding(aPosTmp, oTmp.boundaries, _this.gravity.directionVector)) {
                    oTmp.reaction.react();
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
    }
    /**
     * perform an iteration in the world according to the time passed,
     * first aply gravity
     * 
     * @return {Array} Objects collection with positions updated
     */
    this.performIteration = function(pTimePassedSeconds) {
        aplyGravity(pTimePassedSeconds);
        
        return objectCollection;
    };
    /**
     * 
     */
    this.addObject = function (pObject) {
        objectCollection.push(pObject);
    }
    /**
     * 
     */
    this.solids = {
        addSolid: function (pObject) {
            solidCollection.push(pObject);
        },
    
        addHSolid:function (pHorizontalCoordinate) {
            var oTmp = new phHSolidObject();
            oTmp.solid.hCoordinate = pHorizontalCoordinate;
            _this.solids.addSolid(oTmp);
        }
    };
    /**
     * 
     */
    this.getObjects = function () {
        return objectCollection.slice();
    }
    
    this.finalVelocity = function(pVi, pTime) {
        if(!pTime) {
            pTime = ((new Date()).getTime() - creationTime) / 1000; //mili seconds to seconds
        }
        
        return pVi + (_this.gravity.velocity*pTime);
    }
    
    this.startInterval = function (startingTime, fn) {
        if (!startingTime) {
            startingTime = _this.creationTime;
        }
        
        setTimeout(_.bind(function (){
            var now = (new Date()).getTime(),
                passed = now - startingTime;
                fn(passed);
                _this.startInterval(now, fn);
        }, this),0);
    }
};




var init = function () {
    var myCanvas = document.getElementById('myCanvas'),
        ctx = myCanvas.getContext("2d"),
        mundo = new world(),
        cosa = new drawableObject(ctx),
        atmp;
        
        
        cosa.velocity.value = 0;
        cosa.position=[30,30];
        mundo.addObject(cosa);
        mundo.solids.addHSolid(500);
        
        mundo.startInterval(null, _.bind(function(timePassed){
            ctx.clear();
            var tpSeconds = timePassed/1000 || 0;
            
            atmp = mundo.performIteration(tpSeconds);
            atmp[0].drawMethod();
              
        }, this))
}




