const models = [];
const cams = [];
let camera;
let camerasCounter = 0;
let modelsCounter = 0;
let curvesCounter = 0;
let animationsCounter = 0;

const loadGUI = (gl, meshProgramInfo) => {
    const gui = new dat.GUI();

    gui.add({"Add Camera": controlsCamera.New.bind(this)}, "Add Camera");
    gui.add({"Add Curve": controlsCurve.New.bind(this, gl, meshProgramInfo)}, "Add Curve");
    gui.add({"Add Object": controlsModel.New.bind(this, gl, meshProgramInfo)}, "Add Object");

    controlsCamera.New();
    controlsModel.New(gl, meshProgramInfo);
    controlsCurve.New(gl, meshProgramInfo);
    controlsCurve.New(gl, meshProgramInfo);

    curves[1].points.forEach(point => {
        point.position[2] = 200;
    });

    controlsCurve.Update(curves[1], gl, meshProgramInfo);
    controlsCurve.RefreshUI();
};