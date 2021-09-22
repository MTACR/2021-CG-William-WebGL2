class Model {

    constructor(gl, meshProgramInfo, s) {
        this.buffer = s === 0? flattenedPrimitives.createCubeBufferInfo(gl, 20)
            : s === 1? flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)
                : s === 2? flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6) : null;

        this.VAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, this.buffer);
    }

    rotation = {
        X: 20,
        Y: 40,
        Z: 0
    };

    position = {
        X: 0,
        Y: 0,
        Z: 0
    };

    scale = {
        X: 1,
        Y: 1,
        Z: 1
    }

    uniforms = {
        u_colorMult: [Math.random(), Math.random(), Math.random(), 1],
        u_matrix: m4.identity()
    };

    speed = 1;
    buffer;
    VAO;

    animations = {
        rotate: null,
        color: null
    };
}

class Camera {
    position = {
        X: 0,
        Y: 0,
        Z: 100
    }

    rotation = {
        X: 0,
        Y: 0,
        Z: 0
    }

    target = null
    up = [0, 1, 0]
    FOV = 60
}

const objs = [];
const cams = [];