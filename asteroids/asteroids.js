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
    Asteroids.prototype.reset = function () {
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        // create ship
        var size = Math.min(this.gameSize.x, this.gameSize.y) / 12;
        var position = new Vector2D(this.gameSize.x / 2, this.gameSize.y / 2);
        var orientation = 0;
        var velocity = new Vector2D(0, 0);
        this.ship = new Spaceship(this.gameSize, position, orientation, velocity, size, 100);
        // create asteroids
        this.asteroids = [];
        var number = 5;
        for (var i = 0; i < number; i++) {
            var aPos = Vector2D.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
            var aVelocity = Vector2D.randomVector(-5, 5, -5, 5);
            var aSize = random(30, 100);
            var a = new Asteroid(this.gameSize, aPos, 0, aVelocity, aSize, 50);
            this.asteroids.push(a);
        }
        // draw UI
        this.updateUI();
        this.showMessages("Asteroids", "~~~ new game ~~~", "", "press <space> to start and fire", "press <p> to pause", "press <⯅> or <⯆> to move the ship", "press <⯇> or <⯈> to rotate the ship", "press <F5> to reset");
    };
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
        this.showMessages("Copter", "~~~ paused ~~~", "", "press <space> continue", "press <F5> to reset");
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
    Asteroids.prototype.endGame = function () {
        this.gameOver = true;
        clearInterval(this.interval);
        this.updateUI();
        this.showMessages("~~~ game over! ~~~", "", "total time survived: " + ~~(this.timeElapsed / 1000), "", "press <F5> to restart");
    };
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
                    var angle = 30 * Math.PI / 180;
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
        // update elapsed time
        _this.timeElapsed += _this.intervalTime;
        // update ship position
        _this.ship.animate();
        // animate asteroids
        as.forEach(function (o) { return o.animate(); });
        // test for crash
        for (var i = 0; i < as.length; i++) {
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
        _this.ship.shots.forEach(function (s) { return s.animate(); });
        // remove ceased shots
        _this.ship.shots = _this.ship.shots.filter(function (s) { return !s.isDestroyed(); });
        // TODO: test shots and asteroids for collisions
        var destroyedObject = null;
        // TODO: score
        // _this.score += destroyedObject.originalEnergy;
        // draw game
        _this.updateUI();
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
     */
    Asteroids.prototype.updateUI = function () {
        var _this = this;
        // background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // asteroids
        this.asteroids.forEach(function (o) { return o.draw(_this.ctx); });
        // ship
        this.ship.draw(this.ctx);
        // shots
        this.ship.shots.forEach(function (s) { return s.draw(_this.ctx); });
        // ship energy, time
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("energy: " + ~~this.ship.energy + " time " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
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
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.stroke();
    ctx.fill();
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
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}
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
     * Tranlates this object by a vector
     * @param vector
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
     * @param angle
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
        return false;
    };
    /**
     * React to a hit by another object.
     * @param object
     */
    SpaceObject.prototype.hitBy = function (object) {
        // TODO: damage should depend on velocity difference
        var diff = this.velocity.clone().add(object.velocity.multiplyFactor(-1));
        var magnitude = diff.getNorm();
        // TODO: use magnitude
        var impactEnergy = object.energy;
        object.energy -= this.energy;
        this.energy -= impactEnergy;
        this.reactToHit(object);
    };
    /**
     * Sub-class specific reaction to hits.
     * @param object
     */
    SpaceObject.prototype.reactToHit = function (object) {
        // TODO: asteroids should split if low energy
        // TODO: asteroids should be pushed away by hits
    };
    /**
     * Returns true if energy is lower than 0.
     */
    SpaceObject.prototype.isDestroyed = function () {
        return this.energy < 0;
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
var Spaceship = /** @class */ (function (_super) {
    __extends(Spaceship, _super);
    function Spaceship(gameSize, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        _this.shots = [];
        // create shape
        var _a = _this.position, x = _a.x, y = _a.y;
        _this.points = [
            new Vector2D(x + 0.5 * size, y),
            new Vector2D(x - 0.5 * size, y - 0.5 * size),
            new Vector2D(x - 0.2 * size, y),
            new Vector2D(x - 0.5 * size, y + 0.5 * size),
        ];
        return _this;
    }
    /**
     * Shoots a new Shot object.
     */
    Spaceship.prototype.shoot = function () {
        // velocity mixes ship velocity and ship orientation
        var velocity = this.getOrientationVector()
            .multiplyFactor(2)
            .add(this.velocity.clone().getDirection())
            .multiplyFactor(5);
        var shot = new Shot(this.gameSize, this.position.clone(), this.orientation, velocity, 3, 3);
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
        drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
        drawCircle(ctx, this.position, 5, "#000", "#fff");
    };
    Spaceship.acceleration = 2;
    Spaceship.strokeStyle = "#0ff";
    Spaceship.fillStyle = "#0ff";
    return Spaceship;
}(SpaceObject));
var Shot = /** @class */ (function (_super) {
    __extends(Shot, _super);
    function Shot(gameSize, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        _this.originalEnergy = energy;
        return _this;
    }
    /**
     * @overwrite
     * Moves this object by its velocity.
     */
    Shot.prototype.animate = function () {
        this.translate(this.velocity);
        this.energy -= Shot.decayRate;
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
        drawCircle(ctx, this.position, this.energy, Shot.strokeStyle, Shot.fillStyle);
    };
    Shot.decayRate = 0.05;
    Shot.strokeStyle = "#0f0";
    Shot.fillStyle = "#0f0";
    return Shot;
}(SpaceObject));
var Asteroid = /** @class */ (function (_super) {
    __extends(Asteroid, _super);
    function Asteroid(gameSize, position, orientation, velocity, size, energy) {
        return _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
    }
    /**
     * Split into 2 to 5 smaller asteroids that share the energy.
     */
    Asteroid.prototype.split = function () {
        return [];
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
        drawCircle(ctx, this.position, this.energy, Asteroid.strokeStyle, Asteroid.fillStyle);
        ctx.fillStyle = "#fff";
        ctx.fillText(this.energy.toFixed(2).toString(), this.position.x, this.position.y);
    };
    Asteroid.strokeStyle = "#fff";
    Asteroid.fillStyle = "rgba(255, 255, 255, 0.2)";
    return Asteroid;
}(SpaceObject));
