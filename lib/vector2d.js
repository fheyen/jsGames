"use strict";
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
        var x = lib.random(minX, maxX);
        var y = lib.random(minY, maxY);
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
        return Math.hypot(this.x, this.y);
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
