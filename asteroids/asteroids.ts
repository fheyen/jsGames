import * as lib from "../lib/lib.js";
import Vector2D from "../lib/vector2d.js";

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
        // game size is set to window size
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
    reset(): void {
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
            let aSize = lib.random(50, 100);
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
        _this.ship.shots.forEach((s: Shot) => s.animate());
        _this.drops.forEach((d: Drop) => d.animate());

        // test for crash
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
        _this.ship.shots.forEach((s: Shot) => s.decay());
        _this.drops.forEach(d => d.decay());

        // remove destroyed objects
        _this.asteroids = _this.asteroids.filter(a => !a.isDestroyed());
        _this.ship.shots = _this.ship.shots.filter((s: Shot) => !s.isDestroyed());
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
        this.ship.shots.forEach((s: Shot) => s.draw(this.ctx));
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
        console.log("hit by");
        console.log(object);
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
        lib.drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
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
            lib.drawCircle(ctx, this.position, this.size + 2, `rgba(0, 255, 255, ${this.shield / 100})`, "rgba(0, 0, 0, 0)");
        }
        // draw ship
        lib.drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
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
        lib.drawCircle(ctx, this.position, this.size, color, color);
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

        // create polygon approximating the
        // circle by using random angles and radii
        this.points = [];
        let number = ~~lib.random(5, 20);
        let step = 2 * Math.PI / number;
        let angle = 0;
        for (let i = 0; i <= number; i++) {
            let radius = lib.random(this.size * 0.8, this.size * 1.1);
            let x = this.position.x + radius * Math.cos(angle);
            let y = this.position.y + radius * Math.sin(angle);
            this.points.push(new Vector2D(x, y));
            angle += lib.random(step * 0.5, step * 2);
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
        let numberChildren = ~~lib.random(2, 6);
        let children = [];
        for (let i = 0; i < numberChildren; i++) {
            let energy, energyFraction, size;
            if (i !== numberChildren - 1 && this.energy > 50) {
                // children share energy
                energyFraction = lib.random(0, 0.5);
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
        if (lib.random(0, 1) < 0.25) {
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
        lib.drawPolygon(ctx, this.points, Asteroid.strokeStyle, Asteroid.fillStyle);
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
        let r = ~~lib.random(0, effectTypes.length);
        this.effectType = effectTypes[r];
        switch (this.effectType) {
            case "energy":
                this.effect = 10 * ~~lib.random(-6, 11);
                this.color = "0, 0, 255";
                break;

            case "power":
                this.effect = ~~lib.random(-6, 11);
                this.color = "0, 255, 0";
                break;

            case "shield":
                this.effect = ~~lib.random(500, 1000);
                this.color = "255, 255, 0";
                break;

            case "life":
                this.effect = 1;
                this.color = "255, 0, 0";
                break;

            case "score":
                this.effect = ~~lib.random(-1000, 10000);
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



// #region main

// global game variable
var game: Asteroids;

/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownAsteroids(event: KeyboardEvent): void {
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
            if (game) {
                game.keyDown(event);
            }
    }
}

/**
 * Starts a new game.
 */
function initAsteroids(): void {
    if (game) {
        game.remove();
    }
    game = new Asteroids();
}

// #endregion main