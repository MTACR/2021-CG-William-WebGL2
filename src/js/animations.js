const animationsModel = {
    Rotate: function (model) {
        if (model.animations.rotate == null)
            model.animations.rotate = function (now, deltaTime) {
                const f = deltaTime * 0.1 * model.speed
                model.rotation[1] = (model.rotation[1] + f) % 360;
            };
        else
            model.animations.rotate = null;
    },

    Color: function (model) {
        if (model.animations.color == null)
            model.animations.color = function (now, deltaTime) {
                let f = deltaTime / (10000 / model.speed);
                f = f >= 0 ? f : 1 + f;

                model.uniforms.u_colorMult[0] = ((model.uniforms.u_colorMult[0] + f)) % 1;
                model.uniforms.u_colorMult[1] = ((model.uniforms.u_colorMult[1] + f)) % 1;
                model.uniforms.u_colorMult[2] = ((model.uniforms.u_colorMult[2] + f)) % 1;
            };
        else
            model.animations.color = null;
    },

    Curve: function (model) {
        if (!model.animating[2]) {
            model.animating[2] = false;
            model.animations.curve = null;
            model.curve = null;
        }

        if (model.curve == null)
            return;

        const curve = curves[curves.findIndex(x => x.id == model.curve)];

        if (model.animations.curve == null) {
            let t = 0;

            model.animations.curve = function (now, deltaTime) {
                t = (t + deltaTime * model.speed * 0.0001) % 1;
                const p = getPointOnBezierCurve(curve.pts, t >= 0 ? t : 1 + t);

                model.position[0] = p[0];
                model.position[1] = p[1];
                model.position[2] = p[2];
            };
        } else
            model.animations.curve = null;
    }
}