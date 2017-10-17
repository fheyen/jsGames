"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Main class of this game.
 */
var Asteroids = /** @class */ (function () {
    function Asteroids() {
        // set DEBUG flag
        this.DEBUG = false;
        // game size is set to window size
        this.gameSize = new Vector2D(window.innerWidth, window.innerHeight);
        // inverse framerate
        this.intervalTime = 20;
        // canvas
        this.backgroundCanvas = this.createCanvas();
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.fontSize = 20;
        this.ctx.font = this.fontSize + "px Consolas";
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
    Asteroids.prototype.remove = function () {
        this.canvas.remove();
    };
    /**
     * Called if a ship has clicked on a button.
     * @param event keydown event
     */
    Asteroids.prototype.keyDown = function (event) {
        event.preventDefault();
        // process keyboard input
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                if (!this.gameStarted || !this.gameRunning) {
                    return;
                }
                else {
                    // change ship velocity
                    event.key === "ArrowUp" ? this.ship.increaseVelocity() : this.ship.decreaseVelocity();
                }
                break;
            case "ArrowLeft":
            case "ArrowRight":
                if (!this.gameStarted || !this.gameRunning) {
                    return;
                }
                else {
                    // change ship orientation
                    var angle = 10 * Math.PI / 180;
                    event.key === "ArrowLeft" ? this.ship.rotate(-angle) : this.ship.rotate(angle);
                }
                break;
            case " ":
                // space bar: start pause or resume
                if (!this.gameStarted) {
                    this.startGame();
                }
                else if (this.gameRunning) {
                    this.ship.shoot();
                }
                else {
                    this.resumeGame();
                }
                break;
            case "p":
                // p: pause or resume
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
    };
    /**
     * Resets the game to the initial conditions.
     */
    Asteroids.prototype.reset = function () {
        this.timeElapsed = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        // create ship
        var size = Math.min(this.gameSize.x, this.gameSize.y) / 20;
        var position = new Vector2D(this.gameSize.x / 2, this.gameSize.y / 2);
        var orientation = 0;
        var velocity = new Vector2D(0, 0);
        var power = 20;
        this.ship = new Spaceship(this, position, orientation, velocity, size, 100, power);
        // create asteroids
        this.asteroids = [];
        var num = 5;
        var maxTries = 100;
        var tryNum = 0;
        for (var i = 0; i < num; i++) {
            tryNum = 0;
            // choose free space
            while (tryNum++ < maxTries) {
                var aPos = Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
                var aVelocity = Vector2D.randomVector(-1, 1, -1, 1);
                var aSize = lib.random(50, 100);
                var aEnergy = Math.pow(aSize, 2) / 5;
                var a = new Asteroid(this, aPos, 0, aVelocity, aSize, aEnergy);
                var hit = false;
                for (var j = 0; j < this.asteroids.length; j++) {
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
        for (var i = 0; i < 400; i++) {
            this.stars.push(new Star(this, Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y), 0, new Vector2D(0, 0), lib.random(0.01, 1), 0));
        }
        // draw stars
        var ctx = this.backgroundCanvas.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.gameSize.x, this.gameSize.y);
        this.stars.forEach(function (o) { return o.draw(ctx); });
        // draw UI
        this.updateUI(false);
        this.showMessages("Asteroids", "~~~ new game ~~~", "", "press <space> to start and fire", "press <p> to pause", "press <⯅> or <⯆> to move the ship", "press <⯇> or <⯈> to rotate the ship", "press <F5> to reset");
    };
    // #region game events
    /**
     * Starts the game.
     */
    Asteroids.prototype.startGame = function () {
        if (this.gameStarted) {
            return;
        }
        if (this.gameOver) {
            this.reset();
        }
        this.gameStarted = true;
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    /**
     * Pauses the game.
     */
    Asteroids.prototype.pauseGame = function () {
        if (this.gameOver || !this.gameRunning) {
            return;
        }
        this.gameRunning = false;
        clearInterval(this.interval);
        this.fadeUI();
        // show pause message
        this.showMessages("Asteroids", "~~~ paused ~~~", "", "press <space> continue", "press <F5> to reset");
    };
    /**
     * Resumes the paused game.
     */
    Asteroids.prototype.resumeGame = function () {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    /**
     * Ends the game.
     */
    Asteroids.prototype.endGame = function (won) {
        this.gameOver = true;
        clearInterval(this.interval);
        this.fadeUI();
        this.showMessages(won ? "~~~ you won! ~~~" : "~~~ game over! ~~~", "", "total time survived: " + Math.floor((this.timeElapsed / 1000)) + " seconds", "total score: " + Math.floor((this.score)), "", "press <F5> to restart");
    };
    // #endregion game events
    /**
     * @param a this object
     */
    Asteroids.prototype.animate = function (a) {
        // abbreviations
        var as = a.asteroids;
        // check if player has won
        if (as.length === 0) {
            a.endGame(true);
            return;
        }
        // update elapsed time
        a.timeElapsed += a.intervalTime;
        a.score += a.intervalTime / 3000;
        // update object positions
        as.forEach(function (o) { return o.animate(); });
        a.ship.animate();
        a.ship.shots.forEach(function (s) { return s.animate(); });
        a.drops.forEach(function (d) { return d.animate(); });
        // test for crash
        var crashed = false;
        for (var i = 0; i < as.length; i++) {
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
                    }
                    else {
                        // revive
                        a.ship.energy = 100;
                    }
                }
            }
        }
        // test shots and asteroids for collisions
        var deltaScore = 0;
        for (var i = 0; i < as.length; i++) {
            var asteroid = as[i];
            for (var j = 0; j < a.ship.shots.length; j++) {
                var shot = a.ship.shots[j];
                if (asteroid.isHit(shot)) {
                    // reduce energy of asteroid
                    var _a = asteroid.hitBy(shot), drop = _a[0], children = _a[1];
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
        for (var i = 0; i < as.length; i++) {
            var asteroid1 = as[i];
            for (var j = 0; j < as.length; j++) {
                // only do each pair once and do not collide an asteroid with itself
                if (i <= j) {
                    continue;
                }
                var asteroid2 = as[j];
                if (asteroid1.isHit(asteroid2)) {
                    asteroid1.hitBy(asteroid2);
                    asteroid2.hitBy(asteroid1);
                }
            }
        }
        // test ship and drops for collisions
        for (var i = 0; i < a.drops.length; i++) {
            if (a.ship.isHit(a.drops[i])) {
                a.drops[i].collect(a.ship, a);
            }
        }
        // decay objects
        a.ship.decay();
        a.ship.shots.forEach(function (s) { return s.decay(); });
        a.drops.forEach(function (d) { return d.decay(); });
        // remove destroyed objects
        a.asteroids = a.asteroids.filter(function (ast) { return !ast.isDestroyed(); });
        a.ship.shots = a.ship.shots.filter(function (s) { return !s.isDestroyed(); });
        a.drops = a.drops.filter(function (d) { return !d.isDestroyed(); });
        // draw game
        a.updateUI();
        if (crashed) {
            // taint screen red
            a.fadeUI("rgba(255, 0, 0, 0.2)");
        }
    };
    // #region UI
    /**
     * Creates and returns a canvas object.
     */
    Asteroids.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize.x;
        canvas.height = this.gameSize.y;
        canvas.style.position = "fixed";
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
    /**
     * Displays a message on the UI.
     * @param message message string list
     */
    Asteroids.prototype.showMessages = function () {
        var _this = this;
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        var offsetY = this.canvas.height / 2 - 15 * messages.length;
        messages.forEach(function (m) {
            _this.ctx.fillText(m, _this.canvas.width / 2, offsetY);
            offsetY += 30;
            console.log(m);
        });
    };
    /**
     * Draws a space object on the canvas.
     * If this.DEBUG is set to true, the drawDebug function will be used.
     */
    Asteroids.prototype.drawObject = function (object) {
        this.DEBUG ? object.drawDebug(this.ctx) : object.draw(this.ctx);
    };
    /**
     * Draws the UI.
     * @param drawShip ship is only drawn if this is not set to false
     */
    Asteroids.prototype.updateUI = function (drawShip) {
        var _this = this;
        if (drawShip === void 0) { drawShip = true; }
        this.ctx.clearRect(0, 0, this.gameSize.x, this.gameSize.y);
        // asteroids
        this.asteroids.forEach(function (o) { return _this.drawObject(o); });
        // ship
        if (drawShip) {
            this.drawObject(this.ship);
        }
        // drops
        this.drops.forEach(function (o) { return _this.drawObject(o); });
        // shots
        this.ship.shots.forEach(function (s) { return _this.drawObject(s); });
        // ship energy, time
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("lifes: " + "♥".repeat(Math.floor(this.ship.lifes)) + "  ~  energy: " + Math.floor(this.ship.energy) + "  ~  power: " + Math.floor(this.ship.power) + "  ~  shield: " + Math.floor(this.ship.shield) + "  ~  score: " + Math.floor(this.score) + "  ~  time: " + Math.floor(this.timeElapsed / 1000), this.canvas.width / 2, 25);
    };
    /**
     * Fades UI to a darker shade or specified color.
     */
    Asteroids.prototype.fadeUI = function (color) {
        if (color === void 0) { color = "rgba(0, 0, 0, 0.5)"; }
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.gameSize.x, this.gameSize.y);
        this.ctx.restore();
    };
    return Asteroids;
}());
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////    S P A C E   -   O B J E C T S   ///////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
// #region space objects
/**
 * General space object class from which all game objects in this game are derived
 */
var SpaceObject = /** @class */ (function () {
    function SpaceObject(game, position, orientation, velocity, size, energy) {
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
    SpaceObject.prototype.getOrientationVector = function () {
        return Vector2D.getUnitVectorFromOrientation(this.orientation);
    };
    /**
     * Moves this object by its velocity.
     */
    SpaceObject.prototype.animate = function () {
        this.translate(this.velocity);
    };
    /**
     * Tranlates this object by a vector, keeping it inside the universe.
     * @param vector translation vector
     */
    SpaceObject.prototype.translate = function (vector) {
        var _this = this;
        this.position.translateV(vector);
        this.points.forEach(function (p) { return p.translateV(vector); });
        // objects should reenter on the opposite site if disappearing
        var margin = this.size;
        if (this.position.x < -margin) {
            this.position.x += this.game.gameSize.x + 2 * margin;
            this.points = this.points.map(function (p) {
                p.x += _this.game.gameSize.x + 2 * margin;
                return p;
            });
        }
        else if (this.position.x > this.game.gameSize.x + margin) {
            this.position.x -= this.game.gameSize.x + 2 * margin;
            this.points = this.points.map(function (p) {
                p.x -= _this.game.gameSize.x + 2 * margin;
                return p;
            });
        }
        if (this.position.y < -margin) {
            this.position.y += this.game.gameSize.y + 2 * margin;
            this.points = this.points.map(function (p) {
                p.y += _this.game.gameSize.y + 2 * margin;
                return p;
            });
        }
        else if (this.position.y > this.game.gameSize.y + margin) {
            this.position.y -= this.game.gameSize.y + 2 * margin;
            this.points = this.points.map(function (p) {
                p.y -= _this.game.gameSize.y + 2 * margin;
                return p;
            });
        }
    };
    /**
     * Rotates this object by an angle.
     * @param angle rotation angle
     */
    SpaceObject.prototype.rotate = function (angle) {
        var _this = this;
        this.orientation += angle;
        this.points.forEach(function (p) { return p.rotate(_this.position.x, _this.position.y, angle); });
    };
    /**
     * Hit test with this and another object.
     * @param object
     */
    SpaceObject.prototype.isHit = function (object) {
        // simple test with postion and size
        if (Vector2D.getDistance(this.position, object.position) < this.size + object.size) {
            // exact hit test for polygons
            if (this.points.length > 2 && object.points.length > 2) {
                // both are polygons
                return this.polygonPolygonHit(this.points, object.points);
            }
            else if (this.points.length <= 2 && object.points.length > 2) {
                // circle and polygon
                return this.circlePolygonHit(this.position, this.size, object.points);
            }
            else if (this.points.length > 2 && object.points.length <= 2) {
                // polygon and circle
                return this.circlePolygonHit(object.position, object.size, this.points);
            }
            else {
                return true;
            }
        }
        return false;
    };
    /**
     * React to a hit by another object.
     * @param object
     */
    SpaceObject.prototype.hitBy = function (object) {
        console.log("hit by");
        console.log(object);
    };
    /**
     * Returns true if energy is lower than 0.
     */
    SpaceObject.prototype.isDestroyed = function () {
        return this.energy <= 1;
    };
    /**
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    SpaceObject.prototype.draw = function (ctx) {
        lib.drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
    };
    /**
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    SpaceObject.prototype.drawDebug = function (ctx) {
        // draw orientation
        var point = this.position.clone().add(this.getOrientationVector().multiplyFactor(this.size * 2));
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
    };
    /**
     * Returns a string representation of this object.
     */
    SpaceObject.prototype.toString = function () {
        return "SpaceObject (\nposition: " + this.position.toString() + ",\nvelocity: " + this.velocity.toString() + ",\norientation: " + this.orientation.toFixed(2) + ",\nenergy: " + this.energy + "\n";
    };
    /**
     * Hit test with a circle and a polygon.
     * @param center circle center
     * @param radius circle radius
     * @param point point
     */
    SpaceObject.prototype.circlePolygonHit = function (center, radius, polygon) {
        // use SAT library
        var circle = new SAT.Circle(new SAT.Vector(center.x, center.y), radius);
        var test = SAT.testPolygonCircle(this.createSatPolygon(polygon), circle);
        return test;
    };
    /**
     * Hit test for two polygons.
     * @param polygon1
     * @param polygon2
     */
    SpaceObject.prototype.polygonPolygonHit = function (polygon1, polygon2) {
        // use SAT library
        var test = SAT.testPolygonPolygon(this.createSatPolygon(polygon1), this.createSatPolygon(polygon2));
        return test;
    };
    /**
     * Convert Array<Vector2D> to SAT.Polygon
     */
    SpaceObject.prototype.createSatPolygon = function (polygon) {
        var position = new SAT.Vector(polygon[0].x, polygon[0].y);
        var polPoints = [];
        for (var i = 0; i < polygon.length; i++) {
            polPoints.push(new SAT.Vector(polygon[i].x - polygon[0].x, polygon[i].y - polygon[0].y));
        }
        var poly = new SAT.Polygon(position, polPoints);
        return poly;
    };
    SpaceObject.strokeStyle = "#fff";
    SpaceObject.fillStyle = "rgba(255, 255, 255, 0.2)";
    return SpaceObject;
}());
/**
 * Space ship class
 */
var Spaceship = /** @class */ (function (_super) {
    __extends(Spaceship, _super);
    function Spaceship(game, position, orientation, velocity, size, energy, power) {
        var _this = _super.call(this, game, position, orientation, velocity, size, energy) || this;
        _this.power = power;
        _this.shots = [];
        _this.lifes = 3;
        _this.shield = 0;
        // create shape
        var _a = _this.position, x = _a.x, y = _a.y;
        _this.points = [
            new Vector2D(x + size, y),
            new Vector2D(x - 0.75 * size, y - 0.6 * size),
            new Vector2D(x - 0.2 * size, y),
            new Vector2D(x - 0.75 * size, y + 0.6 * size),
        ];
        _this.lastTimeShot = 0;
        return _this;
    }
    /**
     * React to a hit by another object.
     * @param object
     */
    Spaceship.prototype.hitBy = function (object) {
        if (object instanceof Asteroid) {
            // damage should depend on magnitude of velocity difference
            var magnitude = Vector2D.getDistance(this.velocity, object.velocity);
            var rawDamage = object.energy * (magnitude / 100);
            // shield blocks damage
            var damage = rawDamage - this.shield;
            this.shield = Math.max(0, this.shield - rawDamage);
            this.energy -= damage;
            // give some damage to asteroid too
            object.energy -= rawDamage / 2;
        }
    };
    /**
     * Shoots a new Shot object.
     */
    Spaceship.prototype.shoot = function () {
        // only allow 10 shots per second
        if (this.game.timeElapsed - this.lastTimeShot < 100) {
            return;
        }
        this.lastTimeShot = this.game.timeElapsed;
        // shoot from front of ship
        var position = this.position.clone()
            .add(this.getOrientationVector()
            .multiplyFactor(this.size));
        // velocity mixes ship velocity and ship orientation
        var velocity = this.getOrientationVector()
            .multiplyFactor(5)
            .add(this.velocity.clone().getDirection())
            .multiplyFactor(1);
        var shot = new Shot(this.game, position, this.orientation, velocity, 5, this.power);
        this.shots.push(shot);
    };
    /**
     * Decrease shield overtime
     */
    Spaceship.prototype.decay = function () {
        this.shield = Math.max(0, this.shield - Spaceship.decayRate);
    };
    /**
     * Accelerates the ship forward.
     */
    Spaceship.prototype.increaseVelocity = function () {
        var direction = this.getOrientationVector();
        var delta = direction.multiplyFactor(Spaceship.acceleration);
        this.velocity.add(delta);
    };
    /**
     * Accelerates the ship backward.
     */
    Spaceship.prototype.decreaseVelocity = function () {
        var direction = this.getOrientationVector();
        var delta = direction.multiplyFactor(-Spaceship.acceleration);
        this.velocity.add(delta);
    };
    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    Spaceship.prototype.draw = function (ctx) {
        // draw shield
        if (this.shield > 0) {
            lib.drawCircle(ctx, this.position, this.size + 2, "rgba(0, 255, 255, " + this.shield / 100 + ")", "rgba(0, 0, 0, 0)");
        }
        // draw ship
        lib.drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
    };
    Spaceship.decayRate = 0.1; // shield decay rate
    Spaceship.acceleration = 1;
    Spaceship.strokeStyle = "#0ff";
    Spaceship.fillStyle = "#0ff";
    return Spaceship;
}(SpaceObject));
/**
 * Shot class.
 */
var Shot = /** @class */ (function (_super) {
    __extends(Shot, _super);
    function Shot(game, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, game, position, orientation, velocity, size, energy) || this;
        var p = position;
        _this.points = [
            p.clone().add(_this.getOrientationVector()
                .multiplyFactor(_this.size)),
            p.clone().add(_this.getOrientationVector()
                .rotate(0, 0, Math.PI * 0.75)
                .multiplyFactor(_this.size)),
            p.clone().add(_this.getOrientationVector()
                .rotate(0, 0, -Math.PI * 0.75).multiplyFactor(_this.size)),
        ];
        return _this;
    }
    /**
     * Disable hit detection for shots.
     * @param object
     */
    Shot.prototype.isHit = function (object) {
        console.error("shots cannot be hit");
        console.log(object);
        return false;
    };
    /**
     * Decrease energy overtime.
     */
    Shot.prototype.decay = function () {
        this.energy -= Shot.decayRate * this.originalEnergy;
    };
    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    Shot.prototype.draw = function (ctx) {
        if (this.energy < 0) {
            return;
        }
        var color = "rgba(0, 255, 0, " + this.energy / this.originalEnergy + ")";
        // lib.drawCircle(ctx, this.position, this.size, color, color);
        lib.drawPolygon(ctx, this.points, color, color);
    };
    Shot.decayRate = 0.005;
    Shot.strokeStyle = "#0f0";
    Shot.fillStyle = "#0f0";
    return Shot;
}(SpaceObject));
/**
 * Asteroid class.
 */
var Asteroid = /** @class */ (function (_super) {
    __extends(Asteroid, _super);
    function Asteroid(game, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, game, position, orientation, velocity, size, energy) || this;
        // create polygon approximating the
        // circle by using random angles and radii
        _this.points = [];
        var num = Math.floor(lib.random(10, 30));
        var step = 2 * Math.PI / num;
        var angle = 0;
        for (var i = 0; i <= num; i++) {
            var radius = lib.random(_this.size * 0.7, _this.size);
            var x = _this.position.x + radius * Math.cos(angle);
            var y = _this.position.y + radius * Math.sin(angle);
            _this.points.push(new Vector2D(x, y));
            angle += lib.random(step * 0.7, step * 1.5);
            if (angle > 2 * Math.PI) {
                break;
            }
        }
        return _this;
    }
    /**
     * React to a hit by another object.
     * @param object
     * @return drops and child asteroids if there are any
     */
    Asteroid.prototype.hitBy = function (object) {
        if (object instanceof Shot) {
            // asteroid was shot
            this.energy -= object.energy;
            object.energy = 0;
            if (this.isDestroyed()) {
                // destroyed
                return [this.createDrops(), null];
            }
            else if (this.energy > 100 && this.energy <= 0.5 * this.originalEnergy) {
                // split
                return [this.createDrops(), this.split()];
            }
            else {
                return [null, null];
            }
        }
        else if (object instanceof Asteroid || object instanceof Spaceship) {
            // two asteroids hit each other
            // only push this away, the other will react itself
            var direction = this.position.clone()
                .subtr(object.position.clone())
                .getDirection();
            var speed = this.velocity.getNorm();
            this.velocity = this.velocity.add(direction)
                .getDirection()
                .multiplyFactor(speed);
        }
    };
    /**
     * Splits into 2 to 5 smaller asteroids that share the energy.
     */
    Asteroid.prototype.split = function () {
        // split
        var numberChildren = Math.floor(lib.random(2, 6));
        var children = [];
        for (var i = 0; i < numberChildren; i++) {
            var energy = void 0;
            var energyFraction = void 0;
            var size = void 0;
            if (i !== numberChildren - 1 && this.energy > 50) {
                // children share energy
                energyFraction = lib.random(0, 0.5);
                energy = this.energy * energyFraction;
                size = this.size * energyFraction;
                this.energy -= energy;
                this.size -= size;
            }
            else {
                // last child takes the rest
                energy = this.energy;
                size = this.size;
                this.energy = 0;
                this.size = 0;
            }
            var child = new Asteroid(this.game, this.position.clone().add(Vector2D.randomVector(-1, 1, -1, 1)), this.orientation, this.velocity.clone().add(Vector2D.randomVector(-1, 1, -1, 1)), size, energy);
            children.push(child);
        }
        // return drops and children
        return children;
    };
    /**
     * Creates 1 to 3 drops.
     */
    Asteroid.prototype.createDrops = function () {
        // only create drop with some probability
        if (lib.random(0, 1) < 0.25) {
            return null;
        }
        return new Drop(this.game, this.position.clone().add(Vector2D.randomVector(-2, 2, -2, 2)), this.orientation, this.velocity.clone().add(Vector2D.randomVector(-2, 2, -2, 2)), 10, 100);
    };
    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    Asteroid.prototype.draw = function (ctx) {
        if (this.energy < 0) {
            return;
        }
        lib.drawPolygon(ctx, this.points, Asteroid.strokeStyle, Asteroid.fillStyle);
    };
    Asteroid.strokeStyle = "#fff";
    Asteroid.fillStyle = "#333";
    return Asteroid;
}(SpaceObject));
/**
 * Drops are boni for the ship to collect.
 * They may have adverse effects.
 */
var Drop = /** @class */ (function (_super) {
    __extends(Drop, _super);
    function Drop(game, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, game, position, orientation, velocity, size, energy) || this;
        var effectTypes = ["energy", "power", "shield", "life", "score"];
        var r = Math.floor(lib.random(0, effectTypes.length));
        _this.effectType = effectTypes[r];
        switch (_this.effectType) {
            case "energy":
                _this.effect = 10 * Math.floor(lib.random(-6, 11));
                _this.color = "0, 0, 255";
                break;
            case "power":
                _this.effect = Math.floor(lib.random(-6, 11));
                _this.color = "0, 255, 0";
                break;
            case "shield":
                _this.effect = Math.floor(lib.random(500, 1000));
                _this.color = "255, 255, 0";
                break;
            case "life":
                _this.effect = 1;
                _this.color = "255, 0, 0";
                break;
            case "score":
                _this.effect = Math.floor(lib.random(-1000, 10000));
                _this.color = "255, 215, 0";
                break;
            default:
                break;
        }
        _this.text = _this.effectType + " " + _this.effect;
        // get exact hit box
        var textWidth = _this.game.ctx.measureText(_this.text).width;
        var textHeight = _this.game.fontSize;
        _this.points = [
            new Vector2D(_this.position.x - textWidth, _this.position.y - textHeight),
            new Vector2D(_this.position.x + textWidth, _this.position.y - textHeight),
            new Vector2D(_this.position.x + textWidth, _this.position.y + textHeight),
            new Vector2D(_this.position.x - textWidth, _this.position.y + textHeight)
        ];
        return _this;
    }
    /**
     * Decrease energy overtime
     */
    Drop.prototype.decay = function () {
        this.energy -= Drop.decayRate * this.originalEnergy;
    };
    /**
     * Allow the ship to collect this drop
     * @param collector
     */
    Drop.prototype.collect = function (collector, game) {
        console.warn("collected drop: " + this.text);
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
    };
    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    Drop.prototype.draw = function (ctx) {
        if (this.energy < 0) {
            return;
        }
        ctx.fillStyle = "rgba(" + this.color + ", " + this.energy / this.originalEnergy + ")";
        ctx.fillText(this.text, this.position.x, this.position.y + 10);
    };
    Drop.decayRate = 0.001;
    return Drop;
}(SpaceObject));
/**
 * Stars are only for decoration
 */
var Star = /** @class */ (function (_super) {
    __extends(Star, _super);
    function Star(game, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, game, position, orientation, velocity, size, energy) || this;
        // get random color depending on size
        // TODO:
        _this.color = "#fff";
        return _this;
    }
    /**
     * @overwrite
     * Draws this object onto ctx.
     * @param ctx canvas context
     */
    Star.prototype.draw = function (ctx) {
        lib.drawCircle(ctx, this.position, this.size, this.color, this.color);
    };
    return Star;
}(SpaceObject));
// #endregion space objects
// #region main
// global game variable
var asteroids;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownAsteroids(event) {
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
function initAsteroids() {
    if (asteroids) {
        asteroids.remove();
    }
    asteroids = new Asteroids();
}
// #endregion main
