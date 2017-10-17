"use strict";
/**
 * Main class of this game.
 */
var Pong = /** @class */ (function () {
    /**
     * Creates a new game object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    function Pong(useAi) {
        this.useAi = useAi;
        // lag of the AI in milliseconds
        this.aiLag = 100;
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        this.round = 0;
        // inverse framerate
        this.intervalTime = 16;
        // ball
        this.ball = {
            radius: Math.min(window.innerWidth, window.innerHeight) / 100
        };
        // players
        this.player1 = {
            id: 1
        };
        this.player2 = {
            id: 2
        };
        // canvas
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        // initialize game
        this.resetComplete();
    }
    /**
     * Removes the canvas from the DOM.
     */
    Pong.prototype.remove = function () {
        this.canvas.remove();
    };
    /**
     * Called when a player has pressed a key.
     * @param event keydown event
     */
    Pong.prototype.keyDown = function (event) {
        event.preventDefault();
        // start game if it is not running
        if (!this.gameRunning) {
            if (event.key === "m") {
                // change game mode
                this.useAi = !this.useAi;
                this.resetComplete();
            }
            else {
                this.startGame();
            }
        }
        else {
            // process keyboard input
            switch (event.key) {
                case "w":
                    if (this.player1.position > 10 && !this.useAi) {
                        this.player1.position -= 10;
                    }
                    break;
                case "s":
                    if (this.player2.position < this.canvas.height - 10 && !this.useAi) {
                        this.player1.position += 10;
                    }
                    break;
                case "ArrowUp":
                    if (this.player2.position > 10) {
                        this.player2.position -= 10;
                    }
                    break;
                case "ArrowDown":
                    if (this.player2.position < this.canvas.height - 10) {
                        this.player2.position += 10;
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
     * Resets the game to be ready for the next round.
     * Makes the game more difficult in each round.
     */
    Pong.prototype.reset = function () {
        this.round++;
        // ball
        this.ball.position = [
            this.gameSize[0] / 2,
            this.gameSize[1] / 2
        ];
        var speed = this.gameSize[0] / 200 + this.round * this.gameSize[0] / 2000;
        this.ball.speed = [
            Math.random() > 0.5 ? speed : -speed,
            0
        ];
        // players
        this.player1.position = this.gameSize[1] / 2;
        this.player2.position = this.gameSize[1] / 2;
        // make players smaller every round
        // make a player small if they lost, bigger if they won
        var size = this.gameSize[1] / 3 - this.round * 5;
        this.player1.size = (this.player1.score - this.player2.score) * 10 + size;
        this.player2.size = (this.player2.score - this.player1.score) * 10 + size;
    };
    /**
     * Resets the game to the initial conditions.
     */
    Pong.prototype.resetComplete = function () {
        this.round = 0;
        this.player1.score = 0;
        this.player2.score = 0;
        this.reset();
        // draw UI
        this.updateUI(false);
        this.showMessages("P O N G", "~~~ new game ~~~", this.useAi ? "human vs. PC" : "2 player mode", "", "press <m> to change game mode", "press <s> or <⬆> to start", "player1 (left): " + (this.useAi ? "PC" : "up <w> down <s>"), "player2 (right): up <⬆> down <⬇>", "press <F5> to reset");
    };
    /**
     * Starts the game.
     */
    Pong.prototype.startGame = function () {
        this.gameRunning = true;
        this.resetComplete();
        this.timeout = null;
        this.interval = setInterval(this.animateBall, this.intervalTime, this);
    };
    /**
     * Ends the game.
     * @param winner winner of the currently ended game.
     */
    Pong.prototype.endGame = function (winner) {
        clearInterval(this.interval);
        this.updateUI(false);
        var loser = winner === 1 ? this.player2 : this.player1;
        var message;
        if (loser.size < 20) {
            message = "player " + loser.id + " died!";
            this.gameRunning = false;
        }
        else {
            message = "winner: player " + winner;
            this.reset();
        }
        this.showMessages("game over!", message, "press <s> or <⬆> to continue");
    };
    /**
     * Creates and returns a canvas object.
     */
    Pong.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    /**
     * Moves the ball depedning on its current speed.
     * @param p this Pong object
     */
    Pong.prototype.animateBall = function (p) {
        // move ball
        p.ball.position[0] += p.ball.speed[0];
        p.ball.position[1] += p.ball.speed[1];
        // reflex ball from upper and lower edge
        if (p.ball.position[1] < p.ball.radius
            || p.ball.position[1] > p.canvas.height - p.ball.radius) {
            p.ball.speed[1] *= -1;
        }
        // check if game over
        if (p.ball.position[0] < 0) {
            // player 2 wins
            p.player2.score++;
            p.endGame(2);
        }
        else if (p.ball.position[0] > p.canvas.width) {
            // player 1 wins
            p.player1.score++;
            p.endGame(1);
        }
        else {
            p.updateUI();
        }
        // check if player hit the ball
        var p1hit = p.playerHit(p.player1);
        var p2hit = p.playerHit(p.player2);
        if (p1hit || p2hit) {
            // invert x speed and make faster
            p.ball.speed[0] *= -1.1;
            // y speed:
            // keep it roughly the same but change it
            // depending on where the player was hit
            p.ball.speed[1] += p.playerHitDeltaYSpeed(p1hit ? p.player1 : p.player2);
        }
        if (p.useAi) {
            // if the AI is playing, let it react to the current ball y-position
            // but only slowly
            if (p.ball.position[1] > p.player1.position) {
                p.player1.position += 0.8;
            }
            else {
                p.player1.position -= 0.8;
            }
        }
    };
    /**
     * Returns true if the ball hit the specified player.
     * @param player one of the two player objects
     */
    Pong.prototype.playerHit = function (player) {
        var playerXPosition = player.id === 1 ? 10 : this.canvas.width - 10;
        var xDistance = Math.abs(this.ball.position[0] - playerXPosition);
        var yDistance = Math.abs(this.ball.position[1] - player.position);
        var hit = xDistance < this.ball.radius + 5 && yDistance < player.size / 2 + this.ball.radius;
        return hit;
    };
    /**
     * Returns a y-speed modificator based on player-ball hit position.
     * @param player player that has been hit
     */
    Pong.prototype.playerHitDeltaYSpeed = function (player) {
        // get relative signed distance from player center to ball compared to player size
        return (this.ball.position[1] - player.position) / player.size;
    };
    /**
     * Displays a message on the UI.
     * @param message
     */
    Pong.prototype.showMessages = function () {
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
    Pong.prototype.updateUI = function (drawBall) {
        if (drawBall === void 0) { drawBall = true; }
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // players
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(5, this.player1.position - this.player1.size / 2, 10, this.player1.size);
        this.ctx.fillRect(this.canvas.width - 15, this.player2.position - this.player2.size / 2, 10, this.player2.size);
        // ball
        if (drawBall) {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.position[0], this.ball.position[1], this.ball.radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        // round
        this.ctx.fillText("round " + this.round, this.canvas.width / 2, 25);
        // score
        this.ctx.fillText(this.player1.score + " : " + this.player2.score, this.canvas.width / 2, this.canvas.height - 10);
    };
    return Pong;
}());
var pong;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownPong(event) {
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
            if (pong) {
                pong.keyDown(event);
            }
    }
}
/**
 * Starts a new game.
 */
function initPong() {
    if (pong) {
        pong.remove();
    }
    pong = new Pong(false);
}
