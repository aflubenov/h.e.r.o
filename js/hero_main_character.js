var hero = hero || {},
    mainCharacterBase = {
        
    };

hero.mainCharacter = function (pCanvasContext) {
    var oImg = new Image(),
        iSpriteWidth=25,
        iSpriteHeight=58
        ;

    oImg.src = "imgs/sprites.png";
    
        
    if(pCanvasContext) {
        this._canvasContext = pCanvasContext;
    };
    
    this.boundariesArray[0] = 0;
    this.boundariesArray[1] = iSpriteWidth;    
    this.boundariesArray[2] = iSpriteHeight;    
    this.boundariesArray[3] = 0;
    
    oImg.onload = _.bind(function (){
        this.drawMethod = function () {
            //img, xclip, yclip, xclipWidth, yClipWidth,canvas x, canvas y, canvas width, canvas height
            this._canvasContext.drawImage(oImg,210,140,iSpriteWidth,iSpriteHeight,this.position[0], this.position[1],iSpriteWidth,iSpriteHeight);
        }
    }, this);
    
     
};
hero.mainCharacter.prototype = Object.create(new engine.drawableObject());