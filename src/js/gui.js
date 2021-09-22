const controlsModel = {
    NewObject: function (gl, meshProgramInfo) {
        const obj = new Model(gl, meshProgramInfo, Math.floor(Math.random() * 3));
        obj.id = objs.length;
        objs.push(obj);

        const gui = new dat.GUI();
        const gui_root = gui.addFolder("Object " + obj.id);
        gui_root.open();

        const gui_position = gui_root.addFolder("Position");
        gui_position.add(obj.position, "X", -500, 500, 1).listen();
        gui_position.add(obj.position, "Y", -500, 500, 1).listen();
        gui_position.add(obj.position, "Z", -500, 500, 1).listen();
        gui_position.open();

        const gui_rotation = gui_root.addFolder("Rotation");
        gui_rotation.add(obj.rotation, "X", -360, 360, 1).listen();
        gui_rotation.add(obj.rotation, "Y", -360, 360, 1).listen();
        gui_rotation.add(obj.rotation, "Z", -360, 360, 1).listen();
        gui_rotation.open();

        const gui_scale = gui_root.addFolder("Scale");
        gui_scale.add(obj.scale, "X", -10, 10, 0.1).listen();
        gui_scale.add(obj.scale, "Y", -10, 10, 0.1).listen();
        gui_scale.add(obj.scale, "Z", -10, 10, 0.1).listen();

        gui_root.add({Reset: controlsModel.Reset.bind(this, obj)}, "Reset");

        const gui_color = gui_root.addFolder("Color");
        Object.keys(obj.uniforms.u_colorMult).forEach((key) => {
            gui_color.add(obj.uniforms.u_colorMult, key, 0, 1).listen();
        });

        const gui_shape = gui_root.addFolder("Shape");
        gui_shape.add({Cube: controlsModel.Shape.bind(this, gl, meshProgramInfo, obj, 0)}, "Cube");
        gui_shape.add({Cone: controlsModel.Shape.bind(this, gl, meshProgramInfo, obj, 1)}, "Cone");
        gui_shape.add({Sphere: controlsModel.Shape.bind(this, gl, meshProgramInfo, obj, 2)}, "Sphere");

        const gui_anim = gui_root.addFolder("Animations");
        gui_anim.add({Rotate: controlsModel.Rotate.bind(this, obj)}, "Rotate");
        gui_anim.add({Color: controlsModel.Color.bind(this, obj)}, "Color");
        gui_anim.add(obj, "speed", -10, 10, 0.1);

        gui_root.add({LookAt: controlsModel.LookAt.bind(this, obj)}, "LookAt")
        gui_root.add({Remove: controlsModel.Remove.bind(this, gui, obj)},"Remove");
    },

    Reset: function (obj) {
        obj.position.X = 0;
        obj.position.Y = 0;
        obj.position.Z = 0;
        obj.rotation.X = 0;
        obj.rotation.Y = 0;
        obj.rotation.Z = 0;
        obj.scale.X = 1;
        obj.scale.Y = 1;
        obj.scale.Z = 1;
    },

    Remove: function (gui, obj) {
        gui.destroy();
        objs.splice(objs.findIndex(x => x.id === obj.id), 1);
    },

    Shape: function (gl, meshProgramInfo, obj, s) {
        obj.buffer =  s === 0? flattenedPrimitives.createCubeBufferInfo(gl, 20)
                    : s === 1? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                    : s === 2? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

        obj.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, obj.buffer);
    },

    LookAt: function (obj) {
        cams.forEach(function (cam) {
            if (cam.target === obj) {
                cam.target = null;
            } else {
                cam.target = obj;
            }
        });
    },

    Rotate: function (obj) {
        if (obj.animations.rotate == null)
            obj.animations.rotate = function (deltaTime) {
                obj.rotation.Y = (obj.rotation.Y + deltaTime) % 360;
            };
        else
            obj.animations.rotate = null;
    },

    Color: function (obj) {
        if (obj.animations.color == null)
            obj.animations.color = function (deltaTime) {
                obj.uniforms.u_colorMult = [(obj.uniforms.u_colorMult[0] / deltaTime) % 1,
                    (obj.uniforms.u_colorMult[1] / deltaTime) % 1,
                    (obj.uniforms.u_colorMult[2] / deltaTime) % 1,
                    1]
            };
        else
            obj.animations.color = null;
    }
};

const controlsCamera = {
    Remove: function (cam) {
        if (cams.length > 1) {
            cams.splice(cams.findIndex(x => x.id === cam.id), 1);
        }
    }
}

const controlsCurve = {
    NewCurve: function (gl, meshProgramInfo) {
        const curve = new Curve(gl, meshProgramInfo);
        curve.id = curves.length;
        curves.push(curve);
        controlsCurve.Update(curve, gl, meshProgramInfo);

        const gui = new dat.GUI();
        const gui_root = gui.addFolder("Curve " + curve.id);

        curve.points.forEach(function (point, i) {
            const gui_p = gui_root.addFolder("Point " + i);
            gui_p.open();
            Object.keys(point.position).forEach((key) => {
                gui_p.add(point.position, key, -500, 500).onChange(function () {
                    controlsCurve.Update(curve, gl, meshProgramInfo);
                });
            });
        })

        gui_root.add({Remove: controlsCurve.Remove.bind(this, gui, curve)},"Remove");
    },

    Remove: function (gui, curve) {
        gui.destroy();
        curves.splice(curves.findIndex(x => x.id === curve.id), 1);
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
    const cam = new Camera();
    cam.id = cams.length;
    cams.push(cam);

    const gui = new dat.GUI();

    const gui_cam = gui.addFolder("Camera");
    gui_cam.open();

    const gui_position = gui_cam.addFolder("Position");
    gui_position.add(cam.position, "X", -500, 500, 1).listen();
    gui_position.add(cam.position, "Y", -500, 500, 1).listen();
    gui_position.add(cam.position, "Z", -500, 500, 1).listen();
    gui_position.open();

    const gui_rotation = gui_cam.addFolder("Rotation");
    gui_rotation.add(cam.rotation, "X", -360, 360, ).listen();
    gui_rotation.add(cam.rotation, "Y", -360, 360, 1).listen();
    gui_rotation.add(cam.rotation, "Z", -360, 360, 1).listen();
    gui_rotation.open();

    gui_cam.add(cam, "FOV", 1, 179, 1).listen();

    gui.add({NewObject: controlsModel.NewObject.bind(this, gl, meshProgramInfo)},"NewObject");
    controlsModel.NewObject(gl, meshProgramInfo);

    gui.add({NewCurve: controlsCurve.NewCurve.bind(this, gl, meshProgramInfo)}, "NewCurve");
    controlsCurve.NewCurve(gl, meshProgramInfo);
};