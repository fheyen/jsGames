/**
 * Main class of this game.
 */
class Hangman {
    gameSize: Array<number>;
    timeElapsed: number;
    minWordLength: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameStarted: boolean;
    gameRunning: boolean;
    gameOver: boolean;
    intervalTime: number;
    interval: any;

    /**
     * Creates a new Copter object.
     */
    constructor() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        this.minWordLength = 12;
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
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;

        // get random english word
        let article = this.getWord();
        console.log(article);

        // draw UI
        this.updateUI();
        this.showMessages(
            "Hang Man",
            "~~~ new game ~~~",
            "",
            "press any key to start",
            "press letter keys to play",
            "press <F5> to reset"
        );
    }

    getWord(): string {
        let xhr = new XMLHttpRequest();

        let url = "./words.txt";

        xhr.open("GET", url, true);

        let response = "";

        let game = this;

        xhr.onload = function () {
            if (this.status === 200) {
                response = this.responseText;

                let wordArray: Array<string> = response.split("\n");

                wordArray = wordArray.filter(w => {
                    // filter short words
                    if (w.length < game.minWordLength) {
                        return false;
                    }
                    return true;
                });

                wordArray = wordArray.filter(w => {
                    w = w.toLowerCase();
                    // filter words with number, special characters, etc.
                    // only letters are allowed
                    if (/[^\w]|[0-9]/g.test(w)) {
                        return false;
                    }
                    return true;
                });

                return wordArray[~~lib.random(0, wordArray.length - 1)];

            } else {
                console.error(`HTTP status ${this.status}`);
            }
        };

        xhr.send();

        return response;
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
        this.interval = setInterval(this.drawTime, this.intervalTime, this);
    }

    /**
     * Ends the game.
     */
    endGame(): void {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages(
            "~~~ game over! ~~~",
            "",
            `total time: ${~~(this.timeElapsed / 1000)}`,
            "",
            "press <F5> to restart"
        );
    }

    drawTime(_this: Hangman) {
        _this.timeElapsed += _this.intervalTime;
        _this.updateUI();
    }

    /**
     * Creates and returns a canvas object.
     */
    createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
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
        if (!this.gameStarted) {
            this.startGame();
        }
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
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // TODO: word and _ _ _

        // TODO: gallow

        // TODO: man

        // time elapsed
        this.ctx.fillText(
            `time ${~~(this.timeElapsed / 1000)}`,
            this.canvas.width / 2,
            25
        );
    }

    /**
     * Removes the canvas from the DOM.
     */
    remove(): void {
        this.canvas.remove();
    }
}


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