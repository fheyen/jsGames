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
    Asteroids.prototype.reset = function () {
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        // create ship
        var size = Math.min(this.gameSize[0], this.gameSize[1]) / 10;
        var position = new Vector2D(this.gameSize[0] / 2, this.gameSize[1] / 2);
        var orientation = 0;
        var velocity = new Vector2D(0, 0);
        this.ship = new Spaceship(position, orientation, velocity, size, 100);
        // create asteroids
        this.asteroids = [];
        var number = 3;
        for (var i = 0; i < number; i++) {
            var aPos = Vector2D.randomVector(0, this.gameSize[0], 0, this.gameSize[1]);
            // let aVelocity = Vector2D.randomVector(-10, -10, 10, 10);
            var aVelocity = new Vector2D(0, 0);
            var aSize = random(30, 60);
            var a = new Asteroid(aPos, 0, aVelocity, aSize, 50);
            this.asteroids.push(a);
        }
        // draw UI
        this.updateUI();
        this.showMessages("Asteroids", "~~~ new game ~~~", "", "press <space> to start or pause", "press <⯅> or <⯆> to move the ship", "press <⯇> or <⯈> to rotate the ship", "press <F5> to reset");
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
        canvas.width = this.gameSize[0];
        canvas.height = this.gameSize[1];
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
        console.log(_this.ship.position);
        console.log(_this.ship.orientation);
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
        // TODO: test shots and asteroids for collisions
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
        // time elapsed
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("time " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
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
    function SpaceObject(position, orientation, velocity, size, energy) {
        this.position = position;
        this.orientation = orientation;
        this.velocity = velocity;
        this.size = size;
        this.energy = energy;
        this.fillStyle = "rgba(255, 255, 255, 0.2)";
        this.strokeStyle = "#fff";
        this.points = [];
    }
    SpaceObject.prototype.animate = function () {
        this.position.translateV(this.velocity);
    };
    // TODO: objects should reenter on the opposite site if disappearing
    SpaceObject.prototype.translate = function (vector) {
        this.position.translateV(vector);
        this.points.forEach(function (p) { return p.translateV(vector); });
    };
    SpaceObject.prototype.rotate = function (angle) {
        var _this = this;
        this.orientation += angle;
        this.points.forEach(function (p) { return p.rotate(_this.position.x, _this.position.y, angle); });
    };
    SpaceObject.prototype.isHit = function (object) {
        return false;
    };
    SpaceObject.prototype.hitBy = function (object) {
        var impactEnergy = object.energy;
        object.energy -= this.energy;
        this.energy -= impactEnergy;
        this.reactToHit(object);
    };
    SpaceObject.prototype.reactToHit = function (object) {
        // TODO: asteroids should split if low energy
        // TODO: asteroids should be pushed away by hits
    };
    SpaceObject.prototype.isDestroyed = function () {
        return this.energy < 0;
    };
    SpaceObject.prototype.draw = function (ctx) {
        ctx.save();
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    };
    SpaceObject.prototype.toString = function () {
        return "SpaceObject (\nposition: " + this.position.toString() + ",\nvelocity: " + this.velocity.toString() + ",\norientation: " + this.orientation.toFixed(2) + ",\nenergy: " + this.energy + "\n";
    };
    return SpaceObject;
}());
var Spaceship = /** @class */ (function (_super) {
    __extends(Spaceship, _super);
    function Spaceship(position, orientation, velocity, size, energy) {
        var _this = _super.call(this, position, orientation, velocity, size, energy) || this;
        _this.shots = [];
        // create shape
        var _a = _this.position, x = _a.x, y = _a.y;
        _this.points = [
            new Vector2D(x, y),
            new Vector2D(x - 2 * size, y - size / 2),
            new Vector2D(x - 2 * size, y + size / 2),
        ];
        _this.fillStyle = "#0ff";
        return _this;
    }
    Spaceship.prototype.shoot = function () {
        // TODO: velocity mixes ship velocity and ship orientation
        var velocity = new Vector2D(10, 10);
        var shot = new Shot(this.position, this.orientation, velocity, 3, 3);
    };
    Spaceship.prototype.increaseVelocity = function () {
        var direction = Vector2D.getUnitVectorFromOrientation(this.orientation);
        var delta = direction.multiplyFactor(2);
        this.velocity.add(delta);
    };
    Spaceship.prototype.decreaseVelocity = function () {
        var direction = Vector2D.getUnitVectorFromOrientation(this.orientation);
        var delta = direction.multiplyFactor(-2);
        this.velocity.add(delta);
    };
    Spaceship.prototype.draw = function (ctx) {
        drawPolygon(ctx, this.points, this.strokeStyle, this.fillStyle);
    };
    return Spaceship;
}(SpaceObject));
var Shot = /** @class */ (function (_super) {
    __extends(Shot, _super);
    function Shot(position, orientation, velocity, size, energy) {
        var _this = _super.call(this, position, orientation, velocity, size, energy) || this;
        _this.fillStyle = "#0f0";
        return _this;
    }
    return Shot;
}(SpaceObject));
var Asteroid = /** @class */ (function (_super) {
    __extends(Asteroid, _super);
    function Asteroid(position, orientation, velocity, size, energy) {
        return _super.call(this, position, orientation, velocity, size, energy) || this;
    }
    /**
     * Split into 2 to 5 smaller asteroids that share the energy.
     */
    Asteroid.prototype.split = function () {
        return [];
    };
    return Asteroid;
}(SpaceObject));
