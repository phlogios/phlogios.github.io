window.onload = function () {
    const canvas = document.getElementById("mycanvas");
    const gl = canvas.getContext("webgl") ||
                    canvas.getContext("experimental-webgl") ||
                    canvas.getContext("moz-webgl") ||
                    canvas.getContext("webkit-3d");
    if(gl) {
        const extensions = gl.getSupportedExtensions();
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

    } else {
        console.log("WebGL is not supported");
    }

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

    const vsSource = "attribute vec4 aVertexPosition;\n" +
        "uniform mat4 uModelViewMatrix;\n" + 
        "uniform mat4 uProjectionMatrix;\n" + 
        "void main() {\n" + 
        "gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n" +
        "}\n";
    const fsSource = "void main() {\n" + 
        "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
        "}\n";

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
      
        // Create the shader program
      
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
      
        // If creating the shader program failed, alert
      
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
          return null;
        }
      
        return shaderProgram;
    }

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
      
        // Send the source to the shader object
      
        gl.shaderSource(shader, source);
      
        // Compile the shader program
      
        gl.compileShader(shader);
      
        // See if it compiled successfully
      
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
      
        return shader;
    }
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };
    
    function initBuffers(gl) {

        // Create a buffer for the square's positions.
      
        const positionBuffer = gl.createBuffer();
      
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
      
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
        // Now create an array of positions for the square.
      
        const positions = [
           1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
          -1.0, -1.0,
        ];
      
        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
      
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(positions),
                      gl.STATIC_DRAW);
      
        return {
          position: positionBuffer,
        };
    }
    const buffers = initBuffers(gl);
    
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 100.0;
    const top = Math.tan(1.0*0.5)*near;
    const bottom = -top;
    const right = top * aspect;
    const left = -right;
    const projectionMatrix = mat4_perspective(bottom, top, left, right, near, far);
    let modelViewMatrix = new Mat4(
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -6, 1
        ]
    );

    let lastLoop = Date.now();
    let fpsText = document.getElementById("fps");
    function main() {
        const thisLoop = Date.now();
        let fps = 1000 / (thisLoop - lastLoop);
        lastLoop = thisLoop;
        fpsText.innerHTML = fps;
        window.requestAnimationFrame(main);

        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
                                      // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        gl.useProgram(programInfo.program);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix.data);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix.data);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
    main();
}