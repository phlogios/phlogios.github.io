function Mat4(data) {
    const identity = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];

    this.data = data || identity;

    this.loadIdentity = () => {
        this.data = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
    };

    this.mul = (other)  => {
        let result = new Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                const rowOffset = i*4;
                for(let k = 0; k < 4; k++) {
                    result.data[j + rowOffset] = result.data[j + rowOffset] + this.data[k + i*4] * other.data[j + k*4];
                }
            }
        }
        return result;
    };

    this.transposed = () => {
        return new Mat4([
            this.data[0],
            this.data[4],
            this.data[8],
            this.data[12],

            this.data[1],
            this.data[5],
            this.data[9],
            this.data[13],

            this.data[2],
            this.data[6],
            this.data[10],
            this.data[14],

            this.data[3],
            this.data[7],
            this.data[11],
            this.data[15]
        ]);
    }
}

function mulmatvec(mat, vec) {
    const data = mat.data;
    let out = new Vector4(
        vec.x * data[0] + vec.y * data[1] + vec.z * data[2] + vec.w * data[3],
        vec.x * data[4] + vec.y * data[5] + vec.z * data[6] + vec.w * data[7],
        vec.x * data[8] + vec.y * data[9] + vec.z * data[10] + vec.w * data[11],
        vec.x * data[12] + vec.y * data[13] + vec.z * data[14] + vec.w * data[15]
    );

    if (out.w !== 1.0) {
        out = out.mul(1.0/out.w);
    }
    return out;
}

function mulvecmat(vec, mat) {
    const data = mat.data;
    let out = new Vector4(
        vec.x * data[0] + vec.y * data[4] + vec.z * data[8] + vec.w * data[12],
        vec.x * data[1] + vec.y * data[5] + vec.z * data[9] + vec.w * data[13],
        vec.x * data[2] + vec.y * data[6] + vec.z * data[10] + vec.w * data[14],
        vec.x * data[3] + vec.y * data[7] + vec.z * data[11] + vec.w * data[15]
    );

    if (out.w !== 1.0) {
        out = out.mul(1.0/out.w);
    }
    return out;
}

function perspective(b, t, l, r, n, f) {
    return new Mat4([
        2 * n / (r - l),
        0,
        0,
        0,

        0,
        2 * n / (t - b),
        0,
        0,

        (r + l) / (r - l),
        (t + b) / (t - b),
        -(f + n) / (f - n),
        -1,

        0,
        0,
        -2 * f * n / (f - n),
        0
    ]).transposed();
}