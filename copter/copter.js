"use strict";
/**
 * Main class of this game.
 */
class Copter {
    /**
     * Creates a new Copter object.
     */
    constructor() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        // inverse framerate
        this.intervalTime = 20;
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
        switch (event.key) {
            case "ArrowUp":
                if (!this.gameStarted) {
                    // start game if it is not running
                    this.startGame();
                }
                else if (!this.gameRunning) {
                    // resume game if it is paused
                    this.resumeGame();
                }
                else if (this.player.y > 50) {
                    // move copter up if game is running
                    this.player.y -= 50;
                }
                break;
            case " ":
                if (!this.gameStarted) {
                    return;
                }
                // space bar: pause or resume
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
    }
    /**
     * Resets the game to the initial conditions.
     */
    reset() {
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        // create player
        const playerWidth = Math.min(this.gameSize[0], this.gameSize[1]) / 10;
        this.player = {
            x: 100,
            y: this.gameSize[1] / 2,
            width: playerWidth,
            height: playerWidth / 2,
            speed: 5,
            acceleration: 1
        };
        // create obstacles
        this.obstacles = [];
        const num = 200;
        const width = this.gameSize[0] / num;
        const height = this.gameSize[1];
        let lastObstacle = null;
        for (let i = 0; i < num; i++) {
            lastObstacle = new CopterObstacle(lastObstacle, width, height, 1);
            this.obstacles.push(lastObstacle);
        }
        // draw UI
        this.updateUI();
        this.showMessages("Copter", "~~~ new game ~~~", "", "press <⬆> to start", "press <space> to pause", "press <⬆> to move the copter up", "press <F5> to reset");
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
        this.showMessages("Copter", "~~~ paused ~~~", "", "press <space> or <⬆> to continue", "press <F5> to reset");
    }
    /**
     * Resumes the paused game.
     */
    resumeGame() {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    }
    /**
     * Ends the game.
     */
    endGame() {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages("~~~ game over! ~~~", "", `total time survived: ${Math.floor(this.timeElapsed / 1000)}`, "", "press <F5> to restart");
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
     * @param c this object
     */
    animate(c) {
        // abbreviations
        const obs = c.obstacles;
        const p = c.player;
        // update elapsed time
        c.timeElapsed += c.intervalTime;
        // update player position
        p.y += p.speed;
        // shift obstacles
        const obstacleWidth = obs[0].width;
        obs.forEach(o => o.shift(-obstacleWidth));
        // remove 0. obstacle
        obs.unshift();
        // add new one
        obs.push(new CopterObstacle(obs[obs.length - 1], obstacleWidth, c.gameSize[1], 1 + c.timeElapsed / (1000)));
        // test for crash
        let crashed = false;
        const hitBox = [
            [100, p.y],
            [100 + p.width, p.y + p.height]
        ];
        for (let i = 0; i < obs.length; i++) {
            // only check first few obstacles
            if (obs[i].xPosition > p.x + p.width + obstacleWidth) {
                break;
            }
            if (obs[i].isHit(hitBox)) {
                crashed = true;
                break;
            }
        }
        if (crashed) {
            // game over
            c.endGame();
        }
        else {
            c.updateUI();
        }
    }
    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    showMessages(...messages) {
        let offsetY = this.canvas.height / 2 - 15 * messages.length;
        messages.forEach(m => {
            this.ctx.fillText(m, this.canvas.width / 2, offsetY);
            offsetY += 30;
            console.log(m);
        });
    }
    /**
     * Draws the UI.
     */
    updateUI() {
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // obstacles
        this.ctx.fillStyle = "#0f0";
        this.obstacles.forEach(o => o.draw(this.ctx));
        // player
        this.ctx.fillStyle = "#fff";
        this.drawCopter();
        // time elapsed
        this.ctx.fillText(`time ${Math.floor(this.timeElapsed / 1000)}`, this.canvas.width / 2, 25);
    }
    /**
     * Draws the copter.
     */
    drawCopter() {
        const x = this.player.x;
        const y = this.player.y;
        const w = this.player.width;
        const h = this.player.height;
        const rotorAngle = ((this.timeElapsed / 10) % 20) / 20;
        const rotorWidth = w * rotorAngle;
        const rotorHeight = h * 0.125;
        this.ctx.fillStyle = "#fff";
        // body
        this.ctx.fillRect(x + w * 0.4, y + 2 * rotorHeight, w * 0.5, h - rotorHeight * 3);
        // tail
        this.ctx.fillRect(x, y + 3 * rotorHeight, w * 0.5, h * 0.2);
        this.ctx.fillRect(x, y + rotorHeight, w * 0.1, 3 * rotorHeight);
        // rotor
        this.ctx.fillRect(x + w * 0.65 - rotorWidth * 0.5, y, rotorWidth, rotorHeight);
        // feet
        this.ctx.fillRect(x + w * 0.3, y + h - rotorHeight * 0.5, w * 0.7, rotorHeight * 0.5);
    }
}
/**
 * Obstacle class for Copter.
 */
class CopterObstacle {
    /**
     * Constructor
     * @param lastObstacle the latest created obstacle before this one
     * @param width width
     * @param height height
     * @param difficulty difficulty
     */
    constructor(lastObstacle, width, height, difficulty) {
        this.width = width;
        this.height = height;
        this.difficulty = difficulty;
        // if first obstacle
        if (lastObstacle === null) {
            this.xPosition = 0;
            this.holeUpperY = height * 0.2;
            this.holeLowerY = height - this.holeUpperY;
        }
        else {
            this.xPosition = lastObstacle.xPosition + width;
            const r1 = Math.random();
            const r2 = Math.random();
            // the lower the upper bound is, the more probable it should go up
            const goDown = ((lastObstacle.holeUpperY + lastObstacle.holeLowerY) / 2) / this.height;
            const direction = (r2 > goDown ? 1 : -1);
            // get and apply shift
            const yShift = difficulty * r1 * direction;
            this.holeUpperY = lastObstacle.holeUpperY + yShift;
            this.holeLowerY = lastObstacle.holeLowerY + yShift;
        }
    }
    /**
     * Horizontal shift ob the obstacles position.
     * @param amount shift amount in pixels.
     */
    shift(amount) {
        this.xPosition += amount;
    }
    /**
     * Hit test for this obstacle with a rectangular hit box
     * @param hitBoxRectangle hit box
     */
    isHit(hitBoxRectangle) {
        const hb = hitBoxRectangle;
        const hb2 = [
            [this.xPosition, 0],
            [this.xPosition + this.width, this.holeUpperY]
        ];
        const hb3 = [
            [this.xPosition, this.holeLowerY],
            [this.xPosition + this.width, this.height]
        ];
        return this.rectangleIntersects(hb, hb2) || this.rectangleIntersects(hb, hb3);
    }
    /**
     * Returns true iff two ractangles intersect.
     * @param a rectangle a
     * @param b rectangle b
     */
    rectangleIntersects(a, b) {
        return Math.max(a[0][0], b[0][0]) < Math.min(a[1][0], b[1][0]) &&
            Math.max(a[0][1], b[0][1]) < Math.min(a[1][1], b[1][1]);
    }
    /**
     * Draws this obstacle on the canvas.
     * @param ctx canvas context
     */
    draw(ctx) {
        ctx.fillRect(this.xPosition, 0, this.width + 1, this.holeUpperY);
        ctx.fillRect(this.xPosition, this.holeLowerY, this.width + 1, this.height);
    }
}
// global game variable
let cop;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownCopter(event) {
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
            if (cop) {
                cop.keyDown(event);
            }
    }
}
/**
 * Starts a new game.
 */
function initCopter() {
    if (cop) {
        cop.remove();
    }
    cop = new Copter();
}
