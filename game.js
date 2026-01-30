const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 180, y: 550, w: 40, h: 40, speed: 5 };
let blocks = [];
let frame = 0;
let gameOver = false;

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
});

function spawnBlock() {
    blocks.push({
        x: Math.random() * 360,
        y: -20,
        w: 40,
        h: 40,
        speed: 3 + Math.random() * 3
    });
}

function update() {
    if (gameOver) return;

    frame++;
    if (frame % 40 === 0) spawnBlock();

    blocks.forEach(b => b.y += b.speed);

    blocks = blocks.filter(b => b.y < 650);

    blocks.forEach(b => {
        if (
            player.x < b.x + b.w &&
            player.x + player.w > b.x &&
            player.y < b.y + b.h &&
            player.y + player.h > b.y
        ) {
            gameOver = true;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, 400, 600);

    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "red";
    blocks.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 80, 300);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
