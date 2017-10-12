"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lib = require("../lib/lib.js");
var vector2d_js_1 = require("../lib/vector2d.js");
var Asteroids = (function () {
    function Asteroids() {
        this.gameSize = new vector2d_js_1.default(window.innerWidth, window.innerHeight);
        this.intervalTime = 20;
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "20px Consolas";
        this.ctx.textAlign = "center";
        this.ctx.shadowColor = "#000";
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.reset();
    }
    Asteroids.prototype.reset = function () {
        this.timeElapsed = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameRunning = false;
        var size = Math.min(this.gameSize.x, this.gameSize.y) / 20;
        var position = new vector2d_js_1.default(this.gameSize.x / 2, this.gameSize.y / 2);
        var orientation = 0;
        var velocity = new vector2d_js_1.default(0, 0);
        var power = 10;
        this.ship = new Spaceship(this.gameSize, position, orientation, velocity, size, 100, power);
        this.asteroids = [];
        var number = 3;
        for (var i = 0; i < number; i++) {
            var aPos = vector2d_js_1.default.randomVector(0, this.gameSize.x, 0, this.gameSize.y);
            var aVelocity = vector2d_js_1.default.randomVector(-1, 1, -1, 1);
            var aSize = lib.random(50, 100);
            var aEnergy = Math.pow(aSize, 2) / 5;
            var a = new Asteroid(this.gameSize, aPos, 0, aVelocity, aSize, aEnergy);
            this.asteroids.push(a);
        }
        this.drops = [];
        this.updateUI(false);
        this.showMessages("Asteroids", "~~~ new game ~~~", "", "press <space> to start and fire", "press <p> to pause", "press <⯅> or <⯆> to move the ship", "press <⯇> or <⯈> to rotate the ship", "press <F5> to reset");
    };
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
    Asteroids.prototype.pauseGame = function () {
        if (this.gameOver || !this.gameRunning) {
            return;
        }
        this.gameRunning = false;
        clearInterval(this.interval);
        this.fadeUI();
        this.showMessages("Asteroids", "~~~ paused ~~~", "", "press <space> continue", "press <F5> to reset");
    };
    Asteroids.prototype.resumeGame = function () {
        if (this.gameOver || this.gameRunning) {
            return;
        }
        this.gameRunning = true;
        this.interval = setInterval(this.animate, this.intervalTime, this);
    };
    Asteroids.prototype.endGame = function (won) {
        this.gameOver = true;
        clearInterval(this.interval);
        this.fadeUI();
        this.showMessages(won ? "~~~ you won! ~~~" : "~~~ game over! ~~~", "", "total time survived: " + ~~(this.timeElapsed / 1000) + " seconds", "total score: " + ~~(this.score), "", "press <F5> to restart");
    };
    Asteroids.prototype.keyDown = function (event) {
        event.preventDefault();
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                if (!this.gameStarted || !this.gameRunning) {
                    return;
                }
                else {
                    event.key === "ArrowUp" ? this.ship.increaseVelocity() : this.ship.decreaseVelocity();
                }
                break;
            case "ArrowLeft":
            case "ArrowRight":
                if (!this.gameStarted || !this.gameRunning) {
                    return;
                }
                else {
                    var angle = 10 * Math.PI / 180;
                    event.key === "ArrowLeft" ? this.ship.rotate(-angle) : this.ship.rotate(angle);
                }
                break;
            case " ":
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
    Asteroids.prototype.animate = function (_this) {
        var as = _this.asteroids;
        if (as.length === 0) {
            _this.endGame(true);
            return;
        }
        _this.timeElapsed += _this.intervalTime;
        _this.score += _this.intervalTime / 3000;
        as.forEach(function (o) { return o.animate(); });
        _this.ship.animate();
        _this.ship.shots.forEach(function (s) { return s.animate(); });
        _this.drops.forEach(function (d) { return d.animate(); });
        var crashed = false;
        for (var i = 0; i < as.length; i++) {
            if (_this.ship.isHit(as[i])) {
                crashed = true;
                _this.ship.hitBy(as[i]);
                if (_this.ship.isDestroyed()) {
                    _this.ship.lifes--;
                    if (_this.ship.lifes <= 0) {
                        _this.endGame(false);
                        return;
                    }
                    else {
                        _this.ship.energy = 1000;
                    }
                }
            }
        }
        var deltaScore = 0;
        for (var i = 0; i < as.length; i++) {
            var asteroid = as[i];
            for (var j_1 = 0; j_1 < _this.ship.shots.length; j_1++) {
                var shot = _this.ship.shots[j_1];
                if (asteroid.isHit(shot)) {
                    var _a = asteroid.hitBy(shot), drop = _a[0], children = _a[1];
                    if (drop !== null) {
                        _this.drops.push(drop);
                    }
                    if (children !== null) {
                        _this.asteroids = _this.asteroids.concat(children);
                    }
                    if (asteroid.isDestroyed()) {
                        deltaScore += asteroid.originalEnergy;
                    }
                }
            }
        }
        _this.score += deltaScore;
        for (var i = 0; i < as.length; i++) {
            var asteroid1 = as[i];
            for (var j = 0; j < as.length; j++) {
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
        for (var i = 0; i < _this.drops.length; i++) {
            if (_this.ship.isHit(_this.drops[i])) {
                _this.drops[i].collect(_this.ship, _this);
            }
        }
        _this.ship.decay();
        _this.ship.shots.forEach(function (s) { return s.decay(); });
        _this.drops.forEach(function (d) { return d.decay(); });
        _this.asteroids = _this.asteroids.filter(function (a) { return !a.isDestroyed(); });
        _this.ship.shots = _this.ship.shots.filter(function (s) { return !s.isDestroyed(); });
        _this.drops = _this.drops.filter(function (d) { return !d.isDestroyed(); });
        _this.updateUI();
        if (crashed) {
            _this.fadeUI("rgba(255, 0, 0, 0.2)");
        }
    };
    Asteroids.prototype.createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.gameSize.x;
        canvas.height = this.gameSize.y;
        document.getElementsByTagName("body")[0].appendChild(canvas);
        return canvas;
    };
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
    Asteroids.prototype.updateUI = function (drawShip) {
        var _this = this;
        if (drawShip === void 0) { drawShip = true; }
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.asteroids.forEach(function (o) { return o.draw(_this.ctx); });
        if (drawShip) {
            this.ship.draw(this.ctx);
        }
        this.drops.forEach(function (d) { return d.draw(_this.ctx); });
        this.ship.shots.forEach(function (s) { return s.draw(_this.ctx); });
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("lifes: " + "♥".repeat(~~this.ship.lifes) + "  ~  energy: " + ~~this.ship.energy + "  ~  power: " + ~~this.ship.power + "  ~  shield: " + ~~this.ship.shield + "  ~  score: " + ~~this.score + "  ~  time: " + ~~(this.timeElapsed / 1000), this.canvas.width / 2, 25);
    };
    Asteroids.prototype.fadeUI = function (color) {
        if (color === void 0) { color = "rgba(0, 0, 0, 0.5)"; }
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.gameSize.x, this.gameSize.y);
        this.ctx.restore();
    };
    Asteroids.prototype.remove = function () {
        this.canvas.remove();
    };
    return Asteroids;
}());
var SpaceObject = (function () {
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
    SpaceObject.prototype.getOrientationVector = function () {
        return vector2d_js_1.default.getUnitVectorFromOrientation(this.orientation);
    };
    SpaceObject.prototype.animate = function () {
        this.translate(this.velocity);
    };
    SpaceObject.prototype.translate = function (vector) {
        var _this = this;
        this.position.translateV(vector);
        this.points.forEach(function (p) { return p.translateV(vector); });
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
    SpaceObject.prototype.rotate = function (angle) {
        var _this = this;
        this.orientation += angle;
        this.points.forEach(function (p) { return p.rotate(_this.position.x, _this.position.y, angle); });
    };
    SpaceObject.prototype.isHit = function (object) {
        if (vector2d_js_1.default.getDistance(this.position, object.position) < this.size + object.size) {
            return true;
        }
        return false;
    };
    SpaceObject.prototype.hitBy = function (object) {
        console.log("hit by");
        console.log(object);
    };
    SpaceObject.prototype.isDestroyed = function () {
        return this.energy <= 1;
    };
    SpaceObject.prototype.draw = function (ctx) {
        lib.drawCircle(ctx, this.position, this.size, SpaceObject.strokeStyle, SpaceObject.fillStyle);
    };
    SpaceObject.prototype.toString = function () {
        return "SpaceObject (\nposition: " + this.position.toString() + ",\nvelocity: " + this.velocity.toString() + ",\norientation: " + this.orientation.toFixed(2) + ",\nenergy: " + this.energy + "\n";
    };
    SpaceObject.strokeStyle = "#fff";
    SpaceObject.fillStyle = "rgba(255, 255, 255, 0.2)";
    return SpaceObject;
}());
var Spaceship = (function (_super) {
    tslib_1.__extends(Spaceship, _super);
    function Spaceship(gameSize, position, orientation, velocity, size, energy, power) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        _this.power = power;
        _this.shots = [];
        _this.lifes = 3;
        _this.shield = 0;
        var _a = _this.position, x = _a.x, y = _a.y;
        _this.points = [
            new vector2d_js_1.default(x + size, y),
            new vector2d_js_1.default(x - 0.75 * size, y - 0.6 * size),
            new vector2d_js_1.default(x - 0.2 * size, y),
            new vector2d_js_1.default(x - 0.75 * size, y + 0.6 * size),
        ];
        return _this;
    }
    Spaceship.prototype.hitBy = function (object) {
        if (object instanceof Asteroid) {
            var magnitude = vector2d_js_1.default.getDistance(this.velocity, object.velocity);
            var damage = object.energy * (magnitude / 50);
            if (this.shield >= damage) {
                this.shield -= damage;
                damage = 0;
            }
            else {
                damage -= this.shield;
                this.shield = 0;
            }
            this.energy -= damage;
            var ownDamage = 0.01 * (this.shield + this.energy / 100) / object.energy;
            object.energy -= ownDamage;
        }
    };
    Spaceship.prototype.shoot = function () {
        var velocity = this.getOrientationVector()
            .multiplyFactor(2)
            .add(this.velocity.clone().getDirection())
            .multiplyFactor(5);
        var shot = new Shot(this.gameSize, this.position.clone(), this.orientation, velocity, 3, this.power);
        this.shots.push(shot);
    };
    Spaceship.prototype.decay = function () {
        this.shield = Math.max(0, this.shield - Spaceship.decayRate);
    };
    Spaceship.prototype.increaseVelocity = function () {
        var direction = this.getOrientationVector();
        var delta = direction.multiplyFactor(Spaceship.acceleration);
        this.velocity.add(delta);
    };
    Spaceship.prototype.decreaseVelocity = function () {
        var direction = this.getOrientationVector();
        var delta = direction.multiplyFactor(-Spaceship.acceleration);
        this.velocity.add(delta);
    };
    Spaceship.prototype.draw = function (ctx) {
        if (this.shield > 0) {
            lib.drawCircle(ctx, this.position, this.size + 2, "rgba(0, 255, 255, " + this.shield / 100 + ")", "rgba(0, 0, 0, 0)");
        }
        lib.drawPolygon(ctx, this.points, Spaceship.strokeStyle, Spaceship.fillStyle);
    };
    Spaceship.decayRate = 0.1;
    Spaceship.acceleration = 1;
    Spaceship.strokeStyle = "#0ff";
    Spaceship.fillStyle = "#0ff";
    return Spaceship;
}(SpaceObject));
var Shot = (function (_super) {
    tslib_1.__extends(Shot, _super);
    function Shot(gameSize, position, orientation, velocity, size, energy) {
        return _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
    }
    Shot.prototype.decay = function () {
        this.energy -= Shot.decayRate * this.originalEnergy;
    };
    Shot.prototype.draw = function (ctx) {
        if (this.energy < 0) {
            return;
        }
        var color = "rgba(0, 255, 0, " + this.energy / this.originalEnergy + ")";
        lib.drawCircle(ctx, this.position, this.size, color, color);
    };
    Shot.decayRate = 0.01;
    Shot.strokeStyle = "#0f0";
    Shot.fillStyle = "#0f0";
    return Shot;
}(SpaceObject));
var Asteroid = (function (_super) {
    tslib_1.__extends(Asteroid, _super);
    function Asteroid(gameSize, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        _this.points = [];
        var number = ~~lib.random(5, 20);
        var step = 2 * Math.PI / number;
        var angle = 0;
        for (var i = 0; i <= number; i++) {
            var radius = lib.random(_this.size * 0.8, _this.size * 1.1);
            var x = _this.position.x + radius * Math.cos(angle);
            var y = _this.position.y + radius * Math.sin(angle);
            _this.points.push(new vector2d_js_1.default(x, y));
            angle += lib.random(step * 0.5, step * 2);
            if (angle > 2 * Math.PI) {
                break;
            }
        }
        return _this;
    }
    Asteroid.prototype.hitBy = function (object) {
        if (object instanceof Shot) {
            this.energy -= object.energy;
            object.energy = 0;
            if (this.isDestroyed()) {
                return [this.createDrops(), null];
            }
            else if (this.energy > 100 && this.energy <= 0.5 * this.originalEnergy) {
                return [this.createDrops(), this.split()];
            }
            else {
                return [null, null];
            }
        }
        else if (object instanceof Asteroid) {
            var direction = this.position.clone()
                .subtr(object.position.clone())
                .getDirection();
            var speed = this.velocity.getNorm();
            this.velocity = this.velocity.add(direction)
                .getDirection()
                .multiplyFactor(speed);
        }
    };
    Asteroid.prototype.split = function () {
        var numberChildren = ~~lib.random(2, 6);
        var children = [];
        for (var i = 0; i < numberChildren; i++) {
            var energy = void 0, energyFraction = void 0, size = void 0;
            if (i !== numberChildren - 1 && this.energy > 50) {
                energyFraction = lib.random(0, 0.5);
                energy = this.energy * energyFraction;
                size = this.size * energyFraction;
                this.energy -= energy;
                this.size -= size;
            }
            else {
                energy = this.energy;
                size = this.size;
                this.energy = 0;
                this.size = 0;
            }
            var child = new Asteroid(this.gameSize, this.position.clone().add(vector2d_js_1.default.randomVector(-1, 1, -1, 1)), this.orientation, this.velocity.clone().add(vector2d_js_1.default.randomVector(-1, 1, -1, 1)), size, energy);
            children.push(child);
        }
        return children;
    };
    Asteroid.prototype.createDrops = function () {
        if (lib.random(0, 1) < 0.25) {
            return null;
        }
        return new Drop(this.gameSize, this.position.clone().add(vector2d_js_1.default.randomVector(-2, 2, -2, 2)), this.orientation, this.velocity.clone().add(vector2d_js_1.default.randomVector(-2, 2, -2, 2)), 10, 100);
    };
    Asteroid.prototype.draw = function (ctx) {
        if (this.energy < 0) {
            return;
        }
        lib.drawPolygon(ctx, this.points, Asteroid.strokeStyle, Asteroid.fillStyle);
        ctx.fillStyle = "#fff";
        ctx.fillText((~~this.energy).toString(), this.position.x, this.position.y);
    };
    Asteroid.strokeStyle = "#fff";
    Asteroid.fillStyle = "rgba(255, 255, 255, 0.2)";
    return Asteroid;
}(SpaceObject));
var Drop = (function (_super) {
    tslib_1.__extends(Drop, _super);
    function Drop(gameSize, position, orientation, velocity, size, energy) {
        var _this = _super.call(this, gameSize, position, orientation, velocity, size, energy) || this;
        var effectTypes = ["energy", "power", "shield", "life", "score"];
        var r = ~~lib.random(0, effectTypes.length);
        _this.effectType = effectTypes[r];
        switch (_this.effectType) {
            case "energy":
                _this.effect = 10 * ~~lib.random(-6, 11);
                _this.color = "0, 0, 255";
                break;
            case "power":
                _this.effect = ~~lib.random(-6, 11);
                _this.color = "0, 255, 0";
                break;
            case "shield":
                _this.effect = ~~lib.random(500, 1000);
                _this.color = "255, 255, 0";
                break;
            case "life":
                _this.effect = 1;
                _this.color = "255, 0, 0";
                break;
            case "score":
                _this.effect = ~~lib.random(-1000, 10000);
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
    Drop.prototype.decay = function () {
        this.energy -= Drop.decayRate * this.originalEnergy;
    };
    Drop.prototype.collect = function (collector, game) {
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
        this.energy = 0;
    };
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
var game;
function keyDownAsteroids(event) {
    switch (event.key) {
        case "F5":
            return;
        case "F11":
            return;
        case "F12":
            return;
        default:
            if (game) {
                game.keyDown(event);
            }
    }
}
function initAsteroids() {
    if (game) {
        game.remove();
    }
    game = new Asteroids();
}
