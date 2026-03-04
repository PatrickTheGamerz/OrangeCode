// patterns.js - Bullet Logic
function spawnPattern(pattern, bullets, soulX, soulY) {
    bullets.length = 0;
    if (pattern === "dummyNone") { return; }
    else if (pattern === "bonesHorizontal") {
        for (let x = 0; x <= 400; x += 100) bullets.push({ x: x + 260, y: 130, vx: -5, vy: 0, type: "bone", w: 10, h: 30 });
    } else if (pattern === "bonesHorizontalHigh") {
        for (let x = 0; x <= 400; x += 100) bullets.push({ x: x + 260, y: 110, vx: -5, vy: 0, type: "bone", w: 10, h: 50 });
    } else if (pattern === "papyrusJump") {
        bullets.push({ x: 260, y: 130, vx: -5, vy: 0, type: "bone", w: 10, h: 30 });
        bullets.push({ x: 340, y: 100, vx: -5, vy: 0, type: "bone", w: 10, h: 60 });
        bullets.push({ x: 420, y: 130, vx: -5, vy: 0, type: "bone", w: 10, h: 30 });
        bullets.push({ x: 500, y: 80, vx: -5, vy: 0, type: "bone", w: 10, h: 80 });
    } else if (pattern === "papyrusFinal") {
        bullets.push({ x: 260, y: 120, vx: -4, vy: 0, type: "bone", w: 10, h: 40 });
        bullets.push({ x: 300, y: 120, vx: -4, vy: 0, type: "bone", w: 10, h: 40 });
        bullets.push({ x: 600, y: 70, vx: -4, vy: 0, type: "bone", w: 40, h: 100 });
    } else if (pattern === "fastBones") {
        for (let x = 0; x <= 240; x += 30) bullets.push({ x, y: 140, vx: 0, vy: -6, type: "bone", w: 8, h: 30 });
    } else if (pattern === "torielHandFire") {
        for (let x = 40; x <= 220; x += 40) bullets.push({ x, y: 20, vx: 0, vy: 0, delay: 20, type: "fire" });
        bullets.forEach(b => {
            b.update = function() {
                if (this.delay > 0) this.delay--;
                else if (this.delay === 0) {
                    const dx = soulX - this.x, dy = soulY - this.y;
                    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    this.vx = (dx / len) * 4; this.vy = (dy / len) * 4; this.delay = -1;
                }
            };
        });
    } else if (pattern === "fallingFire") {
        for (let x = 40; x <= 220; x += 30) bullets.push({ x, y: -20, vx: 0, vy: 4, type: "fire" });
    } else if (pattern === "torielSideFire") {
        for (let y = 40; y <= 120; y += 30) {
            bullets.push({ x: -20, y, vx: 4, vy: 0, type: "fire" });
            bullets.push({ x: 260, y, vx: -4, vy: 0, type: "fire" });
        }
    } else if (pattern === "torielWaveFire") {
        for (let x = 40; x <= 220; x += 20) bullets.push({ x, y: -20, vx: Math.sin(x / 20) * 1.5, vy: 4, type: "fire" });
    }
}
