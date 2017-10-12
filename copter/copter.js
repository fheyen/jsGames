"use strict";
var Copter = (function () {
    function Copter() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        this.intervalTime = 20;
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        this.reset();
    }
    Copter.prototype.reset = function () {
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        var playerWidth = Math.min(this.gameSize[0], this.gameSize[1]) / 10;
        this.player = {
            x: 100,
            y: this.gameSize[1] / 2,
            width: playerWidth,
            height: playerWidth / 2,
            speed: 5,
            acceleration: 1
        };
        this.obstacles = [];
        var number = 200;
        var width = this.gameSize[0] / number;
        var height = this.gameSize[1];
        var lastObstacle = null;
        for (var i = 0; i < number; i++) {
            lastObstacle = new CopterObstacle(lastObstacle, width, height, 1);
            this.obstacles.push(lastObstacle);
        }
        this.updateUI();
        this.showMessages("Copter", "~~~ new game ~~~", "", "press <⬆> to start", "press <space> to pause", "press <⬆> to move the copter up", "press <F5> to reset");
    };
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
    Copter.prototype.pauseGame = function () {
        if (this.gameOver || !this.gameRunning) {
            return;
        }
        this.gameRunning = false;
        clearInterval(this.interval);
        this.showMessages("Copter", "~~~ paused ~~~", "", "press <space> or <⬆> to continue", "press <F5> to reset");
    };
    Copter.prototype.resumeGame = function () {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    Copter.prototype.endGame = function () {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages("~~~ game over! ~~~", "", "total time survived: " + ~~(this.timeElapsed / 1000), "", "press <F5> to restart");
    };
    Copter.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    Copter.prototype.keyDown = function (event) {
        event.preventDefault();
        switch (event.key) {
            case "ArrowUp":
                if (!this.gameStarted) {
                    this.startGame();
                }
                else if (!this.gameRunning) {
                    this.resumeGame();
                }
                else if (this.player.y > 50) {
                    this.player.y -= 50;
                }
                break;
            case " ":
                if (!this.gameStarted) {
                    return;
                }
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
    Copter.prototype.animate = function (_this) {
        var obs = _this.obstacles;
        var p = _this.player;
        _this.timeElapsed += _this.intervalTime;
        p.y += p.speed;
        var obstacleWidth = obs[0].width;
        obs.forEach(function (o) { return o.shift(-obstacleWidth); });
        obs.unshift();
        obs.push(new CopterObstacle(obs[obs.length - 1], obstacleWidth, _this.gameSize[1], 1 + _this.timeElapsed / (1000)));
        var crashed = false;
        var hitBox = [
            [100, p.y],
            [100 + p.width, p.y + p.height]
        ];
        for (var i = 0; i < obs.length; i++) {
            if (obs[i].xPosition > p.x + p.width + obstacleWidth) {
                break;
            }
            if (obs[i].isHit(hitBox)) {
                crashed = true;
                break;
            }
        }
        if (crashed) {
            _this.endGame();
        }
        else {
            _this.updateUI();
        }
    };
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
    Copter.prototype.updateUI = function () {
        var _this = this;
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#0f0";
        this.obstacles.forEach(function (o) { return o.draw(_this.ctx); });
        this.ctx.fillStyle = "#fff";
        this.drawCopter();
        this.ctx.fillText("time " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
    };
    Copter.prototype.drawCopter = function () {
        var x = this.player.x;
        var y = this.player.y;
        var w = this.player.width;
        var h = this.player.height;
        var rotorAngle = ((this.timeElapsed / 10) % 20) / 20;
        var rotorWidth = w * rotorAngle;
        var rotorHeight = h * 0.125;
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(x + w * 0.4, y + 2 * rotorHeight, w * 0.5, h - rotorHeight * 3);
        this.ctx.fillRect(x, y + 3 * rotorHeight, w * 0.5, h * 0.2);
        this.ctx.fillRect(x, y + rotorHeight, w * 0.1, 3 * rotorHeight);
        this.ctx.fillRect(x + w * 0.65 - rotorWidth * 0.5, y, rotorWidth, rotorHeight);
        this.ctx.fillRect(x + w * 0.3, y + h - rotorHeight * 0.5, w * 0.7, rotorHeight * 0.5);
    };
    Copter.prototype.remove = function () {
        this.canvas.remove();
    };
    return Copter;
}());
var CopterObstacle = (function () {
    function CopterObstacle(lastObstacle, width, height, difficulty) {
        this.width = width;
        this.height = height;
        this.difficulty = difficulty;
        if (lastObstacle == null) {
            this.xPosition = 0;
            this.holeUpperY = height * 0.2;
            this.holeLowerY = height - this.holeUpperY;
        }
        else {
            this.xPosition = lastObstacle.xPosition + width;
            var r1 = Math.random();
            var r2 = Math.random();
            var goDown = ((lastObstacle.holeUpperY + lastObstacle.holeLowerY) / 2) / this.height;
            var direction = (r2 > goDown ? 1 : -1);
            var yShift = difficulty * r1 * direction;
            this.holeUpperY = lastObstacle.holeUpperY + yShift;
            this.holeLowerY = lastObstacle.holeLowerY + yShift;
        }
    }
    CopterObstacle.prototype.shift = function (amount) {
        this.xPosition += amount;
    };
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
    CopterObstacle.prototype.rectangleIntersects = function (a, b) {
        return Math.max(a[0][0], b[0][0]) < Math.min(a[1][0], b[1][0]) &&
            Math.max(a[0][1], b[0][1]) < Math.min(a[1][1], b[1][1]);
    };
    CopterObstacle.prototype.draw = function (ctx) {
        ctx.fillRect(this.xPosition, 0, this.width + 1, this.holeUpperY);
        ctx.fillRect(this.xPosition, this.holeLowerY, this.width + 1, this.height);
    };
    return CopterObstacle;
}());
var game;
function keyDownCopter(event) {
    switch (event.key) {
        case "F5":
            return;
        case "F11":
            return;
        case "F12":
            return;
        default:
            if (game) {
                game.keyDown(event);
            }
    }
}
function initCopter() {
    if (game) {
        game.remove();
    }
    game = new Copter();
}
