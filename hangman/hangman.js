"use strict";
/**
 * Main class of this game.
 */
class Hangman {
    /**
     * Creates a new Copter object.
     */
    constructor() {
        this.gameSize = {
            x: window.innerWidth,
            y: window.innerHeight
        };
        // game parameters
        this.minWordLength = 10;
        this.maxErrors = 6;
        // inverse framerate
        this.intervalTime = 1000;
        // canvas
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        // initialize game
        this.reset();
    }
    /**
     * Removes the canvas from the DOM.
     */
    remove() {
        this.canvas.remove();
    }
    /**
     * Called if a player has clicked on a button.
     * @param event keydown event
     */
    keyDown(event) {
        event.preventDefault();
        // process keyboard input
        if (!this.gameReady || this.gameOver) {
            return;
        }
        if (!this.gameStarted) {
            this.startGame();
        }
        // remember character
        this.characterKnown.set(event.key, true);
        // increase penalty if word does not contain this character
        if (this.word.indexOf(event.key) === -1) {
            this.errorsMade++;
        }
        this.updateUI();
    }
    /**
     * Resets the game to the initial conditions.
     */
    reset() {
        this.timeElapsed = 0;
        this.gameReady = false;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        this.showMessages("loading...");
        this.characterKnown = new Map();
        this.errorsMade = 0;
        // get random english word
        this.getWord();
    }
    /**
     * Loads a random word from a file.
     */
    getWord() {
        const xhr = new XMLHttpRequest();
        const url = "./words.txt";
        xhr.open("GET", url, true);
        let response = "";
        const game = this;
        // onload callback
        xhr.onload = function () {
            if (this.status === 200) {
                response = this.responseText;
                if (response.length === 0) {
                    throw new Error("Could not load words!");
                }
                let wordArray = response.split("\n");
                // filter short words
                wordArray = wordArray.filter(w => w.length >= game.minWordLength);
                // filter words with number, special characters, etc.
                // only letters are allowed
                wordArray = wordArray.filter(w => !/[0-9,'-\.]/g.test(w.toLowerCase()));
                if (wordArray.length === 0) {
                    throw new Error("No words left after filtering!");
                }
                // choose random word
                const index = Math.floor(lib.random(0, wordArray.length - 1));
                game.word = wordArray[index];
                if (game.word) {
                    game.word = game.word.trim().toLowerCase();
                }
                else {
                    game.word = "";
                }
                // draw UI
                game.updateUI();
                game.showMessages("Hang Man", "~~~ new game ~~~", "", "press any key to start", "press letter keys to play", "press <F5> to reset");
                game.gameReady = true;
            }
        };
        xhr.send();
    }
    /**
     * Starts the game.
     */
    startGame() {
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
    }
    /**
     * Ends the game.
     */
    endGame(won) {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages(won ? "you won!" : "~~~ game over, you're dead! ~~~", "", won ? "" : `the word was: ${this.word}`, `total time: ${Math.floor(this.timeElapsed / 1000)}`, `total erros: ${this.errorsMade}`, "", "press <F5> to restart");
    }
    /**
     * Refreshes the UI to show the current time once a second.
     * @param h
     */
    drawTime(h) {
        h.timeElapsed += h.intervalTime;
        h.updateUI();
    }
    /**
     * Creates and returns a canvas object.
     */
    createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.gameSize.x;
        canvas.height = this.gameSize.y;
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    }
    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    showMessages(...messages) {
        let offsetY = this.canvas.height / 2 - 15 * messages.length;
        this.ctx.save();
        this.ctx.fillStyle = "#fff";
        messages.forEach(m => {
            this.ctx.fillText(m, this.canvas.width / 2, offsetY);
            offsetY += 30;
            console.log(m);
        });
        this.ctx.restore();
    }
    /**
     * Draws the UI.
     */
    updateUI() {
        this.ctx.save();
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // word and _ _ _
        const lineWidth = this.gameSize.x * 0.5 / this.word.length;
        const lineHeight = Math.min(3, lineWidth * 0.1);
        let xOffset = this.gameSize.x * 0.4 - (this.word.length * lineWidth) / 2;
        const y = this.gameSize.y * 0.75;
        this.ctx.font = `${lineWidth}px Arial`;
        this.ctx.fillStyle = "#fff";
        let numberKnown = 0;
        for (let i = 0; i < this.word.length; i++) {
            const character = this.word[i];
            // show underscore
            this.ctx.fillRect(xOffset + lineWidth * 0.1, y, lineWidth * 0.8, lineHeight);
            // show character of known
            if (this.characterKnown.has(character)) {
                this.ctx.fillText(character, xOffset + lineWidth / 2, y - 5);
                numberKnown++;
            }
            xOffset += lineWidth;
        }
        // draw gallow and man
        const x = xOffset + lineWidth;
        const width = (this.gameSize.x - x) * 0.8;
        const height = y * 0.5;
        const rects = [
            [
                x,
                y,
                width,
                -height * 0.2
            ],
            [
                x + width * 0.7,
                y,
                width * 0.08,
                -height
            ],
            [
                x + width * 0.1,
                y - height,
                width * 0.8,
                width * 0.08
            ],
            [
                x + width * 0.2,
                y - height * 0.74,
                width * 0.01,
                -height * 0.25
            ],
            [
                x + width * 0.15,
                y - height * 0.74,
                width * 0.1,
                width * 0.1
            ],
            [
                x + width * 0.15,
                y - height * 0.67,
                width * 0.1,
                width * 0.3
            ]
        ];
        for (let i = 1; i <= this.errorsMade && i <= this.maxErrors; i++) {
            const r = rects[i - 1];
            this.ctx.fillRect(r[0], r[1], r[2], r[3]);
        }
        // time elapsed and errors
        this.ctx.font = "20px Consolas";
        this.ctx.fillText(`time ${Math.floor(this.timeElapsed / 1000)}  ~  errors ${this.errorsMade}`, this.canvas.width / 2, 25);
        this.ctx.restore();
        // check if player won
        if (!this.gameOver && numberKnown === this.word.length) {
            this.endGame(true);
        }
        // check if player lost
        if (!this.gameOver && this.errorsMade > this.maxErrors) {
            this.endGame(false);
        }
    }
}
// #region main
// global game variable
let hm;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownHangman(event) {
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
            if (hm) {
                hm.keyDown(event);
            }
    }
}
/**
 * Starts a new game.
 */
function initHangman() {
    if (hm) {
        hm.remove();
    }
    hm = new Hangman();
}
// #endregion main
