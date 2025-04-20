const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scissorsLoaded = false;
const scissorsImage = new Image();
scissorsImage.src = 'RockPaperScissors/svgs/hand-scissors-solid-red.svg';

let rockLoaded = false;
const rockImage = new Image();
rockImage.src = 'RockPaperScissors/svgs/hand-back-fist-solid-red.svg';

let paperLoaded = false;
const paperImage = new Image();
paperImage.src = 'RockPaperScissors/svgs/hand-solid-red.svg';



const images = [scissorsImage, rockImage, paperImage];

let particlesArray;

class Particle {
    constructor(x, y, dirX, dirY, rot, rotSpeed, size, color, image) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.rot = rot;
        this.rotSpeed = rotSpeed;
        this.size = size;
        this.color = color;
        this.image = image;
    }

    draw() {
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        // ctx.fillStyle = '#8C5523';
        // ctx.fill();
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(this.rot * Math.PI/180);
        ctx.drawImage(this.image, -this.x, -this.y, this.size, this.size);
        ctx.restore();
    }

    update() {
        //check if hit edge of canvas, if it has then change direction
        if(this.x > canvas.width || this.x < 0) {
            this.dirX = -this.dirX;
            this.rotX = this.rotX - 180;
        }
        if(this.y > canvas.height || this.y < 0) {
            this.dirY = -this.dirY;
            this.rotY = -this.rotY - 180;
        }

        this.x += this.dirX;
        this.y += this.dirY;

        this.rot += this.rotSpeed;

        this.draw();
     }
}

function init() {
    particlesArray = [];

    let numParticles = (canvas.height * canvas.width) / 9000;

    for(let i = 0; i < numParticles; i++) {
        let size = (Math.random() * 15) + 10;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let dirX = (Math.random() * 0.05);
        let dirY = (Math.random() * 0.05);
        let color = '#EB7B7B';
        let particleImg = images[Math.floor((Math.random() * 3))];
        let rot = (Math.random() * 360);
        let rotSpeed = 0.01;

        particlesArray.push(new Particle(x, y, dirX, dirY, rot, rotSpeed, size, color, particleImg));
    }
    console.log(particlesArray);
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for(let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }

}

scissorsImage.onload = function() {
    scissorsLoaded = true;

    if(paperImage && rockLoaded) {
        start();
    }
}

paperImage.onload = function() {
    paperLoaded = true;

    if(scissorsLoaded && rockLoaded) {
        start();
    }
}

rockImage.onload = function() {
    rockLoaded = true;

    if(paperImage && scissorsLoaded) {
        start();
    }
}


function start() {
    init();
    animate();
}

addEventListener("resize", (event) => {
    console.log("resized");
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particlesArray = [];
    init();
    animate();
});
// init();
// animate();