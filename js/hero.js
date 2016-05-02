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


var world = function () {},
    worldBase = {
        creationTime : (new Date()).getTime(),
        objectCollection : [],
        solidCollection : [],
        player: null,
        gravity : {
            velocity: 0.049,//9.8
            directionVector: [0,1],
            isAccelerated: true 
        },
    /**
     * aply gravity to every object in the world
     */
    gravity_apply : function (pTimePassedSeconds) {
        var i = 0, j = 0
            l = this.objectCollection.length,
            lSolids = this.solidCollection.length,
            oTmp = null, 
            aPosTmp= null;
            
        for (i = 0; i < l; i = i + 1) {
            oTmp = this.objectCollection[i];
            oTmp.backup();
            
            //if gravity is accelerated, we do the real calculations
            oTmp.gravity_velocity.value =  this.gravity_FinalVelocity( oTmp.gravity_velocity.value, pTimePassedSeconds);
            if(this.gravity.isAccelerated) {    
                oTmp.gravity_velocity.directionVector = vectorLib.sum(oTmp.gravity_velocity.directionVector,  vectorLib.scale(this.gravity.directionVector, oTmp.gravity_velocity.value));
            } else {
                //gravity is not accelerated, we just sum a constant vector
                oTmp.gravity_velocity.directionVector = vectorLib.scale(this.gravity.directionVector, oTmp.gravity_velocity.value);
            }
            if( vectorLib.isCeroTolerated(oTmp.gravity_velocity.directionVector)) {
                oTmp.restore();
                continue;
            }
            
            aPosTmp = vectorLib.sum(oTmp.position, oTmp.gravity_velocity.directionVector);
            
            //we check for collisions
            for (j = 0; j < lSolids; j+= 1) {
                if(this.solidCollection[j].solid_isColiding(aPosTmp, oTmp.getBoundaries(), this.gravity.directionVector)) {
                    //if we should not react to the collision, then the
                    //direction vector is nothing, and gravity_velocity is 0.
                    if(!oTmp.reaction_should_react) {
                        oTmp.gravity_velocity.directionVector = [0,0];
                        oTmp.gravity_velocity.value = 0;
                        break;
                    }
                    //if the object sould react, we react, else, we stop
                    if(oTmp.reaction_should_react) {
                        oTmp.reaction_react(); 
                        aPosTmp = vectorLib.sum(aPosTmp, oTmp.gravity_velocity.directionVector);
                    }
                    
                    break;
                }
            }
            //if not coliding, then we apply gravity
            if(vectorLib.isCeroTolerated(oTmp.gravity_velocity.directionVector)) {
                oTmp.restore();
                oTmp.gravity_velocity.directionVector = [0,0];
                oTmp.gravity_velocity.value = 0;
            } else  {
                oTmp.position = aPosTmp;
            }            
        }
    },
    /**
     * if there is a player setted in the world, it
     * iterates over every playable object and apply
     * movements
     */
    player_movements_apply: function () {
        var i = 0,
            l = 0,
            j = 0,
            lSolids = this.solidCollection.length,
            oTmp;
            
        if (!this.player) {
            return;
        }
        
        l = this.objectCollection.length;
        
        for (i = 0; i < l; i = i + 1) {
            oTmp = this.objectCollection[i];
            if(!oTmp.isPlayable) {
                continue;
            }
            
            oTmp.backup();
            oTmp.move(this.player.keysPresed);
            for (j = 0; j < lSolids; j = j + 1) {
                if(this.solidCollection[j].solid_isColiding(oTmp.position, oTmp.getBoundaries(), this.gravity.directionVector)) {
                    oTmp.restore();
                    break;
                }
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
        this.gravity_apply(pTimePassedSeconds);
        this.player_movements_apply();
        
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
    /**
     * 
     */
    solids_addHSolid:function (pHorizontalCoordinate) {
            var oTmp = new phHSolidObject();
            oTmp.solid_hCoordinate = pHorizontalCoordinate;
            this.solids_addSolid(oTmp);
    },
    /**
     * 
     */
    solids_addSquareSolid: function (pXPos, pYPos, pWidth, pHeight) {
        var oTmp = new pSolidObject();
        oTmp.position[0] = pXPos;
        oTmp.position[1] = pYPos;
        
        oTmp.boundariesArray[0]  = 0; //top
        oTmp.boundariesArray[3] = 0; //left
        oTmp.boundariesArray[1] = pWidth; //right
        oTmp.boundariesArray[2] = pHeight; //bottom
        this.solids_addSolid(oTmp);
    },
    /**
     * 
     */
    getObjects : function () {
        return this.objectCollection.slice();
    },
    
    gravity_FinalVelocity : function(pVi, pTime) {
        if(!this.gravity.isAccelerated) {
            return this.gravity.velocity;
        }
        
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
        cosa = new drawableObject(ctx),
        bloque = new drawableObject(ctx),
        piso = new drawableObject(ctx),
        jugador = new player(),
        atmp;
        
        jugador.setKeyboardListener();
        
        cosa.gravity_velocity.value = 0;
        cosa.position=[30,30];
        
        //quitar
        bloque.drawMethod = _.bind(function ()  {
            this._canvasContext.beginPath();
            ctx.rect(10,150,100,500);
            ctx.stroke();
        }, bloque);
        //quitar
        piso.drawMethod = _.bind(function ()  {
            this._canvasContext.beginPath();
            ctx.rect(100,510,200,100);
            ctx.stroke();
            
            this._canvasContext.beginPath();
            ctx.rect(290,310,10,200);
            ctx.stroke();
        }, piso);
        
        
        
        mundo.gravity.isAccelerated = false;
        mundo.gravity.velocity = 9.4*0.2;
        mundo.addObject(cosa);
        
        //solidos
        //mundo.solids_addHSolid(500);
        mundo.solids_addSquareSolid(10,150,100,500);
        mundo.solids_addSquareSolid(100,510,200,100);
        mundo.solids_addSquareSolid(290,310,10,200);
        mundo.player = jugador;
        
        mundo.startInterval(null, _.bind(function(timePassed){
            ctx.clear();
            var tpSeconds = timePassed/1000 || 0;
            
            atmp = mundo.performIteration(tpSeconds);
            atmp[0].drawMethod();
            bloque.drawMethod();
            piso.drawMethod();
            console.log(cosa.position);
              
        }, this))
}




