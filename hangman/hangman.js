"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib = require("../lib/lib.js");
var Hangman = (function () {
    function Hangman() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
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
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        var article = this.getWord();
        console.log(article);
        this.updateUI();
        this.showMessages("Hang Man", "~~~ new game ~~~", "", "press any key to start", "press letter keys to play", "press <F5> to reset");
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
                    return true;
                });
                wordArray = wordArray.filter(function (w) {
                    w = w.toLowerCase();
                    if (/[^\w]|[0-9]/g.test(w)) {
                        return false;
                    }
                    return true;
                });
                return wordArray[~~lib.random(0, wordArray.length - 1)];
            }
            else {
                console.error("HTTP status " + this.status);
            }
        };
        xhr.send();
        return response;
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
        this.interval = setInterval(this.drawTime, this.intervalTime, this);
    };
    Hangman.prototype.endGame = function () {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages("~~~ game over! ~~~", "", "total time: " + ~~(this.timeElapsed / 1000), "", "press <F5> to restart");
    };
    Hangman.prototype.drawTime = function (_this) {
        _this.timeElapsed += _this.intervalTime;
        _this.updateUI();
    };
    Hangman.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    Hangman.prototype.keyDown = function (event) {
        event.preventDefault();
        if (!this.gameStarted) {
            this.startGame();
        }
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
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillText("time " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
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
