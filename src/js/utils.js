const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

function computeMatrix(projection, translation, rotation, scale) {
    const t = m4.translate(projection, translation[0], translation[1], translation[2]);
    return m4.scale(m4.multiply(t, computeRotation(rotation)), scale[0], scale[1], scale[2]);
}

function computeMatrixPivot(projection, position, rotation, scale, pivot, distance, orbit) {
    const t = m4.translate(computeRotation(orbit), pivot[0], pivot[1], pivot[2]);
    const p = m4.multiply(t, m4.translation(distance[0], distance[1], distance[2]));
    const m = m4.multiply(projection, m4.multiply(p, computeRotation(rotation)));

    position[0] = p[12];
    position[1] = p[13];
    position[2] = p[14];

    return m4.scale(m, scale[0], scale[1], scale[2]);
}

function computeRotation(rotation) {
    const i = m4.identity();
    const rx = m4.xRotate(i, degToRad(rotation[0]));
    const ry = m4.yRotate(i, degToRad(rotation[1]));
    const rz = m4.zRotate(i, degToRad(rotation[2]));
    return m4.multiply(rx, m4.multiply(ry, rz));
}

function distance(a, b) {
    return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2));
}

const v2 = (function() {
    function add(a, ...args) {
        const n = a.slice();
        [...args].forEach(p => {
            n[0] += p[0];
            n[1] += p[1];
            n[2] += p[2];
        });
        return n;
    }

    function sub(a, ...args) {
        const n = a.slice();
        [...args].forEach(p => {
            n[0] -= p[0];
            n[1] -= p[1];
            n[2] -= p[2];
        });
        return n;
    }

    function mult(a, s) {
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

    function lerp(a, b, t) {
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

    // compute the distance squared between a and b
    function distanceSq(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }

    // compute the distance between a and b
    function distance(a, b) {
        return Math.sqrt(distanceSq(a, b));
    }

    // compute the distance squared from p to the line segment
    // formed by v and w
    function distanceToSegmentSq(p, v, w) {
        const l2 = distanceSq(v, w);
        if (l2 === 0) {
            return distanceSq(p, v);
        }
        let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
        t = Math.max(0, Math.min(1, t));
        return distanceSq(p, lerp(v, w, t));
    }

    // compute the distance from p to the line segment
    // formed by v and w
    function distanceToSegment(p, v, w) {
        return Math.sqrt(distanceToSegmentSq(p, v, w));
    }

    return {
        add: add,
        sub: sub,
        max: max,
        min: min,
        mult: mult,
        lerp: lerp,
        distance: distance,
        distanceSq: distanceSq,
        distanceToSegment: distanceToSegment,
        distanceToSegmentSq: distanceToSegmentSq,
    };
}());