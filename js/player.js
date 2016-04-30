var player = function () {},
playerBase = {
    keysPresed : {
        left:false,
        right: false,
        up: false,
        down: false,
        action1: false
    },
    setKeyboardListener: function () {
        window.addEventListener('keydown', _.bind(function(event) {
            switch (event.keyCode) {
                case 37: // Left
                    this.keysPresed.left = true;
                    event.preventDefault();
                break;

                case 38: // Up
                    this.keysPresed.up = true;
                    event.preventDefault();
                break;

                case 39: // Right
                    this.keysPresed.right = true;
                    event.preventDefault();
                break;

                case 40: // Down
                    this.keysPresed.down = true;
                    event.preventDefault();
                break;
                case 32: // space???
                    this.keysPresed.action1 = false;
                    event.preventDefault();
                break;
            }
        }, this), false);
        
        window.addEventListener('keyup', _.bind(function(event) {
            switch (event.keyCode) {
                case 37: // Left
                    this.keysPresed.left = false;
                break;

                case 38: // Up
                    this.keysPresed.up = false;
                break;

                case 39: // Right
                    this.keysPresed.right = false;
                break;

                case 40: // Down
                    this.keysPresed.down = false;
                break;
                case 32: // space???
                    this.keysPresed.action1 = false;
                break;
            }
        }, this), false);
    }
};

player.prototype = new Object(playerBase);
