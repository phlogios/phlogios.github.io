console.log("Hello, World!");

window.onload = function () {
    const canvas = document.getElementById("boidscanvas");
    const context = canvas.getContext("2d");
    fitToContainer(canvas);

    function fitToContainer(canvas){
        // Make it visually fill the positioned parent
        canvas.style.width ='100%';
        let mainElement = document.getElementsByTagName("main")[0];
        let clientHeight = "" + mainElement.clientHeight + "px";
        canvas.style.height=clientHeight;
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    const width = canvas.width;
    const height = canvas.height;

    const maxSpeed = 2;
    const maxForce = 0.06;

    const drawEdgeRay = false;
    const drawAlignment = false;

    let mouseCoords = new Vector2(0, 0);

    document.onmousemove = findDocumentCoords;

    let b = [];

    for(let i = 0; i < 50; i++) {
        b.push({
            position: new Vector2(Math.random()*width, Math.random()*height),
            velocity: new Vector2(Math.random()*2-1, Math.random()*2-1),
            acceleration: new Vector2(0, 0),
            angle: 0
        })
    }

    function findDocumentCoords(mouseEvent)
    {
        if (mouseEvent)
        {
            //FireFox
            mouseCoords.x = mouseEvent.pageX;
            mouseCoords.y = mouseEvent.pageY;
        }
        else
        {
            //IE
            mouseCoords.x = window.event.x + document.body.scrollLeft - 2;
            mouseCoords.y = window.event.y + document.body.scrollTop - 2;
        }
    }

    function applyAcceleration(i) {
        b[i].velocity.x += b[i].acceleration.x;
        b[i].velocity.y += b[i].acceleration.y;
        b[i].velocity = vec2_limitMagnitude(b[i].velocity, maxSpeed);
    }

    function applyVelocity(i) {
        b[i].position.x += b[i].velocity.x;
        b[i].position.y += b[i].velocity.y;
    }

    function updateRotation(i) {
        b[i].angle = Math.atan2(b[i].velocity.y, b[i].velocity.x) + 3.14159/2;
    }

    function steer(desired) {
        let steer = desired;
        steer = vec2_limitMagnitude(steer, maxForce);
        return steer;
    }

    function limitMagnitude(baseVector, maxMagnitude) {
        const magnitude = baseVector.magnitude();
        let newVector = new Vector2(baseVector.x, baseVector.y);
        if(magnitude > maxMagnitude) {
            newVector = newVector.normalized().mul(maxMagnitude);
        }
        return newVector;
    }

    function testForEdge(i) {
        let triangle = b[i];

        let forwardVector = new Vector2(
            Math.sin(triangle.angle),
            -Math.cos(triangle.angle)
        );

        let ray = {
            x0: triangle.position.x,
            y0: triangle.position.y,
            x1: triangle.position.x + forwardVector.x * 100,
            y1: triangle.position.y + forwardVector.y * 100
        };

        let accelerationContribution = steer(vec2_mul(vec2_normalized((vec2_sub(mouseCoords, triangle.position))), 2));

        if(drawEdgeRay) {
            context.strokeStyle = '#ff0000';
            context.beginPath();
            context.moveTo(ray.x0, ray.y0);
            context.lineTo(ray.x1, ray.y1);
            context.stroke();
        }

        return accelerationContribution;
    }

    function avoid(triangleIndex) {
        let triangle = b[triangleIndex];

        let avoidAccel = new Vector2(0, 0);
        for(let i = 0; i < b.length; i++) {
            if(i === triangleIndex) continue;
            let difference = vec2_sub(triangle.position, b[i].position);
            const distance = vec2_magnitude(difference);
            if(distance < 50) {
                avoidAccel = vec2_add(avoidAccel, vec2_mul(vec2_normalized(difference), 1.0/distance));
            }
        }

        return steer(vec2_mul(vec2_normalized(avoidAccel), maxSpeed*2), triangle.velocity);
    }

    function cohesion(triangleIndex) {
        let triangle = b[triangleIndex];

        let sumPositions = new Vector2(0, 0);
        for(let i = 0; i < b.length; i++) {
            //if(i === triangleIndex) continue;
            let difference = vec2_sub(triangle.position, b[i].position);
            const distance = vec2_magnitude(difference);
            if(distance < 100) {
                sumPositions = vec2_add(sumPositions, b[i].position);
            }
        }
        sumPositions = vec2_mul(sumPositions, 1.0/b.length);
        sumPositions = vec2_sub(sumPositions, triangle.position);

        return steer(vec2_mul(vec2_normalized(sumPositions), maxSpeed), triangle.velocity);
    }

    function alignment(triangleIndex) {
        let velocity = new Vector2(0,0);
        let triangle = b[triangleIndex];

        for(let i = 0; i < b.length; i++) {
            if(i === triangleIndex) continue;
            let difference = vec2_sub(triangle.position, b[i].position);
            const distance = vec2_magnitude(difference);
            if(distance < 100) {
                velocity = vec2_add(velocity, b[i].velocity);
            }
        }
        velocity = vec2_mul(velocity, 1.0/(b.length));

        const alignAccel = steer(vec2_mul(vec2_normalized(velocity), maxSpeed), b[triangleIndex].velocity);

        if(drawAlignment) {
            context.strokeStyle = '#ff00ff';
            context.beginPath();
            context.moveTo(b[triangleIndex].position.x, b[triangleIndex].position.y);
            context.lineTo(b[triangleIndex].position.x + velocity.x * 40, b[triangleIndex].position.y + velocity.y * 40);
            context.stroke();
        }

        return alignAccel;
    }

    function updateTriangles(deltaTime) {
       for(let i = 0; i < b.length; i++) {

           //b[i].angle = b[i].angle % (2 * 3.14159);
           let edgeAccel = testForEdge(i);
           let avoidBirdAccel = avoid(i);
           let alignmentAccel = alignment(i);
           let cohesionAccel = cohesion(i);

           b[i].acceleration = new Vector2(0, 0);
           b[i].acceleration = vec2_add(b[i].acceleration, edgeAccel);
           b[i].acceleration = vec2_add(b[i].acceleration, alignmentAccel);
           b[i].acceleration = vec2_mul(vec2_add(b[i].acceleration, avoidBirdAccel), 2.0);
           b[i].acceleration = vec2_mul(vec2_add(b[i].acceleration, cohesionAccel), 0.5);
           applyAcceleration(i);
           applyVelocity(i);
           updateRotation(i);
       }
       for(let i = 0; i < b.length; i++) {
       }
    }

    function drawTriangles() {
        context.fillStyle = '#F8F8F8';

        for (let i = 0; i < b.length; i++) {
            const points = [
                {x: -10, y: 5},
                {x: 10, y: 5},
                {x: 0, y: -20}
            ];
            const angle = b[i].angle;
            const sn = Math.sin(angle);
            const cs = Math.cos(angle);
            for (let p = 0; p < points.length; p++) {
                let x = points[p].x;
                let y = points[p].y;
                points[p].x = x * cs - y * sn;
                points[p].y = x * sn + y * cs;
            }
            context.beginPath();
            context.moveTo(b[i].position.x + points[0].x, b[i].position.y + points[0].y);
            context.lineTo(b[i].position.x + points[1].x, b[i].position.y + points[1].y);
            context.lineTo(b[i].position.x + points[2].x, b[i].position.y + points[2].y);
            context.fill();
        }
    }

    // Main loop
    function main(deltaTime) {
        // Request animation frames
        window.requestAnimationFrame(main);
        context.fillStyle = "#FDFDFD";
        context.fillRect(0, 0, width, height);

        updateTriangles(deltaTime);

        drawTriangles();
    }

    main(0);
};