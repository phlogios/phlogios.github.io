function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

function Vector3(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function Vector4(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

//VEC2 FUNCTIONS
function vec2_add(left, right) {
    return new Vector2(left.x + right.x, left.y + right.y);
};

function vec2_sub(left, right)  {
    return new Vector2(left.x - right.x, left.y - right.y);
};

function vec2_mul(vec, scalar) {
    return new Vector2(vec.x * scalar, vec.y * scalar);
};

function vec2_negated(vec) {
    return new Vector2(-vec.x, -vec.y);
};

function vec2_magnitude(vec) {
    return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
};

function vec2_distance(left, right) {
    return vec2_magnitude(vec2_sub(left, right));
};

function vec2_normalized(vec) {
    let magnitude = vec2_magnitude(vec);
    let newVector = new Vector2(vec.x, vec.y);
    if(magnitude > 0) {
        newVector = vec2_mul(newVector, 1.0/magnitude);
    }
    //console.log("n", newVector.x, newVector.y);
    return newVector;
};

function vec2_limitMagnitude(vec, maxMagnitude) {
    const magnitude = vec2_magnitude(vec);
    let newVector = new Vector2(vec.x, vec.y);
    if(magnitude > maxMagnitude) {
        newVector = vec2_mul(vec2_normalized(newVector),maxMagnitude);
    }
    return newVector;
};

//VEC3 FUNCTIONS
function vec3_add(left, right) {
    return new Vector3(left.x + right.x, left.y + right.y, left.z + right.z);
};

function vec3_sub(left, right) {
    return new Vector3(left.x - right.x, left.y - right.y, left.z - right.z);
};

function vec3_mul(left, scalar) {
    return new Vector3(left.x * scalar, left.y * scalar, left.z * scalar);
};

function vec3_negated(vec) {
    return new Vector3(-vec.x, -vec.y, -vec.z);
};

function vec3_magnitude(vec) {
    return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y) + (vec.z * vec.z));
};

function vec3_distance(left, right) {
    return vec3_magnitude(vec3_sub(left, right));
};

function vec3_normalized(vec) {
    let magnitude = vec3_magnitude(vec);
    let newVector = new Vector3(vec.x, vec.y, vec.z);
    if(magnitude > 0) {
        newVector = vec3_mul(newVector, 1.0/magnitude);
    }
    //console.log("n", newVector.x, newVector.y);
    return newVector;
};

function vec3_limitMagnitude(vec, maxMagnitude) {
    const magnitude = vec3_magnitude(vec);
    let newVector = new Vector3(vec.x, vec.y, vec.z);
    if(magnitude > maxMagnitude) {
        newVector = vec3_mul(vec3_normalized(newVector), maxMagnitude);
    }
    return newVector;
};

function vec3cross(v1, v2) {
    return new Vector3(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x
    );
}

//VEC4 FUNCTIONS

function vec4_clone(vec) {
    return new Vector4(vec.x, vec.y, vec.z, vec.w);
};

function vec4_add(left, right) {
    return new Vector4(left.x + other.x, left.y + other.y, left.z + other.z, left.w + other.w);
};

function vec4_sub(left, right) {
    return new Vector4(left.x - other.x, left.y - other.y, left.z - other.z, left.w - other.w);
};

function vec4_mul(vec, scalar) {
    return new Vector4(vec.x * scalar, vec.y * scalar, vec.z * scalar, vec.w * scalar);
};

function vec4_negated(vec) {
    return new Vector4(-vec.x, -vec.y, -vec.z, -vec.w);
};

function vec4_magnitude(vec) {
    return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y) + (vec.z * vec.z) + (vec.w * vec.w));
};

function vec4_distance(left, right) {
    return vec4_magnitude(vec4_sub(left, right));
};

function vec4_normalized(vec) {
    let magnitude = vec4_magnitude(vec);
    let newVector = new Vector4(vec.x, vec.y, vec.z, vec.w);
    if(magnitude > 0) {
        newVector = vec4_mul(newVector, 1.0/magnitude);
    }
    //console.log("n", newVector.x, newVector.y);
    return newVector;
};

function vec4_limitMagnitude(maxMagnitude) {
    const magnitude = vec4_magnitude(vec);
    let newVector = new Vector4(vec.x, vec.y, vec.z, vec.w);
    if(magnitude > maxMagnitude) {
        newVector = vec4_mul(vec4_normalized(newVector), maxMagnitude);
    }
    return newVector;
};