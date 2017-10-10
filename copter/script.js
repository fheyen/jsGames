var Copter = /** @class */ (function () {
    /**
     * Creates a new TicTacToe object.
     */
    function Copter() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        // inverse framerate
        this.intervalTime = 20;
        // canvas
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        // initialize game
        this.reset();
    }
    /**
     * Resets the game to the initial conditions.
     */
    Copter.prototype.reset = function () {
        this.timeElapsed = 0;
        // create player
        this.player = {
            position: this.gameSize[1] / 2,
            size: 30,
            speed: [10, 2]
        };
        // draw UI
        this.updateUI();
        this.showMessages("Copter", "~~~ new game ~~~", "", "press <⬆> to start", "press <space> to pause", "press <⬆> to move the copter up", "press <F5> to reset");
    };
    /**
     * Starts the game.
     */
    Copter.prototype.startGame = function () {
        this.gameRunning = true;
        this.timeout = null;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    Copter.prototype.pauseGame = function () {
        this.gameRunning = true;
        this.showMessages("Copter", "~~~ paused ~~~", "", "press <space> or <⬆> to continue", "press <F5> to reset");
    };
    /**
     * Ends the game.
     * @param winner winner of the currently ended game.
     */
    Copter.prototype.endGame = function (winner) {
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages("~~~ game over! ~~~", "", "press <⬆> to continue");
    };
    /**
     * Creates and returns a canvas object.
     */
    Copter.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    /**
     * Called if a player has clicked on a button.
     * @param event keydown event
     */
    Copter.prototype.keyDown = function (event) {
        console.log(event.key);
        event.preventDefault();
        // start game if it is not running
        if (!this.gameRunning) {
            this.startGame();
        }
        else {
            // process keyboard input
            switch (event.key) {
                case "ArrowUp":
                    if (this.player.position > 60) {
                        this.player.position -= 40;
                    }
                    break;
                default:
                    break;
            }
            // show current field
            this.updateUI();
        }
    };
    /**
     * @param _this this Pong object
     */
    Copter.prototype.animate = function (_this) {
        _this.timeElapsed += _this.intervalTime;
        _this.player.position += _this.player.speed[1];
        _this.updateUI();
    };
    /**
     * Returns true if the ball hit the specified player.
     * @param player one of the two player objects
     */
    Copter.prototype.playerHit = function (player) {
        return false;
    };
    /**
     * Displays a message on the UI.
     * @param message
     */
    Copter.prototype.showMessages = function () {
        var _this = this;
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        var offsetY = this.canvas.height / 2 - 15 * messages.length;
        messages.forEach(function (m) {
            _this.ctx.fillText(m, _this.canvas.width / 2, offsetY);
            offsetY += 30;
            console.log(m);
        });
    };
    /**
     * Draws the UI.
     */
    Copter.prototype.updateUI = function (drawBall) {
        if (drawBall === void 0) { drawBall = true; }
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // player
        this.ctx.fillStyle = "#fff";
        this.drawCopter();
        // time elapsed
        this.ctx.fillText("time " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
    };
    Copter.prototype.drawCopter = function () {
        var x = 100;
        var y = this.player.position;
        var size = this.player.size;
        var rotorAngle = ((this.timeElapsed / 100) % 10) / 10;
        // body
        this.ctx.fillRect(x + size, y, size, size);
        // tail
        this.ctx.fillRect(x, y + 2, size, size / 4);
        this.ctx.fillRect(x - 1, y - 5, size / 4, size / 2);
        // feet
        this.ctx.fillRect(x + size - 2, y + size + 2, size + 4, size / 8);
        // rotor
        this.ctx.fillRect(x + size / 2, y - 6, (size * 2) * rotorAngle, size / 8);
    };
    /**
     * Removes the canvas from the DOM.
     */
    Copter.prototype.remove = function () {
        this.canvas.remove();
    };
    return Copter;
}());
var game;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownCopter(event) {
    // some keys should be processed by the browser
    switch (event.key) {
        case "F5":
            return;
        case "F11":
            return;
        case "F12":
            return;
        default:
            // pass on to game
            if (game) {
                game.keyDown(event);
            }
    }
}
/**
 * Starts a new game.
 */
function initCopter() {
    if (game) {
        game.remove();
    }
    game = new Copter();
}
