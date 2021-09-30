const degToRad = (d) => (d * Math.PI) / 180;
const radToDeg = (r) => (r * 180) / Math.PI;

function computeMatrix(projection, position, rotation, scale) {
    const t = translateMatrix(projection, position);
    const r = rotateMatrix(t, rotation);
    return scaleMatrix(r, scale);
}

function computeMatrixPivot(projection, position, rotation, scale, pivot, distance, angle) {
    let p = translationMatrix(pivot);
    p = rotateMatrix(p, angle);
    p = translateMatrix(p, distance);

    position[0] = p[12];
    position[1] = p[13];
    position[2] = p[14];

    const r = rotateMatrix(p, rotation);
    const s = m4.multiply(projection, r);
    return scaleMatrix(s, scale);
}

function computeModel(model, projection) {
    if (model.usePivot) {
        return computeMatrixPivot(
            projection,
            model.position,
            model.rotation,
            model.scale,
            model.pivot.position,
            model.pivot.distance,
            model.pivot.rotation
        );
    } else {
        return computeMatrix(
            projection,
            model.position,
            model.rotation,
            model.scale
        );
    }
}

function computeCamera() {
    let screen;

    if (camera.usePivot) {
        screen = translationMatrix(camera.pivot.position);
        screen = rotateMatrix(screen, camera.pivot.rotation);
        screen = translateMatrix(screen, camera.pivot.distance);

        camera.position[0] = screen[12];
        camera.position[1] = screen[13];
        camera.position[2] = screen[14];
    }

    if (camera.target != null) {
        let lookAt = camera.target.position;
        screen = m4.lookAt(camera.position, lookAt, camera.up);
        computeLookAt(lookAt);
    } else {
        screen = translationMatrix(camera.position);
        screen = rotateMatrix(screen, camera.rotation);
    }

    return screen;
}

function computeLookAt(lookAt) {
    let x = lookAt[0] - camera.position[0];
    let y = lookAt[1] - camera.position[1];
    let z = lookAt[2] - camera.position[2];

    let xx = Math.atan2(y, z);
    let yy = Math.atan2(x * Math.cos(xx), z);
    let zz = Math.atan2(Math.cos(xx), Math.sin(xx) * Math.sin(yy));

    if (camera.position[2] > 0) {
        camera.rotation[0] = 180 - radToDeg(xx);
        camera.rotation[1] = 180 - radToDeg(yy);
        camera.rotation[2] = 270 - radToDeg(zz);
    } else {
        camera.rotation[0] = (180 - radToDeg(xx));
        camera.rotation[1] = -radToDeg(yy);
        camera.rotation[2] = 90 + radToDeg(zz);
    }
}

function rotateMatrix(m, rotation) {
    const rx = m4.xRotation(degToRad(rotation[0]));
    const ry = m4.yRotation(degToRad(rotation[1]));
    const rz = m4.zRotation(degToRad(rotation[2]));
    const r = m4.multiply(rx, m4.multiply(ry, rz));
    return m4.multiply(m, r);
}

function translateMatrix(m, position) {
    return m4.translate(m, position[0], position[1], position[2]);
}

function scaleMatrix(m, scale) {
    return m4.scale(m, scale[0], scale[1], scale[2]);
}

function translationMatrix(position) {
    return  m4.translation(position[0], position[1], position[2]);
}

function lerp(s, f, t) {
    return s + (f - s) * t;
}

const v2 = {
    add: function (a, ...args) {
        const n = a.slice();
        [...args].forEach(p => {
            n[0] += p[0];
            n[1] += p[1];
            n[2] += p[2];
        });
        return n;
    },

    mult: function (a, s) {
        if (Array.isArray(s)) {
            let t = s;
            s = a;
            a = t;
        }
        if (Array.isArray(s)) {
            return [
                a[0] * s[0],
                a[1] * s[1],
                a[2] * s[2],
            ];
        } else {
            return [a[0] * s, a[1] * s, a[2] * s];
        }
    }
}