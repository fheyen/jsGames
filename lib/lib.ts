const lib = {
    /**
 * Returns a pseudorandom number in [min, max)
 */
    random(min: number, max: number): number {
        return min + (Math.random() * (max - min));
    },

    // TODO: addCanvas()

    // TODO: showMessages(messages, color)

    /**
     * Draws a polygon onto ctx.
     * @param ctx canvas context
     * @param points points
     * @param stroke stroke style
     * @param fill fill style
     */
    drawPolygon(ctx: CanvasRenderingContext2D, points: Array<Vector2D>, stroke: string, fill: string): void {
        if (points === undefined || points.length < 3) {
            return;
        }
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
    },

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
    drawCircle(ctx: CanvasRenderingContext2D, center: Vector2D, radius: number, stroke: string, fill: string, startAngle: number = 0, endAngle: number = 2 * Math.PI): void {
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
}