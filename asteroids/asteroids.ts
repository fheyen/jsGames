class Asteroids {
    gameSize: Array<number>;
    ship: any;
    shorts: Array<Shot>;
    asteroids: Array<Asteroid>;
    timeElapsed: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameStarted: boolean;
    gameRunning: boolean;
    gameOver: boolean;
    intervalTime: number;
    interval: any;

    constructor() {
        this.gameSize = [
            window.innerWidth,
            window.innerHeight
        ];
        // inverse framerate
        this.intervalTime = 100;
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
     * Resets the game to the initial conditions.
     */
    reset() {
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;

        // create ship
        let size = Math.min(this.gameSize[0], this.gameSize[1]) / 10;
        let position = new Vector2D(this.gameSize[0] / 2, this.gameSize[1] / 2);
        let orientation = 0;
        let velocity = new Vector2D(0, 0);
        this.ship = new Spaceship(position, orientation, velocity, size, 100);

        // create asteroids
        this.asteroids = [];
        let number = 3;
        for (let i = 0; i < number; i++) {
            let aPos = Vector2D.randomVector(0, this.gameSize[0], 0, this.gameSize[1]);
            // let aVelocity = Vector2D.randomVector(-10, -10, 10, 10);
            let aVelocity = new Vector2D(0, 0);
            let aSize = random(30, 60);
            let a = new Asteroid(aPos, 0, aVelocity, aSize, 50);
            this.asteroids.push(a);
        }

        // draw UI
        this.updateUI();
        this.showMessages(
            "Asteroids",
            "~~~ new game ~~~",
            "",
            "press <space> to start or pause",
            "press <⯅> or <⯆> to move the ship",
            "press <⯇> or <⯈> to rotate the ship",
            "press <F5> to reset"
        );
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
        this.interval = setInterval(this.animate, this.intervalTime, this);
    }

    /**
     * Pauses the game.
     */
    pauseGame(): void {
        if (this.gameOver || !this.gameRunning) {
            return;
        }
        this.gameRunning = false;
        clearInterval(this.interval);
        this.showMessages(
            "Copter",
            "~~~ paused ~~~",
            "",
            "press <space> continue",
            "press <F5> to reset"
        );
    }

    /**
     * Resumes the paused game.
     */
    resumeGame(): void {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
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
            `total time survived: ${~~(this.timeElapsed / 1000)}`,
            "",
            "press <F5> to restart"
        );
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
     * Called if a ship has clicked on a button.
     * @param event keydown event
     */
    keyDown(event: KeyboardEvent): void {
        event.preventDefault();
        // process keyboard input
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                if (!this.gameStarted || !this.gameRunning) {
                    return;
                } else {
                    // change ship velocity
                    event.key === "ArrowUp" ? this.ship.increaseVelocity() : this.ship.decreaseVelocity();
                }
                break;

            case "ArrowLeft":
            case "ArrowRight":
                if (!this.gameStarted || !this.gameRunning) {
                    return;
                } else {
                    // change ship orientation
                    let angle = 10 * Math.PI / 180;
                    event.key === "ArrowLeft" ? this.ship.rotate(-angle) : this.ship.rotate(angle);
                }
                break;

            case " ":
                // space bar: start pause or resume
                if (!this.gameStarted) {
                    this.startGame();
                } else if (this.gameRunning) {
                    this.pauseGame();
                } else {
                    this.resumeGame();
                }
                break;

            default:
                break;
        }
    }

    /**
     * @param _this this object
     */
    animate(_this: Asteroids): void {
        // abbreviations
        let as = _this.asteroids;

        // update elapsed time
        _this.timeElapsed += _this.intervalTime;

        // update ship position
        _this.ship.animate();
        console.log(_this.ship.position);
        console.log(_this.ship.orientation);


        // animate asteroids
        as.forEach(o => o.animate());

        // test for crash
        for (let i = 0; i < as.length; i++) {
            if (_this.ship.isHit(as[i])) {
                // reduce energy of ship
                _this.ship.hitBy(as[i]);

                // game over?
                if (_this.ship.isDestroyed()) {
                    _this.endGame();
                }
            }
        }

        // TODO: test shots and asteroids for collisions


        _this.updateUI();
    }

    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    showMessages(...messages: Array<string>): void {
        let offsetY = this.canvas.height / 2 - 15 * messages.length;
        messages.forEach(m => {
            this.ctx.fillText(
                m,
                this.canvas.width / 2,
                offsetY
            );
            offsetY += 30;
            console.log(m);
        });
    }

    /**
     * Draws the UI.
     */
    updateUI(): void {
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // asteroids
        this.asteroids.forEach(o => o.draw(this.ctx));
        // ship
        this.ship.draw(this.ctx);
        // shots
        this.ship.shots.forEach(s => s.draw(this.ctx));
        // time elapsed
        this.ctx.fillStyle = "#fff";
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



//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////         H E L P E R S           //////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////



function random(min, max) {
    return min + (Math.random() * (max - min));
}



function drawPolygon(ctx, points, stroke, fill) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}




















/**
 * Vector class for 2D points and vectors.
 */
class Vector2D {
    x: number;
    y: number;

    /**
     * @param {number} x x-coordinate
     * @param {number} y y-coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Creates and returns a vector with random values.
     * @param minX
     * @param maxX
     * @param minY
     * @param maxY
     */
    static randomVector(minX, maxX, minY, maxY): Vector2D {
        let x = random(minX, maxX);
        let y = random(minY, maxY);
        return new Vector2D(x, y);
    }

    static getUnitVectorFromOrientation(orientation: number) {
        return new Vector2D(Math.cos(orientation), Math.sin(orientation));
    }

    /**
     * Translates the point by dx and dy.
     * @param {number} dx translation of x-coordinate
     * @param {number} dy translation of y-coordinate
     */
    translate(dx, dy): Vector2D {
        this.x += dx;
        this.y += dy;
        return this;
    }

    /**
     * Translates this vector by another vector.
     * @param vector translation vector
     */
    translateV(vector: Vector2D): Vector2D {
        return this.translate(vector.x, vector.y);
    }

    /**
     * Rotates the point around a center at (cx, cy) by angle.
     * @param {number} cx center point x
     * @param {number} cy center point y
     * @param {number} angle rotation angle
     */
    rotate(cx, cy, angle): Vector2D {
        this.translate(-cx, -cy);
        const x = this.x;
        const y = this.y;
        this.x = Math.cos(angle) * x - Math.sin(angle) * y;
        this.y = Math.sin(angle) * x + Math.cos(angle) * y;
        this.translate(cx, cy);
        return this;
    }

    /**
     * Add a vector to this.
     * @param vector
     */
    add(vector: Vector2D): Vector2D {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * Multiplies a factor to this.
     * @param factor
     */
    multiplyFactor(factor: number): Vector2D {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    /**
     * Returns the Euklidean norm of this vector.
     */
    getNorm(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * Returns a normalized unit vector copy of this.
     */
    getDirection(): Vector2D {
        let clone = this.clone();
        if (clone.getNorm() === 0) {
            return new Vector2D(0, 0);
        }
        return clone.multiplyFactor(1 / clone.getNorm());
    }

    /**
     * Returns a copy of this.
     */
    clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    /**
     * Returns a printable (rounded) string representation of this point object.
     */
    toString(): string {
        return `Vector2D (${this.x.toFixed(3)}, ${this.x.toFixed(3)})`;
    }
}





//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////    S P A C E   -   O B J E C T S   ///////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////





class SpaceObject {
    position: Vector2D;
    orientation: number;
    velocity: Vector2D;
    energy: number;
    size: number;
    strokeStyle: string;
    fillStyle: string;

    points: Array<Vector2D>;

    constructor(position, orientation, velocity, size, energy) {
        this.position = position;
        this.orientation = orientation;
        this.velocity = velocity;
        this.size = size;
        this.energy = energy;

        this.fillStyle = "rgba(255, 255, 255, 0.2)";
        this.strokeStyle = "#fff";

        this.points = [];
    }


    animate(): void {
        this.position.translateV(this.velocity);
    }

    // TODO: objects should reenter on the opposite site if disappearing
    translate(vector: Vector2D): void {
        this.position.translateV(vector);
        this.points.forEach(p => p.translateV(vector));
    }

    rotate(angle: number) {
        this.orientation += angle;
        this.points.forEach(p => p.rotate(this.position.x, this.position.y, angle));
    }

    isHit(object: SpaceObject): boolean {
        return false;
    }

    hitBy(object: SpaceObject): void {
        let impactEnergy = object.energy;
        object.energy -= this.energy;
        this.energy -= impactEnergy;
        this.reactToHit(object);
    }

    reactToHit(object: SpaceObject): void {
        // TODO: asteroids should split if low energy
        // TODO: asteroids should be pushed away by hits
    }

    isDestroyed(): boolean {
        return this.energy < 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.size,
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.restore();
    }

    toString(): string {
        return `SpaceObject (\nposition: ${this.position.toString()},\nvelocity: ${this.velocity.toString()},\norientation: ${this.orientation.toFixed(2)},\nenergy: ${this.energy}\n`;
    }
}













class Spaceship extends SpaceObject {
    shots: Array<Shot>;

    constructor(position, orientation, velocity, size, energy) {
        super(position, orientation, velocity, size, energy);

        this.shots = [];

        // create shape
        let { x, y } = this.position;
        this.points = [
            new Vector2D(x, y),
            new Vector2D(x - 2 * size, y - size / 2),
            new Vector2D(x - 2 * size, y + size / 2),
        ];

        this.fillStyle = "#0ff";
    }

    shoot(): void {
        // TODO: velocity mixes ship velocity and ship orientation
        let velocity = new Vector2D(10, 10);
        let shot = new Shot(this.position, this.orientation, velocity, 3, 3);
    }

    increaseVelocity(): void {
        let direction = Vector2D.getUnitVectorFromOrientation(this.orientation);
        let delta = direction.multiplyFactor(2);
        this.velocity.add(delta);
    }

    decreaseVelocity(): void {
        let direction = Vector2D.getUnitVectorFromOrientation(this.orientation);
        let delta = direction.multiplyFactor(-2);
        this.velocity.add(delta);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        drawPolygon(ctx, this.points, this.strokeStyle, this.fillStyle);
    }
}















class Shot extends SpaceObject {
    constructor(position, orientation, velocity, size, energy) {
        super(position, orientation, velocity, size, energy);
        this.fillStyle = "#0f0";
    }
}












class Asteroid extends SpaceObject {
    constructor(position, orientation, velocity, size, energy) {
        super(position, orientation, velocity, size, energy);
    }

    /**
     * Split into 2 to 5 smaller asteroids that share the energy.
     */
    split(): Array<Asteroid> {
        return [];
    }
}