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
        gui_position.add(model.position, "0", -500, 500, 1).name("X").listen();
        gui_position.add(model.position, "1", -500, 500, 1).name("Y").listen();
        gui_position.add(model.position, "2", -500, 500, 1).name("Z").listen();
        gui_position.add({Reset: function () {
                model.position[0] = 0;
                model.position[1] = 0;
                model.position[2] = 0;
            }}, "Reset");

        const gui_rotation = gui_root.addFolder("Rotation");
        gui_rotation.open();
        gui_rotation.add(model.rotation, "0", -360, 360, 1).name("X").listen();
        gui_rotation.add(model.rotation, "1", -360, 360, 1).name("Y").listen();
        gui_rotation.add(model.rotation, "2", -360, 360, 1).name("Z").listen();
        gui_rotation.add({Reset: function () {
                model.rotation[0] = 0;
                model.rotation[1] = 0;
                model.rotation[2] = 0;
            }}, "Reset");

        const gui_scale = gui_root.addFolder("Scale");
        gui_scale.add(model.scale, "0", -10, 10, 0.1).name("X").listen();
        gui_scale.add(model.scale, "1", -10, 10, 0.1).name("Y").listen();
        gui_scale.add(model.scale, "2", -10, 10, 0.1).name("Z").listen();
        gui_scale.add({Reset: function (){
                model.scale[0] = 1;
                model.scale[1] = 1;
                model.scale[2] = 1;
            }}, "Reset");

        const gui_color = gui_root.addFolder("Color");
        gui_color.add(model.uniforms.u_colorMult, "0", 0, 1).name("R").listen();
        gui_color.add(model.uniforms.u_colorMult, "1", 0, 1).name("G").listen();
        gui_color.add(model.uniforms.u_colorMult, "2", 0, 1).name("B").listen();

        const gui_shape = gui_root.addFolder("Shape");
        gui_shape.add(model.shape, "0").name("Cube").listen().onFinishChange(function () {controlsModel.Shape(gl, meshProgramInfo, model, 0)});
        gui_shape.add(model.shape, "1").name("Cone").listen().onFinishChange(function () {controlsModel.Shape(gl, meshProgramInfo, model, 1)});
        gui_shape.add(model.shape, "2").name("Sphere").listen().onFinishChange(function () {controlsModel.Shape(gl, meshProgramInfo, model, 2)});

        const gui_anim = gui_root.addFolder("Animations");
        gui_anim.add(model.animating, "0").name("Rotate").listen().onFinishChange(function () {animationsModel.Rotate(model);});
        gui_anim.add(model.animating, "1").name("Color").listen().onFinishChange(function () {animationsModel.Color(model);});
        gui_anim.add(model.animating, "2").name("Curve").listen().onFinishChange(function () {animationsModel.Curve(model);});

        model.gui = gui_anim.add(model, "curve", controlsModel.Curves()).name("Curve").listen().onFinishChange(function () {

        });

        gui_anim.add(model, "speed", -10, 10, 0.1).name("Speed");

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

        gui_root.add({Remove: function () {
            gui.destroy();
            models.splice(models.findIndex(x => x.id === model.id), 1);
        }},"Remove");
    },

    Shape: function (gl, meshProgramInfo, model, s) {
        model.buffer =  s === 0? flattenedPrimitives.createCubeBufferInfo(gl, 20)
                    : s === 1? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                    : s === 2? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

        model.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, model.buffer);

        model.shape.forEach(function (shape, i) {
            model.shape[i] = false;
        })

        model.shape[s] = true;
    },

    Curves: function () {
        let cs = [];

        curves.forEach(function (curve) {
            cs.push(curve.id);
        });

        return cs;
    }
};

const controlsCamera = {
    New: function () {
        const cam = new Camera();
        cam.id = camerasCounter++;
        cams.forEach(function (c) {
            c.active = false;
        });
        cams.push(cam);
        camera = cam;

        const gui = new dat.GUI();

        const gui_root = gui.addFolder("Camera " + cam.id);
        gui_root.open();

        const gui_position = gui_root.addFolder("Position");
        gui_position.open();
        gui_position.add(cam.position, "0", -500, 500, 1).name("X").listen();
        gui_position.add(cam.position, "1", -500, 500, 1).name("Y").listen();
        gui_position.add(cam.position, "2", -500, 500, 1).name("Z").listen();
        gui_position.add({Reset: function () {
            cam.position[0] = 0;
            cam.position[1] = 0;
            cam.position[2] = 0;
        }}, "Reset");

        const gui_rotation = gui_root.addFolder("Rotation");
        gui_rotation.open();
        gui_rotation.add(cam.rotation, "0", -360, 360, 1).name("X").listen();
        gui_rotation.add(cam.rotation, "1", -360, 360, 1).name("Y").listen();
        gui_rotation.add(cam.rotation, "2", -360, 360, 1).name("Z").listen();
        gui_rotation.add({Reset: function () {
            cam.rotation[0] = 0;
            cam.rotation[1] = 0;
            cam.rotation[2] = 0;
        }}, "Reset");

        gui_root.add(cam, "FOV", 1, 179, 1).listen();

        gui_root.add({Remove: controlsCamera.Remove.bind(this, cam, gui)}, "Remove");
    },

    Remove: function (cam, gui) {
        if (cams.length > 1) {
            gui.destroy();
            cams.splice(cams.findIndex(x => x.id === cam.id), 1);
            camera = cams[cams.length - 1];
        }
    }
}

const controlsCurve = {
    New: function (gl, meshProgramInfo) {
        const curve = new Curve(gl, meshProgramInfo);
        curve.id = curvesCounter++;
        curves.push(curve);
        controlsCurve.Update(curve, gl, meshProgramInfo);

        const gui = new dat.GUI();
        const gui_root = gui.addFolder("Curve " + curve.id);

        curve.points.forEach(function (point, i) {
            const gui_p = gui_root.addFolder("Point " + i);
            gui_p.open();
            gui_p.add(point.position, "0", -500, 500).onChange(function () {controlsCurve.Update(curve, gl, meshProgramInfo);}).name("X");
            gui_p.add(point.position, "1", -500, 500).onChange(function () {controlsCurve.Update(curve, gl, meshProgramInfo);}).name("Y");
            gui_p.add(point.position, "2", -500, 500).onChange(function () {controlsCurve.Update(curve, gl, meshProgramInfo);}).name("Z");
        })

        gui_root.add({Remove: function (){
            gui.destroy();
            curves.splice(curves.findIndex(x => x.id === curve.id), 1);

            models.forEach(function (obj) {
                obj.animating[2] = false;
                obj.animations.curve = null;
                obj.curve = null;
            });
        }}, "Remove");

        models.forEach(function (model) {
            model.gui = model.gui.options(controlsModel.Curves()).name("Curve").listen();
            model.gui.updateDisplay();
        });
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
    }
}

const loadGUI = (gl, meshProgramInfo) => {
    const gui = new dat.GUI();

    gui.add({"Add Camera": controlsCamera.New.bind(this)}, "Add Camera");
    controlsCamera.New();

    gui.add({"Add Curve": controlsCurve.New.bind(this, gl, meshProgramInfo)}, "Add Curve");
    controlsCurve.New(gl, meshProgramInfo);

    gui.add({"Add Object": controlsModel.New.bind(this, gl, meshProgramInfo)}, "Add Object");
    controlsModel.New(gl, meshProgramInfo);


};