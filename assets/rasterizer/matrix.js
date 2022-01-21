const identity = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1];

function Mat4(data) {
    this.data = data || identity;
}

function matmulmat(left, right) {
    let result = new Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            const rowOffset = i*4;
            for(let k = 0; k < 4; k++) {
                result.data[j + rowOffset] = result.data[j + rowOffset] + left.data[k + i*4] * right.data[j + k*4];
            }
        }
    }
    return result;
};

function transpose(mat) {
    return new Mat4([
        mat.data[0],
        mat.data[4],
        mat.data[8],
        mat.data[12],

        mat.data[1],
        mat.data[5],
        mat.data[9],
        mat.data[13],

        mat.data[2],
        mat.data[6],
        mat.data[10],
        mat.data[14],

        mat.data[3],
        mat.data[7],
        mat.data[11],
        mat.data[15]
    ]);
}

function mulmatvec(mat, vec) {
    const data = mat.data;
    let out = new Vector4(
        vec.x * data[0] + vec.y * data[1] + vec.z * data[2] + vec.w * data[3],
        vec.x * data[4] + vec.y * data[5] + vec.z * data[6] + vec.w * data[7],
        vec.x * data[8] + vec.y * data[9] + vec.z * data[10] + vec.w * data[11],
        vec.x * data[12] + vec.y * data[13] + vec.z * data[14] + vec.w * data[15]
    );

    if(vec.w === 0) out.w = 0;

    if (vec.w !== 0.0 && out.w !== 1.0) {
        out = vec4_mul(out, 1.0/out.w);
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

    if(vec.w === 0) out.w = 0;

    if (vec.w !== 0.0 && out.w !== 1.0) {
        out = vec4_mul(out, 1.0/out.w);
    }
    return out;
}

function perspective(b, t, l, r, n, f) {
    return transpose(new Mat4([
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
    ]));
}