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
var Asteroids = /** @class */ (function () {
    function Asteroids() {
        this.gameSize = new Vector2D(window.innerWidth, window.innerHeight);
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
        var power = 10;
        this.ship = new Spaceship(this.gameSize, position, orientation, velocity, size, 100, power);
        // create asteroids
        this.asteroids = [];
        var number = 3;
        for (var i = 0; i < number; i++) {
            var aPos = Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
            var aVelocity = Vector2D.randomVector(-1, 1, -1, 1);
            var aSize = random(50, 100);
            var aEnergy = Math.pow(aSize, 2) / 5;
            var a = new Asteroid(this.gameSize, aPos, 0, aVelocity, aSize, aEnergy);
            this.asteroids.push(a);
        }
        this.drops = [];
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
        this.showMessages(won ? "~~~ you won! ~~~" : "~~~ game over! ~~~", "", "total time survived: " + ~~(this.timeElapsed / 1000) + " seconds", "total score: " + ~~(this.score), "", "press <F5> to restart");
    };
    // #endregion game events
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
     * @param _this this object
     */
    Asteroids.prototype.animate = function (_this) {
        // abbreviations
        var as = _this.asteroids;
        // check if player has won
        if (as.length === 0) {
            _this.endGame(true);
            return;
        }
        // update elapsed time
        _this.timeElapsed += _this.intervalTime;
        _this.score += _this.intervalTime / 3000;
        // update object positions
        as.forEach(function (o) { return o.animate(); });
        _this.ship.animate();
        _this.ship.shots.forEach(function (s) { return s.animate(); });
        _this.drops.forEach(function (d) { return d.animate(); });
        // test for crash
        // TODO: use quadtree
        var crashed = false;
        for (var i = 0; i < as.length; i++) {
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
                    }
                    else {
                        // revive
                        _this.ship.energy = 1000;
                    }
                }
            }
        }
        // test shots and asteroids for collisions
        // TODO: use quadtree
        var deltaScore = 0;
        for (var i = 0; i < as.length; i++) {
            var asteroid = as[i];
            for (var j_1 = 0; j_1 < _this.ship.shots.length; j_1++) {
                var shot = _this.ship.shots[j_1];
                if (asteroid.isHit(shot)) {
                    // reduce energy of asteroid
                    var _a = asteroid.hitBy(shot), drop = _a[0], children = _a[1];
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
        for (var i = 0; i < _this.drops.length; i++) {
            if (_this.ship.isHit(_this.drops[i])) {
                _this.drops[i].collect(_this.ship, _this);
            }
        }
        // decay objects
        _this.ship.decay();
        _this.ship.shots.forEach(function (s) { return s.decay(); });
        _this.drops.forEach(function (d) { return d.decay(); });
        // remove destroyed objects
        _this.asteroids = _this.asteroids.filter(function (a) { return !a.isDestroyed(); });
        _this.ship.shots = _this.ship.shots.filter(function (s) { return !s.isDestroyed(); });
        _this.drops = _this.drops.filter(function (d) { return !d.isDestroyed(); });
        // draw game
        _this.updateUI();
        if (crashed) {
            // taint screen red
            _this.fadeUI("rgba(255, 0, 0, 0.2)");
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
     * Draws the UI.
     * @param drawShip ship is only drawn if this is not set to false
     */
    Asteroids.prototype.updateUI = function (drawShip) {
        var _this = this;
        if (drawShip === void 0) { drawShip = true; }
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // asteroids
        this.asteroids.forEach(function (o) { return o.draw(_this.ctx); });
        // ship
        if (drawShip) {
            this.ship.draw(this.ctx);
        }
        // drops
        this.drops.forEach(function (d) { return d.draw(_this.ctx); });
        // shots
        this.ship.shots.forEach(function (s) { return s.draw(_this.ctx); });
        // ship energy, time
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("lifes: " + "♥".repeat(~~this.ship.lifes) + "  ~  energy: " + ~~this.ship.energy + "  ~  power: " + ~~this.ship.power + "  ~  shield: " + ~~this.ship.shield + "  ~  score: " + ~~this.score + "  ~  time: " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
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
    /**
     * Removes the canvas from the DOM.
     */
    Asteroids.prototype.remove = function () {
        this.canvas.remove();
    };
    return Asteroids;
}());
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////         H E L P E R S           //////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
// #region helper functions
/**
 * Returns a pseudorandom number in [min, max)
 */
function random(min, max) {
    return min + (Math.random() * (max - min));
}
/**
 * Draws a polygon onto ctx.
 * @param ctx canvas context
 * @param points points
 * @param stroke stroke style
 * @param fill fill style
 */
function drawPolygon(ctx, points, stroke, fill) {
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
function drawCircle(ctx, center, radius, stroke, fill, startAngle, endAngle) {
    if (startAngle === void 0) { startAngle = 0; }
    if (endAngle === void 0) { endAngle = 2 * Math.PI; }
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
var Vector2D = /** @class */ (function () {
    /**
     * @param {number} x x-coordinate
     * @param {number} y y-coordinate
     */
    function Vector2D(x, y) {
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
    Vector2D.randomVector = function (minX, maxX, minY, maxY) {
        var x = random(minX, maxX);
        var y = random(minY, maxY);
        return new Vector2D(x, y);
    };
    /**
     * Returns a new unit vector poiting in the direction of orientation
     * @param orientation
     */
    Vector2D.getUnitVectorFromOrientation = function (orientation) {
        return new Vector2D(Math.cos(orientation), Math.sin(orientation));
    };
    /**
     * Returns the distance if two points.
     * @param vector1 point 1
     * @param vector2 point 2
     */
    Vector2D.getDistance = function (vector1, vector2) {
        return vector1.clone().subtr(vector2.clone()).getNorm();
    };
    // endregion statics
    /**
     * Translates the point by dx and dy.
     * @param {number} dx translation of x-coordinate
     * @param {number} dy translation of y-coordinate
     */
    Vector2D.prototype.translate = function (dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    };
    /**
     * Translates this vector by another vector.
     * @param vector translation vector
     */
    Vector2D.prototype.translateV = function (vector) {
        return this.translate(vector.x, vector.y);
    };
    /**
     * Rotates the point around a center at (cx, cy) by angle.
     * @param {number} cx center point x
     * @param {number} cy center point y
     * @param {number} angle rotation angle
     */
    Vector2D.prototype.rotate = function (cx, cy, angle) {
        this.translate(-cx, -cy);
        var x = this.x;
        var y = this.y;
        this.x = Math.cos(angle) * x - Math.sin(angle) * y;
        this.y = Math.sin(angle) * x + Math.cos(angle) * y;
        this.translate(cx, cy);
        return this;
    };
    /**
     * Add a vector to this.
     * @param vector
     */
    Vector2D.prototype.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };
    /**
     * Subtract a vector to this.
     * @param vector
     */
    Vector2D.prototype.subtr = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };
    /**
     * Multiplies a factor to this.
     * @param factor
     */
    Vector2D.prototype.multiplyFactor = function (factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };
    /**
     * Returns the Euklidean norm of this vector.
     */
    Vector2D.prototype.getNorm = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    /**
     * Returns a normalized unit vector copy of this.
     */
    Vector2D.prototype.getDirection = function () {
        var clone = this.clone();
        if (clone.getNorm() === 0) {
            return new Vector2D(0, 0);
        }
        return clone.multiplyFactor(1 / clone.getNorm());
    };
    /**
     * Returns a copy of this.
     */
    Vector2D.prototype.clone = function () {
        return new Vector2D(this.x, this.y);
    };
    /**
     * Returns a printable (rounded) string representation of this point object.
     */
    Vector2D.prototype.toString = function () {
        return "Vector2D (" + this.x.toFixed(3) + ", " + this.x.toFixed(3) + ")";
    };
    return Vector2D;
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
    function SpaceObject(gameSize, position, orientation, velocity, size, energy) {
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
            this.position.x += this.gameSize.x + 2 * margin;
            this.points = this.points.map(function (p) {
                p.x += _this.gameSize.x + 2 * margin;
                return p;
            });
        }
        else if (this.position.x > this.gameSize.x + margin) {
            this.position.x -= this.gameSize.x + 2 * margin;
            this.points = this.points.map(function (p) {
                p.x -= _this.gameSize.x + 2 * margin;
                return p;
            });
        }
        if (this.position.y < -margin) {
            this.position.y += this.gameSize.y + 2 * margin;
            this.points = this.points.map(function (p) {
                p.y += _this.gameSize.y + 2 * margin;
                return p;
            });
        }
        else if (this.position.y > this.gameSize.y + margin) {
            this.position.y -= this.gameSize.y + 2 * margin;
            this.points = this.points.map(function (p) {
                p.y -= _this.gameSize.y + 2 * margin;
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
        // test for thit with postion and points
        if (Vector2D.getDistance(this.position, object.position) < this.size + object.size) {
            // TODO: exact hit test
            return true;
        }
        return false;
    };
    /**
     * React to a hit by another object.
     * @param object
     */
    SpaceObject.prototype.hitBy = function (object) {
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
        drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
    };
    /**
     * Returns a string representation of this object.
     */
    SpaceObject.prototype.toString = function () {
        return "SpaceObject (\nposition: " + this.position.toString() + ",\nvelocity: " + this.velocity.toString() + ",\norientation: " + this.orientation.toFixed(2) + ",\nenergy: " + this.energy + "\n";
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
    function Spaceship(gameSize, position, orientation, velocity, size, energy, power) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
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
            var damage = object.energy * (magnitude / 50);
            if (this.shield >= damage) {
                // shield blocks damage
                this.shield -= damage;
                damage = 0;
            }
            else {
                // shield blocks some damage
                damage -= this.shield;
                this.shield = 0;
            }
            this.energy -= damage;
            // give some damage to asteroid too
            var ownDamage = 0.01 * (this.shield + this.energy / 100) / object.energy;
            object.energy -= ownDamage;
        }
    };
    /**
     * Shoots a new Shot object.
     */
    Spaceship.prototype.shoot = function () {
        // velocity mixes ship velocity and ship orientation
        var velocity = this.getOrientationVector()
            .multiplyFactor(2)
            .add(this.velocity.clone().getDirection())
            .multiplyFactor(5);
        var shot = new Shot(this.gameSize, this.position.clone(), this.orientation, velocity, 3, this.power);
        this.shots.push(shot);
    };
    /**
     * Shoots a laser.
     */
    Spaceship.prototype.laser = function () {
        // TODO: immediate shot in straight line
        var direction = this.getOrientationVector();
        var polygon = [
            this.position,
            direction.multiplyFactor(2000).add(this.position)
        ];
        // drawPolygon(ctx, this.points, this.strokeStyle, this.fillStyle);
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
            drawCircle(ctx, this.position, this.size + 2, "rgba(0, 255, 255, " + this.shield / 100 + ")", "rgba(0, 0, 0, 0)");
        }
        // draw ship
        drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
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
    function Shot(gameSize, position, orientation, velocity, size, energy) {
        return _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
    }
    /**
     * Decrease energy overtime
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
        drawCircle(ctx, this.position, this.size, color, color);
    };
    Shot.decayRate = 0.01;
    Shot.strokeStyle = "#0f0";
    Shot.fillStyle = "#0f0";
    return Shot;
}(SpaceObject));
/**
 * Asteroid class.
 */
var Asteroid = /** @class */ (function (_super) {
    __extends(Asteroid, _super);
    function Asteroid(gameSize, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        // circle by using random angles and radii
        _this.points = [];
        var number = ~~random(5, 20);
        var step = 2 * Math.PI / number;
        var angle = 0;
        for (var i = 0; i <= number; i++) {
            var radius = random(_this.size * 0.3, _this.size * 1.3);
            var x = _this.position.x + _this.size * Math.cos(angle);
            var y = _this.position.y + _this.size * Math.sin(angle);
            _this.points.push(new Vector2D(x, y));
            angle += random(step * 0.5, step * 2);
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
        else if (object instanceof Asteroid) {
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
        var numberChildren = ~~random(2, 6);
        var children = [];
        for (var i = 0; i < numberChildren; i++) {
            var energy = void 0, energyFraction = void 0, size = void 0;
            if (i !== numberChildren - 1 && this.energy > 50) {
                // children share energy
                energyFraction = random(0, 0.5);
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
            var child = new Asteroid(this.gameSize, this.position.clone().add(Vector2D.randomVector(-1, 1, -1, 1)), this.orientation, this.velocity.clone().add(Vector2D.randomVector(-1, 1, -1, 1)), size, energy);
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
        if (random(0, 1) < 0.25) {
            return null;
        }
        return new Drop(this.gameSize, this.position.clone().add(Vector2D.randomVector(-2, 2, -2, 2)), this.orientation, this.velocity.clone().add(Vector2D.randomVector(-2, 2, -2, 2)), 10, 100);
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
        // drawCircle(ctx, this.position, this.size, Asteroid.strokeStyle, Asteroid.fillStyle);
        drawPolygon(ctx, this.points, Asteroid.strokeStyle, Asteroid.fillStyle);
        ctx.fillStyle = "#fff";
        ctx.fillText((~~this.energy).toString(), this.position.x, this.position.y);
    };
    Asteroid.strokeStyle = "#fff";
    Asteroid.fillStyle = "rgba(255, 255, 255, 0.2)";
    return Asteroid;
}(SpaceObject));
/**
 * Drops are boni for the ship to collect.
 * They may have adverse effects.
 */
var Drop = /** @class */ (function (_super) {
    __extends(Drop, _super);
    function Drop(gameSize, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        var effectTypes = ["energy", "power", "shield", "life", "score"];
        var r = ~~random(0, effectTypes.length);
        _this.effectType = effectTypes[r];
        switch (_this.effectType) {
            case "energy":
                _this.effect = 10 * ~~random(-6, 11);
                _this.color = "0, 0, 255";
                break;
            case "power":
                _this.effect = ~~random(-6, 11);
                _this.color = "0, 255, 0";
                break;
            case "shield":
                _this.effect = ~~random(500, 1000);
                _this.color = "255, 255, 0";
                break;
            case "life":
                _this.effect = 1;
                _this.color = "255, 0, 0";
                break;
            case "score":
                _this.effect = ~~random(-1000, 10000);
                _this.color = "255, 215, 0";
                break;
            default:
                break;
        }
        if (!_this.effectType) {
            console.log(r);
        }
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
        ctx.fillText(this.effectType + " " + this.effect, this.position.x, this.position.y + 10);
    };
    Drop.decayRate = 0.001;
    return Drop;
}(SpaceObject));
// #endregion space objects 
