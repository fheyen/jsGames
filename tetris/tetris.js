"use strict";
/**
 * Main class of this game.
 */
class Tetris {
    /**
     * Creates a new Tetris object.
     */
    constructor() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        // game options
        this.rows = 24;
        this.cols = 16;
        // inverse framerate
        this.intervalTime = 500;
        // canvas
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        this.ctx.shadowColor = "#000";
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
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
        if (this.gameOver) {
            return;
        }
        // process keyboard input
        switch (event.key) {
            case "ArrowLeft":
                if (this.gameRunning) {
                    this.currentBlock.moveLeft();
                }
                break;
            case "ArrowRight":
                if (this.gameRunning) {
                    this.currentBlock.moveRight();
                }
                break;
            case "ArrowUp":
                if (this.gameRunning) {
                    this.currentBlock.rotate();
                }
                break;
            case "ArrowDown":
                if (this.gameRunning) {
                    this.currentBlock.drop();
                }
                break;
            case " ":
                // space bar: start, pause or resume
                if (!this.gameStarted) {
                    this.startGame();
                }
                else if (this.gameRunning) {
                    this.pauseGame();
                }
                else {
                    this.resumeGame();
                }
                return;
            default:
                break;
        }
        if (this.gameRunning) {
            this.play();
        }
    }
    /**
     * Resets the game to the initial conditions.
     */
    reset() {
        this.timeElapsed = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        // generate blocks
        this.blockQueue = [];
        for (let i = 0; i < 4; i++) {
            this.blockQueue.push(TetrisBlock.getRandom(this));
        }
        const block = this.blockQueue.shift();
        if (block !== undefined) {
            this.currentBlock = block;
        }
        // create grid
        this.grid = [];
        for (let i = 0; i < this.rows; i++) {
            this.grid.push(new Array(this.cols).fill(0));
        }
        // draw UI
        this.updateUI();
        this.showMessages("Tetris", "~~~ new game ~~~", "", "press <space> to start or pause", "press <⯇> or <⯈> to move the block", "press <⯅> to drop the block", "press <⯆> to drop the block", "press <F5> to reset");
    }
    /**
     * Starts the game.
     */
    startGame() {
        this.gameOver = false;
        this.gameStarted = true;
        this.gameRunning = true;
        this.updateUI();
        this.interval = setInterval(this.animate, this.intervalTime, this);
    }
    /**
     * Pauses the game.
     */
    pauseGame() {
        if (this.gameOver || !this.gameRunning) {
            return;
        }
        this.gameRunning = false;
        clearInterval(this.interval);
        this.showMessages("Tetris", "~~~ paused ~~~", "", "press <space> to continue", "press <F5> to reset");
    }
    /**
     * Resumes the paused game.
     */
    resumeGame() {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.updateUI();
        this.interval = setInterval(this.animate, this.intervalTime, this);
    }
    /**
     * Ends the game.
     */
    endGame() {
        this.gameOver = true;
        clearInterval(this.interval);
        this.showMessages("~~~ game over! ~~~", "", `total time survived: ${Math.floor(this.timeElapsed / 1000)}`, `total score: ${Math.floor(this.score)}`, "", "press <F5> to restart");
    }
    /**
     * Creates and returns a canvas object.
     */
    createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    }
    /**
     * @param this this object
     */
    animate(t) {
        t.timeElapsed += t.intervalTime;
        t.currentBlock.moveDown();
        t.play();
    }
    /**
     * Main game logic.
     */
    play() {
        // check if block hit bottom
        if (this.currentBlock.hitBottom()) {
            // if block was at top, player lost
            if (this.currentBlock.boxes[0].y <= 0) {
                this.endGame();
            }
            if (this.currentBlock.bottom) {
                // add block to grid
                this.currentBlock.addToGrid();
                this.score += 10;
                // create new block and shift one from queue
                this.blockQueue.push(TetrisBlock.getRandom(this));
                const block = this.blockQueue.shift();
                if (block !== undefined) {
                    this.currentBlock = block;
                }
            }
            else {
                this.currentBlock.bottom = true;
            }
        }
        else {
            this.currentBlock.bottom = false;
        }
        // check for full rows
        const fr = this.getFullRows();
        if (fr.length > 0) {
            fr.forEach((r) => this.clearRow(r));
            this.score += fr.length * 100;
            if (fr.length === 4) {
                // tetris
                this.score += fr.length * 400;
            }
            // make game faster
            this.intervalTime -= 10;
            clearInterval(this.interval);
            this.interval = setInterval(this.animate, this.intervalTime, this);
        }
        // time add to score
        this.score += this.intervalTime / 10000;
        this.updateUI();
    }
    /**
     * Finds full rows if there are any.
     */
    getFullRows() {
        const result = [];
        for (let row = 0; row < this.rows; row++) {
            let rowFull = true;
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === 0) {
                    rowFull = false;
                    break;
                }
            }
            if (rowFull) {
                result.push(row);
            }
        }
        return result;
    }
    /**
     * Clears a row.
     * @param row index of row to be cleared.
     */
    clearRow(row) {
        // shift all values from above down by one row
        for (let r = row; r > 0; r--) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[r][col] = this.grid[r - 1][col];
            }
        }
    }
    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    showMessages(...messages) {
        let offsetY = this.canvas.height / 2 - 15 * messages.length;
        this.ctx.fillStyle = "#fff";
        messages.forEach((m) => {
            this.ctx.fillText(m, this.canvas.width / 2, offsetY);
            offsetY += 30;
            console.log(m);
        });
    }
    /**
     * Draws the UI.
     */
    updateUI() {
        if (this.gameOver) {
            return;
        }
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // grid
        const boxSize = Math.min(this.gameSize[0] / (this.cols + 4), this.gameSize[1] / this.rows) * 0.8;
        const margin = boxSize / 10;
        let gridX = (this.gameSize[0] - (boxSize + margin) * (this.cols + 4)) / 2;
        let gridY = (this.gameSize[1] - (boxSize + margin) * this.rows) / 2;
        let y = gridY;
        for (let row = 0; row < this.rows; row++) {
            let x = gridX;
            for (let col = 0; col < this.cols; col++) {
                const type = this.grid[row][col];
                this.ctx.fillStyle = TetrisBlock.colors[type];
                this.ctx.fillRect(x, y, boxSize, boxSize);
                x += boxSize + margin;
            }
            y += boxSize + margin;
        }
        // block
        this.currentBlock.draw(this.ctx, gridX, gridY, boxSize, margin);
        // queue
        gridX += (this.cols / 2 + 3) * (boxSize + margin);
        this.blockQueue.forEach(b => {
            b.draw(this.ctx, gridX, gridY, boxSize, margin);
            gridY += (b.height + 1) * (boxSize + margin);
        });
        // time elapsed
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(`time ${Math.floor(this.timeElapsed / 1000)}  ~  score ${Math.floor(this.score)}`, this.canvas.width / 2, 25);
    }
}
/**
 * Class for tetris blocks.
 */
class TetrisBlock {
    constructor(game, type) {
        this.bottom = false;
        this.game = game;
        this.type = type;
        this.colorId = Math.floor(lib.random(1, TetrisBlock.numTypes + 1));
        // create block from type
        const x = Math.min(game.cols / 2) - 1;
        const y = 0;
        switch (type) {
            case 1:
                // OO
                // OO
                this.height = 2;
                this.boxes = [
                    { x, y },
                    {
                        x: x + 1,
                        y: y + 0
                    },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x + 1,
                        y: y + 1
                    }
                ];
                break;
            case 2:
                // O
                // O
                // OO
                this.height = 3;
                this.boxes = [
                    { x, y },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x + 0,
                        y: y + 2
                    },
                    {
                        x: x + 1,
                        y: y + 2
                    }
                ];
                break;
            case 3:
                // O
                // O
                // O
                // O
                this.height = 4;
                this.boxes = [
                    { x, y },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x + 0,
                        y: y + 2
                    },
                    {
                        x: x + 0,
                        y: y + 3
                    }
                ];
                break;
            case 4:
                // OO
                // O
                // O
                this.height = 3;
                this.boxes = [
                    { x, y },
                    {
                        x: x + 1,
                        y: y + 0
                    },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x + 0,
                        y: y + 2
                    }
                ];
                break;
            case 5:
                // O
                // OO
                //  O
                this.height = 3;
                this.boxes = [
                    { x, y },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x + 1,
                        y: y + 1
                    },
                    {
                        x: x + 1,
                        y: y + 2
                    }
                ];
                break;
            case 6:
                //  O
                // OO
                // O
                this.height = 3;
                this.boxes = [
                    { x, y },
                    {
                        x: x + -1,
                        y: y + 1
                    },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x - 1,
                        y: y + 2
                    }
                ];
                break;
            case 7:
                // O
                // OO
                // O
                this.height = 3;
                this.boxes = [
                    { x, y },
                    {
                        x: x + 0,
                        y: y + 1
                    },
                    {
                        x: x + 1,
                        y: y + 1
                    },
                    {
                        x: x + 0,
                        y: y + 2
                    }
                ];
                break;
            default:
                break;
        }
    }
    static getRandom(game) {
        return new TetrisBlock(game, Math.floor(lib.random(1, TetrisBlock.numTypes + 1)));
    }
    /**
     * Moves block left if possible.
     */
    moveLeft() {
        if (this.hitSide(true)) {
            return;
        }
        this.boxes = this.boxes.map(b => {
            return {
                x: b.x - 1,
                y: b.y
            };
        });
    }
    /**
     * Moves block right if possible.
     */
    moveRight() {
        if (this.hitSide(false)) {
            return;
        }
        this.boxes = this.boxes.map(b => {
            return {
                x: b.x + 1,
                y: b.y
            };
        });
    }
    /**
     * Moves block down if possible.
     */
    moveDown() {
        if (this.hitBottom()) {
            return;
        }
        this.boxes = this.boxes.map(b => {
            return {
                x: b.x,
                y: b.y + 1
            };
        });
    }
    /**
     * Rotates block if possible.
     */
    rotate() {
        if (this.type === 1) {
            return;
        }
        const postionX = this.boxes[0].x;
        const postionY = this.boxes[0].y;
        const boxes = this.boxes.map(b => {
            // move to origin
            let x = b.x - postionX;
            let y = b.y - postionY;
            const tmp = y;
            y = -x;
            x = tmp;
            // move back
            x += postionX;
            y += postionY;
            return { x, y };
        });
        // check if all went well
        let ok = true;
        for (let i = 0; i < boxes.length; i++) {
            const x = boxes[i].x;
            const y = boxes[i].y;
            if (y < 0) {
                continue;
            }
            if (x < 0 || x >= this.game.cols) {
                // side of grid reached
                ok = false;
                break;
            }
            if (y >= this.game.rows) {
                // bottom of grid reached
                ok = false;
                break;
            }
            if (this.game.grid[y][x] !== 0) {
                // space already taken
                ok = false;
                break;
            }
        }
        if (ok) {
            this.boxes = boxes;
        }
    }
    /**
     * Checks if block would hit something when moving sideward.
     * @param left if true, movement to the left is assumed, right otherwise.
     */
    hitSide(left) {
        // first box is top-left box
        for (let i = 0; i < this.boxes.length; i++) {
            const x = this.boxes[i].x + (left ? -1 : 1);
            const y = this.boxes[i].y;
            if (y < 0) {
                continue;
            }
            if (x < 0 || x >= this.game.cols) {
                // side of grid reached
                return true;
            }
            if (this.game.grid[y][x] !== 0) {
                // space already taken
                return true;
            }
        }
        return false;
    }
    /**
     * Checks if block would hit somehting when moving downward.
     */
    hitBottom() {
        // first box is top-left box
        for (let i = 0; i < this.boxes.length; i++) {
            const x = this.boxes[i].x;
            const y = this.boxes[i].y + 1;
            if (y < 0) {
                continue;
            }
            else if (y >= this.game.rows) {
                // bottom of grid reached
                return true;
            }
            if (this.game.grid[y][x] !== 0) {
                // space already taken
                return true;
            }
        }
        return false;
    }
    /**
     * Moves the block down as far as possible.
     */
    drop() {
        while (!this.hitBottom()) {
            this.moveDown();
        }
    }
    /**
     * Adds the block to the games grid (so it cannot be moved anymore).
     */
    addToGrid() {
        this.boxes.forEach(b => {
            this.game.grid[b.y][b.x] = this.colorId;
        });
    }
    /**
     * Draws the block.
     * @param ctx canvas context
     * @param gridX grid position x
     * @param gridY grid position y
     * @param boxSize size of all boxes
     * @param margin margin around boxes
     */
    draw(ctx, gridX, gridY, boxSize, margin) {
        ctx.fillStyle = TetrisBlock.colors[this.colorId];
        this.boxes.forEach(b => {
            ctx.fillRect(gridX + b.x * (boxSize + margin), gridY + b.y * (boxSize + margin), boxSize, boxSize);
        });
    }
}
TetrisBlock.colors = ["#222", "#f22", "#0f0", "#08f", "#ff0", "#66f", "#ddd", "#fa0"];
TetrisBlock.numTypes = 7;
// #region main
// global game letiable
let tetris;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownTetris(event) {
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
            if (tetris) {
                tetris.keyDown(event);
            }
    }
}
/**
 * Starts a new game.
 */
function initTetris() {
    if (tetris) {
        tetris.remove();
    }
    tetris = new Tetris();
}
// #endregion main
