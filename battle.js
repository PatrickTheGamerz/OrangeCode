// battle.js - battle system and combat rendering

let battleMenuIndex = 0;
let battleSubState = "menu";
let battleTextArray = []; // Handles multi-box dialogue
let battleTextPageIndex = 0;
let battleFullText = "";
let battleShownText = "";
let battleTextIndex = 0;
let battleTextTimer = null;
let battleTextDone = true;

let actIndex = 0, itemIndex = 0, mercyIndex = 0;
let talksDone = 0, spareCount = 0;
let canSpare = false;

let fightMarkerPos = 0, fightMarkerDir = 1, fightInterval = null;

let soulX = 120, soulY = 100, soulVX = 0, soulVY = 0;
let keyState = {};
let gravity = 0;
let onGround = false;
let isJumping = false; // For variable jump height
let jumpHoldTimer = 0;

let bullets = [];
let enemyInterval = null, enemyTurnTicks = 0;
let showDog = false; // Flags the annoying dog sprite

let gameOverText = "", gameOverShownText = "", gameOverIndex = 0, gameOverTimer = null;

function setBattleText(textArray) {
    if (!Array.isArray(textArray)) textArray = [textArray];
    battleTextArray = textArray;
    battleTextPageIndex = 0;
    startTypingCurrentPage();
}

function startTypingCurrentPage() {
    if (battleTextTimer) clearInterval(battleTextTimer);
    battleFullText = battleTextArray[battleTextPageIndex];
    battleShownText = "";
    battleTextIndex = 0;
    battleTextDone = false;

    battleTextTimer = setInterval(() => {
        if (battleTextIndex >= battleFullText.length) {
            clearInterval(battleTextTimer);
            battleTextTimer = null;
            battleTextDone = true;
            renderBattle();
            return;
        }
        
        // Skip HTML tags instantly so they don't print letter by letter
        if (battleFullText[battleTextIndex] === "<") {
            let tag = "";
            while (battleFullText[battleTextIndex] !== ">" && battleTextIndex < battleFullText.length) {
                tag += battleFullText[battleTextIndex];
                battleTextIndex++;
            }
            tag += ">";
            battleShownText += tag;
            battleTextIndex++;
            return;
        }

        const ch = battleFullText[battleTextIndex];
        battleShownText += ch;
        battleTextIndex++;
        
        renderBattle();
    }, 30); // Fast typewriter
}

function instantFinishBattleText() {
    if (!battleFullText) return;
    if (battleTextTimer) clearInterval(battleTextTimer);
    battleShownText = battleFullText;
    battleTextIndex = battleFullText.length;
    battleTextDone = true;
    battleTextTimer = null;
    renderBattle();
}

function advanceBattleText() {
    if (!battleTextDone) {
        instantFinishBattleText();
        return;
    }
    
    if (battleTextPageIndex < battleTextArray.length - 1) {
        battleTextPageIndex++;
        startTypingCurrentPage();
    } else {
        // Dialogue is completely over
        if (battleSubState === "text") {
            if (currentEnemy.HP <= 0) {
                endBattleWin();
            } else if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                startEnemyTurn();
            }
        }
    }
}

function startBattle(enemyId) {
    currentEnemy = JSON.parse(JSON.stringify(enemies.find(e => e.id === enemyId)));
    currentEnemy.HP = currentEnemy.maxHP;
    currentEnemy.turnIndex = 0;
    battleMenuIndex = 0;
    battleSubState = "menu";
    talksDone = 0; spareCount = 0; canSpare = false; showDog = false;
    gameState = "battle";
    setBattleText(currentEnemy.openingText);
    render();
}

function battleKeyDown(e) {
    const key = e.key.toLowerCase();

    if (battleSubState === "menu") {
        if (key === "arrowleft" || key === "a") {
            battleMenuIndex = (battleMenuIndex + 3) % 4; renderBattle();
        } else if (key === "arrowright" || key === "d") {
            battleMenuIndex = (battleMenuIndex + 1) % 4; renderBattle();
        } else if (key === "z" || key === "enter") {
            handleBattleMenuConfirm();
        }
        return;
    }

    if (battleSubState === "attackBar") {
        if (key === "z" || key === "enter") finishAttackBar();
        return;
    }

    if (battleSubState === "actMenu" || battleSubState === "itemMenu" || battleSubState === "mercyMenu") {
        if (key === "x" || key === "shift") {
            battleSubState = "menu"; renderBattle(); return;
        }
    }

    if (battleSubState === "actMenu") {
        const opts = currentEnemy.actOptions || ["CHECK", "TALK"];
        if (key === "arrowup" || key === "w") { actIndex = (actIndex + opts.length - 1) % opts.length; renderBattle(); }
        else if (key === "arrowdown" || key === "s") { actIndex = (actIndex + 1) % opts.length; renderBattle(); }
        else if (key === "z" || key === "enter") handleActConfirm();
        return;
    }

    if (battleSubState === "mercyMenu") {
        if (key === "arrowup" || key === "w" || key === "arrowdown" || key === "s") {
            mercyIndex = 1 - mercyIndex; renderBattle();
        } else if (key === "z" || key === "enter") handleMercyConfirm();
        return;
    }

    if (battleSubState === "text" || battleSubState === "enemyDialogue") {
        if (key === "z" || key === "enter") advanceBattleText();
        return;
    }

    if (battleSubState === "enemyTurn") {
        keyState[key] = true;
        if (key === "arrowup") keyState["w"] = true;
        if (key === "arrowdown") keyState["s"] = true;
        if (key === "arrowleft") keyState["a"] = true;
        if (key === "arrowright") keyState["d"] = true;
        return;
    }
}

function battleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (battleSubState === "enemyTurn") {
        keyState[key] = false;
        if (key === "arrowup") keyState["w"] = false;
        if (key === "arrowdown") keyState["s"] = false;
        if (key === "arrowleft") keyState["a"] = false;
        if (key === "arrowright") keyState["d"] = false;
    }
}

document.addEventListener("keyup", battleKeyUp);

function handleBattleMenuConfirm() {
    if (battleMenuIndex === 0) startAttackBar();
    else if (battleMenuIndex === 1) { battleSubState = "actMenu"; actIndex = 0; renderBattle(); }
    else if (battleMenuIndex === 2) { battleSubState = "itemMenu"; itemIndex = 0; renderBattle(); }
    else if (battleMenuIndex === 3) { battleSubState = "mercyMenu"; mercyIndex = 0; renderBattle(); }
}

function handleMercyConfirm() {
    if (mercyIndex === 0) { // SPARE
        spareCount++;
        if (currentEnemy.id === "toriel" && spareCount >= currentEnemy.spareTurnsRequirement) canSpare = true;

        if (canSpare) {
            setBattleText(["* You spared the enemy."]);
            endBattleMercy();
        } else {
            battleSubState = "text";
            setBattleText(["* The enemy is not ready to be spared."]);
        }
    } else { // FLEE
        battleSubState = "text";
        setBattleText(["* You fled the battle..."]);
        setTimeout(() => {
            if (enemyInterval) clearInterval(enemyInterval);
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }, 600);
    }
}

function startAttackBar() {
    battleSubState = "attackBar"; fightMarkerPos = 0; fightMarkerDir = 1;
    if (fightInterval) clearInterval(fightInterval);
    fightInterval = setInterval(() => {
        fightMarkerPos += fightMarkerDir * 12; 
        if (fightMarkerPos >= 490) { fightMarkerPos = 490; fightMarkerDir = -1; }
        if (fightMarkerPos <= 0) { fightMarkerPos = 0; fightMarkerDir = 1; }
        renderBattle();
    }, 20); 
    renderBattle();
}

function finishAttackBar() {
    if (fightInterval) clearInterval(fightInterval);
    const center = 250;
    const dist = Math.abs(fightMarkerPos - center);
    const multiplier = Math.max(0.2, 1 - dist / 200);
    const base = totalAT(currentPlayer) + 3;
    let raw = Math.max(1, Math.round(base * multiplier));
    
    // BETRAYAL KILL LOGIC: If they can be spared, they drop their guard to -9999
    if (canSpare) currentEnemy.DF = -9999;
    
    raw = Math.max(1, raw - (currentEnemy.DF || 0));
    let damage = raw;

    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleSubState = "text";
    
    if (canSpare && currentEnemy.HP <= 0) {
        setBattleText([`* You dealt ${damage} damage!`, "* It was a devastating blow..."]);
    } else {
        if (multiplier <= 0.2) setBattleText(["* MISS!"]);
        else setBattleText([`* You hit ${currentEnemy.name} for ${damage} damage!`]);
    }
}

function handleActConfirm() {
    const opts = currentEnemy.actOptions || ["CHECK", "TALK"];
    const choice = opts[actIndex] || "CHECK";

    if (choice === "CHECK") {
        battleSubState = "text";
        setBattleText([`* ${currentEnemy.name} - ${currentEnemy.AT} ATK ${currentEnemy.DF} DEF\n${currentEnemy.checkDesc}`]);
    } else if (choice === "TALK") {
        battleSubState = "text";
        setBattleText(currentEnemy.talkTexts[0]);
    }
}

function startEnemyTurn() {
    const turn = currentEnemy.turnIndex || 0;

    // Check endurance SPARES before starting attack
    if (currentEnemy.id === "papyrus" && turn >= currentEnemy.surviveTurns) {
        canSpare = true;
        battleSubState = "text";
        setBattleText([`* ${currentEnemy.name} is sparing you.`]);
        return;
    }

    // Handle Enemy Pre-Attack Dialogue
    let dIndex = turn;
    if (currentEnemy.id === "toriel") dIndex = spareCount;
    
    if (currentEnemy.turnDialogues && currentEnemy.turnDialogues[dIndex]) {
        battleSubState = "enemyDialogue";
        showDog = (currentEnemy.id === "papyrus" && turn === 5); // Show dog on turn 5
        setBattleText(currentEnemy.turnDialogues[dIndex]);
    } else {
        executeEnemyBulletPhase(turn);
    }
}

// Called after enemy dialogue finishes
function advanceBattleText() {
    if (!battleTextDone) {
        instantFinishBattleText();
        return;
    }
    if (battleTextPageIndex < battleTextArray.length - 1) {
        battleTextPageIndex++;
        startTypingCurrentPage();
    } else {
        if (battleSubState === "enemyDialogue") {
            executeEnemyBulletPhase(currentEnemy.turnIndex || 0);
        } else if (battleSubState === "text") {
            if (currentEnemy.HP <= 0) endBattleWin();
            else if (currentPlayer.HP <= 0) endBattleLose();
            else startEnemyTurn();
        }
    }
}

function executeEnemyBulletPhase(turn) {
    battleSubState = "enemyTurn";
    soulX = 120; soulY = 100; soulVX = 0; soulVY = 0;
    bullets = []; enemyTurnTicks = 0; onGround = false;
    isJumping = false; jumpHoldTimer = 0;

    let chosen = currentEnemy.patterns[0];

    if (currentEnemy.id === "papyrus") {
        const seq = ["bonesHorizontal", "bonesHorizontalHigh", "papyrusJump", "bonesHorizontal", "bonesHorizontal", "papyrusFinal"];
        chosen = seq[Math.min(turn, seq.length - 1)];
        gravity = 0.6; // Papyrus turns you blue
    } else {
        gravity = 0;
    }

    spawnPattern(chosen, bullets, soulX, soulY);

    let turnDuration = 150;
    if (chosen === "papyrusFinal") turnDuration = 200; 

    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(() => {
        enemyTurnTicks++;
        updateSoul();
        updateBullets();
        checkBulletCollisions();
        
        if (enemyTurnTicks > turnDuration) {
            clearInterval(enemyInterval);
            if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                currentEnemy.turnIndex++;
                battleSubState = "menu";
                showDog = false;
                setBattleText(["* The enemy is watching you."]);
            }
        } else {
            renderBattle();
        }
    }, 30);
    renderBattle();
}

function updateSoul() {
    const speed = 5;
    
    if (gravity === 0) { // RED SOUL
        if (keyState["w"]) soulY -= speed;
        if (keyState["s"]) soulY += speed;
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
    } else { // BLUE SOUL (Variable Jump)
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
        
        if (keyState["w"] && onGround) {
            soulVY = -7.5; // Initial burst
            onGround = false;
            isJumping = true;
            jumpHoldTimer = 0;
        }
        
        // Hold W to jump higher
        if (keyState["w"] && isJumping) {
            jumpHoldTimer++;
            if (jumpHoldTimer < 12) soulVY -= 0.5; // Sustain upward momentum
        } else {
            isJumping = false;
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
        b.x += b.vx; b.y += b.vy;
    });
    bullets = bullets.filter(b => b.x > -300 && b.x < 800 && !b.remove);
}

function checkBulletCollisions() {
    bullets.forEach(b => {
        const bw = b.w || 10;
        const bh = b.h || 10;
        const inX = soulX + 6 > b.x && soulX - 6 < b.x + bw;
        const inY = soulY + 6 > b.y && soulY - 6 < b.y + bh;
        
        if (inX && inY && !b.remove) {
            applyEnemyDamage(b);
            b.remove = true;
        }
    });
    bullets = bullets.filter(b => !b.remove);
}

function applyEnemyDamage(b) {
    let dmg = Math.max(1, currentEnemy.AT - totalDF(currentPlayer));
    if (currentEnemy.id === "papyrus" && currentPlayer.HP - dmg <= 0) dmg = Math.max(0, currentPlayer.HP - 1); // Papyrus spares you
    currentPlayer.HP = Math.max(0, currentPlayer.HP - dmg);
}

function endBattleWin() {
    if (enemyInterval) clearInterval(enemyInterval);
    battleSubState = "text";
    currentPlayer.G += currentEnemy.gold || 0;
    currentPlayer.EXP += currentEnemy.exp || 0;
    setBattleText(["* You won!"]);
    // simplified for space
    document.onkeydown = (e) => { if (e.key === "z") { document.onkeydown = handleKeyDown; gameState = "mainMenu"; render(); } };
}

function endBattleLose() {
    if (currentEnemy.id === "papyrus") {
        if (enemyInterval) clearInterval(enemyInterval);
        battleSubState = "text";
        setBattleText(["* Papyrus captured you..."]);
        setTimeout(() => { document.onkeydown = handleKeyDown; gameState = "mainMenu"; render(); }, 1200);
    }
}

function endBattleMercy() {
    if (enemyInterval) clearInterval(enemyInterval);
    document.onkeydown = (e) => { if (e.key === "z") { document.onkeydown = handleKeyDown; gameState = "mainMenu"; render(); } };
}

function renderBattle() {
    const g = document.getElementById("game");
    const hpPercent = currentPlayer && currentPlayer.maxHP ? (currentPlayer.HP / currentPlayer.maxHP) * 100 : 0;
    const hpBarWidth = currentPlayer.maxHP * 1.5; 

    let subBoxHTML = "";
    if (battleSubState === "attackBar") {
        subBoxHTML = `<div class="sub-box"><div class="fight-bar"><div class="fight-crit"></div><div class="fight-marker" style="left:${fightMarkerPos}px;"></div></div></div>`;
    } else if (battleSubState === "actMenu") {
        subBoxHTML = `<div class="sub-box"><div class="sub-option">${'<span class="heart">♥</span>'}&nbsp;CHECK</div></div>`; // simplified
    } else if (battleSubState === "mercyMenu") {
        // YELLOW TEXT IF CAN SPARE
        const spareClass = canSpare ? "yellow-text" : "";
        subBoxHTML = `
            <div class="sub-box">
                <div class="sub-option ${spareClass}">${mercyIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;&nbsp;&nbsp;'}Spare</div>
                <div class="sub-option">${mercyIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;&nbsp;&nbsp;'}Flee</div>
            </div>
        `;
    }

    let soulBoxHTML = "";
    if (battleSubState === "enemyTurn") {
        const soulClass = gravity > 0 ? "soul blue" : "soul";
        let bulletsHTML = "";
        bullets.forEach(b => {
            const wStyle = b.w ? `width:${b.w}px; border-radius: 0;` : "";
            const hStyle = b.h ? `height:${b.h}px;` : "";
            bulletsHTML += `<div class="bullet" style="left:${b.x}px; top:${b.y}px; ${wStyle} ${hStyle}"></div>`;
        });
        soulBoxHTML = `<div class="soul-box"><div class="${soulClass}" style="left:${soulX}px; top:${soulY}px;"></div>${bulletsHTML}</div>`;
    }

    let enemyDialogueHTML = "";
    if (battleSubState === "enemyDialogue") {
        const fontClass = currentEnemy.fontClass || "";
        enemyDialogueHTML = `<div class="enemy-dialogue-box ${fontClass}" style="display:block;">${battleShownText.replace(/\n/g,"<br>")}</div>`;
    }

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="enemy-area">
                    <div class="enemy-sprite enemy-${currentEnemy.id}"></div>
                    ${enemyDialogueHTML}
                    ${showDog ? `<div class="annoying-dog"></div>` : ''}
                </div>
                ${soulBoxHTML ? '' : `<div class="battle-text">${battleShownText.replace(/\n/g,"<br>")}</div>`}
                ${soulBoxHTML}
                ${subBoxHTML}
            </div>
            <div class="bottom-menu">
                <div class="battle-status-line">
                    <span>${currentPlayer.name || "CHARA"}</span>
                    <span>LV ${currentPlayer.LV}</span>
                    <span>HP</span>
                    <span class="hp-bar" style="width: ${hpBarWidth}px;"><span class="hp-fill-yellow" style="width:${hpPercent}%;"></span></span>
                    <span>${currentPlayer.HP} / ${currentPlayer.maxHP}</span>
                </div>
                <div class="battle-buttons-line">
                    <span class="button-box ${battleMenuIndex === 0 ? "selected" : ""}">FIGHT</span>
                    <span class="button-box ${battleMenuIndex === 1 ? "selected" : ""}">ACT</span>
                    <span class="button-box ${battleMenuIndex === 2 ? "selected" : ""}">ITEM</span>
                    <span class="button-box ${battleMenuIndex === 3 ? "selected" : ""}">MERCY</span>
                </div>
            </div>
        </div>
    `;
}
