"use strict";
var Hangman = (function () {
    function Hangman() {
        this.gameSize = {
            x: window.innerWidth,
            y: window.innerHeight
        };
        this.minWordLength = 12;
        this.intervalTime = 1000;
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        this.reset();
    }
    Hangman.prototype.reset = function () {
        this.timeElapsed = 0;
        this.gameReady = false;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        this.showMessages("loading...");
        this.characterKnown = new Map();
        this.wrongs = 0;
        this.getWord();
    };
    Hangman.prototype.getWord = function () {
        var xhr = new XMLHttpRequest();
        var url = "./words.txt";
        xhr.open("GET", url, true);
        var response = "";
        var game = this;
        xhr.onload = function () {
            if (this.status === 200) {
                response = this.responseText;
                var wordArray = response.split("\n");
                wordArray = wordArray.filter(function (w) {
                    if (w.length < game.minWordLength) {
                        return false;
                    }
                    w = w.toLowerCase();
                    if (/[^\w]|[0-9]/g.test(w)) {
                        return false;
                    }
                    return true;
                });
                var index = ~~lib.random(0, wordArray.length - 1);
                game.word = wordArray[index].toLowerCase();
                console.log(game.word);
                game.updateUI();
                game.showMessages("Hang Man", "~~~ new game ~~~", "", "press any key to start", "press letter keys to play", "press <F5> to reset");
                game.gameReady = true;
            }
        };
        xhr.send();
    };
    Hangman.prototype.startGame = function () {
        if (this.gameStarted) {
            return;
        }
        if (this.gameOver) {
            this.reset();
        }
        this.gameStarted = true;
        this.gameRunning = true;
        this.updateUI();
        this.interval = setInterval(this.drawTime, this.intervalTime, this);
    };
    Hangman.prototype.endGame = function (won) {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages(won ? "you won!" : "~~~ game over! ~~~", "", "total time: " + ~~(this.timeElapsed / 1000), "total erros: " + this.wrongs, "", "press <F5> to restart");
    };
    Hangman.prototype.drawTime = function (_this) {
        _this.timeElapsed += _this.intervalTime;
        _this.updateUI();
    };
    Hangman.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize.x;
        canvas.height = this.gameSize.y;
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    Hangman.prototype.keyDown = function (event) {
        event.preventDefault();
        if (!this.gameReady) {
            return;
        }
        if (!this.gameStarted) {
            this.startGame();
            return;
        }
        this.characterKnown.set(event.key);
        if (this.word.indexOf(event.key) === -1) {
            this.wrongs++;
        }
        this.updateUI();
    };
    Hangman.prototype.showMessages = function () {
        var _this = this;
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        var offsetY = this.canvas.height / 2 - 15 * messages.length;
        this.ctx.save();
        this.ctx.fillStyle = "#fff";
        messages.forEach(function (m) {
            _this.ctx.fillText(m, _this.canvas.width / 2, offsetY);
            offsetY += 30;
            console.log(m);
        });
        this.ctx.restore();
    };
    Hangman.prototype.updateUI = function () {
        this.ctx.save();
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = "40px Consolas";
        var len = this.word.length;
        var xOffset = this.gameSize.x / 2 - len * 30;
        var y = this.gameSize.y * 0.75;
        this.ctx.fillStyle = "#fff";
        var numberKnown = 0;
        for (var i = 0; i < len; i++) {
            var character = this.word[i];
            this.ctx.fillRect(xOffset, y, 50, 3);
            if (this.characterKnown.has(character)) {
                this.ctx.fillText(character, xOffset + 25, y - 5);
                numberKnown++;
            }
            xOffset += 60;
        }
        if (!this.gameOver && numberKnown === this.word.length) {
            this.endGame(true);
        }
        this.ctx.fillRect(100, 100, 50, 5);
        this.ctx.font = "20px Consolas";
        this.ctx.fillText("time " + ~~(this.timeElapsed / 1000) + "  ~  errors " + this.wrongs, this.canvas.width / 2, 25);
        this.ctx.restore();
    };
    Hangman.prototype.remove = function () {
        this.canvas.remove();
    };
    return Hangman;
}());
var hm;
function keyDownHangman(event) {
    switch (event.key) {
        case "F5":
            return;
        case "F11":
            return;
        case "F12":
            return;
        default:
            if (hm) {
                hm.keyDown(event);
            }
    }
}
function initHangman() {
    if (hm) {
        hm.remove();
    }
    hm = new Hangman();
}
