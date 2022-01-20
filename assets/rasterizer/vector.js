function Vector2(x, y) {
    this.x = x;
    this.y = y;

    this.add = (other) => {
        return new Vector2(this.x + other.x, this.y + other.y);
    };

    this.sub = (other) => {
        return new Vector2(this.x - other.x, this.y - other.y);
    };

    this.mul = (scalar) => {
        return new Vector2(this.x * scalar, this.y * scalar);
    };

    this.negated = () => {
        return new Vector2(-this.x, -this.y);
    };

    this.magnitude = () => {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };

    this.distance = (other) => {
        return this.sub(other).magnitude();
    };

    this.normalized = () => {
        let magnitude = this.magnitude();
        let newVector = new Vector2(this.x, this.y);
        if(magnitude > 0) {
            newVector = newVector.mul(1.0/magnitude);
        }
        //console.log("n", newVector.x, newVector.y);
        return newVector;
    };

    this.limitMagnitude = (maxMagnitude) => {
        const magnitude = this.magnitude();
        let newVector = new Vector2(this.x, this.y);
        if(magnitude > maxMagnitude) {
            newVector = newVector.normalized().mul(maxMagnitude);
        }
        return newVector;
    };
}

function Vector3(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.add = (other) => {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    };

    this.sub = (other) => {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    };

    this.mul = (scalar) => {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    };

    this.negated = () => {
        return new Vector3(-this.x, -this.y, -this.z);
    };

    this.magnitude = () => {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    };

    this.distance = (other) => {
        return this.sub(other).magnitude();
    };

    this.normalized = () => {
        let magnitude = this.magnitude();
        let newVector = new Vector3(this.x, this.y, this.z);
        if(magnitude > 0) {
            newVector = newVector.mul(1.0/magnitude);
        }
        //console.log("n", newVector.x, newVector.y);
        return newVector;
    };

    this.limitMagnitude = (maxMagnitude) => {
        const magnitude = this.magnitude();
        let newVector = new Vector3(this.x, this.y, this.z);
        if(magnitude > maxMagnitude) {
            newVector = newVector.normalized().mul(maxMagnitude);
        }
        return newVector;
    };
}

function vec3cross(v1, v2) {
    return new Vector3(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x
    );
}

function Vector4(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    this.clone = () => {
        return new Vector4(this.x, this.y, this.z, this.w);
    };

    this.add = (other) => {
        return new Vector4(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
    };

    this.sub = (other) => {
        return new Vector4(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w);
    };

    this.mul = (scalar) => {
        return new Vector4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    };

    this.negated = () => {
        return new Vector4(-this.x, -this.y, -this.z, -this.w);
    };

    this.magnitude = () => {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w));
    };

    this.distance = (other) => {
        return this.sub(other).magnitude();
    };

    this.normalized = () => {
        let magnitude = this.magnitude();
        let newVector = new Vector4(this.x, this.y, this.z, this.w);
        if(magnitude > 0) {
            newVector = newVector.mul(1.0/magnitude);
        }
        //console.log("n", newVector.x, newVector.y);
        return newVector;
    };

    this.limitMagnitude = (maxMagnitude) => {
        const magnitude = this.magnitude();
        let newVector = new Vector4(this.x, this.y, this.z, this.w);
        if(magnitude > maxMagnitude) {
            newVector = newVector.normalized().mul(maxMagnitude);
        }
        return newVector;
    };
}