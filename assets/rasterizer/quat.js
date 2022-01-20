function Quat(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    this.pitch = (angle) => {
        let eulerQuat = quatFromEulerAngle(new Vector3(angle, 0, 0));
        let newQuat = this.mul(eulerQuat);
        this.x = newQuat.x;
        this.y = newQuat.y;
        this.z = newQuat.z;
        this.w = newQuat.w;

        return newQuat;
    }

    this.pitchGlobal = (angle) => {
        let eulerQuat = quatFromEulerAngle(new Vector3(angle, 0, 0));
        let newQuat = eulerQuat.mul(this);
        this.x = newQuat.x;
        this.y = newQuat.y;
        this.z = newQuat.z;
        this.w = newQuat.w;

        return newQuat;
    }

    this.yawGlobal = (angle) => {
        let eulerQuat = quatFromEulerAngle(new Vector3(0, angle, 0));
        let newQuat = eulerQuat.mul(this);
        this.x = newQuat.x;
        this.y = newQuat.y;
        this.z = newQuat.z;
        this.w = newQuat.w;

        return newQuat;
    }
    
    this.mul = (r) => {
        const p = new Quat(this.x, this.y, this.z, this.w);
        const q = r;
		this.w = p.w * q.w - p.x * q.x - p.y * q.y - p.z * q.z;
		this.x = p.w * q.x + p.x * q.w + p.y * q.z - p.z * q.y;
		this.y = p.w * q.y + p.y * q.w + p.z * q.x - p.x * q.z;
		this.z = p.w * q.z + p.z * q.w + p.x * q.y - p.y * q.x;
        return this;
    }

    this.toMat4 = () => {
        const qxx = this.x * this.x;
        const qyy = this.y * this.y;
        const qzz = this.z * this.z;

        const qxz = this.x * this.z;
        const qxy = this.x * this.y;
        const qyz = this.y * this.z;

        const qwx = this.w * this.x;
        const qwy = this.w * this.y;
        const qwz = this.w * this.z;

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
}

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