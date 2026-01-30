// battle.js - battle system and combat rendering

let battleMenuIndex = 0;
let battleSubState = "menu";
let battleText = "";
let actIndex = 0;
let itemIndex = 0;
let talksDone = 0;
let canSpare = fals;

let fightMarkerPos = 0;
let fightMarkerDir = 1;
let fightInterval = null;

let soulX = 120, soulY = 100;
let soulVX = 0, soulVY = 0;
let keyState = {};
let gravity = 0;
let onGround = false;

let bullets = [];
let enemyInterval = null;
let enemyTurnTicks = 0;

function startBattle(enemyId) {
    currentEnemy = JSON.parse(JSON.stringify(enemies.find(e => e.id === enemyId)));
    currentEnemy.HP = currentEnemy.maxHP;
    battleMenuIndex = 0;
    battleSubState = "menu";
    battleText = `* ${currentEnemy.name} - ATK ${currentEnemy.AT} DEF ${currentEnemy.DF}`;
    talksDone = 0;
    canSpare = false;
    gameState = "battle";
    render();
}

function battleKeyDown(e) {
    const key = e.key.toLowerCase();

    if (battleSubState === "menu") {
        if (key === "a") {
            battleMenuIndex = (battleMenuIndex + 3) % 4;
            renderBattle();
        } else if (key === "d") {
            battleMenuIndex = (battleMenuIndex + 1) % 4;
            renderBattle();
        } else if (key === "z") {
            handleBattleMenuConfirm();
        }
        return;
    }

    if (battleSubState === "attackBar") {
        if (key === "z") {
            finishAttackBar();
        }
        return;
    }

    if (battleSubState === "actMenu") {
        if (key === "w" || key === "s") {
            actIndex = (actIndex + 1) % 2;
            renderBattle();
        } else if (key === "z") {
            handleActConfirm();
        } else if (key === "x") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "itemMenu") {
        if (currentPlayer.inventory.length === 0) {
            if (key === "z" || key === "x") {
                battleSubState = "menu";
                renderBattle();
            }
            return;
        }
        if (key === "w") {
            itemIndex = (itemIndex + currentPlayer.inventory.length - 1) % currentPlayer.inventory.length;
            renderBattle();
        } else if (key === "s") {
            itemIndex = (itemIndex + 1) % currentPlayer.inventory.length;
            renderBattle();
        } else if (key === "z") {
            useBattleItem();
        } else if (key === "x") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "text") {
        if (key === "z") {
            if (currentEnemy.HP <= 0) {
                endBattleWin();
            } else if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                startEnemyTurn();
            }
        }
        return;
    }

    if (battleSubState === "enemyTurn") {
        keyState[key] = true;
        return;
    }
}

function battleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (battleSubState === "enemyTurn") {
        keyState[key] = false;
    }
}

document.addEventListener("keyup", battleKeyUp);

function handleBattleMenuConfirm() {
    if (battleMenuIndex === 0) {
        startAttackBar();
    } else if (battleMenuIndex === 1) {
        battleSubState = "actMenu";
        actIndex = 0;
        renderBattle();
    } else if (battleMenuIndex === 2) {
        battleSubState = "itemMenu";
        itemIndex = 0;
        renderBattle();
    } else if (battleMenuIndex === 3) {
        if (canSpare) {
            battleText = "* You spared the enemy.";
            endBattleMercy();
        } else {
            battleSubState = "text";
            battleText = "* The enemy is not ready to be spared.";
            renderBattle();
        }
    }
}

function startAttackBar() {
    battleSubState = "attackBar";
    fightMarkerPos = 0;
    fightMarkerDir = 1;
    if (fightInterval) clearInterval(fightInterval);
    fightInterval = setInterval(() => {
        fightMarkerPos += fightMarkerDir * 8;
        if (fightMarkerPos >= 316) {
            fightMarkerPos = 316;
            fightMarkerDir = -1;
        }
        if (fightMarkerPos <= 0) {
            fightMarkerPos = 0;
            fightMarkerDir = 1;
        }
        renderBattle();
    }, 40);
    renderBattle();
}

function finishAttackBar() {
    if (fightInterval) clearInterval(fightInterval);
    const center = 158;
    const dist = Math.abs(fightMarkerPos - center);
    const multiplier = Math.max(0.2, 1 - dist / 160);
    const base = totalAT(currentPlayer) + 3;
    const damage = Math.max(1, Math.round(base * multiplier));
    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleSubState = "text";
    battleText = `* You hit ${currentEnemy.name} for ${damage} damage!`;
    renderBattle();
}

function handleActConfirm() {
    if (actIndex === 0) {
        battleSubState = "text";
        battleText = `* ${currentEnemy.name} - ATK ${currentEnemy.AT} DEF ${currentEnemy.DF}`;
    } else {
        talksDone++;
        if (talksDone >= currentEnemy.spareTalks) {
            canSpare = true;
            battleText = "* You talk to the enemy.\n* It seems satisfied with your words.";
        } else {
            battleText = "* You talk to the enemy.\n* It doesn't seem much for conversation.";
        }
        battleSubState = "text";
    }
    renderBattle();
}

function useBattleItem() {
    const item = currentPlayer.inventory[itemIndex];
    if (!item) return;
    if (item === "MONSTER CANDY") {
        currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 10);
        battleText = "* You ate the MONSTER CANDY.\n* You recovered 10 HP.";
    } else if (item === "SPIDER DONUT") {
        currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 12);
        battleText = "* You ate the SPIDER DONUT.\n* You recovered 12 HP.";
    } else if (item === "BUTTERSCOTCH PIE") {
        currentPlayer.HP = currentPlayer.maxHP;
        battleText = "* You ate the BUTTERSCOTCH PIE.\n* Your HP was maxed out.";
    } else {
        battleText = `* You used ${item}.`;
    }
    currentPlayer.inventory.splice(itemIndex, 1);
    battleSubState = "text";
    renderBattle();
}

function startEnemyTurn() {
    battleSubState = "enemyTurn";
    soulX = 120;
    soulY = 100;
    soulVX = 0;
    soulVY = 0;
    bullets = [];
    enemyTurnTicks = 0;
    gravity = currentEnemy.soulType === "blue" ? 0.5 : 0;
    onGround = false;

    const patterns = currentEnemy.patterns && currentEnemy.patterns.length ? currentEnemy.patterns : [currentEnemy.pattern];
    const chosen = patterns[Math.floor(Math.random() * patterns.length)];
    spawnPattern(chosen);

    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(() => {
        enemyTurnTicks++;
        updateSoul();
        updateBullets();
        checkBulletCollisions();
        if (enemyTurnTicks > 120) {
            clearInterval(enemyInterval);
            if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                battleSubState = "menu";
                battleText = "* The enemy is watching you.";
                renderBattle();
            }
        } else {
            renderBattle();
        }
    }, 40);
    renderBattle();
}

function updateSoul() {
    const speed = currentEnemy.soulType === "red" ? 4 : 3.5;
    if (currentEnemy.soulType === "red") {
        if (keyState["w"]) soulY -= speed;
        if (keyState["s"]) soulY += speed;
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
    } else {
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
        if (keyState["w"] && onGround) {
            soulVY = -6.5;
            onGround = false;
        }
        soulVY += gravity;
        soulY += soulVY;
        if (soulY >= 140) {
            soulY = 140;
            soulVY = 0;
            onGround = true;
        }
    }

    soulX = Math.max(10, Math.min(240, soulX));
    soulY = Math.max(10, Math.min(140, soulY));
}

function updateBullets() {
    bullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.ay) b.vy += b.ay;
        if (b.ax) b.vx += b.ax;
    });
    bullets = bullets.filter(b => b.x > -20 && b.x < 280 && b.y > -20 && b.y < 180 && !b.remove);
}

function checkBulletCollisions() {
    bullets.forEach(b => {
        const dx = soulX - b.x;
        const dy = soulY - b.y;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && !b.remove) {
            const dmg = Math.max(1, (currentEnemy.AT || 1) - totalDF(currentPlayer));
            currentPlayer.HP = Math.max(0, currentPlayer.HP - dmg);
            b.remove = true;
        }
    });
    bullets = bullets.filter(b => !b.remove);
}

function spawnPattern(pattern) {
    bullets = [];
    if (pattern === "simpleHorizontal") {
        for (let i = 0; i < 4; i++) {
            bullets.push({ x: -10 - i * 40, y: 80, vx: 4, vy: 0 });
        }
    } else if (pattern === "multiHorizontal") {
        for (let y = 40; y <= 120; y += 20) {
            for (let i = 0; i < 4; i++) {
                bullets.push({ x: -10 - i * 40, y, vx: 4, vy: 0 });
            }
        }
    } else if (pattern === "fallingFire") {
        for (let x = 20; x <= 240; x += 30) {
            bullets.push({ x, y: -10, vx: 0, vy: 3 });
        }
    } else if (pattern === "fallingFireWave") {
        for (let x = 20; x <= 240; x += 20) {
            bullets.push({ x, y: -10 - (x % 40), vx: 0, vy: 3.5 });
        }
    } else if (pattern === "bonesHorizontal") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 140, vx: 0, vy: -3 });
        }
    } else if (pattern === "fastBones") {
        for (let x = 0; x <= 240; x += 20) {
            bullets.push({ x, y: 140, vx: 0, vy: -5 });
        }
    } else if (pattern === "mixedBones") {
        for (let x = 0; x <= 240; x += 30) {
            bullets.push({ x, y: 140, vx: 0, vy: -4 });
            bullets.push({ x, y: 0, vx: 0, vy: 4 });
        }
    } else if (pattern === "boneRain") {
        for (let x = 0; x <= 240; x += 24) {
            bullets.push({ x, y: -10, vx: 0, vy: 4 });
        }
    } else if (pattern === "sideBones") {
        for (let y = 20; y <= 140; y += 20) {
            bullets.push({ x: -10, y, vx: 4, vy: 0 });
            bullets.push({ x: 260, y, vx: -4, vy: 0 });
        }
    } else if (pattern === "dummySpiral") {
        const cx = 130;
        const cy = 80;
        for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 * i) / 24;
            const speed = 2.5;
            bullets.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            });
        }
    } else if (pattern === "dummyRain") {
        for (let x = 10; x <= 250; x += 20) {
            bullets.push({ x, y: -10, vx: 0, vy: 3 + (x % 3) });
        }
    } else if (pattern === "sansKarma") {
        for (let x = 0; x <= 240; x += 24) {
            bullets.push({ x, y: 140, vx: 0, vy: -4 });
        }
        for (let y = 20; y <= 140; y += 20) {
            bullets.push({ x: -10, y, vx: 5, vy: 0 });
        }
    } else if (pattern === "sansSideSpam") {
        for (let i = 0; i < 10; i++) {
            bullets.push({ x: -10 - i * 20, y: 40, vx: 5, vy: 0 });
            bullets.push({ x: 260 + i * 20, y: 120, vx: -5, vy: 0 });
        }
    }
}

function endBattleWin() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    battleSubState = "text";
    battleText = `* You won!\n* You earned ${currentEnemy.gold}G and ${currentEnemy.exp} EXP. (Z)`;
    currentPlayer.G += currentEnemy.gold || 0;
    currentPlayer.EXP += currentEnemy.exp || 0;
    currentPlayer.kills += 1;
    if (currentPlayer.EXP >= currentPlayer.NEXT) {
        currentPlayer.LV += 1;
        currentPlayer.EXP = 0;
        currentPlayer.NEXT += 10;
        currentPlayer.maxHP += 4;
        currentPlayer.HP = currentPlayer.maxHP;
        currentPlayer.baseAT += 1;
        currentPlayer.baseDF += 1;
    }
    saves[currentSlot] = currentPlayer;
    saveSlot(currentSlot);
    renderBattle();
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z") {
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }
    };
}

function endBattleLose() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    battleSubState = "text";
    battleText = "* You died. (Z)";
    renderBattle();
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z") {
            document.onkeydown = handleKeyDown;
            loadSaves();
            useSave(currentSlot);
            gameState = "mainMenu";
            render();
        }
    };
}

function endBattleMercy() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    renderBattle();
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z") {
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }
    };
}

function enemySpriteClass() {
    if (!currentEnemy) return "";
    switch (currentEnemy.id) {
        case "dummy": return "enemy-dummy";
        case "mad_dummy": return "enemy-mad-dummy";
        case "toriel": return "enemy-toriel";
        case "papyrus": return "enemy-papyrus";
        case "p_sans": return "enemy-p-sans";
        case "us_sans": return "enemy-us-sans";
        default: return "";
    }
}

function renderBattle() {
    const g = document.getElementById("game");
    const hpPercent = currentPlayer && currentPlayer.maxHP ? (currentPlayer.HP / currentPlayer.maxHP) * 100 : 0;
    let hpColor = "#ff8000";
    if (hpPercent <= 25) hpColor = "#ff0000";
    else if (hpPercent >= 75) hpColor = "#ffff00";

    let subBoxHTML = "";

    if (battleSubState === "attackBar") {
        subBoxHTML = `
            <div class="fight-bar">
                <div class="fight-crit"></div>
                <div class="fight-marker" style="left:${fightMarkerPos}px;"></div>
            </div>
        `;
    } else if (battleSubState === "actMenu") {
        subBoxHTML = `
            <div class="sub-box">
                <div class="sub-option">${actIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}CHECK</div>
                <div class="sub-option">${actIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}TALK</div>
            </div>
        `;
    } else if (battleSubState === "itemMenu") {
        if (currentPlayer.inventory.length === 0) {
            subBoxHTML = `<div class="sub-box"><p>* You have no items.</p></div>`;
        } else {
            let itemsHTML = `<div class="sub-box"><p>* ITEMS</p>`;
            currentPlayer.inventory.forEach((it, i) => {
                itemsHTML += `<div class="sub-option">${i === itemIndex ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}${it}</div>`;
            });
            itemsHTML += `</div>`;
            subBoxHTML = itemsHTML;
        }
    }

    let soulBoxHTML = "";
    if (battleSubState === "enemyTurn") {
        const soulClass = currentEnemy.soulType === "blue" ? "soul blue" : "soul";
        let bulletsHTML = "";
        bullets.forEach(b => {
            bulletsHTML += `<div class="bullet" style="left:${b.x}px; top:${b.y}px;"></div>`;
        });
        soulBoxHTML = `
            <div class="soul-box">
                <div class="${soulClass}" style="left:${soulX}px; top:${soulY}px;"></div>
                ${bulletsHTML}
            </div>
        `;
    }

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="enemy-area">
                    <div class="enemy-sprite ${enemySpriteClass()}"></div>
                </div>
                <div class="battle-text">
                    <p>${battleText.replace(/\n/g,"<br>")}</p>
                </div>
                ${soulBoxHTML}
                ${subBoxHTML}
            </div>
            <div class="bottom-menu">
                <div>
                    <span class="button-box ${battleMenuIndex === 0 ? "selected" : ""}">FIGHT</span>
                    <span class="button-box ${battleMenuIndex === 1 ? "selected" : ""}">ACT</span>
                    <span class="button-box ${battleMenuIndex === 2 ? "selected" : ""}">ITEM</span>
                    <span class="button-box ${battleMenuIndex === 3 ? "selected" : ""}">MERCY</span>
                </div>
                <div style="margin-top:8px;">
                    <span>${currentPlayer.name || "HUMAN"}</span>
                    <span>LV ${currentPlayer.LV}</span>
                    <span>HP ${currentPlayer.HP}/${currentPlayer.maxHP}</span>
                    <span class="hp-bar"><span class="hp-fill" style="width:${hpPercent}%; background:${hpColor};"></span></span>
                </div>
            </div>
        </div>
    `;
}
