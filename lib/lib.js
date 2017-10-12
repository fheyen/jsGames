"use strict";
var lib = {
    random: function (min, max) {
        return min + (Math.random() * (max - min));
    },
    drawPolygon: function (ctx, points, stroke, fill) {
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
    drawCircle: function (ctx, center, radius, stroke, fill, startAngle, endAngle) {
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
};
