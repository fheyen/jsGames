/**
 * Main class of this game.
 */
class Hangman {
    gameSize: { x: number, y: number };
    timeElapsed: number;
    word: string;
    minWordLength: number;
    characterKnown: any;
    errorsMade: number;
    maxErrors: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameReady: boolean;
    gameStarted: boolean;
    gameRunning: boolean;
    gameOver: boolean;
    intervalTime: number;
    interval: any;

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
     * Resets the game to the initial conditions.
     */
    reset(): void {
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
    getWord(): void {
        let xhr = new XMLHttpRequest();
        let url = "./words.txt";
        xhr.open("GET", url, true);
        let response = "";
        let game = this;
        // onload callback
        xhr.onload = function () {
            if (this.status === 200) {
                response = this.responseText;

                if (response.length === 0) {
                    throw new Error("Could not load words!");
                }

                let wordArray: Array<string> = response.split("\n");

                // filter short words
                wordArray = wordArray.filter(w => w.length >= game.minWordLength);

                // filter words with number, special characters, etc.
                // only letters are allowed
                wordArray = wordArray.filter(w => !/[0-9,'-\.]/g.test(w.toLowerCase()));

                if (wordArray.length === 0) {
                    throw new Error("No words left after filtering!");
                }

                // choose random word
                let index = ~~lib.random(0, wordArray.length - 1);
                game.word = wordArray[index];
                if (game.word) {
                    game.word = game.word.trim().toLowerCase();
                } else {
                    game.word = "";
                }
                // TODO: remove
                console.log(game.word);

                // draw UI
                game.updateUI();
                game.showMessages(
                    "Hang Man",
                    "~~~ new game ~~~",
                    "",
                    "press any key to start",
                    "press letter keys to play",
                    "press <F5> to reset"
                );

                game.gameReady = true;
            }
        };
        xhr.send();
    }

    /**
     * Starts the game.
     */
    startGame(): void {
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
    endGame(won: boolean): void {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages(
            won ? "you won!" : "~~~ game over, you're dead! ~~~",
            "",
            won ? "" : `the word was: ${this.word}`,
            `total time: ${~~(this.timeElapsed / 1000)}`,
            `total erros: ${this.errorsMade}`,
            "",
            "press <F5> to restart"
        );
    }

    /**
     * Refreshes the UI to show the current time once a second.
     * @param _this
     */
    drawTime(_this: Hangman) {
        _this.timeElapsed += _this.intervalTime;
        _this.updateUI();
    }

    /**
     * Creates and returns a canvas object.
     */
    createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement("canvas");
        canvas.width = this.gameSize.x;
        canvas.height = this.gameSize.y;
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    }

    /**
     * Called if a player has clicked on a button.
     * @param event keydown event
     */
    keyDown(event: KeyboardEvent): void {
        event.preventDefault();
        // process keyboard input
        if (!this.gameReady || this.gameOver) {
            return;
        }
        if (!this.gameStarted) {
            this.startGame();
        }

        // remember character
        this.characterKnown.set(event.key);

        // increase penalty if word does not contain this character
        if (this.word.indexOf(event.key) === - 1) {
            this.errorsMade++;
        }

        this.updateUI();
    }

    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    showMessages(...messages: Array<string>): void {
        let offsetY = this.canvas.height / 2 - 15 * messages.length;
        this.ctx.save();
        this.ctx.fillStyle = "#fff";
        messages.forEach(m => {
            this.ctx.fillText(
                m,
                this.canvas.width / 2,
                offsetY
            );
            offsetY += 30;
            console.log(m);
        });
        this.ctx.restore();
    }

    /**
     * Draws the UI.
     */
    updateUI(): void {
        this.ctx.save();
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // word and _ _ _
        let lineWidth = this.gameSize.x * 0.5 / this.word.length;
        let lineHeight = Math.min(3, lineWidth * 0.1);
        let xOffset = this.gameSize.x * 0.4 - (this.word.length * lineWidth) / 2;
        let y = this.gameSize.y * 0.75;
        this.ctx.font = `${lineWidth}px Arial`;
        this.ctx.fillStyle = "#fff";
        let numberKnown = 0;
        for (let i = 0; i < this.word.length; i++) {
            let character = this.word[i];
            // show underscore
            this.ctx.fillRect(
                xOffset + lineWidth * 0.1,
                y,
                lineWidth * 0.8,
                lineHeight
            );
            // show character of known
            if (this.characterKnown.has(character)) {
                this.ctx.fillText(character, xOffset + lineWidth / 2, y - 5);
                numberKnown++;
            }
            xOffset += lineWidth;
        }

        // TODO: draw gallow and man
        let x = xOffset + lineWidth;
        let width = (this.gameSize.x - x) * 0.8;
        let height = y * 0.5;
        let rects = [
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
            let r = rects[i - 1];
            this.ctx.fillRect(r[0], r[1], r[2], r[3]);
        }

        // time elapsed and errors
        this.ctx.font = "20px Consolas";
        this.ctx.fillText(
            `time ${~~(this.timeElapsed / 1000)}  ~  errors ${this.errorsMade}`,
            this.canvas.width / 2,
            25
        );
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

    /**
     * Removes the canvas from the DOM.
     */
    remove(): void {
        this.canvas.remove();
    }
}

// #region main

// global game variable
var hm: Hangman;

/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownHangman(event: KeyboardEvent): void {
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
function initHangman(): void {
    if (hm) {
        hm.remove();
    }
    hm = new Hangman();
}

// #endregion main