// patterns.js - bullet patterns for enemy attacks

function spawnPattern(pattern, bullets, soulX, soulY) {
    bullets.length = 0;

    if (pattern === "dummyNone") {
        // Does nothing!
    } else if (pattern === "dummyAim") {
        for (let i = 0; i < 4; i++) {
            const dy = soulY - 80;
            const dx = soulX - 20;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const sp = 4.5;
            bullets.push({
                x: 20, y: 80,
                vx: (dx / len) * sp, vy: (dy / len) * sp
            });
        }
    } else if (pattern === "dummyAimBurst") {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const sp = 5;
            bullets.push({
                x: 130, y: 80,
                vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp
            });
        }
    } else if (pattern === "dummyAimFast") {
        for (let i = 0; i < 6; i++) {
            bullets.push({
                x: 120, y: 40, vx: 0, vy: 0, delay: i * 15,
                type: "dummy_magic", w: 8, h: 8
            });
        }
        bullets.forEach(b => {
            if (b.type === "dummy_magic") {
                b.update = function() {
                    if (this.delay > 0) {
                        this.delay--;
                    } else if (this.delay === 0) {
                        const dy = soulY - this.y;
                        const dx = soulX - this.x;
                        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                        const sp = 6;
                        this.vx = (dx / len) * sp;
                        this.vy = (dy / len) * sp;
                        this.delay = -1;
                    }
                }
            }
        });
    } else if (pattern === "fallingFire") {
        for (let x = 40; x <= 220; x += 30) {
            bullets.push({ x, y: -20, vx: 0, vy: 4, type: "fire" });
        }
    } else if (pattern === "torielSideFire") {
        for (let y = 40; y <= 120; y += 30) {
            bullets.push({ x: -20, y, vx: 4, vy: 0, type: "fire" });
            bullets.push({ x: 260, y, vx: -4, vy: 0, type: "fire" });
        }
    } else if (pattern === "torielWaveFire") {
        for (let x = 40; x <= 220; x += 20) {
            bullets.push({ x, y: -20, vx: Math.sin(x / 20) * 1.5, vy: 4, type: "fire" });
        }
    } else if (pattern === "torielHandFire") {
        for (let x = 40; x <= 220; x += 40) {
            bullets.push({ x, y: 20, vx: 0, vy: 0, delay: 20, type: "fire" });
        }
        bullets.forEach(b => {
            b.update = function() {
                if (this.delay > 0) {
                    this.delay--;
                } else if (this.delay === 0) {
                    const dx = soulX - this.x;
                    const dy = soulY - this.y;
                    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    const sp = 4;
                    this.vx = (dx / len) * sp;
                    this.vy = (dy / len) * sp;
                    this.delay = -1; 
                }
            };
        });
    } else if (pattern === "torielAvoid") {
        // Toriel is missing on purpose because she gave up!
        bullets.push({ x: 100, y: -20, vx: -1.5, vy: 4, type: "fire" });
        bullets.push({ x: 160, y: -20, vx: 1.5, vy: 4, type: "fire" });
    } else if (pattern === "bonesHorizontal") {
        for (let x = 0; x <= 240; x += 40) {
            bullets.push({ x, y: 140, vx: 0, vy: -4, type: "bone", w: 8, h: 40 });
        }
    } else if (pattern === "bonesHorizontalReverse") {
        for (let x = 0; x <= 240; x += 40) {
            bullets.push({ x, y: -20, vx: 0, vy: 4, type: "bone", w: 8, h: 40 });
        }
    } else if (pattern === "bonesHorizontalHigh") {
        for (let x = 0; x <= 240; x += 40) {
            bullets.push({ x, y: 100, vx: 0, vy: -4, type: "bone", w: 8, h: 40 });
        }
    } else if (pattern === "fastBones") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 140, vx: 0, vy: -6, type: "bone", w: 8, h: 30 });
        }
    } else if (pattern === "mixedBones") {
        for (let x = 0; x <= 240; x += 40) {
            bullets.push({ x, y: 140, vx: 0, vy: -5, type: "bone", w: 8, h: 30 });
            bullets.push({ x: 20, y: -20, vx: 0, vy: 5, type: "bone", w: 8, h: 30 });
        }
    } else if (pattern === "boneRain") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: -20, vx: 0, vy: 5, type: "bone", w: 8, h: 30 });
        }
    } else if (pattern === "sideBones") {
        for (let y = 20; y <= 140; y += 30) {
            bullets.push({ x: -20, y, vx: 5, vy: 0, type: "bone", w: 40, h: 8 });
            bullets.push({ x: 260, y: y+15, vx: -5, vy: 0, type: "bone", w: 40, h: 8 });
        }
    } else if (pattern === "sansSideSpam") {
        for (let i = 0; i < 10; i++) {
            bullets.push({ x: -10 - i * 30, y: 40, vx: 6, vy: 0, type: "bone", w: 40, h: 8 });
            bullets.push({ x: 260 + i * 30, y: 120, vx: -6, vy: 0, type: "bone", w: 40, h: 8 });
        }
    } else if (pattern === "blueAttackPhase") {
        for (let x = 0; x <= 300; x += 30) {
            const height = (x % 60 === 0) ? 140 : 100;
            bullets.push({ x: x + 260, y: height, vx: -5, vy: 0, type: "bone", color: "blue", w: 10, h: 60 });
        }
    } else if (pattern === "papyrusFinal") {
        // Papyrus's long, exhausting final attack
        for (let x = 0; x <= 400; x += 40) {
            bullets.push({ x: x + 260, y: 140, vx: -5, vy: 0, type: "bone", w: 10, h: 40 });
        }
        // The giant, unavoidable bone at the end
        bullets.push({ x: 700, y: 70, vx: -5, vy: 0, type: "bone", w: 40, h: 100 });
    } else if (pattern === "gasterBlaster") {
        const targetX = soulX;
        bullets.push({ 
            x: targetX - 20, y: -50, vx: 0, vy: 0, w: 40, h: 250, 
            delay: 20, type: "laser", opacity: 0.2, color: "blue" 
        });
        
        bullets.forEach(b => {
            b.update = function() {
                if (this.delay > 0) {
                    this.delay--;
                } else if (this.delay === 0) {
                    this.opacity = 1.0; 
                    this.color = ""; 
                    this.delay = -1;
                    this.lifespan = 15;
                } else {
                    this.lifespan--;
                    if (this.lifespan <= 0) this.remove = true;
                }
            };
        });
    }
}
