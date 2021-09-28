function main() {
    const {gl, meshProgramInfo} = initializeWorld();
    let then = 0;
    loadGUI(gl, meshProgramInfo);
    gl.useProgram(meshProgramInfo.program);

    function render(now) {
        const deltaTime = now - then;
        then = now;

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        const projection = m4.multiply(
            m4.perspective(degToRad(camera.FOV), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000),
            m4.inverse(computeCamera()));

        curves.forEach(function (curve) {
            curve.points.forEach(function (point) {
                gl.bindVertexArray(point.VAO);

                point.uniforms.u_matrix = computeMatrix(projection,
                    point.position, [0, 0, 0], [0.1, 0.1, 0.1]);

                twgl.setUniforms(meshProgramInfo, point.uniforms);
                twgl.drawBufferInfo(gl, point.buffer);
            });

            curve.interpolation.forEach(function (point) {
                gl.bindVertexArray(point.VAO);

                point.uniforms.u_matrix = computeMatrix(projection,
                    point.position, [0, 0, 0], [0.1, 0.1, 0.1]);

                twgl.setUniforms(meshProgramInfo, point.uniforms);
                twgl.drawBufferInfo(gl, point.buffer);
            });
        });

        models.forEach(function (model, i) {

            Object.entries(model.animations).forEach(function (anim) {
                if (anim[1] != null)
                    anim[1](deltaTime);
            });

            gl.bindVertexArray(model.pivot.VAO);

            model.pivot.uniforms.u_matrix = computeMatrix(projection,
                model.pivot.position, [0, 0, 0], [0.1, 0.1, 0.1]);

            twgl.setUniforms(meshProgramInfo, model.pivot.uniforms);
            twgl.drawBufferInfo(gl, model.pivot.buffer);

            gl.bindVertexArray(model.VAO);

            if (model.usePivot) {
                model.uniforms.u_matrix = computeMatrixPivot(
                    projection,
                    model.position,
                    model.rotation,
                    model.scale,
                    model.pivot.position,
                    model.pivot.distance,
                    model.pivot.rotation
                );
            } else {
                model.uniforms.u_matrix = computeMatrix(
                    projection,
                    model.position,
                    model.rotation,
                    model.scale
                );
            }

            twgl.setUniforms(meshProgramInfo, model.uniforms);
            twgl.drawBufferInfo(gl, model.buffer);
        });

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();