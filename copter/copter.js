"use strict";
/**
 * Main class of this game.
 */
var Copter = /** @class */ (function () {
    /**
     * Creates a new Copter object.
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
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        // create player
        var playerWidth = Math.min(this.gameSize[0], this.gameSize[1]) / 10;
        this.player = {
            x: 100,
            y: this.gameSize[1] / 2,
            width: playerWidth,
            height: playerWidth / 2,
            speed: 5,
            acceleration: 1
        };
        // create obstacles
        this.obstacles = [];
        var number = 200;
        var width = this.gameSize[0] / number;
        var height = this.gameSize[1];
        var lastObstacle = null;
        for (var i = 0; i < number; i++) {
            lastObstacle = new CopterObstacle(lastObstacle, width, height, 1);
            this.obstacles.push(lastObstacle);
        }
        // draw UI
        this.updateUI();
        this.showMessages("Copter", "~~~ new game ~~~", "", "press <⬆> to start", "press <space> to pause", "press <⬆> to move the copter up", "press <F5> to reset");
    };
    /**
     * Starts the game.
     */
    Copter.prototype.startGame = function () {
        if (this.gameStarted) {
            return;
        }
        if (this.gameOver) {
            this.reset();
        }
        this.gameStarted = true;
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    /**
     * Pauses the game.
     */
    Copter.prototype.pauseGame = function () {
        if (this.gameOver || !this.gameRunning) {
            return;
        }
        this.gameRunning = false;
        clearInterval(this.interval);
        this.showMessages("Copter", "~~~ paused ~~~", "", "press <space> or <⬆> to continue", "press <F5> to reset");
    };
    /**
     * Resumes the paused game.
     */
    Copter.prototype.resumeGame = function () {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    /**
     * Ends the game.
     */
    Copter.prototype.endGame = function () {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages("~~~ game over! ~~~", "", "total time survived: " + ~~(this.timeElapsed / 1000), "", "press <F5> to restart");
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
        event.preventDefault();
        // process keyboard input
        switch (event.key) {
            case "ArrowUp":
                if (!this.gameStarted) {
                    // start game if it is not running
                    this.startGame();
                }
                else if (!this.gameRunning) {
                    // resume game if it is paused
                    this.resumeGame();
                }
                else if (this.player.y > 50) {
                    // move copter up if game is running
                    this.player.y -= 50;
                }
                break;
            case " ":
                if (!this.gameStarted) {
                    return;
                }
                // space bar: pause or resume
                if (this.gameRunning) {
                    this.pauseGame();
                }
                else {
                    this.resumeGame();
                }
                break;
            default:
                break;
        }
    };
    /**
     * @param _this this object
     */
    Copter.prototype.animate = function (_this) {
        // abbreviations
        var obs = _this.obstacles;
        var p = _this.player;
        // update elapsed time
        _this.timeElapsed += _this.intervalTime;
        // update player position
        p.y += p.speed;
        // shift obstacles
        var obstacleWidth = obs[0].width;
        obs.forEach(function (o) { return o.shift(-obstacleWidth); });
        // remove 0. obstacle
        obs.unshift();
        // add new one
        obs.push(new CopterObstacle(obs[obs.length - 1], obstacleWidth, _this.gameSize[1], 1 + _this.timeElapsed / (1000)));
        // test for crash
        var crashed = false;
        var hitBox = [
            [100, p.y],
            [100 + p.width, p.y + p.height]
        ];
        for (var i = 0; i < obs.length; i++) {
            // only check first few obstacles
            if (obs[i].xPosition > p.x + p.width + obstacleWidth) {
                break;
            }
            if (obs[i].isHit(hitBox)) {
                crashed = true;
                break;
            }
        }
        if (crashed) {
            // game over
            _this.endGame();
        }
        else {
            _this.updateUI();
        }
    };
    /**
     * Displays a message on the UI.
     * @param message message string list
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
    Copter.prototype.updateUI = function () {
        var _this = this;
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // obstacles
        this.ctx.fillStyle = "#0f0";
        this.obstacles.forEach(function (o) { return o.draw(_this.ctx); });
        // player
        this.ctx.fillStyle = "#fff";
        this.drawCopter();
        // time elapsed
        this.ctx.fillText("time " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
    };
    /**
     * Draws the copter.
     */
    Copter.prototype.drawCopter = function () {
        var x = this.player.x;
        var y = this.player.y;
        var w = this.player.width;
        var h = this.player.height;
        var rotorAngle = ((this.timeElapsed / 10) % 20) / 20;
        var rotorWidth = w * rotorAngle;
        var rotorHeight = h * 0.125;
        this.ctx.fillStyle = "#fff";
        // body
        this.ctx.fillRect(x + w * 0.4, y + 2 * rotorHeight, w * 0.5, h - rotorHeight * 3);
        // tail
        this.ctx.fillRect(x, y + 3 * rotorHeight, w * 0.5, h * 0.2);
        this.ctx.fillRect(x, y + rotorHeight, w * 0.1, 3 * rotorHeight);
        // rotor
        this.ctx.fillRect(x + w * 0.65 - rotorWidth * 0.5, y, rotorWidth, rotorHeight);
        // feet
        this.ctx.fillRect(x + w * 0.3, y + h - rotorHeight * 0.5, w * 0.7, rotorHeight * 0.5);
    };
    /**
     * Removes the canvas from the DOM.
     */
    Copter.prototype.remove = function () {
        this.canvas.remove();
    };
    return Copter;
}());
/**
 * Obstacle class for Copter.
 */
var CopterObstacle = /** @class */ (function () {
    /**
     * Constructor
     * @param lastObstacle the latest created obstacle before this one
     * @param width width
     * @param height height
     * @param difficulty difficulty
     */
    function CopterObstacle(lastObstacle, width, height, difficulty) {
        this.width = width;
        this.height = height;
        this.difficulty = difficulty;
        // if first obstacle
        if (lastObstacle == null) {
            this.xPosition = 0;
            this.holeUpperY = height * 0.2;
            this.holeLowerY = height - this.holeUpperY;
        }
        else {
            this.xPosition = lastObstacle.xPosition + width;
            var r1 = Math.random();
            var r2 = Math.random();
            // the lower the upper bound is, the more probable it should go up
            var goDown = ((lastObstacle.holeUpperY + lastObstacle.holeLowerY) / 2) / this.height;
            var direction = (r2 > goDown ? 1 : -1);
            // get and apply shift
            var yShift = difficulty * r1 * direction;
            this.holeUpperY = lastObstacle.holeUpperY + yShift;
            this.holeLowerY = lastObstacle.holeLowerY + yShift;
        }
    }
    /**
     * Horizontal shift ob the obstacles position.
     * @param amount shift amount in pixels.
     */
    CopterObstacle.prototype.shift = function (amount) {
        this.xPosition += amount;
    };
    /**
     * Hit test for this obstacle with a rectangular hit box
     * @param hitBoxRectangle hit box
     */
    CopterObstacle.prototype.isHit = function (hitBoxRectangle) {
        var hb = hitBoxRectangle;
        var hb2 = [
            [this.xPosition, 0],
            [this.xPosition + this.width, this.holeUpperY]
        ];
        var hb3 = [
            [this.xPosition, this.holeLowerY],
            [this.xPosition + this.width, this.height]
        ];
        return this.rectangleIntersects(hb, hb2) || this.rectangleIntersects(hb, hb3);
    };
    /**
     * Returns true iff two ractangles intersect.
     * @param a rectangle a
     * @param b rectangle b
     */
    CopterObstacle.prototype.rectangleIntersects = function (a, b) {
        return Math.max(a[0][0], b[0][0]) < Math.min(a[1][0], b[1][0]) &&
            Math.max(a[0][1], b[0][1]) < Math.min(a[1][1], b[1][1]);
    };
    /**
     * Draws this obstacle on the canvas.
     * @param ctx canvas context
     */
    CopterObstacle.prototype.draw = function (ctx) {
        ctx.fillRect(this.xPosition, 0, this.width + 1, this.holeUpperY);
        ctx.fillRect(this.xPosition, this.holeLowerY, this.width + 1, this.height);
    };
    return CopterObstacle;
}());
// global game variable
var cop;
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
    if (cop) {
        cop.remove();
    }
    cop = new Copter();
}
