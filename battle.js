// battle.js - battle system and combat rendering

let battleMenuIndex = 0;
let battleSubState = "menu";
let battleText = "";
let battleFullText = "";
let battleShownText = "";
let battleTextIndex = 0;
let battleTextTimer = null;
let battleTextDone = true;

let actIndex = 0;
let itemIndex = 0;
let talksDone = 0;
let spareCount = 0; // Added for Toriel
let canSpare = false;

let mercyIndex = 0;

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

let gameOverText = "";
let gameOverShownText = "";
let gameOverIndex = 0;
let gameOverTimer = null;

function setBattleText(text) {
    if (battleTextTimer) clearInterval(battleTextTimer);
    battleFullText = text;
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
        const ch = battleFullText[battleTextIndex];
        battleShownText += ch;
        battleTextIndex++;
        let delay = 30; 
        if (ch === "." || ch === "," || ch === "!" || ch === "?") delay = 150;
        clearInterval(battleTextTimer);
        battleTextTimer = setInterval(() => {
            clearInterval(battleTextTimer);
            battleTextTimer = null;
            setBattleTextContinue();
        }, delay);
        renderBattle();
    }, 0);
}

function setBattleTextContinue() {
    if (battleTextIndex >= battleFullText.length) {
        battleTextDone = true;
        renderBattle();
        return;
    }
    const ch = battleFullText[battleTextIndex];
    battleShownText += ch;
    battleTextIndex++;
    let delay = 30;
    if (ch === "." || ch === "," || ch === "!" || ch === "?") delay = 150;
    battleTextTimer = setInterval(() => {
        clearInterval(battleTextTimer);
        battleTextTimer = null;
        setBattleTextContinue();
    }, delay);
    renderBattle();
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

function startBattle(enemyId) {
    currentEnemy = JSON.parse(JSON.stringify(enemies.find(e => e.id === enemyId)));
    currentEnemy.HP = currentEnemy.maxHP;
    currentEnemy.turnIndex = 0;
    battleMenuIndex = 0;
    battleSubState = "menu";
    talksDone = 0;
    spareCount = 0;
    canSpare = false;
    
    if (currentEnemy.id === "p_sans") canSpare = true; // Sleepy Sans

    mercyIndex = 0;
    gameState = "battle";
    battleText = currentEnemy.openingText || `* ${currentEnemy.name} blocks the way!`;
    setBattleText(battleText);
    render();
}

function battleKeyDown(e) {
    const key = e.key.toLowerCase();

    if (battleSubState === "menu") {
        if (key === "arrowleft" || key === "a") {
            battleMenuIndex = (battleMenuIndex + 3) % 4;
            renderBattle();
        } else if (key === "arrowright" || key === "d") {
            battleMenuIndex = (battleMenuIndex + 1) % 4;
            renderBattle();
        } else if (key === "z" || key === "enter") {
            handleBattleMenuConfirm();
        }
        return;
    }

    if (battleSubState === "attackBar") {
        if (key === "z" || key === "enter") finishAttackBar();
        return;
    }

    if (battleSubState === "actMenu") {
        const opts = currentEnemy.actOptions || ["CHECK", "TALK"];
        if (key === "arrowup" || key === "w") {
            actIndex = (actIndex + opts.length - 1) % opts.length;
            renderBattle();
        } else if (key === "arrowdown" || key === "s") {
            actIndex = (actIndex + 1) % opts.length;
            renderBattle();
        } else if (key === "z" || key === "enter") {
            handleActConfirm();
        } else if (key === "x" || key === "shift") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "itemMenu") {
        if (currentPlayer.inventory.length === 0) {
            if (key === "z" || key === "x" || key === "enter" || key === "shift") {
                battleSubState = "menu";
                renderBattle();
            }
            return;
        }
        if (key === "arrowup" || key === "w") {
            itemIndex = (itemIndex + currentPlayer.inventory.length - 1) % currentPlayer.inventory.length;
            renderBattle();
        } else if (key === "arrowdown" || key === "s") {
            itemIndex = (itemIndex + 1) % currentPlayer.inventory.length;
            renderBattle();
        } else if (key === "z" || key === "enter") {
            useBattleItem();
        } else if (key === "x" || key === "shift") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "mercyMenu") {
        if (key === "arrowup" || key === "w" || key === "arrowdown" || key === "s") {
            mercyIndex = 1 - mercyIndex;
            renderBattle();
        } else if (key === "z" || key === "enter") {
            handleMercyConfirm();
        } else if (key === "x" || key === "shift") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "text") {
        if (key === "z" || key === "enter") {
            if (!battleTextDone) {
                instantFinishBattleText();
                return;
            }
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
        battleSubState = "mercyMenu";
        mercyIndex = 0;
        renderBattle();
    }
}

function handleMercyConfirm() {
    if (mercyIndex === 0) { // SPARE
        spareCount++;
        
        if (currentEnemy.id === "toriel") {
            if (spareCount >= currentEnemy.spareTurnsRequirement) {
                canSpare = true;
                currentEnemy.DF = -9999; // Toriel betrayal kill threshold
            }
        }

        if (canSpare) {
            battleText = "* You spared the enemy.";
            setBattleText(battleText);
            endBattleMercy();
        } else {
            battleSubState = "text";
            if (currentEnemy.id === "toriel") {
                 battleText = "* Toriel looks through you.";
            } else if (currentEnemy.id === "papyrus") {
                 battleText = "* Papyrus refuses your mercy.";
            } else {
                 battleText = "* The enemy is not ready to be spared.";
            }
            setBattleText(battleText);
            renderBattle();
        }
    } else { // FLEE
        battleSubState = "text";
        battleText = "* You fled the battle...";
        setBattleText(battleText);
        renderBattle();
        setTimeout(() => {
            if (enemyInterval) clearInterval(enemyInterval);
            if (fightInterval) clearInterval(fightInterval);
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }, 600);
    }
}

function startAttackBar() {
    battleSubState = "attackBar";
    fightMarkerPos = 0;
    fightMarkerDir = 1;
    if (fightInterval) clearInterval(fightInterval);
    fightInterval = setInterval(() => {
        fightMarkerPos += fightMarkerDir * 12; 
        if (fightMarkerPos >= 490) {
            fightMarkerPos = 490;
            fightMarkerDir = -1;
        }
        if (fightMarkerPos <= 0) {
            fightMarkerPos = 0;
            fightMarkerDir = 1;
        }
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
    raw = Math.max(1, raw - (currentEnemy.DF || 0));
    let damage = raw;
    
    // Betrayal / Dodge Logic
    let isBetrayal = false;
    if (currentEnemy.id === "toriel" && canSpare) {
        damage = 9999;
        isBetrayal = true;
    } else if (currentEnemy.id === "p_sans") {
        damage = 0; // Sans dodges
    }

    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleSubState = "text";
    
    if (isBetrayal && currentEnemy.HP <= 0) {
        battleText = currentEnemy.betrayalText || `* You dealt ${damage} damage!`;
    } else if (currentEnemy.id === "p_sans") {
        battleText = "* Sans dodged the attack.";
    } else {
        if (multiplier <= 0.2) {
             battleText = `* MISS!`;
        } else {
             battleText = `* You hit ${currentEnemy.name} for ${damage} damage!`;
        }
    }
    
    setBattleText(battleText);
    renderBattle();
}

function handleActConfirm() {
    const opts = currentEnemy.actOptions || ["CHECK", "TALK"];
    const choice = opts[actIndex] || "CHECK";

    if (choice === "CHECK") {
        battleSubState = "text";
        const at = currentEnemy.checkAT != null ? currentEnemy.checkAT : currentEnemy.AT;
        const df = currentEnemy.checkDF != null ? currentEnemy.checkDF : currentEnemy.DF;
        const desc = currentEnemy.checkDesc || "";
        battleText = `* ${currentEnemy.name} - ${at} ATK ${df} DEF\n${desc}`;
        setBattleText(battleText);
    } else if (choice === "TALK") {
        talksDone++;
        if (currentEnemy.id === "dummy" && talksDone >= currentEnemy.spareTalks) {
            canSpare = true;
        }
        battleSubState = "text";
        if (currentEnemy.id === "toriel") {
             battleText = "* You couldn't think of any\n  conversation topics.";
        } else if (currentEnemy.id === "mad_dummy") {
             battleText = "* You talk to the MAD DUMMY.\n* It pretends not to hear you.";
        } else {
             battleText = (currentEnemy.talkTexts && currentEnemy.talkTexts[0]) || "* You try to talk.\n* It doesn't seem much for\n  conversation.";
        }
        setBattleText(battleText);
    } else if (choice === "FLIRT") {
        battleSubState = "text";
        if (currentEnemy.id === "papyrus") {
             battleText = "* You flirt with Papyrus.\n* He becomes flustered!\n* 'WOWIE! A DATE?!'";
        } else {
             battleText = "* You flirt.\n* Nothing happens.";
        }
        setBattleText(battleText);
    } else if (choice === "INSULT") {
        battleSubState = "text";
        if (currentEnemy.id === "papyrus") {
             battleText = "* You insult Papyrus.\n* He doesn't seem to understand.";
        } else {
             battleText = "* You insult the enemy.\n* It doesn't seem to care.";
        }
        setBattleText(battleText);
    } else if (choice === "CHALLENGE") {
        battleSubState = "text";
        battleText = "* You challenge Sans to a\n  jumping contest.\n* He accepts!";
        setBattleText(battleText);
    } else if (choice === "STARE") {
        battleSubState = "text";
        battleText = "* You stare at the Mad Dummy.\n* It glares back.";
        setBattleText(battleText);
    }
    renderBattle();
}

function useBattleItem() {
    const item = currentPlayer.inventory[itemIndex];
    if (!item) return;
    if (item.type === "heal") {
        if (item.name === "MONSTER CANDY") {
            currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 10);
            battleText = "* You ate the MONSTER CANDY.\n* You recovered 10 HP.";
        } else if (item.name === "BUTTERSCOTCH PIE") {
            currentPlayer.HP = currentPlayer.maxHP;
            battleText = "* You ate the BUTTERSCOTCH PIE.\n* Your HP was maxed out.";
        } else {
            currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 12);
            battleText = `* You used ${item.name}.`;
        }
        currentPlayer.inventory.splice(itemIndex, 1);
    } else {
        battleText = `* You can't use that here.`;
    }
    battleSubState = "text";
    setBattleText(battleText);
    renderBattle();
}

function startEnemyTurn() {
    const turn = currentEnemy.turnIndex || 0;

    // Check endurance SPARES before starting attack
    if ((currentEnemy.id === "papyrus" || currentEnemy.id === "us_sans") && turn >= currentEnemy.surviveTurns) {
        canSpare = true;
        battleSubState = "text";
        battleText = `* ${currentEnemy.name} is sparing you.`;
        setBattleText(battleText);
        renderBattle();
        return;
    }
    if (currentEnemy.id === "mad_dummy" && turn >= currentEnemy.surviveTurns) {
        canSpare = true;
        battleSubState = "text";
        battleText = "* Mad Dummy ran out of magic.";
        setBattleText(battleText);
        renderBattle();
        return;
    }

    battleSubState = "enemyTurn";
    soulX = 120;
    soulY = 100;
    soulVX = 0;
    soulVY = 0;
    bullets = [];
    enemyTurnTicks = 0;
    gravity = currentEnemy.soulType === "blue" ? 0.5 : 0;
    onGround = false;

    let chosen = currentEnemy.patterns[0];

    // Character-specific attack logic
    if (currentEnemy.id === "papyrus") {
        const seq = [
            "blueAttackPhase", "bonesHorizontal", "bonesHorizontalReverse", 
            "fastBones", "bonesHorizontalHigh", "sideBones", 
            "mixedBones", "boneRain", "mixedBones", "fastBones",
            "sideBones", "bonesHorizontal", "dummyNone", "papyrusFinal"
        ];
        chosen = seq[Math.min(turn, seq.length - 1)];
    } else if (currentEnemy.id === "us_sans") {
        const seq = ["fastBones", "mixedBones", "boneRain", "sansSideSpam", "fastBones", "mixedBones", "papyrusFinal"];
        chosen = seq[Math.min(turn, seq.length - 1)];
    } else if (currentEnemy.id === "toriel") {
        if (canSpare) chosen = "torielAvoid"; // She stops hitting you
        else chosen = currentEnemy.patterns[Math.floor(Math.random() * currentEnemy.patterns.length)];
    } else {
        chosen = currentEnemy.patterns[Math.floor(Math.random() * currentEnemy.patterns.length)];
    }

    spawnPattern(chosen, bullets, soulX, soulY);

    let turnDuration = 150;
    if (chosen === "papyrusFinal" || chosen === "gasterBlaster") turnDuration = 240; 

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
                if (currentEnemy.id === "papyrus" && currentEnemy.turnIndex === 1) {
                    battleText = "* You're blue now.";
                } else {
                    battleText = "* The enemy is watching you.";
                }
                setBattleText(battleText);
                renderBattle();
            }
        } else {
            renderBattle();
        }
    }, 30);
    renderBattle();
}

function updateSoul() {
    const speed = currentEnemy.soulType === "red" ? 5 : 4.5;
    
    if (currentEnemy.soulType === "red") {
        if (keyState["w"]) soulY -= speed;
        if (keyState["s"]) soulY += speed;
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
    } else {
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
        if (keyState["w"] && onGround) {
            soulVY = -10; // High jump for Papyrus' final attack
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
        if (b.update) b.update();
        b.x += b.vx;
        b.y += b.vy;
        if (b.ay) b.vy += b.ay;
        if (b.ax) b.vx += b.ax;
    });
    bullets = bullets.filter(b => b.x > -300 && b.x < 800 && b.y > -200 && b.y < 300 && !b.remove);
}

function checkBulletCollisions() {
    bullets.forEach(b => {
        if (b.opacity && b.opacity < 0.8) return; 
        const bw = b.w || 10;
        const bh = b.h || 10;
        
        const inX = soulX + 6 > b.x && soulX - 6 < b.x + bw;
        const inY = soulY + 6 > b.y && soulY - 6 < b.y + bh;
        
        if (inX && inY && !b.remove) {
            if (b.color === "blue") {
                if (keyState["w"] || keyState["a"] || keyState["s"] || keyState["d"]) {
                    applyEnemyDamage(b);
                }
            } else if (b.color === "orange") {
                if (!keyState["w"] && !keyState["a"] && !keyState["s"] && !keyState["d"]) {
                    applyEnemyDamage(b);
                }
            } else {
                applyEnemyDamage(b);
            }
            if (b.type !== "laser") b.remove = true;
        }
    });
    bullets = bullets.filter(b => !b.remove);
}

function applyEnemyDamage(b) {
    let base = currentEnemy.AT || 1;
    let dmg = Math.max(1, Math.round(base * 0.7) - totalDF(currentPlayer));
    if (currentEnemy.id === "toriel" && currentPlayer.HP <= 10) dmg = Math.max(1, Math.floor(dmg * 0.3));
    if (currentEnemy.id === "papyrus") {
        if (currentPlayer.HP - dmg <= 0) dmg = Math.max(0, currentPlayer.HP - 1); // Papyrus never kills
    }
    currentPlayer.HP = Math.max(0, currentPlayer.HP - dmg);
}

function endBattleWin() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    battleSubState = "text";

    let gainedGold = currentEnemy.gold || 0;
    let gainedEXP = currentEnemy.exp || 0;

    if (currentEnemy.id === "toriel" && canSpare && currentEnemy.HP <= 0) {
        gainedGold = Math.floor(gainedGold * 0.7);
        gainedEXP = Math.floor(gainedEXP * 0.7);
    }

    battleText = `* You won!\n* You earned ${gainedGold}G and ${gainedEXP} EXP. (Z)`;
    setBattleText(battleText);

    currentPlayer.G += gainedGold;
    currentPlayer.EXP += gainedEXP;
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
        if (e.key.toLowerCase() === "z" || e.key.toLowerCase() === "enter") {
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }
    };
}

function startGameOver() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    const name = currentPlayer && currentPlayer.name ? currentPlayer.name : "HUMAN";
    gameOverText = `GAME OVER\n${name}!\nStay determined...`;
    gameOverShownText = "";
    gameOverIndex = 0;
    if (gameOverTimer) clearInterval(gameOverTimer);
    gameState = "gameOver";
    gameOverTimer = setInterval(() => {
        if (gameOverIndex >= gameOverText.length) {
            clearInterval(gameOverTimer);
            gameOverTimer = null;
            return;
        }
        gameOverShownText += gameOverText[gameOverIndex];
        gameOverIndex++;
        renderGameOver();
    }, 80);
    renderGameOver();
}

function endBattleLose() {
    if (currentEnemy.id === "papyrus") {
        if (enemyInterval) clearInterval(enemyInterval);
        if (fightInterval) clearInterval(fightInterval);
        battleSubState = "text";
        battleText = "* Papyrus captured you...";
        setBattleText(battleText);
        renderBattle();
        setTimeout(() => {
            currentPlayer.HP = currentPlayer.maxHP;
            saves[currentSlot] = currentPlayer;
            saveSlot(currentSlot);
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }, 1200);
    } else {
        startGameOver();
    }
}

function endBattleMercy() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);

    const goldGain = currentEnemy.goldMercy != null ? currentEnemy.goldMercy : currentEnemy.gold || 0;
    currentPlayer.G += goldGain;
    saves[currentSlot] = currentPlayer;
    saveSlot(currentSlot);

    renderBattle();
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z" || e.key.toLowerCase() === "enter") {
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
    const hpBarWidth = currentPlayer.maxHP * 1.5; 

    let subBoxHTML = "";

    if (battleSubState === "attackBar") {
        subBoxHTML = `
            <div class="sub-box" style="display:flex; justify-content:center; align-items:center;">
                <div class="fight-bar">
                    <div class="fight-crit"></div>
                    <div class="fight-marker" style="left:${fightMarkerPos}px;"></div>
                </div>
            </div>
        `;
    } else if (battleSubState === "actMenu") {
        const opts = currentEnemy.actOptions || ["CHECK", "TALK"];
        let rows = "";
        opts.forEach((opt, i) => {
            rows += `<div class="sub-option">${i === actIndex ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;&nbsp;&nbsp;'}${opt}</div>`;
        });
        subBoxHTML = `<div class="sub-box">${rows}</div>`;
    } else if (battleSubState === "itemMenu") {
        if (currentPlayer.inventory.length === 0) {
            subBoxHTML = `<div class="sub-box"><p style="margin:8px 16px;">* You have no items.</p></div>`;
        } else {
            let itemsHTML = `<div class="sub-box">`;
            currentPlayer.inventory.forEach((it, i) => {
                itemsHTML += `<div class="sub-option">${i === itemIndex ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;&nbsp;&nbsp;'}${it.name}</div>`;
            });
            itemsHTML += `</div>`;
            subBoxHTML = itemsHTML;
        }
    } else if (battleSubState === "mercyMenu") {
        subBoxHTML = `
            <div class="sub-box">
                <div class="sub-option">${mercyIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;&nbsp;&nbsp;'}Spare</div>
                <div class="sub-option">${mercyIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;&nbsp;&nbsp;'}Flee</div>
            </div>
        `;
    }

    let soulBoxHTML = "";
    if (battleSubState === "enemyTurn") {
        const soulClass = currentEnemy.soulType === "blue" ? "soul blue" : "soul";
        let bulletsHTML = "";
        bullets.forEach(b => {
            const colorClass = b.color === "blue" ? "bullet-blue" : (b.color === "orange" ? "bullet-orange" : "");
            const wStyle = b.w ? `width:${b.w}px; border-radius: 0;` : "";
            const hStyle = b.h ? `height:${b.h}px;` : "";
            const oStyle = b.opacity !== undefined ? `opacity:${b.opacity};` : "";
            bulletsHTML += `<div class="bullet ${colorClass}" style="left:${b.x}px; top:${b.y}px; ${wStyle} ${hStyle} ${oStyle}"></div>`;
        });
        soulBoxHTML = `
            <div class="soul-box">
                <div class="${soulClass}" style="left:${soulX}px; top:${soulY}px;"></div>
                ${bulletsHTML}
            </div>
        `;
    }

    // Accurate dialogue box rendering
    let enemyDialogueHTML = "";
    if (battleSubState === "enemyTurn" && currentEnemy) {
        let dIndex = currentEnemy.turnIndex || 0;
        if (currentEnemy.id === "toriel") dIndex = spareCount;
        
        let dText = "";
        if (currentEnemy.turnDialogues && currentEnemy.turnDialogues[dIndex]) {
            dText = currentEnemy.turnDialogues[dIndex];
        } else if (currentEnemy.id === "toriel" && canSpare) {
            dText = "...";
        } else if (currentEnemy.id === "p_sans") {
            dText = "Zzz...";
        }
        
        if (dText) {
            enemyDialogueHTML = `<div class="enemy-dialogue-box" style="display:block;">${dText.replace(/\n/g,"<br>")}</div>`;
        } else {
            enemyDialogueHTML = `<div class="enemy-dialogue-box"></div>`;
        }
    } else {
        enemyDialogueHTML = `<div class="enemy-dialogue-box"></div>`;
    }

    const textToShow = battleShownText || battleText || "";

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="enemy-area">
                    <div class="enemy-sprite ${enemySpriteClass()}"></div>
                    ${enemyDialogueHTML}
                </div>
                ${soulBoxHTML ? '' : `
                <div class="battle-text">
                    ${textToShow.replace(/\n/g,"<br>")}
                </div>
                `}
                ${soulBoxHTML}
                ${subBoxHTML}
            </div>
            <div class="bottom-menu">
                <div class="battle-status-line">
                    <span>${currentPlayer.name || "CHARA"}</span>
                    <span>LV ${currentPlayer.LV}</span>
                    <span>HP</span>
                    <span class="hp-bar" style="width: ${hpBarWidth}px;">
                        <span class="hp-fill-yellow" style="width:${hpPercent}%;"></span>
                    </span>
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

function renderGameOver() {
    const g = document.getElementById("game");
    const lines = gameOverShownText.split("\n").join("<br>");
    g.innerHTML = `
        <div class="center game-over-screen">
            <p class="game-over-title">GAME OVER</p>
            <p class="game-over-text">${lines}</p>
            <p class="small-text" style="margin-top: 40px;">(Press Z)</p>
        </div>
    `;
}
