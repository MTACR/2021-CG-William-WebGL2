function Curve(gl, meshProgramInfo) {

    this.points = [
        new Point(gl, meshProgramInfo, [-100, 0, 0], true),
        new Point(gl, meshProgramInfo, [0, 100, 0], true),
        new Point(gl, meshProgramInfo, [0, -100, 0], true),
        new Point(gl, meshProgramInfo, [100, 0, 0], true)
    ];

    this.interpolation = [];
    this.pts = [];
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

const controlsCurve = {
    New: function (gl, meshProgramInfo) {
        const curve = new Curve(gl, meshProgramInfo);
        curve.id = "Curve " + curvesCounter++;
        curves.push(curve);
        controlsCurve.Update(curve, gl, meshProgramInfo);

        const gui = new dat.GUI();
        const gui_root = gui.addFolder(curve.id);

        curve.points.forEach(function (point, i) {
            const gui_p = gui_root.addFolder("Point " + i);
            gui_p.open();
            gui_p.add(point.position, "0", -500, 500).onChange(function () {
                controlsCurve.Update(curve, gl, meshProgramInfo);
            }).name("X");
            gui_p.add(point.position, "1", -500, 500).onChange(function () {
                controlsCurve.Update(curve, gl, meshProgramInfo);
            }).name("Y");
            gui_p.add(point.position, "2", -500, 500).onChange(function () {
                controlsCurve.Update(curve, gl, meshProgramInfo);
            }).name("Z");
        })

        gui_root.add({
            Remove: function () {
                models.forEach(function (model) {
                    if (model.curve == curve.id) {
                        model.animating[2] = false;
                        model.animations.curve = null;
                        model.curve = "";
                    }
                });

                gui.destroy();
                curves.splice(curves.findIndex(x => x.id == curve.id), 1);

                controlsCurve.RefreshUI();
            }
        }, "Remove");

        controlsCurve.RefreshUI();
    },

    Update: function (curve, gl, meshProgramInfo) {
        curve.pts = [];
        curve.interpolation = [];

        curve.points.forEach(function (p) {
            curve.pts.push(p.position);
        });

        getPointsOnBezierCurve(curve.pts, 50).forEach(function (p) {
            curve.interpolation.push(new Point(gl, meshProgramInfo, p, false));
        });
    },

    RefreshUI: function () {
        models.forEach(model => {
            model.gui = model.gui.options(controlsCurve.Curves()).name("Curve").listen().onFinishChange(function () {
                if (model.animating[1] && !model.animating[3]) {
                    model.usePivot = false;
                }

                if (model.curve == "") {
                    model.animations.curve = null;
                    model.animating[2] = false;
                } else {
                    //model.animating[3] = false;
                    //model.usePivot = false;
                    //model.animations.orbit = null;

                    const curve = curves[curves.findIndex(x => x.id == model.curve)];

                    if (curve === undefined)
                        return;

                    const p = getPointOnBezierCurve(curve.pts, model.curveT >= 0 ? model.curveT : 1 + model.curveT);

                    if (model.animating[3]) {
                        model.pivot.position[0] = p[0];
                        model.pivot.position[1] = p[1];
                        model.pivot.position[2] = p[2];
                    } else {
                        model.position[0] = p[0];
                        model.position[1] = p[1];
                        model.position[2] = p[2];
                    }
                }
            });
            model.gui.updateDisplay();
        });

        cams.forEach(cam => {
            cam.gui = cam.gui.options(controlsCurve.Curves()).name("Curve").listen().onFinishChange(function () {
                if (cam.animate) {
                    cam.curve = "";
                    return;
                }

                if (cam.curve == "") {
                    //cam.animations.curve = null;
                    //cam.animating[2] = false;
                } else {
                    const curve = curves[curves.findIndex(x => x.id == cam.curve)];

                    if (curve === undefined)
                        return;

                    const p = getPointOnBezierCurve(curve.pts, cam.curveT >= 0 ? cam.curveT : 1 + cam.curveT);

                    cam.position[0] = p[0];
                    cam.position[1] = p[1];
                    cam.position[2] = p[2];
                }
            });
            cam.gui.updateDisplay();
        });
    },

    Curves: function () {
        let cs = [];

        curves.forEach(function (curve) {
            cs.push(curve.id);
        });

        cs.push("");

        return cs;
    }
}