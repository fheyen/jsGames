/**
 * Main class of this game.
 */
class Asteroids {
    public gameSize: Vector2D;
    public score: number;
    public ship: Spaceship;
    public asteroids: Array<Asteroid>;
    public drops: Array<Drop>;
    public stars: Array<Star>;
    public timeElapsed: number;
    public canvas: HTMLCanvasElement;
    public backgroundCanvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public fontSize: number;
    public gameStarted: boolean;
    public gameRunning: boolean;
    public gameOver: boolean;
    public intervalTime: number;
    public interval: number;
    public DEBUG: boolean;

    constructor() {
        // set DEBUG flag
        this.DEBUG = false;
        // game size is set to window size
        this.gameSize = new Vector2D(
            window.innerWidth,
            window.innerHeight
        );
        // inverse framerate
        this.intervalTime = 20;
        // canvas
        this.backgroundCanvas = this.createCanvas();
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.fontSize = 20;
        this.ctx.font = `${this.fontSize}px Consolas`;
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
    public remove(): void {
        this.canvas.remove();
    }

    /**
     * Called if a ship has clicked on a button.
     * @param event keydown event
     */
    public keyDown(event: KeyboardEvent): void {
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
                    const angle = 10 * Math.PI / 180;
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
     * Resets the game to the initial conditions.
     */
    private reset(): void {
        this.timeElapsed = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;

        // create ship
        const size = Math.min(this.gameSize.x, this.gameSize.y) / 20;
        const position = new Vector2D(this.gameSize.x / 2, this.gameSize.y / 2);
        const orientation = 0;
        const velocity = new Vector2D(0, 0);
        const power = 20;
        this.ship = new Spaceship(
            this,
            position,
            orientation,
            velocity,
            size,
            100,
            power
        );

        // create asteroids
        this.asteroids = [];
        const num = 5;
        const maxTries = 100;
        let tryNum = 0;
        for (let i = 0; i < num; i++) {
            tryNum = 0;
            // choose free space
            while (tryNum++ < maxTries) {
                const aPos = Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
                const aVelocity = Vector2D.randomVector(-1, 1, -1, 1);
                const aSize = lib.random(50, 100);
                const aEnergy = aSize ** 2 / 5;
                const a = new Asteroid(this, aPos, 0, aVelocity, aSize, aEnergy);
                let hit = false;
                for (let j = 0; j < this.asteroids.length; j++) {
                    if (this.asteroids[j].isHit(a)) {
                        hit = true;
                        break;
                    }
                }
                if (!hit) {
                    this.asteroids.push(a);
                    break;
                }
            }
        }

        // reset drops
        this.drops = [];

        // create stars
        this.stars = [];
        for (let i = 0; i < 400; i++) {
            this.stars.push(
                new Star(
                    this,
                    Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y),
                    0,
                    new Vector2D(0, 0),
                    lib.random(0.01, 1),
                    0
                )
            );
        }
        // draw stars
        const ctx = this.backgroundCanvas.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.gameSize.x, this.gameSize.y);
        this.stars.forEach(o => o.draw(ctx));

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
    private startGame(): void {
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
    private pauseGame(): void {
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
    private resumeGame(): void {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    }

    /**
     * Ends the game.
     */
    private endGame(won: boolean): void {
        this.gameOver = true;
        clearInterval(this.interval);
        this.fadeUI();
        this.showMessages(
            won ? "~~~ you won! ~~~" : "~~~ game over! ~~~",
            "",
            `total time survived: ${Math.floor((this.timeElapsed / 1000))} seconds`,
            `total score: ${Math.floor((this.score))}`,
            "",
            "press <F5> to restart"
        );
    }

    // #endregion game events

    /**
     * @param a this object
     */
    private animate(a: Asteroids): void {
        // abbreviations
        const as = a.asteroids;

        // check if player has won
        if (as.length === 0) {
            a.endGame(true);
            return;
        }

        // update elapsed time
        a.timeElapsed += a.intervalTime;
        a.score += a.intervalTime / 3000;

        // update object positions
        as.forEach(o => o.animate());
        a.ship.animate();
        a.ship.shots.forEach((s: Shot) => s.animate());
        a.drops.forEach((d: Drop) => d.animate());

        // test for crash
        let crashed = false;
        for (let i = 0; i < as.length; i++) {
            if (a.ship.isHit(as[i])) {
                crashed = true;

                // push asteroid away
                as[i].hitBy(a.ship);

                // reduce energy of ship
                a.ship.hitBy(as[i]);

                // game over?
                if (a.ship.isDestroyed()) {
                    a.ship.lifes--;
                    if (a.ship.lifes <= 0) {
                        a.endGame(false);
                        return;
                    } else {
                        // revive
                        a.ship.energy = 100;
                    }
                }
            }
        }

        // test shots and asteroids for collisions
        let deltaScore = 0;
        for (let i = 0; i < as.length; i++) {
            const asteroid = as[i];
            for (let j = 0; j < a.ship.shots.length; j++) {
                const shot = a.ship.shots[j];

                if (asteroid.isHit(shot)) {
                    // reduce energy of asteroid
                    const [drop, children] = asteroid.hitBy(shot);

                    if (drop !== null) {
                        a.drops.push(drop);
                    }
                    if (children !== null) {
                        a.asteroids = a.asteroids.concat(children);
                    }

                    // destroyed?
                    if (asteroid.isDestroyed()) {
                        // increase player score
                        deltaScore += asteroid.originalEnergy;

                    }
                }
            }
        }
        a.score += deltaScore;

        // test asteroids for collision with each other
        for (let i = 0; i < as.length; i++) {
            const asteroid1 = as[i];
            for (let j = 0; j < as.length; j++) {
                // only do each pair once and do not collide an asteroid with itself
                if (i <= j) {
                    continue;
                }
                const asteroid2 = as[j];
                if (asteroid1.isHit(asteroid2)) {
                    asteroid1.hitBy(asteroid2);
                    asteroid2.hitBy(asteroid1);
                }
            }
        }

        // test ship and drops for collisions
        for (let i = 0; i < a.drops.length; i++) {
            if (a.ship.isHit(a.drops[i])) {
                a.drops[i].collect(a.ship, a);
            }
        }

        // decay objects
        a.ship.decay();
        a.ship.shots.forEach((s: Shot) => s.decay());
        a.drops.forEach(d => d.decay());

        // remove destroyed objects
        a.asteroids = a.asteroids.filter(ast => !ast.isDestroyed());
        a.ship.shots = a.ship.shots.filter((s: Shot) => !s.isDestroyed());
        a.drops = a.drops.filter(d => !d.isDestroyed());

        // draw game
        a.updateUI();
        if (crashed) {
            // taint screen red
            a.fadeUI("rgba(255, 0, 0, 0.2)");
        }
    }

    // #region UI

    /**
     * Creates and returns a canvas object.
     */
    private createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = this.gameSize.x;
        canvas.height = this.gameSize.y;
        canvas.style.position = "fixed";
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    }

    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    private showMessages(...messages: Array<string>): void {
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
     * Draws a space object on the canvas.
     * If this.DEBUG is set to true, the drawDebug function will be used.
     */
    private drawObject(object: SpaceObject): void {
        this.DEBUG ? object.drawDebug(this.ctx) : object.draw(this.ctx);
    }

    /**
     * Draws the UI.
     * @param drawShip ship is only drawn if this is not set to false
     */
    private updateUI(drawShip: boolean = true): void {
        this.ctx.clearRect(0, 0, this.gameSize.x, this.gameSize.y);
        // asteroids
        this.asteroids.forEach(o => this.drawObject(o));
        // ship
        if (drawShip) {
            this.drawObject(this.ship);
        }
        // drops
        this.drops.forEach(o => this.drawObject(o));
        // shots
        this.ship.shots.forEach((s: Shot) => this.drawObject(s));
        // ship energy, time
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(
            `lifes: ${
            "♥".repeat(Math.floor(this.ship.lifes))
            }  ~  energy: ${
            Math.floor(this.ship.energy)
            }  ~  power: ${
            Math.floor(this.ship.power)
            }  ~  shield: ${
            Math.floor(this.ship.shield)
            }  ~  score: ${
            Math.floor(this.score)
            }  ~  time: ${
            Math.floor(this.timeElapsed / 1000)}`,
            this.canvas.width / 2,
            25
        );
    }

    /**
     * Fades UI to a darker shade or specified color.
     */
    private fadeUI(color: string = "rgba(0, 0, 0, 0.5)"): void {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.gameSize.x, this.gameSize.y);
        this.ctx.restore();
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
    public static strokeStyle: string = "#fff";
    public static fillStyle: string = "rgba(255, 255, 255, 0.2)";
    public position: Vector2D;
    public orientation: number;
    public velocity: Vector2D;
    public energy: number;
    public originalEnergy: number;
    public size: number;
    public game: Asteroids;
    public points: Array<Vector2D>;

    constructor(
        game: Asteroids,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        this.game = game;
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
    public getOrientationVector(): Vector2D {
        return Vector2D.getUnitVectorFromOrientation(this.orientation);
    }

    /**
     * Moves this object by its velocity.
     */
    public animate(): void {
        this.translate(this.velocity);
    }

    /**
     * Tranlates this object by a vector, keeping it inside the universe.
     * @param vector translation vector
     */
    public translate(vector: Vector2D): void {
        this.position.translateV(vector);
        this.points.forEach(p => p.translateV(vector));

        // objects should reenter on the opposite site if disappearing
        const margin = this.size;
        if (this.position.x < -margin) {
            this.position.x += this.game.gameSize.x + 2 * margin;
            this.points = this.points.map(p => {
                p.x += this.game.gameSize.x + 2 * margin;
                return p;
            });
        } else if (this.position.x > this.game.gameSize.x + margin) {
            this.position.x -= this.game.gameSize.x + 2 * margin;
            this.points = this.points.map(p => {
                p.x -= this.game.gameSize.x + 2 * margin;
                return p;
            });
        }
        if (this.position.y < -margin) {
            this.position.y += this.game.gameSize.y + 2 * margin;
            this.points = this.points.map(p => {
                p.y += this.game.gameSize.y + 2 * margin;
                return p;
            });
        } else if (this.position.y > this.game.gameSize.y + margin) {
            this.position.y -= this.game.gameSize.y + 2 * margin;
            this.points = this.points.map(p => {
                p.y -= this.game.gameSize.y + 2 * margin;
                return p;
            });
        }
    }

    /**
     * Rotates this object by an angle.
     * @param angle rotation angle
     */
    public rotate(angle: number): void {
        this.orientation += angle;
        this.points.forEach(p => p.rotate(this.position.x, this.position.y, angle));
    }

    /**
     * Hit test with this and another object.
     * @param object
     */
    public isHit(object: SpaceObject): boolean {
        // simple test with postion and size
        if (Vector2D.getDistance(this.position, object.position) < this.size + object.size) {
            // exact hit test for polygons
            if (this.points.length > 2 && object.points.length > 2) {
                // both are polygons
                return this.polygonPolygonHit(this.points, object.points);
            } else if (this.points.length <= 2 && object.points.length > 2) {
                // circle and polygon
                return this.circlePolygonHit(this.position, this.size, object.points);
            } else if (this.points.length > 2 && object.points.length <= 2) {
                // polygon and circle
                return this.circlePolygonHit(object.position, object.size, this.points);
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * React to a hit by another object.
     * @param object
     */
    public hitBy(object: SpaceObject): void {
        console.log("hit by");
        console.log(object);
    }

    /**
     * Returns true if energy is lower than 0.
     */
    public isDestroyed(): boolean {
        return this.energy <= 1;
    }

    /**
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        lib.drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
    }

    /**
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    public drawDebug(ctx: CanvasRenderingContext2D): void {
        // draw orientation
        const point = this.position.clone().add(this.getOrientationVector().multiplyFactor(this.size * 2));
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(point.x, point.y);
        ctx.closePath();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        // draw size (outer hit box)
        lib.drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
        // draw points
        lib.drawPolygon(ctx, this.points, SpaceObject.strokeStyle, SpaceObject.fillStyle);
        // draw center
        lib.drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
        // draw energy
        ctx.fillStyle = "#fff";
        ctx.fillText((Math.floor(this.energy)).toString(), this.position.x, this.position.y);
    }

    /**
     * Returns a string representation of this object.
     */
    public toString(): string {
        return `SpaceObject (\nposition: ${
            this.position.toString()
            },\nvelocity: ${
            this.velocity.toString()
            },\norientation: ${
            this.orientation.toFixed(2)
            },\nenergy: ${
            this.energy}\n`;
    }

    /**
     * Hit test with a circle and a polygon.
     * @param center circle center
     * @param radius circle radius
     * @param point point
     */
    private circlePolygonHit(center: Vector2D, radius: number, polygon: Array<Vector2D>): boolean {
        // use SAT library
        const circle = new SAT.Circle(new SAT.Vector(center.x, center.y), radius);
        const test = SAT.testPolygonCircle(
            this.createSatPolygon(polygon),
            circle
        );
        return test;
    }

    /**
     * Hit test for two polygons.
     * @param polygon1
     * @param polygon2
     */
    private polygonPolygonHit(polygon1: Array<Vector2D>, polygon2: Array<Vector2D>, ): boolean {
        // use SAT library
        const test = SAT.testPolygonPolygon(
            this.createSatPolygon(polygon1),
            this.createSatPolygon(polygon2)
        );
        return test;
    }

    /**
     * Convert Array<Vector2D> to SAT.Polygon
     */
    private createSatPolygon(polygon: Array<Vector2D>): Array<SAT.Polygon> {
        const position = new SAT.Vector(polygon[0].x, polygon[0].y);
        const polPoints = [];
        for (let i = 0; i < polygon.length; i++) {
            polPoints.push(
                new SAT.Vector(polygon[i].x - polygon[0].x, polygon[i].y - polygon[0].y)
            );
        }
        const poly = new SAT.Polygon(
            position,
            polPoints
        );
        return poly;
    }
}

/**
 * Space ship class
 */
class Spaceship extends SpaceObject {
    public static decayRate: number = 0.1; // shield decay rate
    public static acceleration: number = 1;
    public static strokeStyle: string = "#0ff";
    public static fillStyle: string = "#0ff";
    public shots: Array<Shot>;
    public lastTimeShot: number;
    public power: number;
    public shield: number;
    public lifes: number;

    constructor(
        game: Asteroids,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number,
        power: number
    ) {
        super(game, position, orientation, velocity, size, energy);

        this.power = power;
        this.shots = [];
        this.lifes = 3;
        this.shield = 0;

        // create shape
        const { x, y } = this.position;
        this.points = [
            new Vector2D(x + size, y),
            new Vector2D(x - 0.75 * size, y - 0.6 * size),
            new Vector2D(x - 0.2 * size, y),
            new Vector2D(x - 0.75 * size, y + 0.6 * size),
        ];

        this.lastTimeShot = 0;
    }

    /**
     * React to a hit by another object.
     * @param object
     */
    public hitBy(object: SpaceObject): void {
        if (object instanceof Asteroid) {
            // damage should depend on magnitude of velocity difference
            const magnitude = Vector2D.getDistance(this.velocity, object.velocity);
            const rawDamage = object.energy * (magnitude / 100);
            // shield blocks damage
            const damage = rawDamage - this.shield;
            this.shield = Math.max(0, this.shield - rawDamage);
            this.energy -= damage;
            // give some damage to asteroid too
            object.energy -= rawDamage / 2;
        }
    }

    /**
     * Shoots a new Shot object.
     */
    public shoot(): void {
        // only allow 10 shots per second
        if (this.game.timeElapsed - this.lastTimeShot < 100) {
            return;
        }
        this.lastTimeShot = this.game.timeElapsed;
        // shoot from front of ship
        const position = this.position.clone()
            .add(this.getOrientationVector()
                .multiplyFactor(this.size)
            );
        // velocity mixes ship velocity and ship orientation
        const velocity = this.getOrientationVector()
            .multiplyFactor(5)
            .add(this.velocity.clone().getDirection())
            .multiplyFactor(1);
        const shot = new Shot(
            this.game,
            position,
            this.orientation,
            velocity,
            5,
            this.power);
        this.shots.push(shot);
    }

    /**
     * Decrease shield overtime
     */
    public decay(): void {
        this.shield = Math.max(0, this.shield - Spaceship.decayRate);
    }

    /**
     * Accelerates the ship forward.
     */
    public increaseVelocity(): void {
        const direction = this.getOrientationVector();
        const delta = direction.multiplyFactor(Spaceship.acceleration);
        this.velocity.add(delta);
    }

    /**
     * Accelerates the ship backward.
     */
    public decreaseVelocity(): void {
        const direction = this.getOrientationVector();
        const delta = direction.multiplyFactor(-Spaceship.acceleration);
        this.velocity.add(delta);
    }

    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        // draw shield
        if (this.shield > 0) {
            lib.drawCircle(
                ctx,
                this.position,
                this.size + 2,
                `rgba(0, 255, 255, ${this.shield / 100})`,
                "rgba(0, 0, 0, 0)"
            );
        }
        // draw ship
        lib.drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
    }
}

/**
 * Shot class.
 */
class Shot extends SpaceObject {
    public static decayRate: number = 0.005;
    public static strokeStyle: string = "#0f0";
    public static fillStyle: string = "#0f0";

    constructor(
        game: Asteroids,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(game, position, orientation, velocity, size, energy);

        const p = position;
        this.points = [
            p.clone().add(
                this.getOrientationVector()
                    .multiplyFactor(this.size)
            ),
            p.clone().add(
                this.getOrientationVector()
                    .rotate(0, 0, Math.PI * 0.75)
                    .multiplyFactor(this.size)
            ),
            p.clone().add(
                this.getOrientationVector()
                    .rotate(0, 0, -Math.PI * 0.75).multiplyFactor(this.size)
            ),
        ];
    }

    /**
     * Disable hit detection for shots.
     * @param object
     */
    public isHit(object: SpaceObject): boolean {
        console.error("shots cannot be hit");
        console.log(object);
        return false;
    }

    /**
     * Decrease energy overtime.
     */
    public decay(): void {
        this.energy -= Shot.decayRate * this.originalEnergy;
    }

    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.energy < 0) {
            return;
        }
        const color = `rgba(0, 255, 0, ${this.energy / this.originalEnergy})`;
        // lib.drawCircle(ctx, this.position, this.size, color, color);
        lib.drawPolygon(ctx, this.points, color, color);
    }
}

/**
 * Asteroid class.
 */
class Asteroid extends SpaceObject {
    public static strokeStyle: string = "#fff";
    public static fillStyle: string = "#333";

    constructor(
        game: Asteroids,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(game, position, orientation, velocity, size, energy);

        // create polygon approximating the
        // circle by using random angles and radii
        this.points = [];
        const num = Math.floor(lib.random(10, 30));
        const step = 2 * Math.PI / num;
        let angle = 0;
        for (let i = 0; i <= num; i++) {
            const radius = lib.random(this.size * 0.7, this.size);
            const x = this.position.x + radius * Math.cos(angle);
            const y = this.position.y + radius * Math.sin(angle);
            this.points.push(new Vector2D(x, y));
            angle += lib.random(step * 0.7, step * 1.5);
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
    public hitBy(object: SpaceObject): [Drop, Array<Asteroid>] {
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
        } else if (object instanceof Asteroid || object instanceof Spaceship) {
            // two asteroids hit each other
            // only push this away, the other will react itself
            const direction = this.position.clone()
                .subtr(object.position.clone())
                .getDirection();
            const speed = this.velocity.getNorm();
            this.velocity = this.velocity.add(direction)
                .getDirection()
                .multiplyFactor(speed);
        }
    }

    /**
     * Splits into 2 to 5 smaller asteroids that share the energy.
     */
    public split(): Array<Asteroid> {
        // split
        const numberChildren = Math.floor(lib.random(2, 6));
        const children = [];
        for (let i = 0; i < numberChildren; i++) {
            let energy;
            let energyFraction;
            let size;
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

            const child = new Asteroid(
                this.game,
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
    public createDrops(): Drop {
        // only create drop with some probability
        if (lib.random(0, 1) < 0.25) {
            return null;
        }
        return new Drop(
            this.game,
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
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.energy < 0) {
            return;
        }
        lib.drawPolygon(ctx, this.points, Asteroid.strokeStyle, Asteroid.fillStyle);
    }
}

/**
 * Drops are boni for the ship to collect.
 * They may have adverse effects.
 */
class Drop extends SpaceObject {
    public static decayRate: number = 0.001;
    public effectType: string;
    public effect: number;
    public color: string;
    public text: string;

    constructor(
        game: Asteroids,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(game, position, orientation, velocity, size, energy);

        const effectTypes = ["energy", "power", "shield", "life", "score"];
        const r = Math.floor(lib.random(0, effectTypes.length));
        this.effectType = effectTypes[r];
        switch (this.effectType) {
            case "energy":
                this.effect = 10 * Math.floor(lib.random(-6, 11));
                this.color = "0, 0, 255";
                break;

            case "power":
                this.effect = Math.floor(lib.random(-6, 11));
                this.color = "0, 255, 0";
                break;

            case "shield":
                this.effect = Math.floor(lib.random(500, 1000));
                this.color = "255, 255, 0";
                break;

            case "life":
                this.effect = 1;
                this.color = "255, 0, 0";
                break;

            case "score":
                this.effect = Math.floor(lib.random(-1000, 10000));
                this.color = "255, 215, 0";
                break;

            default:
                break;
        }

        this.text = `${this.effectType} ${this.effect}`;

        // get exact hit box
        const textWidth = this.game.ctx.measureText(this.text).width;
        const textHeight = this.game.fontSize;
        this.points = [
            new Vector2D(this.position.x - textWidth, this.position.y - textHeight),
            new Vector2D(this.position.x + textWidth, this.position.y - textHeight),
            new Vector2D(this.position.x + textWidth, this.position.y + textHeight),
            new Vector2D(this.position.x - textWidth, this.position.y + textHeight)
        ];
    }

    /**
     * Decrease energy overtime
     */
    public decay(): void {
        this.energy -= Drop.decayRate * this.originalEnergy;
    }

    /**
     * Allow the ship to collect this drop
     * @param collector
     */
    public collect(collector: Spaceship, game: Asteroids): void {
        console.warn(`collected drop: ${this.text}`);
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
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.energy < 0) {
            return;
        }
        ctx.fillStyle = `rgba(${this.color}, ${this.energy / this.originalEnergy})`;
        ctx.fillText(this.text, this.position.x, this.position.y + 10);
    }
}

/**
 * Stars are only for decoration
 */
class Star extends SpaceObject {
    public color: string;

    constructor(
        game: Asteroids,
        position: Vector2D,
        orientation: number,
        velocity: Vector2D,
        size: number,
        energy: number
    ) {
        super(game, position, orientation, velocity, size, energy);

        // get random color depending on size
        // TODO:
        this.color = "#fff";
    }

    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        lib.drawCircle(ctx, this.position, this.size, this.color, this.color);
    }
}

// #endregion space objects

// #region main

// global game variable
let asteroids: Asteroids;

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
            if (asteroids) {
                asteroids.keyDown(event);
            }
    }
}

/**
 * Starts a new game.
 */
function initAsteroids(): void {
    if (asteroids) {
        asteroids.remove();
    }
    asteroids = new Asteroids();
}

// #endregion main
