import * as lib from "./lib.js";
/**
 * Vector class for 2D points and vectors.
 */
export default class Vector2D {
    x: number;
    y: number;

    /**
     * @param {number} x x-coordinate
     * @param {number} y y-coordinate
     */
    constructor(x: number, y: number) {
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
    static randomVector(minX: number, maxX: number, minY: number, maxY: number): Vector2D {
        let x = lib.random(minX, maxX);
        let y = lib.random(minY, maxY);
        return new Vector2D(x, y);
    }

    /**
     * Returns a new unit vector poiting in the direction of orientation
     * @param orientation
     */
    static getUnitVectorFromOrientation(orientation: number): Vector2D {
        return new Vector2D(Math.cos(orientation), Math.sin(orientation));
    }

    /**
     * Returns the distance if two points.
     * @param vector1 point 1
     * @param vector2 point 2
     */
    static getDistance(vector1: Vector2D, vector2: Vector2D): number {
        return vector1.clone().subtr(vector2.clone()).getNorm();
    }

    // endregion statics

    /**
     * Translates the point by dx and dy.
     * @param {number} dx translation of x-coordinate
     * @param {number} dy translation of y-coordinate
     */
    translate(dx: number, dy: number): Vector2D {
        this.x += dx;
        this.y += dy;
        return this;
    }

    /**
     * Translates this vector by another vector.
     * @param vector translation vector
     */
    translateV(vector: Vector2D): Vector2D {
        return this.translate(vector.x, vector.y);
    }

    /**
     * Rotates the point around a center at (cx, cy) by angle.
     * @param {number} cx center point x
     * @param {number} cy center point y
     * @param {number} angle rotation angle
     */
    rotate(cx: number, cy: number, angle: number): Vector2D {
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
    add(vector: Vector2D): Vector2D {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * Subtract a vector to this.
     * @param vector
     */
    subtr(vector: Vector2D): Vector2D {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * Multiplies a factor to this.
     * @param factor
     */
    multiplyFactor(factor: number): Vector2D {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    /**
     * Returns the Euklidean norm of this vector.
     */
    getNorm(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * Returns a normalized unit vector copy of this.
     */
    getDirection(): Vector2D {
        let clone = this.clone();
        if (clone.getNorm() === 0) {
            return new Vector2D(0, 0);
        }
        return clone.multiplyFactor(1 / clone.getNorm());
    }

    /**
     * Returns a copy of this.
     */
    clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    /**
     * Returns a printable (rounded) string representation of this point object.
     */
    toString(): string {
        return `Vector2D (${this.x.toFixed(3)}, ${this.x.toFixed(3)})`;
    }
}