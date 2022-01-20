console.log("Hello, World!");

window.onload = function () {
    const canvas = document.getElementById("mycanvas");
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    const aspectRatio = 640.0 / 480.0;
    let triangles = [
        {v0: 0, v1: 1, v2: 3}, {v0: 3, v1: 1, v2: 2},
        {v0: 1, v1: 5, v2: 2}, {v0: 2, v1: 5, v2: 6},
        {v0: 5, v1: 4, v2: 6}, {v0: 6, v1: 4, v2: 7},
        {v0: 4, v1: 0, v2: 7}, {v0: 7, v1: 0, v2: 3},
        {v0: 3, v1: 2, v2: 7}, {v0: 7, v1: 2, v2: 6},
        {v0: 4, v1: 5, v2: 0}, {v0: 0, v1: 5, v2: 1}
    ];

    let vertices = [
        new Vector4(-1, -1, -1, 1),
        new Vector4(1, -1, -1, 1),
        new Vector4(1, 1, -1, 1),
        new Vector4(-1, 1, -1, 1),
        new Vector4(-1, -1, 1, 1),
        new Vector4(1, -1, 1, 1),
        new Vector4(1, 1, 1, 1),
        new Vector4(-1, 1, 1, 1)
    ];

    let faceNormals = [];
    for(let i = 0; i < triangles.length; i++) {
        const v1 = vertices[triangles[i].v0];
        const v2 = vertices[triangles[i].v1];
        const v3 = vertices[triangles[i].v2];

        const v1_3 = new Vector3(v1.x, v1.y, v1.z);
        const v2_3 = new Vector3(v2.x, v2.y, v2.z);
        const v3_3 = new Vector3(v3.x, v3.y, v3.z);

        const normal3 = vec3cross(
            (v2_3.sub(v1_3)),
            (v3_3.sub(v1_3))).normalized();

        faceNormals[i] = new Vector4(normal3.x, normal3.y, normal3.z, 0.0);
    }

    let myImageData = context.createImageData(640, 480);

    function clear() {
        for(let i = 0; i < myImageData.data.length; i = i + 4) {
            myImageData.data[i] = 0;
            myImageData.data[i+1] = 0;
            myImageData.data[i+2] = 0;
            myImageData.data[i+3] = 255;
        }
    }

    clear();

    function drawPointShaded(point, normal) {
        const pixelIndex = (Math.floor(point.x + point.y*640)) * 4;
        myImageData.data[pixelIndex] = 255 * (normal.z * 0.5 + 0.5);
        myImageData.data[pixelIndex+1] = 255 * (normal.z * 0.5 + 0.5);
        myImageData.data[pixelIndex+2] = 255 * (normal.z * 0.5 + 0.5);

    }

    function drawPoint(point) {

        const pixelIndex = (Math.floor(point.x + point.y*640)) * 4;
        myImageData.data[pixelIndex] = 255;
        myImageData.data[pixelIndex+1] = 255;
        //myImageData.data[pixelIndex+2] = 0;
    }

    function sortTriangleVertices(triangle) {
        return triangle.sort((v1, v2) => { return v1.y - v2.y });
    }

    function getSplitVector(triangle) {
        return new Vector3(triangle[0].x + ((triangle[1].y - triangle[0].y) / (triangle[2].y - triangle[0].y)) * (triangle[2].x - triangle[0].x), triangle[1].y, 0);
    }

    function fillBottomFlatTriangle(v1, v2, v3, normal) {
        let invslope1 = (v2.x - v1.x) / (v2.y - v1.y);
        let invslope2 = (v3.x - v1.x) / (v3.y - v1.y);
        if(invslope1 < invslope2) {
            let temp = invslope1; invslope1 = invslope2; invslope2 = temp;
        }

        let curx1 = v1.x;
        let curx2 = curx1;
        const yStart = v1.y;
        const yEnd = v2.y;

        for (let scanlineY = yStart; scanlineY <= yEnd; scanlineY++)
        {
            const clampedx1 = Math.min(640, curx1);
            const clampedx2 = Math.max(0, curx2);
            for(let x = clampedx1; x >= clampedx2; x--) {
                drawPointShaded(new Vector2(x, scanlineY), normal);
            }
            curx1 += invslope1;
            curx2 += invslope2;
        }
    }

    function fillTopFlatTriangle(v1, v2, v3, normal) {
        let invslope1 = (v3.x - v1.x) / (v3.y - v1.y);
        let invslope2 = (v3.x - v2.x) / (v3.y - v2.y);
        if(invslope2 < invslope1) {
            let temp = invslope1; invslope1 = invslope2; invslope2 = temp;
        }

        let curx1 = v3.x;
        let curx2 = curx1;
        const yStart = v3.y;
        const yEnd = v1.y;

        for (let scanlineY = yStart; scanlineY > yEnd; scanlineY--)
        {
            const clampedx1 = Math.min(640, curx1);
            const clampedx2 = Math.max(0, curx2);
            for(let x = clampedx1; x >= clampedx2; x--) {
                drawPointShaded(new Vector2(x, scanlineY), normal);
            }
            curx1 -= invslope1;
            curx2 -= invslope2;
        }
    }

    let time = -5;
    const near = 0.1;
    const far = 1000.0;
    const top = Math.tan(1.0*0.5)*near;
    const bottom = -top;
    const right = top * aspectRatio;
    const left = -right;
    const perspectiveMatrix = perspective(bottom, top, left, right, near, far);
    let quat = new Quat(0, 0, 0, 1);

    function main(timestamp) {
        window.requestAnimationFrame(main);
        clear();
        time += 0.01;

        let translationMatrix = new Mat4([
            1,0,0,Math.sin(time),
            0,1,0,Math.cos(time),
            0,0,1,-5,
            0,0,0,1
        ]);

        quat.pitch(0.01);
        quat.yawGlobal(0.01);
        let rotationYMatrix = quat.toMat4().transposed();
        let modelMatrix = translationMatrix.mul(rotationYMatrix);
        let mat3 = perspectiveMatrix.mul(modelMatrix);
        let transformedPoints = vertices
            .map(vertex => mulmatvec(mat3, vertex));
        transformedPoints.forEach(vertex => {
            vertex.x = Math.floor((vertex.x + 1) * 320);
            vertex.y = Math.floor((vertex.y + 1) * 240);
        });

        let transformedNormals = faceNormals.map(normal => mulmatvec(mat3, normal).normalized());

        for(let t = 0; t < triangles.length; t++) {
            const v1 = transformedPoints[triangles[t].v0];
            const v2 = transformedPoints[triangles[t].v1];
            const v3 = transformedPoints[triangles[t].v2];

            let transformedTriangle = [
                v1, v2, v3
            ];

            const v1_3 = new Vector3(v1.x, v1.y, v1.z);
            const v2_3 = new Vector3(v2.x, v2.y, v2.z);
            const v3_3 = new Vector3(v3.x, v3.y, v3.z);
            let cullingNormal = vec3cross(
                (v2_3.sub(v1_3)),
                (v3_3.sub(v1_3))).normalized()
            const normal = transformedNormals[t];
            if (cullingNormal.z >= 0) continue;

            transformedTriangle = sortTriangleVertices(transformedTriangle);
            if (transformedTriangle[1].y == transformedTriangle[2].y) {
                fillBottomFlatTriangle(transformedTriangle[0], transformedTriangle[1], transformedTriangle[2], normal);
            } else if(transformedTriangle[0].y == transformedTriangle[1].y) {
                fillTopFlatTriangle(transformedTriangle[1], transformedTriangle[0], transformedTriangle[2], normal);
            } else {
                fillBottomFlatTriangle(transformedTriangle[0], transformedTriangle[1], transformedTriangle[2], normal);
                fillTopFlatTriangle(transformedTriangle[1], transformedTriangle[0], transformedTriangle[2], normal);
            }

            // for(let i = 0; i < 3; i++) {
            //     drawPoint(transformedTriangle[i]);
            // }
        }

        context.putImageData(myImageData, 0, 0);
    }
    main(0);
};