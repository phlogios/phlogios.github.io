console.log("Hello, World!");

window.onload = function () {
    const canvas = document.getElementById("mycanvas");
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    const aspectRatio = 640.0 / 480.0;
    let triangles = [
        0, 1, 3, 3, 1, 2,
        1, 5, 2, 2, 5, 6,
        5, 4, 6, 6, 4, 7,
        4, 0, 7, 7, 0, 3,
        3, 2, 7, 7, 2, 6,
        4, 5, 0, 0, 5, 1
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

    function drawPoint(point) {

        const pixelIndex = (Math.floor(point.x) + Math.floor(point.y)*640) * 4;
        myImageData.data[pixelIndex] = 255;
        myImageData.data[pixelIndex+1] = 255;
        myImageData.data[pixelIndex+2] = 0;
    }

    function sortTriangleVertices(triangle) {
        return triangle.sort((v1, v2) => { return v1.y - v2.y });
    }

    function getSplitVector(triangle) {
        return new Vector3(triangle[0].x + ((triangle[1].y - triangle[0].y) / (triangle[2].y - triangle[0].y)) * (triangle[2].x - triangle[0].x), triangle[1].y, 0);
    }

    function fillBottomFlatTriangle(v1, v2, v3) {
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
                drawPoint(new Vector2(x, scanlineY));
            }
            curx1 += invslope1;
            curx2 += invslope2;
        }
    }

    function fillTopFlatTriangle(v1, v2, v3) {
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
                drawPoint(new Vector2(x, scanlineY));
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
            1,0,0,0,
            0,1,0,0,
            0,0,1, -5 + Math.sin(time*2),
            0,0,0,1
        ]);

        quat.pitch(0.01);
        quat.yawGlobal(0.01);
        let rotationYMatrix = quat.toMat4().transposed();

        let mat3 = perspectiveMatrix.mul(translationMatrix.mul(rotationYMatrix));

        let transformedPoints = vertices
            .map(vertex => mulmatvec(mat3, vertex));
        transformedPoints.forEach(vertex => {
            vertex.x = Math.floor((vertex.x + 1) * 320);
            vertex.y = Math.floor((vertex.y + 1) * 240);
        })

        for(let t = 0; t < triangles.length / 3; t++) {
            let t0 = t*3+0;
            let t1 = t0+1;
            let t2 = t0+2;
            let transformedTriangle = [
                transformedPoints[triangles[t0]],
                transformedPoints[triangles[t1]],
                transformedPoints[triangles[t2]]
            ];

            transformedTriangle = sortTriangleVertices(transformedTriangle);
            if (transformedTriangle[1].y == transformedTriangle[2].y) {
                fillBottomFlatTriangle(transformedTriangle[0], transformedTriangle[1], transformedTriangle[2]);
            } else if(transformedTriangle[0].y == transformedTriangle[1].y) {
                fillTopFlatTriangle(transformedTriangle[1], transformedTriangle[0], transformedTriangle[2]);
            } else {
                fillBottomFlatTriangle(transformedTriangle[0], transformedTriangle[1], transformedTriangle[2]);
                fillTopFlatTriangle(transformedTriangle[1], transformedTriangle[0], transformedTriangle[2]);
            }

            // for(let i = 0; i < 3; i++) {
            //     drawPoint(transformedTriangle[i]);
            // }
        }

        context.putImageData(myImageData, 0, 0);
    }
    main(0);
};