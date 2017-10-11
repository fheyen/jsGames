class Asteroids {
    gameSize: Vector2D;
    score: number;
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
        this.gameSize = new Vector2D(
            window.innerWidth,
            window.innerHeight
        );
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
     * Resets the game to the initial conditions.
     */
    reset() {
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;

        // create ship
        let size = Math.min(this.gameSize.x, this.gameSize.y) / 12;
        let position = new Vector2D(this.gameSize.x / 2, this.gameSize.y / 2);
        let orientation = 0;
        let velocity = new Vector2D(0, 0);
        this.ship = new Spaceship(
            this.gameSize,
            position,
            orientation,
            velocity,
            size,
            1000,
            100
        );

        // create asteroids
        this.asteroids = [];
        let number = 3;
        for (let i = 0; i < number; i++) {
            let aPos = Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
            let aVelocity = Vector2D.randomVector(-2, 2, -2, 2);
            let aSize = random(50, 100);
            let aEnergy = aSize ** 2;
            let a = new Asteroid(this.gameSize, aPos, 0, aVelocity, aSize, aEnergy);
            this.asteroids.push(a);
        }

        // draw UI
        this.updateUI();
        this.showMessages(
            "Asteroids",
            "~~~ new game ~~~",
            "",
            "press <space> to start and fire",
            "press <p> to pause",
            "press <⯅> or <⯆> to move the ship",
            "press <⯇> or <⯈> to rotate the ship",
            "press <F5> to reset"
        );
    }

    // #region game events

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
            "Asteroids",
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
        this.showMessages(
            "~~~ game over! ~~~",
            "",
            `total time survived: ${~~(this.timeElapsed / 1000)}`,
            "",
            "press <F5> to restart"
        );
    }

    // #endregion game events

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
                    this.ship.shoot();
                } else {
                    this.resumeGame();
                }
                break;

            case "p":
                // p: pause or resume
                if (this.gameRunning) {
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

        // animate shots
        _this.ship.shots.forEach(s => s.animate());
        // remove ceased shots
        _this.ship.shots = _this.ship.shots.filter(s => !s.isDestroyed());

        // test shots and asteroids for collisions
        for (let i = 0; i < as.length; i++) {
            let asteroid = as[i];
            for (var j = 0; j < _this.ship.shots.length; j++) {
                let shot = _this.ship.shots[j];

                if (asteroid.isHit(shot)) {
                    // reduce energy of asteroid
                    asteroid.hitBy(shot);

                    // destroyed?
                    if (asteroid.isDestroyed()) {
                        // remove this asteroid
                        _this.asteroids.filter(a => a !== asteroid);
                    }
                }
            }
        }
        let destroyedObject: SpaceObject = null;

        // TODO: score
        // _this.score += destroyedObject.originalEnergy;

        // draw game
        _this.updateUI();
    }


    // #region UI

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
        // ship energy, time
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(
            `energy: ${~~this.ship.energy} power: ${~~this.ship.power} time ${~~(this.timeElapsed / 1000)}`,
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

    // #endregion UI
}



//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////         H E L P E R S           //////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


// #region helper functions

/**
 * Returns a pseudorandom number in [min, max)
 */
function random(min: number, max: number): number {
    return min + (Math.random() * (max - min));
}

/**
 * Draws a polygon onto ctx.
 * @param ctx canvas context
 * @param points points
 * @param stroke stroke style
 * @param fill fill style
 */
function drawPolygon(ctx: CanvasRenderingContext2D, points: Array<Vector2D>, stroke: string, fill: string): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    ctx.restore();
}

/**
 * Draws a cirlce onto ctx.
 * @param ctx canvas context
 * @param center center point
 * @param radius radius
 * @param stroke stroke style
 * @param fill fill style
 * @param startAngle start angle
 * @param endAngle end angle
 */
function drawCircle(ctx: CanvasRenderingContext2D, center: Vector2D, radius: number, stroke: string, fill: string, startAngle: number = 0, endAngle: number = 2 * Math.PI): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    ctx.restore();
}

// #endregion helper functions







// #region Vector2D



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
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }


    // #region statics

    /**
     * Creates and returns a vector with random values.
     * @param minX
     * @param maxX
     * @param minY
     * @param maxY
     */
    static randomVector(minX: number, maxX: number, minY: number, maxY: number): Vector2D {
        let x = random(minX, maxX);
        let y = random(minY, maxY);
        return new Vector2D(x, y);
    }

    /**
     * Returns a new unit vector poiting in the direction of orientation
     * @param orientation
     */
    static getUnitVectorFromOrientation(orientation: number): Vector2D {
        return new Vector2D(Math.cos(orientation), Math.sin(orientation));
    }

    /**
     * Returns the distance if two points.
     * @param vector1 point 1
     * @param vector2 point 2
     */
    static getDistance(vector1: Vector2D, vector2: Vector2D): number {
        return vector1.clone().add(vector2.clone().multiplyFactor(-1)).getNorm();
    }

    // endregion statics

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


// #endregion Vector2D






//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////    S P A C E   -   O B J E C T S   ///////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// #region space objects



class SpaceObject {
    position: Vector2D;
    orientation: number;
    velocity: Vector2D;
    energy: number;
    originalEnergy: number;
    size: number;
    static strokeStyle: string = "#fff";
    static fillStyle: string = "rgba(255, 255, 255, 0.2)";
    gameSize: Vector2D;
    points: Array<Vector2D>;

    constructor(
        gameSize: Vector2D,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        this.gameSize = gameSize;
        this.position = position;
        this.orientation = orientation;
        this.velocity = velocity;
        this.size = size;
        this.energy = energy;

        this.originalEnergy = energy;
        this.points = [];
    }

    /**
     * Returns a unit vector poiting in the direction of this.orientation
     */
    getOrientationVector(): Vector2D {
        return Vector2D.getUnitVectorFromOrientation(this.orientation);
    }

    /**
     * Moves this object by its velocity.
     */
    animate(): void {
        this.translate(this.velocity);
    }

    /**
     * Tranlates this object by a vector, keeping it inside the universe.
     * @param vector translation vector
     */
    translate(vector: Vector2D): void {
        this.position.translateV(vector);
        this.points.forEach(p => p.translateV(vector));

        // objects should reenter on the opposite site if disappearing
        let margin = this.size;
        if (this.position.x < -margin) {
            this.position.x += this.gameSize.x + 2 * margin;
            this.points = this.points.map(p => {
                p.x += this.gameSize.x + 2 * margin;
                return p;
            });
        } else if (this.position.x > this.gameSize.x + margin) {
            this.position.x -= this.gameSize.x + 2 * margin;
            this.points = this.points.map(p => {
                p.x -= this.gameSize.x + 2 * margin;
                return p;
            });
        }
        if (this.position.y < -margin) {
            this.position.y += this.gameSize.y + 2 * margin;
            this.points = this.points.map(p => {
                p.y += this.gameSize.y + 2 * margin;
                return p;
            });
        } else if (this.position.y > this.gameSize.y + margin) {
            this.position.y -= this.gameSize.y + 2 * margin;
            this.points = this.points.map(p => {
                p.y -= this.gameSize.y + 2 * margin;
                return p;
            });
        }
    }

    /**
     * Rotates this object by an angle.
     * @param angle rotation angle
     */
    rotate(angle: number): void {
        this.orientation += angle;
        this.points.forEach(p => p.rotate(this.position.x, this.position.y, angle));
    }

    /**
     * Hit test with this and another object.
     * @param object
     */
    isHit(object: SpaceObject): boolean {
        // test for thit with postion and points
        if (Vector2D.getDistance(this.position, object.position) < this.size + object.size) {
            // TODO: exact hit test
            return true;
        }
        return false;
    }

    /**
     * React to a hit by another object.
     * @param object
     */
    hitBy(object: SpaceObject): void {

    }

    /**
     * Returns true if energy is lower than 0.
     */
    isDestroyed(): boolean {
        return this.energy < 0;
    }

    /**
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    draw(ctx: CanvasRenderingContext2D): void {
        drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
    }

    /**
     * Returns a string representation of this object.
     */
    toString(): string {
        return `SpaceObject (\nposition: ${this.position.toString()},\nvelocity: ${this.velocity.toString()},\norientation: ${this.orientation.toFixed(2)},\nenergy: ${this.energy}\n`;
    }
}













class Spaceship extends SpaceObject {
    shots: Array<Shot>;
    power: number;
    static acceleration: number = 2;
    static strokeStyle: string = "#0ff";
    static fillStyle: string = "#0ff";

    constructor(
        gameSize: Vector2D,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number,
        power: number
    ) {
        super(gameSize, position, orientation, velocity, size, energy);

        this.power = power;
        this.shots = [];

        // create shape
        let { x, y } = this.position;
        this.points = [
            new Vector2D(x + size, y),
            new Vector2D(x - 0.75 * size, y - 0.6 * size),
            new Vector2D(x - 0.2 * size, y),
            new Vector2D(x - 0.75 * size, y + 0.6 * size),
        ];
    }

    /**
     * React to a hit by another object.
     * @param object
     */
    hitBy(object: SpaceObject): void {
        // damage should depend on magnitude of velocity difference
        let magnitude = Vector2D.getDistance(this.velocity, object.velocity);
        this.energy -= object.energy * (magnitude / 100);
    }

    /**
     * Shoots a new Shot object.
     */
    shoot(): void {
        // velocity mixes ship velocity and ship orientation
        let velocity = this.getOrientationVector()
            .multiplyFactor(2)
            .add(this.velocity.clone().getDirection())
            .multiplyFactor(5);
        let shot = new Shot(
            this.gameSize,
            this.position.clone(),
            this.orientation,
            velocity,
            3,
            this.power);
        this.shots.push(shot);
    }

    /**
     * Shoots a laser.
     */
    laser(): void {
        // TODO: immediate shot in straight line
        let direction = this.getOrientationVector();
        let polygon = [
            this.position,
            direction.multiplyFactor(2000).add(this.position)
        ];
        // drawPolygon(ctx, this.points, this.strokeStyle, this.fillStyle);
    }

    /**
     * Accelerates the ship forward.
     */
    increaseVelocity(): void {
        let direction = this.getOrientationVector();
        let delta = direction.multiplyFactor(Spaceship.acceleration);
        this.velocity.add(delta);
    }

    /**
     * Accelerates the ship backward.
     */
    decreaseVelocity(): void {
        let direction = this.getOrientationVector();
        let delta = direction.multiplyFactor(-Spaceship.acceleration);
        this.velocity.add(delta);
    }

    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    draw(ctx: CanvasRenderingContext2D): void {
        // draw shield
        drawCircle(ctx, this.position, this.size + 2, "#0f0", "#000");
        // draw ship
        drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
    }
}















class Shot extends SpaceObject {
    static decayRate: number = 0.01;
    static strokeStyle: string = "#0f0";
    static fillStyle: string = "#0f0";

    constructor(
        gameSize: Vector2D,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(gameSize, position, orientation, velocity, size, energy);
    }

    /**
     * @overwrite
     * Moves this object by its velocity.
     */
    animate(): void {
        this.translate(this.velocity);
        this.energy -= Shot.decayRate * this.originalEnergy;
    }

    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    draw(ctx: CanvasRenderingContext2D): void {
        if (this.energy < 0) {
            return;
        }
        let color = `rgba(0, 255, 0, ${this.energy / this.originalEnergy})`;
        drawCircle(ctx, this.position, this.size, color, color);
    }
}












class Asteroid extends SpaceObject {
    static strokeStyle: string = "#fff";
    static fillStyle: string = "rgba(255, 255, 255, 0.2)";

    constructor(
        gameSize: Vector2D,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(gameSize, position, orientation, velocity, size, energy);
    }

    /**
     * TODO: Split into 2 to 5 smaller asteroids that share the energy.
     */
    split(): Array<Asteroid> {
        // TODO: create drops
        return [];
    }

    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    draw(ctx: CanvasRenderingContext2D): void {
        if (this.energy < 0) {
            return;
        }
        drawCircle(ctx, this.position, this.size, Asteroid.strokeStyle, Asteroid.fillStyle);
        ctx.fillStyle = "#fff";
        ctx.fillText(this.energy.toFixed(2).toString(), this.position.x, this.position.y);
    }
}


// TODO: should decay after some time
// TODO: only do something when colliding with ship
class Drop extends SpaceObject {
    effectType: string;
    effect: number;

    constructor(
        gameSize: Vector2D,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(gameSize, position, orientation, velocity, size, energy);

        let r = ~~random(0, 5);
        let effectTypes = ["energy", "power", "shield", "life"];
        this.effectType = effectTypes[r];
        let effect = random(10, 100);
    }
}


// #endregion space objects