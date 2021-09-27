function Model(gl, meshProgramInfo, s) {

    this.buffer = s === 0 ? flattenedPrimitives.createCubeBufferInfo(gl, 20)
                : s === 1 ? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                : s === 2 ? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

    this.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.buffer);

    this.shape = [false, false, false];
    this.shape[s] = true;

    this.animationList = [];
    this.position = [0, 0, 0];
    this.rotation = [20, 40, 0];
    this.scale = [1, 1, 1];
    this.speed = 1;
    this.curveT = 0;
    this.lookAt = false;
    this.usePivot = false;
    this.animating = [false, false, false, false];
    this.curve = "";
    this.gui;

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
        buffer: null,
        VAO: null,
        uniforms: {
            u_colorMult: [0, 1, 0, 1],
            u_matrix: m4.identity()
        },
        distance: 10
    };

    this.pivot.buffer = flattenedPrimitives.createSphereBufferInfo(gl, 6, 10, 10);
    this.pivot.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.pivot.buffer);
}

class Camera {
    position = [0, 0, 100];
    rotation = [0, 0, 0];
    target = null;
    up = [0, 1, 0];
    FOV = 60;
    active = true;
    curve = "";
}

const models = [];
const cams = [];
let camera;
let camerasCounter = 0;
let modelsCounter = 0;
let curvesCounter = 0;