console.log("Hello, World!");

window.onload = function () {
    const canvas = document.getElementById("mycanvas");
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    const width = canvas.width;
    const height = canvas.height;
    const aspectRatio = width / height;
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

        const normal3 = vec3_normalized(vec3cross(
            (vec3_sub(v2, v1)),
            (vec3_sub(v3, v1))));

        faceNormals[i] = new Vector4(normal3.x, normal3.y, normal3.z, 0.0);
    }

    let myImageData = context.createImageData(width, height);

    function setupImage() {
        for(let i = 0; i < myImageData.data.length; i = i + 4) {
            myImageData.data[i+3] = 255;
        }
    }

    function clear() {
        for(let i = 0; i < myImageData.data.length; i = i + 4) {
            myImageData.data[i] = 0;
            //myImageData.data[i+1] = 0;
            //myImageData.data[i+2] = 0;
            //myImageData.data[i+3] = 255;
        }
    }

    setupImage();

    function drawPointShaded(point, normal) {
        const shade = 255 * (normal.z * 0.5 + 0.5);
        const pixelIndex = (point.x + point.y) * 4;
        myImageData.data[pixelIndex] = shade;
        myImageData.data[pixelIndex+1] = shade;
        myImageData.data[pixelIndex+2] = shade;
    }

    function drawPointFlatshaded(point, shade) {
        const pixelIndex = (point.x + point.y) * 4;
        myImageData.data[pixelIndex] = shade;
        //myImageData.data[pixelIndex+1] = shade;
        //myImageData.data[pixelIndex+2] = shade;
    }

    function drawPoint(point) {
        const pixelIndex = (point.x + point.y) * 4;
        myImageData.data[pixelIndex] = 255;
        myImageData.data[pixelIndex+1] = 255;
        //myImageData.data[pixelIndex+2] = 0;
    }

    function sortTriangleVertices(triangle) {
        return triangle.sort(function(v1, v2) { return v1.y - v2.y });
    }

    function getSplitVector(triangle) {
        return new Vector3(triangle[0].x + ((triangle[1].y - triangle[0].y) / (triangle[2].y - triangle[0].y)) * (triangle[2].x - triangle[0].x), triangle[1].y, 0);
    }

    function fillBottomFlatTriangle(v1, v2, v3, normal) {
        const shade = 255 * (normal.z * 0.5 + 0.5);
        let invslope1 = (v2.x - v1.x) / (v2.y - v1.y);
        let invslope2 = (v3.x - v1.x) / (v3.y - v1.y);
        if(invslope1 < invslope2) {
            let temp = invslope1; invslope1 = invslope2; invslope2 = temp;
        }

        let curx1 = v1.x;
        let curx2 = curx1;
        const yStart = v1.y;
        const yEnd = v2.y;

        let pixel = new Vector2();
        for (let scanlineY = yStart; scanlineY <= yEnd; scanlineY++)
        {
            pixel.y = scanlineY * width; //premultiplied with screen width for performance in array indexing
            const clampedx1 = Math.min(width, curx1) | 0;
            const clampedx2 = Math.max(0, curx2) | 0;
            for(let x = clampedx1; x >= clampedx2; x--) {
                pixel.x = x;
                drawPointFlatshaded(pixel, shade);
            }
            curx1 = curx1 + invslope1;
            curx2 = curx2 + invslope2;
        }
    }

    function fillTopFlatTriangle(v1, v2, v3, normal) {
        const shade = 255 * (normal.z * 0.5 + 0.5);
        let invslope1 = (v3.x - v1.x) / (v3.y - v1.y);
        let invslope2 = (v3.x - v2.x) / (v3.y - v2.y);
        if(invslope2 < invslope1) {
            let temp = invslope1; invslope1 = invslope2; invslope2 = temp;
        }

        let curx1 = v3.x;
        let curx2 = curx1;
        const yStart = v3.y;
        const yEnd = v1.y;

        let pixel = new Vector2();
        for (let scanlineY = yStart; scanlineY > yEnd; scanlineY--)
        {
            pixel.y = scanlineY * width; //premultiplied with screen width for performance in array indexing
            const clampedx1 = Math.min(width, curx1) | 0;
            const clampedx2 = Math.max(0, curx2) | 0;
            for(let x = clampedx1; x >= clampedx2; x--) {
                pixel.x = x;
                drawPointFlatshaded(pixel, shade);
            }
            curx1 = curx1 - invslope1;
            curx2 = curx2 - invslope2;
        }
    }

    let time = -5;
    const near = 0.1;
    const far = 1000.0;
    const top = Math.tan(1.0*0.5)*near;
    const bottom = -top;
    const right = top * aspectRatio;
    const left = -right;
    const perspectiveMatrix = transpose(mat4_perspective(bottom, top, left, right, near, far));
    let quat = new Quat(0, 0, 0, 1);

    let lastLoop = Date.now();
    let fpsText = document.getElementById("fps");
    function main(timestamp) {
        const thisLoop = Date.now();
        let fps = 1000 / (thisLoop - lastLoop);
        lastLoop = thisLoop;
        fpsText.innerHTML = fps;
        window.requestAnimationFrame(main);
        clear();
        time += 0.01;

        let translationMatrix = new Mat4([
            1,0,0,Math.sin(time),
            0,1,0,Math.cos(time),
            0,0,1,-5,
            0,0,0,1
        ]);

        quat_pitch(quat, 0.01);
        quat_yawGlobal(quat, 0.01);
        let rotationYMatrix = transpose(quat_toMat4(quat));
        let modelMatrix = matmulmat(translationMatrix, rotationYMatrix);
        let mat3 = matmulmat(perspectiveMatrix, modelMatrix);
        let transformedPoints = vertices
            .map(function(vertex) { return mulmatvec(mat3, vertex) });
        transformedPoints.forEach(function(vertex) {
            vertex.x = Math.floor((vertex.x + 1) * width/2);
            vertex.y = Math.floor((vertex.y + 1) * height/2);
        });

        let transformedNormals = faceNormals.map(function(normal) { return vec4_normalized(mulmatvec(mat3, normal)); });

        for(let t = 0; t < triangles.length; t++) {
            const v1 = transformedPoints[triangles[t].v0];
            const v2 = transformedPoints[triangles[t].v1];
            const v3 = transformedPoints[triangles[t].v2];

            let transformedTriangle = [
                v1, v2, v3
            ];

            let cullingNormal = vec3_normalized(vec3cross(
                (vec3_sub(v2, v1)),
                (vec3_sub(v3, v1))));
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