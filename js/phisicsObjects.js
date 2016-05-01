/**
 * 
 */
var phObject = function () {
    
    if(this._initialize){
        this._initialize();
    }
},
    phObjectBase = {
        type : "generic", //generic, hSolid, vSolid
        isDrawable: false,
        isPlayable: false,
        position : [0,0],
        _backup : null,
        /**
         * 
         */
        _initialize: function () {
            this.boundariesArray = [0,0,0,0];
        },        
        /**
         * 
         */
        backup : function () {
            this._backup  = this._backup || {};
            
            this._backup.gravity_velocity = {
                value: this.gravity_velocity.value,
                directionVector: this.gravity_velocity.directionVector.slice()
            }
            
            this._backup.position = [this.position[0], this.position[1]];
            
        },
        /**
         * 
         */
        restore : function () {
            this.gravity_velocity.value = this._backup.gravity_velocity.value;
            this.gravity_velocity.directionVector = this._backup.gravity_velocity.directionVector.slice();
            this.position[0] = this._backup.position[0];
            this.position[1] = this._backup.position[1]; 
        },
        
        gravity_velocity : {
            value: 0,
            directionVector: [0,0]
        },
        reaction_should_react: true,
        /**
         * 
         */
        reaction_react: function () {
            if(!this.reaction_should_react) {
                return;
            }
            this.gravity_velocity.directionVector = vectorLib.scale(this.gravity_velocity.directionVector, -0.8);
            if(vectorLib.module(this.gravity_velocity.directionVector) <= tolerance) {
                this.gravity_velocity.directionVector =[0,0];
            }
        },
        boundariesArray: null,
        getBoundaries: function() {
            return {
                top: this.boundariesArray[0],
                left: this.boundariesArray[3],
                bottom: this.boundariesArray[2],
                right: this.boundariesArray[1]
            }
        },
        solid : {
            hCoordinate: 0
        },
        /**
         * 
         */
        getCorners: function (paPositionn, pBoundaries) {
            var oRet = new Array(4);
            paPositionn = paPositionn || this.position;
            pBoundaries = pBoundaries || this.getBoundaries();
            
            oRet[0] = [paPositionn[0] - pBoundaries.left , paPositionn[1] - pBoundaries.top ];
            oRet[1] = [paPositionn[0] + pBoundaries.right , paPositionn[1] - pBoundaries.top ];
            oRet[2] = [paPositionn[0] + pBoundaries.right , paPositionn[1] + pBoundaries.bottom ];
            oRet[3] = [paPositionn[0] - pBoundaries.left , paPositionn[1] + pBoundaries.bottom ];
            
            return oRet;
        }
    };
    
phObject.prototype = new Object(phObjectBase);



var phHSolidObject = function () {
        _.extend(this, new Object(phObject.prototype));
        if (this._initialize) {
            this._initialize();
        }
    },
    phHSolidObjectBase = {    
        type : "solid",
        solid_hCoordinate: 0,
        solid_isColiding: function (paPosition, pSquareBoundaries, pGravityVertDirection) {
                var bottomHit = (paPosition[1] + pSquareBoundaries.bottom - this.solid_hCoordinate)*pGravityVertDirection[1] >= tolerance;
                var topHit = (paPosition[1] - pSquareBoundaries.top - this.solid_hCoordinate)*pGravityVertDirection[1] >= tolerance;
                return (bottomHit || topHit);
            }
    };
phHSolidObject.prototype = new Object(phHSolidObjectBase);

var pSolidObject = function () {
    _.extend(this, new Object(phObject.prototype));
    if(this._initialize) {
        this._initialize();
    }
},
    pSolidObjectBase = {
        type: "olid",
        /**
         * 
         */
        solid_isColiding: function (aPosition, pSquareBoundaries) {
           
            var oObjectCorners = this.getCorners(aPosition, pSquareBoundaries),
                oThisCorners = this.getCorners(),
                i = 0;
            //---firsch check corners of the object came by param, if any corner is inside this solid, then is coliding.
            //by checking the corners, we consider the situation where the object is inside of this solid.
            for (i = 0; i < 4; i = i + 1) { 
                if(oObjectCorners[i][0] >= oThisCorners[0][0] && oObjectCorners[i][0] <= oThisCorners[1][0] && 
                oObjectCorners[i][1] >= oThisCorners[0][1] && oObjectCorners[i][1] <= oThisCorners[2][1]) {
                    return true;
                }
            }
            
            //--- now we check the corner of this solid against the object passed by param,
            //by checking this, we also are considering the situation where the solid is 
            //inside the object pased by param
            for (i = 0; i < 4; i = i + 1) {
                if(oThisCorners[i][0] >= oObjectCorners[0][0] && oThisCorners[i][0] <= oObjectCorners[1][0] &&
                    oThisCorners[i][1] >= oObjectCorners[0][1] && oThisCorners[i][1] <= oObjectCorners[2][1]) {
                        return true;
                    }
            }
            
            //TODO: check cross intersection
            return false;
            
        }
        
    };
pSolidObject.prototype = new Object(pSolidObjectBase);