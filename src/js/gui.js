const models = [];
const cams = [];
let camera;
let camerasCounter = 0;
let modelsCounter = 0;
let curvesCounter = 0;
let animationsCounter = 0;

const loadGUI = (gl, meshProgramInfo) => {
    const gui = new dat.GUI();

    gui.add({"Add Camera": controlsCamera.New.bind(this, gl, meshProgramInfo)}, "Add Camera");
    gui.add({"Add Curve":  controlsCurve.New.bind(this, gl, meshProgramInfo)}, "Add Curve");
    gui.add({"Add Object": controlsModel.New.bind(this, gl, meshProgramInfo)}, "Add Object");

    controlsCamera.New(gl, meshProgramInfo);
    controlsModel.New(gl, meshProgramInfo);
    controlsCurve.New(gl, meshProgramInfo);
    controlsCurve.New(gl, meshProgramInfo);

    const points = curves[1].points;
    points[0].position[0] = -100;
    points[0].position[1] = 0;
    points[0].position[2] = -500;

    points[1].position[0] = 0;
    points[1].position[1] = 100;
    points[1].position[2] = 500;

    points[2].position[0] = 0;
    points[2].position[1] = -100;
    points[2].position[2] = 500;

    points[3].position[0] = 100;
    points[3].position[1] = 0;
    points[3].position[2] = -500;

    controlsCurve.Update(curves[1], gl, meshProgramInfo);
    controlsCurve.RefreshUI();
};