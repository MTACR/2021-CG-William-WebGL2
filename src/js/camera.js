function Camera(gl, meshProgramInfo) {
    this.position = [0, 0, 200];
    this.rotation = [0, 0, 0];
    this.target = null;
    this.up = [0, 1, 0];
    this.FOV = 60;
    this.active = true;
    this.curve = "";
    this.gui = null;
    this.curveT = 0;
    this.speed = 1;
    this.animate = false;
    this.usePivot = false;
    this.animationList = [];
    this.animating = [false, false, false, false];
    this.animations = {
        //rotate: null,
        curve: null,
        //color: null,
        orbit: null
    };

    this.pivot = {
        position: [0, 0, 200],
        rotation: [0, 0, 0],
        distance: [0, 0, 0],
        buffer: null,
        VAO: null,
        uniforms: {
            u_colorMult: [0, 0, 1, 1],
            u_matrix: m4.identity()
        }
    };

    this.pivot.buffer = flattenedPrimitives.createSphereBufferInfo(gl, 6, 10, 10);
    this.pivot.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.pivot.buffer);
}

const controlsCamera = {
    New: function (gl, meshProgramInfo) {
        const cam = new Camera(gl, meshProgramInfo);
        cam.id = camerasCounter++;
        cams.forEach(function (c) {
            c.active = false;
        });
        cams.push(cam);

        if (camera != null)
            cam.target = camera.target;

        camera = cam;

        const gui = new dat.GUI();

        const gui_root = gui.addFolder("Camera " + cam.id);
        gui_root.open();

        const gui_position = gui_root.addFolder("Position");
        gui_position.open();
        gui_position.add(cam.position, "0", -500, 500).name("X").listen();
        gui_position.add(cam.position, "1", -500, 500).name("Y").listen();
        gui_position.add(cam.position, "2", -500, 500).name("Z").listen();
        gui_position.add({
            Reset: function () {
                cam.position[0] = 0;
                cam.position[1] = 0;
                cam.position[2] = 0;
            }
        }, "Reset");

        const gui_curve = gui_position.addFolder("Curve");

        cam.gui = gui_curve.add(cam, "curve", controlsCurve.Curves()).name("Curve").listen();

        gui_curve.add(cam, "curveT", -1, 1, 0.01).name("Curve T").listen().onChange(function () {
            if (cam.curve != null) {
                const curve = curves[curves.findIndex(x => x.id == cam.curve)];

                if (curve === undefined)
                    return;

                const p = getPointOnBezierCurve(curve.pts, cam.curveT >= 0 ? cam.curveT : 1 + cam.curveT);

                cam.position[0] = p[0];
                cam.position[1] = p[1];
                cam.position[2] = p[2];
            }
        });

        const gui_orbit = gui_position.addFolder("Orbit");
        const gui_pivot_p = gui_orbit.addFolder("Pivot");
        gui_pivot_p.open();
        gui_pivot_p.add(cam.pivot.position, "0", -500, 500).name("X").listen();
        gui_pivot_p.add(cam.pivot.position, "1", -500, 500).name("Y").listen();
        gui_pivot_p.add(cam.pivot.position, "2", -500, 500).name("Z").listen();
        gui_pivot_p.add({
            Reset: function () {
                cam.pivot.position[0] = 0;
                cam.pivot.position[1] = 0;
                cam.pivot.position[2] = 0;
            }
        }, "Reset");
        const gui_pivot_r = gui_orbit.addFolder("Angle");
        gui_pivot_r.open();
        gui_pivot_r.add(cam.pivot.rotation, "0", -500, 500).name("X").listen();
        gui_pivot_r.add(cam.pivot.rotation, "1", -500, 500).name("Y").listen();
        gui_pivot_r.add(cam.pivot.rotation, "2", -500, 500).name("Z").listen();
        gui_pivot_r.add({
            Reset: function () {
                cam.pivot.rotation[0] = 0;
                cam.pivot.rotation[1] = 0;
                cam.pivot.rotation[2] = 0;
            }
        }, "Reset");

        const gui_distance = gui_orbit.addFolder("Distance");
        gui_distance.open();
        gui_distance.add(cam.pivot.distance, "0", 0, 100).name("X").listen();
        gui_distance.add(cam.pivot.distance, "1", 0, 100).name("Y").listen();
        gui_distance.add(cam.pivot.distance, "2", 0, 100).name("Z").listen();

        gui_orbit.add(cam, "usePivot").name("Enabled").listen().onFinishChange(function () {
            if (cam.animate) {
                cam.usePivot = false;
                return;
            }

            if (cam.animating[2] && !cam.animating[3]) {
                cam.usePivot = false;
            }

            if (!cam.usePivot && cam.animating[3]) {
                cam.animating[3] = false;
                cam.animations.orbit = null;
            }
        });

        const gui_rotation = gui_root.addFolder("Rotation");
        gui_rotation.open();
        gui_rotation.add(cam.rotation, "0", -360, 360).name("X").listen();
        gui_rotation.add(cam.rotation, "1", -360, 360).name("Y").listen();
        gui_rotation.add(cam.rotation, "2", -360, 360).name("Z").listen();
        gui_rotation.add({
            Reset: function () {
                cam.rotation[0] = 0;
                cam.rotation[1] = 0;
                cam.rotation[2] = 0;
            }
        }, "Reset");

        const gui_anim = gui_root.addFolder("Animations");

        gui_anim.add(cam.animating, "2").name("Curve").listen().onChange(function () {
            if (cam.animate) {
                cam.animating[2] = false;
                return;
            }

            if (cam.curve == "") {
                cam.animating[2] = false;
                cam.animations.curve = null;
            } else {
                animationsModel.Curve(cam);
            }
        });

        gui_anim.add(cam.animating, "3").name("Orbit").listen().onFinishChange(function () {
            if (cam.animate) {
                cam.animating[3] = false;
                return;
            }

            cam.usePivot = !(cam.animating[2] && !cam.animating[3]);
            animationsModel.Orbit(cam);
        });

        gui_anim.add(cam, "speed", -10, 10).name("Speed");

        gui_anim.add({"Custom": controlsCamera.Animation.bind(this, cam)}, "Custom");

        gui_root.add(cam, "FOV", 1, 179).listen();

        gui_root.add(cam, "active").name("Active").listen().onFinishChange(function () {
            controlsCamera.Active(cam);
        });

        gui_root.add({Remove: controlsCamera.Remove.bind(this, cam, gui)}, "Remove");
    },

    Remove: function (cam, gui) {
        if (cams.length > 1) {
            gui.destroy();
            cams.splice(cams.findIndex(x => x.id == cam.id), 1);
            camera = cams[cams.length - 1];
            camera.active = true;
        }
    },

    Active: function (cam) {
        if (cam === camera) {
            cam.active = true;
            return;
        }

        camera = cam;

        cams.forEach(function (c) {
            if (c !== cam)
                c.active = false;
        });
    },

    Animation: function (cam) {
        const gui = new dat.GUI();

        const gui_root = gui.addFolder("Camera " + cam.id + "'s Animations");
        gui_root.open();

        const gui_anims = gui_root.addFolder("Animations");
        gui_anims.open();

        gui_root.add({
            "Add Translation": function () {

                const a = new Animation();
                a.animation = animationCustom.Translate;
                a.id = animationsCounter++;
                cam.animationList.push(a);

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
                gui_tr.add(a, "start", 0, 30, 0.1).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30, 0.1).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        cam.animationList.splice(cam.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Translation");

        gui_root.add({
            "Add Rotation": function () {

                const a = new Animation();
                a.animation = animationCustom.Rotate;
                a.id = animationsCounter++;
                cam.animationList.push(a);

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
                gui_tr.add(a, "start", 0, 30, 0.1).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30, 0.1).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        cam.animationList.splice(cam.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Rotation");

        gui_root.add({
            "Add Zoom": function () {

                const a = new Animation();
                a.animation = animationCustom.Zoom;
                a.id = animationsCounter++;
                cam.animationList.push(a);

                const gui_tr = gui_anims.addFolder("Zoom (" + a.id + ")");
                gui_tr.open();

                gui_tr.add(a.args, "start", 1, 179).name("Initial FOV").listen();
                gui_tr.add(a.args, "end", 1, 179).name("Final FOV").listen();
                gui_tr.add(a, "start", 0, 30, 0.1).name("Starts in").listen();
                gui_tr.add(a, "duration", 0, 30, 0.1).name("Duration").listen();

                gui_tr.add({
                    "Remove": function () {
                        gui_anims.removeFolder(gui_tr);
                        cam.animationList.splice(cam.animationList.findIndex(x => x.id == a.id))
                    }
                }, "Remove");
            }
        }, "Add Zoom");

        gui_root.add({
            Start: function () {
                cam.animations.curve = null;
                cam.animations.orbit = null;
                cam.animating[0] = false;
                cam.animating[1] = false;
                cam.animating[2] = false;
                cam.animating[3] = false;
                cam.usePivot = false;
                cam.curve = "";
                cam.animate = true;

                const now = Date.now();

                cam.animationList.forEach(a => {
                    a.startT = (a.start * 1000) + now;
                    a.finishT = (a.duration * 1000) + a.startT;
                    a.isPlaying = true;
                });
            }
        }, "Start");

        gui_root.add({
            Stop: function () {
                cam.animationList.forEach(a => {
                    a.isPlaying = false;
                    cam.animate = false;
                });
            }
        }, "Stop");

        gui_root.add({
            Remove: function () {
                cam.animate = false;
                cam.animationList = [];
                gui.destroy();
            }
        }, "Remove");

    }
}