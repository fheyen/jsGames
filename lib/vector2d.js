"use strict";
/**
 * Vector class for 2D points and vectors.
 */
class Vector2D {
    /**
     * @param {number} x x-coordinate
     * @param {number} y y-coordinate
     */
    constructor(x, y) {
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
    static randomVector(minX, maxX, minY, maxY) {
        let x = lib.random(minX, maxX);
        let y = lib.random(minY, maxY);
        return new Vector2D(x, y);
    }
    /**
     * Returns a new unit vector poiting in the direction of orientation
     * @param orientation
     */
    static getUnitVectorFromOrientation(orientation) {
        return new Vector2D(Math.cos(orientation), Math.sin(orientation));
    }
    /**
     * Returns the distance if two points.
     * @param vector1 point 1
     * @param vector2 point 2
     */
    static getDistance(vector1, vector2) {
        return vector1.clone().subtr(vector2.clone()).getNorm();
    }
    // endregion statics
    /**
     * Translates the point by dx and dy.
     * @param {number} dx translation of x-coordinate
     * @param {number} dy translation of y-coordinate
     */
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    }
    /**
     * Translates this vector by another vector.
     * @param vector translation vector
     */
    translateV(vector) {
        return this.translate(vector.x, vector.y);
    }
    /**
     * Rotates the point around a center at (cx, cy) by angle.
     * @param {number} cx center point x
     * @param {number} cy center point y
     * @param {number} angle rotation angle
     */
    rotate(cx, cy, angle) {
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
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    /**
     * Subtract a vector to this.
     * @param vector
     */
    subtr(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    /**
     * Multiplies a factor to this.
     * @param factor
     */
    multiplyFactor(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }
    /**
     * Returns the Euklidean norm of this vector.
     */
    getNorm() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    /**
     * Returns a normalized unit vector copy of this.
     */
    getDirection() {
        let clone = this.clone();
        if (clone.getNorm() === 0) {
            return new Vector2D(0, 0);
        }
        return clone.multiplyFactor(1 / clone.getNorm());
    }
    /**
     * Returns a copy of this.
     */
    clone() {
        return new Vector2D(this.x, this.y);
    }
    /**
     * Returns a printable (rounded) string representation of this point object.
     */
    toString() {
        return `Vector2D (${this.x.toFixed(3)}, ${this.x.toFixed(3)})`;
    }
}
