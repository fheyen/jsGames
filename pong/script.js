var Pong = /** @class */ (function () {
    /**
     * Creates a new TicTacToe object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    function Pong(useAi) {
        this.useAi = useAi;
        // lag of the AI in milliseconds
        this.aiLag = 100;
        this.gameSize = [600, 400];
        this.round = 0;
        // inverse framerate
        this.intervalTime = 20;
        // ball
        this.ball = {
            radius: 5
        };
        // players
        this.player1 = {
            id: 1,
            score: 0
        };
        this.player2 = {
            id: 2,
            score: 0
        };
        this.reset();
        // canvas
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "center";
        // draw UI
        this.updateUI();
        this.showMessage("press any key to start");
    }
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
        var speed = 2 + this.round * 0.1;
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
    };
    /**
     * Starts the game.
     */
    Pong.prototype.startGame = function () {
        this.gameRunning = true;
        this.showMessage("start");
        this.timeout = null;
        this.interval = setInterval(this.animateBall, this.intervalTime, this);
    };
    /**
     * Ends the game.
     * @param winner winner of the currently ended game.
     */
    Pong.prototype.endGame = function (winner) {
        clearInterval(this.interval);
        this.gameRunning = false;
        this.updateUI();
        var loser = winner === 1 ? this.player2 : this.player1;
        if (loser.size < 20) {
            this.showMessage("game over! winner: player " + loser.id + " died!");
            this.resetComplete();
        }
        else {
            this.showMessage("game over! winner: player " + winner);
            this.reset();
        }
    };
    /**
     * Creates and returns a canvas object.
     */
    Pong.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementById("game").appendChild(canvas);
        return canvas;
    };
    /**
     * Called if a player has clicked on a button.
     * @param event keydown event
     */
    Pong.prototype.keyDown = function (event) {
        if (!this.gameRunning) {
            this.startGame();
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
     * Moves the ball depedning on its current speed.
     * @param _this this Pong object
     */
    Pong.prototype.animateBall = function (_this) {
        // move ball
        _this.ball.position[0] += _this.ball.speed[0];
        _this.ball.position[1] += _this.ball.speed[1];
        // reflex ball from upper and lower edge
        if (_this.ball.position[1] < _this.ball.radius
            || _this.ball.position[1] > _this.canvas.height - _this.ball.radius) {
            _this.ball.speed[1] *= -1;
        }
        // check if game over
        if (_this.ball.position[0] < 0) {
            // player 2 wins
            _this.player2.score++;
            _this.endGame(2);
        }
        else if (_this.ball.position[0] > _this.canvas.width) {
            // player 1 wins
            _this.player1.score++;
            _this.endGame(1);
        }
        else {
            _this.updateUI();
        }
        // check if player hit the ball
        var p1hit = _this.playerHit(_this.player1);
        var p2hit = _this.playerHit(_this.player2);
        if (p1hit || p2hit) {
            // invert x speed and make faster
            _this.ball.speed[0] *= -1.1;
            // y speed:
            // keep it roughly the same but change it
            // depending on where the player was hit
            _this.ball.speed[1] += _this.playerHitDeltaYSpeed(p1hit ? _this.player1 : _this.player2);
        }
        // if the AI is playing, let it react to the current ball y-position
        // but only slowly
        if (this.useAi) {
            if (_this.ball.position[1] > _this.player1.position) {
                _this.player1.position += 0.8;
            }
            else {
                _this.player1.position -= 0.8;
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
    Pong.prototype.showMessage = function (message) {
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 20);
        console.log(message);
    };
    /**
     * Draws the UI.
     */
    Pong.prototype.updateUI = function () {
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // players
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(5, this.player1.position - this.player1.size / 2, 10, this.player1.size);
        this.ctx.fillRect(this.canvas.width - 15, this.player2.position - this.player2.size / 2, 10, this.player2.size);
        // ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.position[0], this.ball.position[1], this.ball.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        // round
        this.ctx.fillText("round " + this.round, this.canvas.width / 2, 25);
        // score
        this.ctx.fillText(this.player1.score + " : " + this.player2.score, this.canvas.width / 2, this.canvas.height - 10);
    };
    /**
     * Removes the canvas from the DOM.
     */
    Pong.prototype.remove = function () {
        this.canvas.remove();
    };
    return Pong;
}());
var game;
/**
 * Starts a new game.
 * @param isTwoPlayerMode game mode
 */
function init(isTwoPlayerMode) {
    console.log("\n~~~ new game ~~~");
    console.log(isTwoPlayerMode ? "two player mode" : "human vs. AI mode");
    if (game) {
        game.remove();
    }
    game = new Pong(!isTwoPlayerMode);
}
