function main() {
    const {gl, meshProgramInfo} = initializeWorld();
    let then = 0;
    loadGUI(gl, meshProgramInfo);

    //TODO abaixo:

    //-----------------------CAMERA

    function render(now) {
        const deltaTime = now - then;
        then = now;

        twgl.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.useProgram(meshProgramInfo.program);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        let screen;

        if (camera.target != null) {
            var lookAt = camera.target.position;
            screen = m4.lookAt(camera.position, lookAt, camera.up);

            //cam.rotation.Y = radToDeg(Math.atan2(cam.position.X, cam.target.position.X));
            //cam.rotation.X = radToDeg(Math.atan2(cam.position.Y, cam.target.position.Y));
            //cam.rotation.Z = Math.atan2(cam.target.position.Z, cam.position.Z);

        } else {
            screen = m4.translate(m4.identity(), camera.position[0], camera.position[1], camera.position[2]);
            screen = m4.xRotate(screen, degToRad(camera.rotation[0]));
            screen = m4.yRotate(screen, degToRad(camera.rotation[1]));
            screen = m4.zRotate(screen, degToRad(camera.rotation[2]));
        }

        const projection = m4.multiply(
            m4.perspective(degToRad(camera.FOV), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000),
            m4.inverse(screen));

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

            gl.bindVertexArray(model.VAO);

            Object.entries(model.animations).forEach(function (anim) {
                if (anim[1] != null)
                    anim[1](now, deltaTime);
            });

            model.uniforms.u_matrix = computeMatrix(projection,
                model.position,
                model.rotation,
                model.scale
            );

            twgl.setUniforms(meshProgramInfo, model.uniforms);
            twgl.drawBufferInfo(gl, model.buffer);
        });

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
