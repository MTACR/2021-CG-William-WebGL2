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

        let screen;

        if (camera.target != null) {
            var lookAt = camera.target.position;
            screen = m4.lookAt(camera.position, lookAt, camera.up);

            let x = lookAt[0] - camera.position[0];
            let y = lookAt[1] - camera.position[1];
            let z = lookAt[2] - camera.position[2];

            let xx = Math.atan2(y, z);
            let yy = Math.atan2(x * Math.cos(xx), z);
            let zz = Math.atan2(Math.cos(xx), Math.sin(xx) * Math.sin(yy));

            camera.rotation[0] = 180 - radToDeg(xx);
            camera.rotation[1] = 180 - radToDeg(yy);
            camera.rotation[2] = 270 - radToDeg(zz);

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
                //const i = m4.identity();
                //var m = m4.yRotate(i, degToRad(model.rotation[1]));

                /*const rx = m4.xRotate(i, degToRad(model.rotation[0]));
                const ry = m4.yRotate(rx, degToRad(model.rotation[1]));
                const rz = m4.zRotate(ry, degToRad(model.rotation[2]));*/

                //const r = m4.multiply(rz, m4.multiply(rx, ry));
                /*var m = m4.translate(rz, model.pivot.position[0],
                    model.pivot.position[1],
                    model.pivot.position[2]);*/
                /*var m = m4.translate(rz, model.pivot.position[0] - model.pivot.distance,
                    model.pivot.position[1] - model.pivot.distance,
                    model.pivot.position[2] - model.pivot.distance);*/

                //var m = m4.translate(rz, model.pivot.distance, model.pivot.distance, model.pivot.distance);
                //m = m4.translate(m, model.pivot.position[0], model.pivot.position[1], model.pivot.position[2]);

                /*var p = [
                    m[12],
                    m[13],
                    m[14]
                ];*/

                //model.position[0] = p[0];
                //model.position[1] = p[1];
                //model.position[2] = p[2];


                //var matrix = m4.lookAt(model.position, model.pivot.position, [0, 1, 0]);

                //model.uniforms.u_matrix = m4.multiply(projection, m);

                model.uniforms.u_matrix = computeMatrixPivot(projection,
                    model.position,
                    model.rotation,
                    model.scale,
                    model.pivot.position,
                    model.pivot.distance
                );

            } else {

                model.uniforms.u_matrix = computeMatrix(projection,
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