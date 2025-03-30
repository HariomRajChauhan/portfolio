let canvas = document.getElementById('canvas');

let width = canvas.width = window.innerWidth/1.2;
let height = canvas.height = window.innerHeight/1.52;

let ctx = canvas.getContext('2d');

// i want to move the canvas using my mouse

let mouse = {
    x: undefined,
    y: undefined
}

let maxRadius = 40;
let minRadius = 2;

let colorArray = [
    '#2C3E50',
    '#E74C3C',
    '#ECF0F1',
    '#3498DB',
    '#2980B9'
];

window.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
}   );

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth/1.2;
    canvas.height = window.innerHeight/1.52;
    init();
});

function Circle(x, y, dx, dy, radius)
{
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.minRadius = radius;
    this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
    this.draw = function(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    this.update = function(){
        if(this.x + this.radius > width || this.x - this.radius < 0)
        {
            this.dx = -this.dx;
        }
        if(this.y + this.radius > height || this.y - this.radius < 0)
        {
            this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;

        // interactivity
        if(mouse.x - this.x < 50 && mouse.x - this.x > -50 && mouse.y - this.y < 50 && mouse.y - this.y > -50)
        {
            if(this.radius < maxRadius)
            {
                this.radius += 1;
            }
        }
        else if(this.radius > this.minRadius)
        {
            this.radius -= 1;
        }

        this.draw();
    }


}

let circleArray = [];

function init(){
    circleArray = [];
    for(let i = 0; i < 800; i++)
    {
        let radius = Math.random() * 3 + 1;
        let x = Math.random() * (width - radius * 2) + radius;
        let y = Math.random() * (height - radius * 2) + radius;
        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;
        circleArray.push(new Circle(x, y, dx, dy, radius));
    }
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    for(let i = 0; i < circleArray.length; i++)
    {
        circleArray[i].update();
    }
}

init();
animate();

