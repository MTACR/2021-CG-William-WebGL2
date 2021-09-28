function Model(gl, meshProgramInfo, s) {

    this.buffer = s === 0 ? flattenedPrimitives.createCubeBufferInfo(gl, 20)
                : s === 1 ? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                : s === 2 ? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

    this.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.buffer);

    this.shape = [false, false, false];
    this.shape[s] = true;

    this.animationList = [];
    this.animate = false;
    this.position = [0, 0, 0];
    this.rotation = [20, 40, 0];
    this.scale = [1, 1, 1];
    this.speed = 1;
    this.curveT = 0;
    this.lookAt = false;
    this.usePivot = false;
    this.animating = [false, false, false, false];
    this.curve = "";
    this.gui = null;

    this.uniforms = {
        u_colorMult: [Math.random(), Math.random(), Math.random(), 1],
        u_matrix: m4.identity()
    };

    this.animations = {
        rotate: null,
        curve: null,
        color: null,
        orbit: null
    };

    this.pivot = {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        distance: 0,
        buffer: null,
        VAO: null,
        uniforms: {
            u_colorMult: [0, 1, 0, 1],
            u_matrix: m4.identity()
        }
    };

    this.pivot.buffer = flattenedPrimitives.createSphereBufferInfo(gl, 6, 10, 10);
    this.pivot.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.pivot.buffer);
}

const controlsModel = {
    New: function (gl, meshProgramInfo) {
        const model = new Model(gl, meshProgramInfo, Math.floor(Math.random() * 3));
        model.id = modelsCounter++;
        models.push(model);

        const gui = new dat.GUI();
        const gui_root = gui.addFolder("Object " + model.id);
        gui_root.open();

        const gui_position = gui_root.addFolder("Position");
        gui_position.open();
        gui_position.add(model.position, "0", -500, 500).name("X").listen();
        gui_position.add(model.position, "1", -500, 500).name("Y").listen();
        gui_position.add(model.position, "2", -500, 500).name("Z").listen();
        gui_position.add({
            Reset: function () {
                model.position[0] = 0;
                model.position[1] = 0;
                model.position[2] = 0;
            }
        }, "Reset");
        const gui_curve = gui_position.addFolder("Curve");
        model.gui = gui_curve.add(model, "curve", controlsCurve.Curves()).name("Curve").listen();/*.onFinishChange(function () {
            if (model.animate) {
                model.curve = "";
                return;
            }

            if (model.curve == "") {
                model.animations.curve = null;
                model.animating[2] = false;
            } else {
                const curve = curves[curves.findIndex(x => x.id == model.curve)];

                if (curve === undefined)
                    return;

                const p = getPointOnBezierCurve(curve.pts, model.curveT >= 0 ? model.curveT : 1 + model.curveT);

                model.position[0] = p[0];
                model.position[1] = p[1];
                model.position[2] = p[2];
            }
        });*/

        gui_curve.add(model, "curveT", -1, 1, 0.01).name("Curve T").listen().onChange(function () {
            if (model.curve != null) {
                const curve = curves[curves.findIndex(x => x.id == model.curve)];

                if (curve === undefined)
                    return;

                const p = getPointOnBezierCurve(curve.pts, model.curveT >= 0 ? model.curveT : 1 + model.curveT);

                model.position[0] = p[0];
                model.position[1] = p[1];
                model.position[2] = p[2];
            }
        });

        const gui_orbit = gui_position.addFolder("Orbit");
        const gui_pivot_p = gui_orbit.addFolder("Pivot");
        gui_pivot_p.open();
        gui_pivot_p.add(model.pivot.position, "0", -500, 500).name("X").listen();
        gui_pivot_p.add(model.pivot.position, "1", -500, 500).name("Y").listen();
        gui_pivot_p.add(model.pivot.position, "2", -500, 500).name("Z").listen();
        gui_pivot_p.add({
            Reset: function () {
                model.pivot.position[0] = 0;
                model.pivot.position[1] = 0;
                model.pivot.position[2] = 0;
            }
        }, "Reset");
        const gui_pivot_r = gui_orbit.addFolder("Angle");
        gui_pivot_r.open();
        gui_pivot_r.add(model.pivot.rotation, "0", -500, 500).name("X").listen();
        gui_pivot_r.add(model.pivot.rotation, "1", -500, 500).name("Y").listen();
        gui_pivot_r.add(model.pivot.rotation, "2", -500, 500).name("Z").listen();
        gui_pivot_r.add({
            Reset: function () {
                model.pivot.rotation[0] = 0;
                model.pivot.rotation[1] = 0;
                model.pivot.rotation[2] = 0;
            }
        }, "Reset");

        //gui_orbit.add(model.pivot, "distance", 0, 100, 1);

        /*const gui_distance = gui_orbit.addFolder("Distance");
        gui_distance.open();
        gui_distance.add(model.pivot.distance, "0", 0, 100).name("X").listen();
        gui_distance.add(model.pivot.distance, "1", 0, 100).name("Y").listen();
        gui_distance.add(model.pivot.distance, "2", 0, 100).name("Z").listen();*/

        gui_orbit.add(model, "usePivot").name("Enabled").listen().onFinishChange(function () {
            //model.animating[2] = false;
            //model.animations.curve = null;
            if (model.animate) {
                model.usePivot = false;
                return;
            }

            if (!model.usePivot && model.animating[3]) {
                model.animating[3] = false;
                model.animations.orbit = null;
            }
        });

        const gui_rotation = gui_root.addFolder("Rotation");
        //gui_rotation.open();
        gui_rotation.add(model.rotation, "0", -360, 360).name("X").listen();
        gui_rotation.add(model.rotation, "1", -360, 360).name("Y").listen();
        gui_rotation.add(model.rotation, "2", -360, 360).name("Z").listen();
        gui_rotation.add({
            Reset: function () {
                model.rotation[0] = 0;
                model.rotation[1] = 0;
                model.rotation[2] = 0;
            }
        }, "Reset");

        const gui_scale = gui_root.addFolder("Scale");
        gui_scale.add(model.scale, "0", -10, 10).name("X").listen();
        gui_scale.add(model.scale, "1", -10, 10).name("Y").listen();
        gui_scale.add(model.scale, "2", -10, 10).name("Z").listen();
        gui_scale.add({
            Reset: function () {
                model.scale[0] = 1;
                model.scale[1] = 1;
                model.scale[2] = 1;
            }
        }, "Reset");

        const gui_color = gui_root.addFolder("Color");
        gui_color.add(model.uniforms.u_colorMult, "0", 0, 1).name("R").listen();
        gui_color.add(model.uniforms.u_colorMult, "1", 0, 1).name("G").listen();
        gui_color.add(model.uniforms.u_colorMult, "2", 0, 1).name("B").listen();

        const gui_shape = gui_root.addFolder("Shape");
        gui_shape.add(model.shape, "0").name("Cube").listen().onFinishChange(function () {
            controlsModel.Shape(gl, meshProgramInfo, model, 0)
        });
        gui_shape.add(model.shape, "1").name("Cone").listen().onFinishChange(function () {
            controlsModel.Shape(gl, meshProgramInfo, model, 1)
        });
        gui_shape.add(model.shape, "2").name("Sphere").listen().onFinishChange(function () {
            controlsModel.Shape(gl, meshProgramInfo, model, 2)
        });

        const gui_anim = gui_root.addFolder("Animations");
        gui_anim.add(model.animating, "0").name("Rotate").listen().onFinishChange(function () {
            if (model.animate) {
                model.animating[0] = false;
                return;
            }

            animationsModel.Rotate(model);
        });
        gui_anim.add(model.animating, "1").name("Color").listen().onFinishChange(function () {
            if (model.animate) {
                model.animating[1] = false;
                return;
            }

            animationsModel.Color(model);
        });
        gui_anim.add(model.animating, "2").name("Curve").listen().onChange(function () {
            if (model.animate) {
                model.animating[2] = false;
                return;
            }

            if (model.curve == "") {
                model.animating[2] = false;
                model.animations.curve = null;
            } else {
                //model.animating[3] = false;
                //model.usePivot = false;
                //model.animations.orbit = null;
                animationsModel.Curve(model);
            }
        });
        gui_anim.add(model.animating, "3").name("Orbit").listen().onFinishChange(function () {
            if (model.animate) {
                model.animating[3] = false;
                return;
            }

            model.usePivot = !(model.animating[2] && !model.animating[3]);
            //model.animating[2] = false;
            //model.animations.curve = null;
            animationsModel.Orbit(model);
        });

        gui_anim.add(model, "speed", -10, 10).name("Speed");

        gui_anim.add({"Custom": controlsModel.Animation.bind(this, model)}, "Custom");

        gui_root.add(model, "lookAt").name("Look At").listen().onFinishChange(function () {
            models.forEach(function (o) {
                if (o !== model)
                    o.lookAt = false;
            });

            cams.forEach(function (cam) {
                if (cam.target === model) {
                    cam.target = null;
                } else {
                    cam.target = model;
                }
            });
        });

        gui_root.add({
            Remove: function () {
                gui.destroy();
                models.splice(models.findIndex(x => x.id == model.id), 1);
            }
        }, "Remove");
    },

    Shape: function (gl, meshProgramInfo, model, s) {
        model.buffer = s === 0 ? flattenedPrimitives.createCubeBufferInfo(gl, 20)
            : s === 1 ? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                : s === 2 ? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

        model.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, model.buffer);

        model.shape.forEach(function (shape, i) {
            model.shape[i] = false;
        })

        model.shape[s] = true;
    },

    Animation: function (model) {
        const gui = new dat.GUI();

        const gui_root = gui.addFolder("Object " + model.id + "'s Animations");
        gui_root.open();

        const gui_anims = gui_root.addFolder("Animations");
        gui_anims.open();

        gui_root.add({
            "Add Translation": function () {

                const a = new Animation();
                a.animation = animationCustom.Translate;
                a.id = animationsCounter++;
                model.animationList.push(a);

                const gui_tr = gui_anims.addFolder("Translation (" + a.id + ")");
                gui_tr.open();

                gui_tr.add(a.args, "start", -500, 500).name("Initial position").listen();
                gui_tr.add(a.args, "end", -500, 500).name("Final position").listen();
                gui_tr.add(a.args, "axisStr", ['X', 'Y', 'Z']).name("Axis").listen().onFinishChange(function () {
                    switch (a.args.axisStr) {
                        case 'X':
                            a.args.axis = 0;
                            break;
                        case 'Y':
                            a.args.axis = 1;
                            break
                        case 'Z':
                            a.args.axis = 2;
                            break
                    }
                });
                gui_tr.add(a, "start", 0, 30).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        model.animationList.splice(model.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Translation");

        gui_root.add({
            "Add Rotation": function () {

                const a = new Animation();
                a.animation = animationCustom.Rotate;
                a.id = animationsCounter++;
                model.animationList.push(a);

                const gui_tr = gui_anims.addFolder("Rotation (" + a.id + ")");
                gui_tr.open();

                gui_tr.add(a.args, "start", -360, 360).name("Initial rotation").listen();
                gui_tr.add(a.args, "end", -360, 360).name("Final rotation").listen();
                gui_tr.add(a.args, "axisStr", ['X', 'Y', 'Z']).name("Axis").listen().onFinishChange(function () {
                    switch (a.args.axisStr) {
                        case 'X':
                            a.args.axis = 0;
                            break;
                        case 'Y':
                            a.args.axis = 1;
                            break
                        case 'Z':
                            a.args.axis = 2;
                            break
                    }
                });
                gui_tr.add(a, "start", 0, 30).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        model.animationList.splice(model.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Rotation");

        gui_root.add({
            "Add Scaling": function () {

                const a = new Animation();
                a.animation = animationCustom.Scale;
                a.id = animationsCounter++;
                model.animationList.push(a);

                const gui_tr = gui_anims.addFolder("Scaling (" + a.id + ")");
                gui_tr.open();

                gui_tr.add(a.args, "start", -10, 10).name("Initial scale").listen();
                gui_tr.add(a.args, "end", -10, 10).name("Final scale").listen();
                gui_tr.add(a.args, "axisStr", ['X', 'Y', 'Z']).name("Axis").listen().onFinishChange(function () {
                    switch (a.args.axisStr) {
                        case 'X':
                            a.args.axis = 0;
                            break;
                        case 'Y':
                            a.args.axis = 1;
                            break
                        case 'Z':
                            a.args.axis = 2;
                            break
                    }
                });
                gui_tr.add(a, "start", 0, 30).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        model.animationList.splice(model.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Scaling");

        gui_root.add({
            "Add Coloring": function () {

                const a = new Animation();
                a.animation = animationCustom.Color;
                a.id = animationsCounter++;
                model.animationList.push(a);

                const gui_tr = gui_anims.addFolder("Coloring (" + a.id + ")");
                gui_tr.open();

                gui_tr.add(a.args, "start", 0, 1).name("Initial color").listen();
                gui_tr.add(a.args, "end", 0, 1).name("Final color").listen();
                gui_tr.add(a.args, "axisStr", ['R', 'G', 'B']).name("Component").listen().onFinishChange(function () {
                    switch (a.args.axisStr) {
                        case 'R':
                            a.args.axis = 0;
                            break;
                        case 'G':
                            a.args.axis = 1;
                            break
                        case 'B':
                            a.args.axis = 2;
                            break
                    }
                });
                gui_tr.add(a, "start", 0, 30).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        model.animationList.splice(model.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Coloring");

        gui_root.add({
            Start: function () {
                model.animations.rotate = null;
                model.animations.curve = null;
                model.animations.color = null;
                model.animations.orbit = null;
                model.animating[0] = false;
                model.animating[1] = false;
                model.animating[2] = false;
                model.animating[3] = false;
                model.usePivot = false;
                model.curve = "";
                model.animate = true;

                const now = Date.now();

                model.animationList.forEach(a => {
                    a.startT = (a.start * 1000) + now;
                    a.finishT = (a.duration * 1000) + a.startT;
                    a.isPlaying = true;
                });
            }
        }, "Start");

        gui_root.add({
            Stop: function () {
                model.animationList.forEach(a => {
                    a.isPlaying = false;
                    model.animate = false;
                });
            }
        }, "Stop");

        gui_root.add({
            Remove: function () {
                model.animate = false;
                model.animationList = [];
                gui.destroy();
            }
        }, "Remove");

        /*gui_root.add({
            Log: function () {
                console.log(model.animationList);
            }
        }, "Log");*/
    }
};