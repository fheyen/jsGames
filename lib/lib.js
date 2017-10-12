"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function random(min, max) {
    return min + (Math.random() * (max - min));
}
exports.random = random;
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
exports.drawPolygon = drawPolygon;
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
exports.drawCircle = drawCircle;
