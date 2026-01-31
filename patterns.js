// patterns.js - enemy attack patterns

// bullets: { x, y, vx, vy, type, color, ay, ax, remove, sprite }

function spawnPattern(pattern, soulX, soulY, enemy) {
    bullets = [];

    switch (pattern) {
        /* DUMMY */
        case "dummySimple":
            for (let y = 60; y <= 120; y += 20) {
                bullets.push({ x: -10, y, vx: 3, vy: 0, type: "bullet" });
            }
            break;

        /* MAD DUMMY - scribble style */

        case "madDummySimple":
            for (let i = 0; i < 6; i++) {
                const dy = soulY - 80;
                const dx = soulX - 40;
                const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                const sp = 3 + Math.random() * 1.5;
                bullets.push({
                    x: 40,
                    y: 80,
                    vx: (dx / len) * sp,
                    vy: (dy / len) * sp,
                    type: "bullet"
                });
            }
            break;

        case "madDummyWalls":
            for (let y = 40; y <= 140; y += 20) {
                bullets.push({ x: -10, y, vx: 3.5, vy: 0, type: "bullet" });
                bullets.push({ x: 260, y, vx: -3.5, vy: 0, type: "bullet" });
            }
            break;

        case "madDummyChase":
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const sp = 2.5;
                bullets.push({
                    x: 130,
                    y: 80,
                    vx: Math.cos(angle) * sp,
                    vy: Math.sin(angle) * sp,
                    type: "chase",
                    life: 40
                });
            }
            break;

        /* TORIEL */

        case "torielFireRain":
            for (let x = 30; x <= 230; x += 18) {
                bullets.push({ x, y: -10, vx: 0, vy: 3, type: "fire" });
            }
            break;

        case "torielFireWalls":
            for (let y = 40; y <= 140; y += 16) {
                bullets.push({ x: -10, y, vx: 3, vy: 0, type: "fire" });
                bullets.push({ x: 260, y, vx: -3, vy: 0, type: "fire" });
            }
            break;

        case "torielHandShot":
            // hand sweeps left->right spawning fire that later shoots at soul
            for (let x = 40; x <= 220; x += 30) {
                bullets.push({
                    x,
                    y: 40,
                    vx: 0,
                    vy: 0.5,
                    type: "fireDelay",
                    delay: 20
                });
            }
            break;

        /* PAPYRUS */

        case "papyrusPhase1":
            // 3 bones from bottom
            for (let x = 60; x <= 180; x += 60) {
                bullets.push({ x, y: 160, vx: 0, vy: -3, type: "bone" });
            }
            break;

        case "papyrusPhase2":
            // 3 bones from top
            for (let x = 60; x <= 180; x += 60) {
                bullets.push({ x, y: -20, vx: 0, vy: 3, type: "bone" });
            }
            break;

        case "papyrusBlueAttack":
            // blue bones glued to top/bottom, moving horizontally
            for (let y = 30; y <= 140; y += 20) {
                const fromTop = (y % 40 === 0);
                const yy = fromTop ? 20 : 140;
                bullets.push({
                    x: 260,
                    y: yy,
                    vx: -4,
                    vy: 0,
                    type: "boneBlue"
                });
            }
            break;

        case "papyrusSpecial":
            // mix of vertical and horizontal bones
            for (let x = 40; x <= 220; x += 30) {
                bullets.push({ x, y: 160, vx: 0, vy: -4, type: "bone" });
            }
            for (let y = 40; y <= 140; y += 20) {
                bullets.push({ x: -10, y, vx: 4, vy: 0, type: "bone" });
            }
            break;

        /* SANS / US SANS placeholders (reuse old patterns) */

        case "sansFastBones":
            for (let x = 0; x <= 240; x += 20) {
                bullets.push({ x, y: 140, vx: 0, vy: -5, type: "bone" });
            }
            break;

        case "sansKarma":
            for (let x = 0; x <= 240; x += 24) {
                bullets.push({ x, y: 140, vx: 0, vy: -4, type: "bone" });
            }
            for (let y = 20; y <= 140; y += 20) {
                bullets.push({ x: -10, y, vx: 5, vy: 0, type: "bone" });
            }
            break;

        case "sansSideSpam":
            for (let i = 0; i < 10; i++) {
                bullets.push({ x: -10 - i * 20, y: 40, vx: 5, vy: 0, type: "bone" });
                bullets.push({ x: 260 + i * 20, y: 120, vx: -5, vy: 0, type: "bone" });
            }
            break;

        case "usSansMixedBones":
            for (let x = 0; x <= 240; x += 30) {
                bullets.push({ x, y: 140, vx: 0, vy: -4, type: "bone" });
                bullets.push({ x, y: 0, vx: 0, vy: 4, type: "bone" });
            }
            break;

        default:
            // fallback simple
            for (let y = 60; y <= 120; y += 20) {
                bullets.push({ x: -10, y, vx: 3, vy: 0, type: "bullet" });
            }
            break;
    }
}
