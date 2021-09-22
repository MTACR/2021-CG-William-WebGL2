function main() {
    const {gl, meshProgramInfo} = initializeWorld();
    let then = 0;
    loadGUI(gl, meshProgramInfo);

    //TODO abaixo:

    //-----------------------CAMERA
    const cam = cams[0];

    function render(now) {
        const deltaTime = now - then;
        then = now;

        twgl.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.useProgram(meshProgramInfo.program);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        let camera;

        if (cam.target != null) {
            var lookAt = [cam.target.position.X, cam.target.position.Y, cam.target.position.Z];
            camera = m4.lookAt([cam.position.X, cam.position.Y, cam.position.Z], lookAt, cam.up);

            //cam.rotation.Y = radToDeg(Math.atan2(cam.position.X, cam.target.position.X));
            //cam.rotation.X = radToDeg(Math.atan2(cam.position.Y, cam.target.position.Y));
            //cam.rotation.Z = Math.atan2(cam.target.position.Z, cam.position.Z);

        } else {
            camera = m4.translate(m4.identity(), cam.position.X, cam.position.Y, cam.position.Z);
            camera = m4.xRotate(camera, degToRad(cam.rotation.X));
            camera = m4.yRotate(camera, degToRad(cam.rotation.Y));
            camera = m4.zRotate(camera, degToRad(cam.rotation.Z));
        }

        const projection = m4.multiply(
            m4.perspective(degToRad(cam.FOV), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000),
            m4.inverse(camera));

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

        const tempPoints = getPointOnBezierCurve(curves[0].pts, (now % 5000) / 5000);

        objs.forEach(function (obj, i) {

            gl.bindVertexArray(obj.VAO);

            obj.position.X = tempPoints[0];
            obj.position.Y = tempPoints[1];
            obj.position.Z = tempPoints[2];

            obj.uniforms.u_matrix = computeMatrix(projection,
                [obj.position.X, obj.position.Y, obj.position.Z],
                [obj.rotation.X, obj.rotation.Y, obj.rotation.Z],
                [obj.scale.X, obj.scale.Y, obj.scale.Z]
            );

            Object.entries(obj.animations).forEach(function (anim) {
                if (anim[1] != null)
                    anim[1](deltaTime / 100 * obj.speed);
            });

            twgl.setUniforms(meshProgramInfo, obj.uniforms);
            twgl.drawBufferInfo(gl, obj.buffer);
        });

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
