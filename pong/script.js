var Pong = /** @class */ (function () {
    /**
     * Creates a new TicTacToe object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    function Pong(useAi) {
        this.useAi = useAi;
        this.windowSize = this.getWindowSize();
        this.round = 1;
        // ball
        this.ball = {};
        // players
        this.player1 = {
            score: 0
        };
        this.player2 = {
            score: 0
        };
        this.reset(1); // TODO: random -1,1
        // canvas
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "center";
        // draw UI
        this.updateUI();
        this.showMessage("press any key to start");
    }
    Pong.prototype.reset = function (winner) {
        console.log("reset");
        // ball
        this.ball.position = [
            this.windowSize.x / 2,
            this.windowSize.y / 2
        ];
        this.ball.speed = [
            winner === 2 ? 1 : -1,
            0
        ];
        // players
        // TODO: make player smaller every round
        // TODO: make player small if lost, bigger if won
        this.player1.position = this.windowSize.y / 2;
        this.player1.size = this.windowSize.y / 2;
        this.player2.position = this.windowSize.y / 2;
        this.player2.size = this.windowSize.y / 2;
    };
    Pong.prototype.startGame = function () {
        this.gameRunning = true;
        this.showMessage("start");
        this.timeout = null;
        this.interval = setInterval(this.animateBall, 20, this);
    };
    Pong.prototype.endGame = function (winner) {
        clearInterval(this.interval);
        this.gameRunning = false;
        this.updateUI();
        this.showMessage("game over! winner: player " + winner);
        this.reset(winner);
    };
    /**
     * Source: https://stackoverflow.com/a/11744120
     *
     * Returns the current size of the browser window as {x, y}.
     */
    Pong.prototype.getWindowSize = function () {
        var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth || g.clientWidth, y = w.innerHeight || e.clientHeight || g.clientHeight;
        return { x: 400, y: 400 };
        // return { x, y };
    };
    /**
     * Creates and returns a canvas object.
     */
    Pong.prototype.createCanvas = function () {
        var windowSize = this.windowSize;
        var canvas = document.createElement("canvas");
        canvas.width = windowSize.x;
        canvas.height = windowSize.y;
        document.getElementById("game").appendChild(canvas);
        return canvas;
    };
    /**
     * Called if a player has clicked on a button.
     */
    Pong.prototype.keyDown = function (event) {
        if (!this.gameRunning) {
            this.startGame();
        }
        else {
            // process keyboard input
            switch (event.key) {
                case "w":
                    if (this.player1.position > 10) {
                        this.player1.position -= 10;
                    }
                    break;
                case "s":
                    if (this.player2.position < this.canvas.height - 10) {
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
    Pong.prototype.animateBall = function (_this) {
        _this.ball.position[0] += _this.ball.speed[0];
        _this.ball.position[1] += _this.ball.speed[1];
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
    };
    /**
     * Displays a message on the UI.
     * @param message
     */
    Pong.prototype.showMessage = function (message) {
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 10);
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
        this.ctx.arc(this.ball.position[0], this.ball.position[1], 5, 0, 2 * Math.PI);
        this.ctx.fill();
        // score
        this.ctx.fillText(this.player1.score + " : " + this.player2.score, this.canvas.width / 2, this.canvas.height - 10);
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
    game = new Pong(!isTwoPlayerMode);
}
