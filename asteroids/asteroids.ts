class Asteroids {
    gameSize: Vector2D;
    score: number;
    ship: any;
    asteroids: Array<Asteroid>;
    drops: Array<Drop>;
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
        this.intervalTime = 20;
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
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;

        // create ship
        let size = Math.min(this.gameSize.x, this.gameSize.y) / 20;
        let position = new Vector2D(this.gameSize.x / 2, this.gameSize.y / 2);
        let orientation = 0;
        let velocity = new Vector2D(0, 0);
        let power = 10;
        this.ship = new Spaceship(
            this.gameSize,
            position,
            orientation,
            velocity,
            size,
            100,
            power
        );

        // create asteroids
        this.asteroids = [];
        let number = 3;
        for (let i = 0; i < number; i++) {
            let aPos = Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
            let aVelocity = Vector2D.randomVector(-1, 1, -1, 1);
            let aSize = random(50, 100);
            let aEnergy = aSize ** 2 / 5;
            let a = new Asteroid(this.gameSize, aPos, 0, aVelocity, aSize, aEnergy);
            this.asteroids.push(a);
        }

        this.drops = [];

        // draw UI
        this.updateUI(false);
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
        this.fadeUI();
        // show pause message
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
    endGame(won: boolean): void {
        this.gameOver = true;
        clearInterval(this.interval);
        this.fadeUI();
        this.showMessages(
            won ? "~~~ you won! ~~~" : "~~~ game over! ~~~",
            "",
            `total time survived: ${~~(this.timeElapsed / 1000)} seconds`,
            `total score: ${~~(this.score)}`,
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

        // check if player has won
        if (as.length === 0) {
            _this.endGame(true);
            return;
        }

        // update elapsed time
        _this.timeElapsed += _this.intervalTime;
        _this.score += _this.intervalTime / 3000;

        // update object positions
        as.forEach(o => o.animate());
        _this.ship.animate();
        _this.ship.shots.forEach(s => s.animate());
        _this.drops.forEach(d => d.animate());

        // test for crash
        // TODO: use quadtree
        let crashed = false;
        for (let i = 0; i < as.length; i++) {
            if (_this.ship.isHit(as[i])) {
                crashed = true;

                // reduce energy of ship
                _this.ship.hitBy(as[i]);

                // game over?
                if (_this.ship.isDestroyed()) {
                    _this.ship.lifes--;
                    if (_this.ship.lifes <= 0) {
                        _this.endGame(false);
                        return;
                    } else {
                        // revive
                        _this.ship.energy = 1000;
                    }
                }
            }
        }

        // test shots and asteroids for collisions
        // TODO: use quadtree
        let deltaScore = 0;
        for (let i = 0; i < as.length; i++) {
            let asteroid = as[i];
            for (let j = 0; j < _this.ship.shots.length; j++) {
                let shot = _this.ship.shots[j];

                if (asteroid.isHit(shot)) {
                    // reduce energy of asteroid
                    let [drop, children] = asteroid.hitBy(shot);

                    if (drop !== null) {
                        _this.drops.push(drop);
                    }
                    if (children !== null) {
                        _this.asteroids = _this.asteroids.concat(children);
                    }

                    // destroyed?
                    if (asteroid.isDestroyed()) {
                        // increase player score
                        deltaScore += asteroid.originalEnergy;

                    }
                }
            }
        }
        _this.score += deltaScore;

        // test asteroids for collision with each other
        // TODO: use quadtree
        for (let i = 0; i < as.length; i++) {
            let asteroid1 = as[i];
            for (var j = 0; j < as.length; j++) {
                // only do each pair once and do not collide an asteroid with itself
                if (i <= j) {
                    continue;
                }

                let asteroid2 = as[j];

                if (asteroid1.isHit(asteroid2)) {
                    asteroid1.hitBy(asteroid2);
                    asteroid2.hitBy(asteroid1);
                }
            }
        }

        // test ship and drops for collisions
        for (let i = 0; i < _this.drops.length; i++) {
            if (_this.ship.isHit(_this.drops[i])) {
                _this.drops[i].collect(_this.ship, _this);
            }
        }

        // decay objects
        _this.ship.decay();
        _this.ship.shots.forEach(s => s.decay());
        _this.drops.forEach(d => d.decay());

        // remove destroyed objects
        _this.asteroids = _this.asteroids.filter(a => !a.isDestroyed());
        _this.ship.shots = _this.ship.shots.filter(s => !s.isDestroyed());
        _this.drops = _this.drops.filter(d => !d.isDestroyed());

        // draw game
        _this.updateUI();
        if (crashed) {
            // taint screen red
            _this.fadeUI("rgba(255, 0, 0, 0.2)");
        }
    }

    // #region UI

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
     * @param drawShip ship is only drawn if this is not set to false
     */
    updateUI(drawShip: boolean = true): void {
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // asteroids
        this.asteroids.forEach(o => o.draw(this.ctx));
        // ship
        if (drawShip) {
            this.ship.draw(this.ctx);
        }
        // drops
        this.drops.forEach(d => d.draw(this.ctx));
        // shots
        this.ship.shots.forEach(s => s.draw(this.ctx));
        // ship energy, time
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(
            `lifes: ${
            "♥".repeat(~~this.ship.lifes)
            }  ~  energy: ${
            ~~this.ship.energy
            }  ~  power: ${
            ~~this.ship.power
            }  ~  shield: ${
            ~~this.ship.shield
            }  ~  score: ${
            ~~this.score
            }  ~  time: ${
            ~~(this.timeElapsed / 1000)}`,
            this.canvas.width / 2,
            25
        );
    }

    /**
     * Fades UI to a darker shade or specified color.
     */
    fadeUI(color: string = "rgba(0, 0, 0, 0.5)"): void {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.gameSize.x, this.gameSize.y);
        this.ctx.restore();
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
        return vector1.clone().subtr(vector2.clone()).getNorm();
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
     * Subtract a vector to this.
     * @param vector
     */
    subtr(vector: Vector2D): Vector2D {
        this.x -= vector.x;
        this.y -= vector.y;
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

// #region space objects


/**
 * General space object class from which all game objects in this game are derived
 */
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
        return this.energy <= 1;
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



/**
 * Space ship class
 */
class Spaceship extends SpaceObject {
    shots: Array<Shot>;
    power: number;
    shield: number;
    lifes: number;
    static decayRate: number = 0.1; // shield decay rate
    static acceleration: number = 1;
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
        this.lifes = 3;
        this.shield = 0;

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
        if (object instanceof Asteroid) {
            // damage should depend on magnitude of velocity difference
            let magnitude = Vector2D.getDistance(this.velocity, object.velocity);
            let damage = object.energy * (magnitude / 50);
            if (this.shield >= damage) {
                // shield blocks damage
                this.shield -= damage;
                damage = 0;
            } else {
                // shield blocks some damage
                damage -= this.shield;
                this.shield = 0;
            }
            this.energy -= damage;
            // give some damage to asteroid too
            let ownDamage = 0.01 * (this.shield + this.energy / 100) / object.energy;
            object.energy -= ownDamage;
        }
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
     * Decrease shield overtime
     */
    decay(): void {
        this.shield = Math.max(0, this.shield - Spaceship.decayRate);
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
        if (this.shield > 0) {
            drawCircle(ctx, this.position, this.size + 2, `rgba(0, 255, 255, ${this.shield / 100})`, "rgba(0, 0, 0, 0)");
        }
        // draw ship
        drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
    }
}



/**
 * Shot class.
 */
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
     * Decrease energy overtime
     */
    decay(): void {
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



/**
 * Asteroid class.
 */
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

        // circle by using random angles and radii
        this.points = [];
        let number = ~~random(5, 20);
        let step = 2 * Math.PI / number;
        let angle = 0;
        for (let i = 0; i <= number; i++) {
            let radius = random(this.size * 0.3, this.size * 1.3);
            let x = this.position.x + this.size * Math.cos(angle);
            let y = this.position.y + this.size * Math.sin(angle);
            this.points.push(new Vector2D(x, y));
            angle += random(step * 0.5, step * 2);
            if (angle > 2 * Math.PI) {
                break;
            }
        }
    }

    /**
     * React to a hit by another object.
     * @param object
     * @return drops and child asteroids if there are any
     */
    hitBy(object: SpaceObject): [Drop, Array<Asteroid>] {
        if (object instanceof Shot) {
            // asteroid was shot
            this.energy -= object.energy;
            object.energy = 0;

            if (this.isDestroyed()) {
                // destroyed
                return [this.createDrops(), null];
            } else if (this.energy > 100 && this.energy <= 0.5 * this.originalEnergy) {
                // split
                return [this.createDrops(), this.split()];
            } else {
                return [null, null];
            }
        } else if (object instanceof Asteroid) {
            // two asteroids hit each other
            // only push this away, the other will react itself
            let direction = this.position.clone()
                .subtr(object.position.clone())
                .getDirection();
            let speed = this.velocity.getNorm();
            this.velocity = this.velocity.add(direction)
                .getDirection()
                .multiplyFactor(speed);
        }
    }

    /**
     * Splits into 2 to 5 smaller asteroids that share the energy.
     */
    split(): Array<Asteroid> {
        // split
        let numberChildren = ~~random(2, 6);
        let children = [];
        for (let i = 0; i < numberChildren; i++) {
            let energy, energyFraction, size;
            if (i !== numberChildren - 1 && this.energy > 50) {
                // children share energy
                energyFraction = random(0, 0.5);
                energy = this.energy * energyFraction;
                size = this.size * energyFraction;
                this.energy -= energy;
                this.size -= size;
            } else {
                // last child takes the rest
                energy = this.energy;
                size = this.size;
                this.energy = 0;
                this.size = 0;
            }

            let child = new Asteroid(
                this.gameSize,
                this.position.clone().add(Vector2D.randomVector(-1, 1, -1, 1)),
                this.orientation,
                this.velocity.clone().add(Vector2D.randomVector(-1, 1, -1, 1)),
                size,
                energy
            );
            children.push(child);
        }
        // return drops and children
        return children;
    }

    /**
     * Creates 1 to 3 drops.
     */
    createDrops(): Drop {
        // only create drop with some probability
        if (random(0, 1) < 0.25) {
            return null;
        }
        return new Drop(
            this.gameSize,
            this.position.clone().add(Vector2D.randomVector(-2, 2, -2, 2)),
            this.orientation,
            this.velocity.clone().add(Vector2D.randomVector(-2, 2, -2, 2)),
            10,
            100
        );
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
        // drawCircle(ctx, this.position, this.size, Asteroid.strokeStyle, Asteroid.fillStyle);
        drawPolygon(ctx, this.points, Asteroid.strokeStyle, Asteroid.fillStyle);
        ctx.fillStyle = "#fff";
        ctx.fillText((~~this.energy).toString(), this.position.x, this.position.y);
    }
}

/**
 * Drops are boni for the ship to collect.
 * They may have adverse effects.
 */
class Drop extends SpaceObject {
    static decayRate: number = 0.001;
    effectType: string;
    effect: number;
    color: string;

    constructor(
        gameSize: Vector2D,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(gameSize, position, orientation, velocity, size, energy);

        let effectTypes = ["energy", "power", "shield", "life", "score"];
        let r = ~~random(0, effectTypes.length);
        this.effectType = effectTypes[r];
        switch (this.effectType) {
            case "energy":
                this.effect = 10 * ~~random(-6, 11);
                this.color = "0, 0, 255";
                break;

            case "power":
                this.effect = ~~random(-6, 11);
                this.color = "0, 255, 0";
                break;

            case "shield":
                this.effect = ~~random(500, 1000);
                this.color = "255, 255, 0";
                break;

            case "life":
                this.effect = 1;
                this.color = "255, 0, 0";
                break;

            case "score":
                this.effect = ~~random(-1000, 10000);
                this.color = "255, 215, 0";
                break;

            default:
                break;
        }

        if (!this.effectType) {
            console.log(r);
        }
    }

    /**
     * Decrease energy overtime
     */
    decay(): void {
        this.energy -= Drop.decayRate * this.originalEnergy;
    }

    /**
     * Allow the ship to collect this drop
     * @param collector
     */
    collect(collector: Spaceship, game: Asteroids): void {
        // increase score for collecting
        game.score += 250;
        switch (this.effectType) {
            case "energy":
                collector.energy += this.effect;
                break;

            case "power":
                collector.power += this.effect;
                break;

            case "shield":
                collector.shield += this.effect;
                break;

            case "life":
                collector.lifes += this.effect;
                break;

            case "score":
                game.score += this.effect;
                break;

            default:
                break;
        }
        // destroy drop
        this.energy = 0;
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
        ctx.fillStyle = `rgba(${this.color}, ${this.energy / this.originalEnergy})`;
        ctx.fillText(`${this.effectType} ${this.effect}`, this.position.x, this.position.y + 10);
    }
}


// #endregion space objects