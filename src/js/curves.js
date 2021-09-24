function Curve(gl, meshProgramInfo) {

    this.points = [
        new Point(gl, meshProgramInfo, [-100, 0, 0], true),
        new Point(gl, meshProgramInfo, [0, 100, 0], true),
        new Point(gl, meshProgramInfo, [0, -100, 0], true),
        new Point(gl, meshProgramInfo, [100, 0, 0], true)
    ];

    this.interpolation = [];
    this.pts = [];
    this.e = null;
}

class Point {

    constructor(gl, meshProgramInfo, position, original) {
        this.buffer = flattenedPrimitives.createSphereBufferInfo(gl, original? 6 : 2, 10, 10);
        this.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.buffer);
        this.position = position;

        if (original) {
            this.uniforms.u_colorMult = [1, 0, 0, 1];
        }
    }

    uniforms = {
        u_colorMult: [0, 0, 0, 1],
        u_matrix: m4.identity()
    };

    position = [0, 0, 0];
    buffer;
    VAO;
}

const curves = []

function getPointOnBezierCurve(points, t) {
    const invT = (1 - t);

    return v2.add(v2.mult(points[0], invT * invT * invT),
        v2.mult(points[1], 3 * t * invT * invT),
        v2.mult(points[2], 3 * invT * t * t),
        v2.mult(points[3], t * t * t));
}

function getPointsOnBezierCurve(points, numPoints) {
    const cpoints = [];
    for (let i = 0; i < numPoints; ++i) {
        const t = i / (numPoints - 1);
        cpoints.push(getPointOnBezierCurve(points, t));
    }
    return cpoints;
}