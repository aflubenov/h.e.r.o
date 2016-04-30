/**
 * 
 */
var phObject = function () {},
    phObjectBase = {
        type : "generic", //generic, hSolid, vSolid
        isDrawable: false,
        isPlayable: false,
        position : [0,0],
        _backup : {},
        /**
         * 
         */
        backup : function () {
            this._backup.gravity_velocity = {
                value: this.gravity_velocity.value,
                directionVector: this.gravity_velocity.directionVector.slice()
            }
        },
        /**
         * 
         */
        restore : function () {
            this.gravity_velocity.value = this._backup.gravity_velocity.value;
            this.gravity_velocity.directionVector = this._backup.gravity_velocity.directionVector.slice(); 
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
        boundaries : {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
        solid : {
            hCoordinate: 0
        }
    };
    
phObject.prototype = new Object(phObjectBase);



var phHSolidObject = function () {
    _.extend(this, new Object(phObject.prototype));
    },
    phHSolidObjectBase = {    
        type : "hSolid",
        solid_hCoordinate: 0,
        solid_isColiding: function (aPosition, squareBoundaries, pGravityVertDirection) {
                var bottomHit = (aPosition[1] + squareBoundaries.bottom - this.solid_hCoordinate)*pGravityVertDirection[1] >= tolerance;
                var topHit = (aPosition[1] - squareBoundaries.top - this.solid_hCoordinate)*pGravityVertDirection[1] >= tolerance;
                return (bottomHit || topHit);
            }
    };
phHSolidObject.prototype = new Object(phHSolidObjectBase);