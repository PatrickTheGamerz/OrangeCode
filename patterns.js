// patterns.js - bullet patterns for enemy attacks

function spawnPattern(pattern, bullets, soulX, soulY) {
    bullets.length = 0;

    if (pattern === "simpleHorizontal") {
        bullets.push({ x: -10, y: 80, vx: 3, vy: 0 });
    } else if (pattern === "multiHorizontal") {
        for (let y = 50; y <= 110; y += 20) {
            for (let i = 0; i < 3; i++) {
                bullets.push({ x: -10 - i * 40, y, vx: 3.5, vy: 0 });
            }
        }
    } else if (pattern === "dummyAim") {
        for (let i = 0; i < 4; i++) {
            const dy = soulY - 80;
            const dx = soulX - 20;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const sp = 3;
            bullets.push({
                x: 20,
                y: 80,
                vx: (dx / len) * sp,
                vy: (dy / len) * sp
            });
        }
    } else if (pattern === "dummyAimBurst") {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const sp = 3.5;
            bullets.push({
                x: 130,
                y: 80,
                vx: Math.cos(angle) * sp,
                vy: Math.sin(angle) * sp
            });
        }
    } else if (pattern === "fallingFire") {
        for (let x = 40; x <= 220; x += 20) {
            bullets.push({ x, y: -10, vx: 0, vy: 3, type: "fire" });
        }
    } else if (pattern === "torielSideFire") {
        for (let y = 40; y <= 120; y += 20) {
            bullets.push({ x: -10, y, vx: 3, vy: 0, type: "fire" });
            bullets.push({ x: 260, y, vx: -3, vy: 0, type: "fire" });
        }
    } else if (pattern === "torielWaveFire") {
        for (let x = 40; x <= 220; x += 16) {
            bullets.push({ x, y: -10, vx: Math.sin(x / 20) * 0.8, vy: 3, type: "fire" });
        }
    } else if (pattern === "torielHandFire") {
        for (let x = 40; x <= 220; x += 30) {
            bullets.push({ x, y: 20, vx: 0, vy: 0, delay: 25, type: "fire" });
        }
        bullets.forEach(b => {
            b.update = function() {
                if (this.delay > 0) {
                    this.delay--;
                } else {
                    const dx = soulX - this.x;
                    const dy = soulY - this.y;
                    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    const sp = 3;
                    this.vx = (dx / len) * sp;
                    this.vy = (dy / len) * sp;
                }
            };
        });
    } else if (pattern === "bonesHorizontal") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 140, vx: 0, vy: -3, type: "bone" });
        }
    } else if (pattern === "bonesHorizontalReverse") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 0, vx: 0, vy: 3, type: "bone" });
        }
    } else if (pattern === "bonesHorizontalHigh") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 100, vx: 0, vy: -3, type: "bone" });
        }
    } else if (pattern === "fastBones") {
        for (let x = 0; x <= 240; x += 20) {
            bullets.push({ x, y: 140, vx: 0, vy: -5, type: "bone" });
        }
    } else if (pattern === "mixedBones") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 140, vx: 0, vy: -4, type: "bone" });
            bullets.push({ x, y: 0, vx: 0, vy: 4, type: "bone" });
        }
    } else if (pattern === "boneRain") {
        for (let x = 0; x <= 240; x += 24) {
            bullets.push({ x, y: -10, vx: 0, vy: 4, type: "bone" });
        }
    } else if (pattern === "sideBones") {
        for (let y = 20; y <= 140; y += 20) {
            bullets.push({ x: -10, y, vx: 4, vy: 0, type: "bone" });
            bullets.push({ x: 260, y, vx: -4, vy: 0, type: "bone" });
        }
    } else if (pattern === "sansKarma") {
        for (let x = 0; x <= 240; x += 24) {
            bullets.push({ x, y: 140, vx: 0, vy: -4, type: "bone" });
        }
        for (let y = 20; y <= 140; y += 20) {
            bullets.push({ x: -10, y, vx: 5, vy: 0, type: "bone" });
        }
    } else if (pattern === "sansSideSpam") {
        for (let i = 0; i < 10; i++) {
            bullets.push({ x: -10 - i * 20, y: 40, vx: 5, vy: 0, type: "bone" });
            bullets.push({ x: 260 + i * 20, y: 120, vx: -5, vy: 0, type: "bone" });
        }
    } else if (pattern === "blueAttackPhase") {
        for (let x = 0; x <= 240; x += 16) {
            const height = (x % 32 === 0) ? 140 : 100;
            bullets.push({ x: 260, y: height, vx: -4, vy: 0, type: "bone", color: "blue" });
        }
    }
}
