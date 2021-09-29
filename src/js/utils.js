const degToRad = (d) => (d * Math.PI) / 180;
const radToDeg = (r) => (r * 180) / Math.PI;

function computeMatrix(projection, position, rotation, scale) {
    const t = m4.translate(projection, position[0], position[1], position[2]);
    return m4.scale(m4.multiply(t, computeRotation(rotation)), scale[0], scale[1], scale[2]);
}

function computeMatrixPivot(projection, position, rotation, scale, pivot, distance, angle) {
    const px = pivot[0];
    const py = pivot[1];
    const pz = pivot[2];

    let p = m4.translation(px, py, pz);
    p = m4.translate(p, 0, 0, 0);
    p = m4.multiply(p, computeRotation(angle));
    p = m4.translate(p, -px, -py, -pz);

    position[0] = p[12];
    position[1] = p[13];
    position[2] = p[14];

    return m4.scale(m4.multiply(projection, m4.multiply(p, computeRotation(rotation))), scale[0], scale[1], scale[2]);
}

function computeRotation(rotation) {
    const rx = m4.xRotation(degToRad(rotation[0]));
    const ry = m4.yRotation(degToRad(rotation[1]));
    const rz = m4.zRotation(degToRad(rotation[2]));
    return m4.multiply(rx, m4.multiply(ry, rz));
}

function computeCamera() {
    let screen;

    if (camera.usePivot) {
        const px = camera.pivot.position[0];
        const py = camera.pivot.position[1];
        const pz = camera.pivot.position[2];

        let screen = m4.translation(px, py, pz);
        screen = m4.translate(screen, 0, 0, 0);
        screen = m4.multiply(screen, computeRotation(camera.pivot.rotation));
        screen = m4.translate(screen, -px, -py, -pz);

        camera.position[0] = screen[12];
        camera.position[1] = screen[13];
        camera.position[2] = screen[14];

        if (camera.target != null) {
            let lookAt = camera.target.position;
            screen = m4.lookAt(camera.position, lookAt, camera.up);
            computeLookAt(lookAt);

        } else {
            screen = m4.translation(camera.position[0], camera.position[1], camera.position[2]);
            screen = m4.multiply(screen, computeRotation(camera.rotation));
        }

        return screen;

    } else {
        if (camera.target != null) {
            let lookAt = camera.target.position;
            screen = m4.lookAt(camera.position, lookAt, camera.up);
            computeLookAt(lookAt);

        } else {
            screen = m4.translation(camera.position[0], camera.position[1], camera.position[2]);
            screen = m4.multiply(screen, computeRotation(camera.rotation));
        }
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

    sub: function (a, ...args) {
        const n = a.slice();
        [...args].forEach(p => {
            n[0] -= p[0];
            n[1] -= p[1];
            n[2] -= p[2];
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
    },

    /*lerp: function (a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        ];
    }

    function min(a, b) {
        return [
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
            Math.min(a[2], b[2]),
        ];
    }

    function max(a, b) {
        return [
            Math.max(a[0], b[0]),
            Math.max(a[1], b[1]),
            Math.max(a[2], b[2]),
        ];
    }

    function distanceSq(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const dz = a[2] - b[2]
        return dx * dx + dy * dy + dz * dz;
    }

    function distance(a, b) {
        return Math.sqrt(distanceSq(a, b));
    }

    function distanceToSegmentSq(p, v, w) {
        const l2 = distanceSq(v, w);
        if (l2 === 0) {
            return distanceSq(p, v);
        }
        let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
        t = Math.max(0, Math.min(1, t));
        return distanceSq(p, lerp(v, w, t));
    }

    function distanceToSegment(p, v, w) {
        return Math.sqrt(distanceToSegmentSq(p, v, w));
    }*/
}