const animationsModel = {
    Rotate: function (model) {
        if (model.animations.rotate == null)
            model.animations.rotate = function (deltaTime) {
                const f = deltaTime * 0.1 * model.speed
                model.rotation[0] = (model.rotation[0] + f) % 360;
                model.rotation[1] = (model.rotation[1] + f) % 360;
                model.rotation[2] = (model.rotation[2] + f) % 360;
            };
        else
            model.animations.rotate = null;
    },

    Color: function (model) {
        if (model.animations.color == null)
            model.animations.color = function (deltaTime) {
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
        if (model.curve == "")
            return;

        const curve = curves[curves.findIndex(x => x.id == model.curve)];

        if (curve === undefined)
            return;

        if (model.animations.curve == null) {
            model.animations.curve = function (deltaTime) {
                model.curveT = (model.curveT + deltaTime * model.speed * 0.0001) % 1;
                const p = getPointOnBezierCurve(curve.pts, model.curveT >= 0 ? model.curveT : 1 + model.curveT);

                if (model.animating[3]) {
                    model.pivot.position[0] = p[0];
                    model.pivot.position[1] = p[1];
                    model.pivot.position[2] = p[2];
                } else {
                    model.position[0] = p[0];
                    model.position[1] = p[1];
                    model.position[2] = p[2];
                }
            };
        } else
            model.animations.curve = null;
    },

    Orbit: function (model) {
        if (model.animations.orbit == null)
            model.animations.orbit = function (deltaTime) {
                const f = deltaTime * 0.1 * model.speed
                model.pivot.rotation[0] = (model.pivot.rotation[0] + f) % 360;
                model.pivot.rotation[1] = (model.pivot.rotation[1] + f) % 360;
                model.pivot.rotation[2] = (model.pivot.rotation[2] + f) % 360;
            };
        else
            model.animations.orbit = null;
    }
}

function Animation() {
    this.start = 0;
    this.duration = 1;
    this.animation = null;
    this.finishT = 0;
    this.startT = 0;
    this.isPlaying = false;
    this.args = {
        axisStr: "X",
        start: 0,
        end: 0,
        axis: 0
    };
}

const animationCustom = {
    Translate: function (model, args, t) {
        model.position[args.axis] = lerp(args.start, args.end, t);
    },

    Rotate: function (model, args, t) {
        model.rotation[args.axis] = lerp(args.start, args.end, t);
    },

    Scale: function (model, args, t) {
        model.scale[args.axis] = lerp(args.start, args.end, t);
    },

    Color: function (model, args, t) {
        model.uniforms.u_colorMult[args.axis] = lerp(args.start, args.end, t);
    }
}

function tickAnimations(obj) {
    if (obj.animationList.length > 0) {
        const now = Date.now();

        obj.animationList.forEach(animation => {
            if (now >= animation.startT && animation.isPlaying) {
                const d = animation.finishT - animation.startT;
                const n = now - animation.startT;
                const t = n / d;

                //console.log(t);

                animation.animation(obj, animation.args, Math.min(t, 1));

                if (t > 1) {
                    animation.isPlaying = false;

                    const r = t - 1;
                    console.log(r);
                }
            }
        });
    } else {
        obj.animate = false;
    }

}