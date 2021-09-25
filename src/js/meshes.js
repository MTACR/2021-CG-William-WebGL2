class Model {

    constructor(gl, meshProgramInfo, s) {
        this.buffer = s === 0 ? flattenedPrimitives.createCubeBufferInfo(gl, 20)
                    : s === 1 ? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                    : s === 2 ? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

        this.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.buffer);

        this.shape[s] = true;
    }

    animationList = [];
    position = [0, 0, 0];
    rotation = [20, 40, 0];
    scale = [1, 1, 1];
    speed = 1;
    lookAt = false;
    animating = [false, false, false];
    shape = [false, false, false];
    curve = null;
    VAO;
    gui;

    uniforms = {
        u_colorMult: [Math.random(), Math.random(), Math.random(), 1],
        u_matrix: m4.identity()
    };

    animations = {
        rotate: null,
        curve: null,
        color: null
    };
}

class Camera {
    position = [0, 0, 100];
    rotation = [0, 0, 0];
    target = null;
    up = [0, 1, 0];
    FOV = 60;
    active = true;
}

const models = [];
const cams = [];
let camera;
let camerasCounter = 0;
let modelsCounter = 0;
let curvesCounter = 0;