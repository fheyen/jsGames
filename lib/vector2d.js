"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib = require("./lib.js");
var Vector2D = (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2D.randomVector = function (minX, maxX, minY, maxY) {
        var x = lib.random(minX, maxX);
        var y = lib.random(minY, maxY);
        return new Vector2D(x, y);
    };
    Vector2D.getUnitVectorFromOrientation = function (orientation) {
        return new Vector2D(Math.cos(orientation), Math.sin(orientation));
    };
    Vector2D.getDistance = function (vector1, vector2) {
        return vector1.clone().subtr(vector2.clone()).getNorm();
    };
    Vector2D.prototype.translate = function (dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    };
    Vector2D.prototype.translateV = function (vector) {
        return this.translate(vector.x, vector.y);
    };
    Vector2D.prototype.rotate = function (cx, cy, angle) {
        this.translate(-cx, -cy);
        var x = this.x;
        var y = this.y;
        this.x = Math.cos(angle) * x - Math.sin(angle) * y;
        this.y = Math.sin(angle) * x + Math.cos(angle) * y;
        this.translate(cx, cy);
        return this;
    };
    Vector2D.prototype.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };
    Vector2D.prototype.subtr = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };
    Vector2D.prototype.multiplyFactor = function (factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };
    Vector2D.prototype.getNorm = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    Vector2D.prototype.getDirection = function () {
        var clone = this.clone();
        if (clone.getNorm() === 0) {
            return new Vector2D(0, 0);
        }
        return clone.multiplyFactor(1 / clone.getNorm());
    };
    Vector2D.prototype.clone = function () {
        return new Vector2D(this.x, this.y);
    };
    Vector2D.prototype.toString = function () {
        return "Vector2D (" + this.x.toFixed(3) + ", " + this.x.toFixed(3) + ")";
    };
    return Vector2D;
}());
exports.default = Vector2D;
