"use strict";
var Pong = (function () {
    function Pong(useAi) {
        this.useAi = useAi;
        this.aiLag = 100;
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        this.round = 0;
        this.intervalTime = 16;
        this.ball = {
            radius: Math.min(window.innerWidth, window.innerHeight) / 100
        };
        this.player1 = {
            id: 1
        };
        this.player2 = {
            id: 2
        };
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        this.resetComplete();
    }
    Pong.prototype.reset = function () {
        this.round++;
        this.ball.position = [
            this.gameSize[0] / 2,
            this.gameSize[1] / 2
        ];
        var speed = this.gameSize[0] / 200 + this.round * this.gameSize[0] / 2000;
        this.ball.speed = [
            Math.random() > 0.5 ? speed : -speed,
            0
        ];
        this.player1.position = this.gameSize[1] / 2;
        this.player2.position = this.gameSize[1] / 2;
        var size = this.gameSize[1] / 3 - this.round * 5;
        this.player1.size = (this.player1.score - this.player2.score) * 10 + size;
        this.player2.size = (this.player2.score - this.player1.score) * 10 + size;
    };
    Pong.prototype.resetComplete = function () {
        this.round = 0;
        this.player1.score = 0;
        this.player2.score = 0;
        this.reset();
        this.updateUI(false);
        this.showMessages("P O N G", "~~~ new game ~~~", this.useAi ? "human vs. PC" : "2 player mode", "", "press <m> to change game mode", "press <s> or <⬆> to start", "player1 (left): " + (this.useAi ? "PC" : "up <w> down <s>"), "player2 (right): up <⬆> down <⬇>", "press <F5> to reset");
    };
    Pong.prototype.startGame = function () {
        this.gameRunning = true;
        this.resetComplete();
        this.timeout = null;
        this.interval = setInterval(this.animateBall, this.intervalTime, this);
    };
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
    Pong.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    Pong.prototype.keyDown = function (event) {
        event.preventDefault();
        if (!this.gameRunning) {
            if (event.key === "m") {
                this.useAi = !this.useAi;
                this.resetComplete();
            }
            else {
                this.startGame();
            }
        }
        else {
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
            this.updateUI();
        }
    };
    Pong.prototype.animateBall = function (_this) {
        _this.ball.position[0] += _this.ball.speed[0];
        _this.ball.position[1] += _this.ball.speed[1];
        if (_this.ball.position[1] < _this.ball.radius
            || _this.ball.position[1] > _this.canvas.height - _this.ball.radius) {
            _this.ball.speed[1] *= -1;
        }
        if (_this.ball.position[0] < 0) {
            _this.player2.score++;
            _this.endGame(2);
        }
        else if (_this.ball.position[0] > _this.canvas.width) {
            _this.player1.score++;
            _this.endGame(1);
        }
        else {
            _this.updateUI();
        }
        var p1hit = _this.playerHit(_this.player1);
        var p2hit = _this.playerHit(_this.player2);
        if (p1hit || p2hit) {
            _this.ball.speed[0] *= -1.1;
            _this.ball.speed[1] += _this.playerHitDeltaYSpeed(p1hit ? _this.player1 : _this.player2);
        }
        if (_this.useAi) {
            if (_this.ball.position[1] > _this.player1.position) {
                _this.player1.position += 0.8;
            }
            else {
                _this.player1.position -= 0.8;
            }
        }
    };
    Pong.prototype.playerHit = function (player) {
        var playerXPosition = player.id === 1 ? 10 : this.canvas.width - 10;
        var xDistance = Math.abs(this.ball.position[0] - playerXPosition);
        var yDistance = Math.abs(this.ball.position[1] - player.position);
        var hit = xDistance < this.ball.radius + 5 && yDistance < player.size / 2 + this.ball.radius;
        return hit;
    };
    Pong.prototype.playerHitDeltaYSpeed = function (player) {
        return (this.ball.position[1] - player.position) / player.size;
    };
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
    Pong.prototype.updateUI = function (drawBall) {
        if (drawBall === void 0) { drawBall = true; }
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(5, this.player1.position - this.player1.size / 2, 10, this.player1.size);
        this.ctx.fillRect(this.canvas.width - 15, this.player2.position - this.player2.size / 2, 10, this.player2.size);
        if (drawBall) {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.position[0], this.ball.position[1], this.ball.radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.fillText("round " + this.round, this.canvas.width / 2, 25);
        this.ctx.fillText(this.player1.score + " : " + this.player2.score, this.canvas.width / 2, this.canvas.height - 10);
    };
    Pong.prototype.remove = function () {
        this.canvas.remove();
    };
    return Pong;
}());
var p;
function keyDownPong(event) {
    switch (event.key) {
        case "F5":
            return;
        case "F11":
            return;
        case "F12":
            return;
        default:
            if (p) {
                p.keyDown(event);
            }
    }
}
function initPong() {
    if (p) {
        p.remove();
    }
    p = new Pong(false);
}
