// patterns.js - bullet patterns for enemy attacks

function spawnPattern(pattern, bullets, soulX, soulY) {
    bullets.length = 0;

    if (pattern === "bonesHorizontal") {
        // Simple hurdles scrolling left
        for (let x = 0; x <= 400; x += 100) {
            bullets.push({ x: x + 260, y: 130, vx: -5, vy: 0, type: "bone", w: 10, h: 30 });
        }
    } else if (pattern === "bonesHorizontalHigh") {
        // High hurdles you barely have to jump
        for (let x = 0; x <= 400; x += 100) {
            bullets.push({ x: x + 260, y: 110, vx: -5, vy: 0, type: "bone", w: 10, h: 50 });
        }
    } else if (pattern === "papyrusJump") {
        // Staggered varying height bones requiring precision jumping
        bullets.push({ x: 260, y: 130, vx: -5, vy: 0, type: "bone", w: 10, h: 30 }); // Short
        bullets.push({ x: 340, y: 100, vx: -5, vy: 0, type: "bone", w: 10, h: 60 }); // Tall
        bullets.push({ x: 420, y: 130, vx: -5, vy: 0, type: "bone", w: 10, h: 30 }); // Short
        bullets.push({ x: 500, y: 80, vx: -5, vy: 0, type: "bone", w: 10, h: 80 });  // Very Tall! Hold W!
    } else if (pattern === "papyrusFinal") {
        // The normal attack after the dog steals the special attack
        bullets.push({ x: 260, y: 120, vx: -4, vy: 0, type: "bone", w: 10, h: 40 });
        bullets.push({ x: 300, y: 120, vx: -4, vy: 0, type: "bone", w: 10, h: 40 });
        // The giant, unavoidable bone at the end
        bullets.push({ x: 600, y: 70, vx: -4, vy: 0, type: "bone", w: 40, h: 100 });
    }
    // (Toriel patterns remain the same)
}
