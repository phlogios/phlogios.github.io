function Quat(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

function quat_pitch(quat, angle) {
    let eulerQuat = quatFromEulerAngle(new Vector3(angle, 0, 0));
    let newQuat = quat_mul(quat, eulerQuat);
    quat.x = newQuat.x;
    quat.y = newQuat.y;
    quat.z = newQuat.z;
    quat.w = newQuat.w;

    return newQuat;
}

function quat_pitchGlobal(quat, angle) {
    let eulerQuat = quatFromEulerAngle(new Vector3(angle, 0, 0));
    let newQuat = quat_mul(eulerQuat, quat);
    quat.x = newQuat.x;
    quat.y = newQuat.y;
    quat.z = newQuat.z;
    quat.w = newQuat.w;

    return newQuat;
}

function quat_yawGlobal(quat, angle) {
    let eulerQuat = quatFromEulerAngle(new Vector3(0, angle, 0));
    let newQuat = quat_mul(eulerQuat, quat);
    quat.x = newQuat.x;
    quat.y = newQuat.y;
    quat.z = newQuat.z;
    quat.w = newQuat.w;

    return newQuat;
}

function quat_mul(l, r) {
    const p = new Quat(l.x, l.y, l.z, l.w);
    const q = r;
    l.w = p.w * q.w - p.x * q.x - p.y * q.y - p.z * q.z;
    l.x = p.w * q.x + p.x * q.w + p.y * q.z - p.z * q.y;
    l.y = p.w * q.y + p.y * q.w + p.z * q.x - p.x * q.z;
    l.z = p.w * q.z + p.z * q.w + p.x * q.y - p.y * q.x;
    return l;
}

function quat_toMat4(quat) {
    const qxx = quat.x * quat.x;
    const qyy = quat.y * quat.y;
    const qzz = quat.z * quat.z;

    const qxz = quat.x * quat.z;
    const qxy = quat.x * quat.y;
    const qyz = quat.y * quat.z;

    const qwx = quat.w * quat.x;
    const qwy = quat.w * quat.y;
    const qwz = quat.w * quat.z;

    let data = [
        1 - 2 * (qyy + qzz),
        2 * (qxy + qwz),
        2 * (qxz - qwy),
        0,

        2 * (qxy - qwz),
        1 - 2 * (qxx + qzz),
        2 * (qyz + qwx),
        0,

        2 * (qxz + qwy),
        2 * (qyz - qwx),
        1 - 2 * (qxx + qyy),
        0,

        0, 0, 0, 1
    ];
    return new Mat4(data);
};

function quatFromEulerAngle(eulerAngle) {
    const c = new Vector3(Math.cos(eulerAngle.x * 0.5), Math.cos(eulerAngle.y * 0.5), Math.cos(eulerAngle.z * 0.5));
    const s = new Vector3(Math.sin(eulerAngle.x * 0.5), Math.sin(eulerAngle.y * 0.5), Math.sin(eulerAngle.z * 0.5));

    return new Quat(
        s.x * c.y * c.z - c.x * s.y * s.z,
        c.x * s.y * c.z + s.x * c.y * s.z,
        c.x * c.y * s.z - s.x * s.y * c.z,
        c.x * c.y * c.z + s.x * s.y * s.z
    );
}