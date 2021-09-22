const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

function computeMatrix(projection, translation, rotation, scale) {
    let matrix = m4.translate(projection, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, degToRad(rotation[0]));
    matrix = m4.yRotate(matrix, degToRad(rotation[1]));
    matrix = m4.zRotate(matrix, degToRad(rotation[2]));
    return m4.scale(matrix, scale[0], scale[1], scale[2]);
}