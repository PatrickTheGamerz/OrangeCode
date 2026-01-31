// battle.js - battle system and combat rendering

let battleMenuIndex = 0;
let battleSubState = "menu"; // menu, attackBar, actMenu, itemMenu, itemAction, mercyMenu, text, enemyTurn
let battleText = "";
let fullBattleText = "";
let shownBattleText = "";
let textTimer = null;
let textIndex = 0;
let textDone = true;

let actIndex = 0;
let itemIndex = 0;
let itemActionIndex = 0; // 0 USE, 1 INFO, 2 DROP
let mercyIndex = 0; // 0 SPARE, 1 FLEE
let talksDone = 0;
let canSpare = false;
let lastSpared = false;

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
    fullBattleText = text;
    shownBattleText = "";
    textIndex = 0;
    textDone = false;
    if (textTimer) clearInterval(textTimer);
    textTimer = setInterval(() => {
        if (textIndex >= fullBattleText.length) {
            clearInterval(textTimer);
            textTimer = null;
            textDone = true;
            renderBattle();
            return;
        }
        const ch = fullBattleText[textIndex];
        shownBattleText += ch;
        textIndex++;
        renderBattle();
    }, 40);
}

function startBattle(enemyId) {
    currentEnemy = JSON.parse(JSON.stringify(enemies.find(e => e.id === enemyId)));
    currentEnemy.HP = currentEnemy.maxHP;
    battleMenuIndex = 0;
    battleSubState = "menu";
    talksDone = 0;
    canSpare = false;
    lastSpared = false;
    gameState = "battle";
    const intro = currentEnemy.introText || `* ${currentEnemy.name} blocks the way!`;
    battleText = intro;
    setBattleText(intro);
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
            battleSubState = "itemAction";
            itemActionIndex = 0;
            renderBattle();
        } else if (key === "x") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "itemAction") {
        if (key === "w" || key === "s") {
            itemActionIndex = (itemActionIndex + 2) % 3;
            renderBattle();
        } else if (key === "z") {
            handleItemAction();
        } else if (key === "x") {
            battleSubState = "itemMenu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "mercyMenu") {
        if (key === "w" || key === "s") {
            mercyIndex = 1 - mercyIndex;
            renderBattle();
        } else if (key === "z") {
            handleMercyAction();
        } else if (key === "x") {
            battleSubState = "menu";
            renderBattle();
        }
        return;
    }

    if (battleSubState === "text") {
        if (!textDone) {
            // skip to end of text
            if (textTimer) clearInterval(textTimer);
            shownBattleText = fullBattleText;
            textDone = true;
            renderBattle();
            return;
        }
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
        battleSubState = "mercyMenu";
        mercyIndex = 0;
        renderBattle();
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
    const raw = base - currentEnemy.DF * 0.5;
    const damage = Math.max(1, Math.round(raw * multiplier));
    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleSubState = "text";
    const txt = `* You hit ${currentEnemy.name} for ${damage} damage!`;
    battleText = txt;
    setBattleText(txt);
    renderBattle();
}

function handleActConfirm() {
    if (actIndex === 0) {
        battleSubState = "text";
        const txt = currentEnemy.checkText || `* ${currentEnemy.name} - ATK ${currentEnemy.AT} DEF ${currentEnemy.DF}`;
        battleText = txt;
        setBattleText(txt);
    } else {
        talksDone++;
        let txt = "";
        if (currentEnemy.id === "dummy" || currentEnemy.id === "mad_dummy") {
            txt = "* You talk to the DUMMY.\n* ...\n* It doesn't seem much for conversation.";
        } else if (currentEnemy.id === "toriel") {
            txt = "* You couldn't think of any conversation topics.";
        } else if (currentEnemy.id === "papyrus") {
            txt = "* You flirt with Papyrus.\n* He becomes very flustered.";
        } else {
            txt = "* You talk to the enemy.\n* It doesn't seem much for conversation.";
        }

        if (talksDone >= currentEnemy.spareTalks) {
            canSpare = true;
        }

        battleSubState = "text";
        battleText = txt;
        setBattleText(txt);
    }
    renderBattle();
}

function handleItemAction() {
    const item = currentPlayer.inventory[itemIndex];
    if (!item) return;
    const meta = getItemMeta(item.name);

    if (itemActionIndex === 0) {
        // USE
        if (item.type === "heal") {
            useBattleItem();
        } else if (item.type === "weapon") {
            equipWeapon(meta);
        } else if (item.type === "armor") {
            equipArmor(meta);
        } else {
            const txt = `* You can't use that here.`;
            battleSubState = "text";
            battleText = txt;
            setBattleText(txt);
            renderBattle();
        }
    } else if (itemActionIndex === 1) {
        // INFO
        const txt = `* ${meta.desc}`;
        battleSubState = "text";
        battleText = txt;
        setBattleText(txt);
        renderBattle();
    } else if (itemActionIndex === 2) {
        // DROP
        currentPlayer.inventory.splice(itemIndex, 1);
        const txt = `* You threw away the ${item.name}.`;
        battleSubState = "text";
        battleText = txt;
        setBattleText(txt);
        renderBattle();
    }
}

function equipWeapon(meta) {
    const old = currentPlayer.weapon;
    const oldBonus = currentPlayer.weaponBonus;
    currentPlayer.weapon = meta.name;
    currentPlayer.weaponBonus = meta.at || 0;
    // remove from inventory
    const idx = currentPlayer.inventory.findIndex(i => i.name === meta.name && i.type === "weapon");
    if (idx !== -1) currentPlayer.inventory.splice(idx, 1);
    // add old weapon back if not default and space
    if (old && old !== meta.name && currentPlayer.inventory.length < INVENTORY_LIMIT) {
        currentPlayer.inventory.push({ name: old, type: "weapon" });
    }
    const txt = `* You equipped the ${meta.name}.`;
    battleSubState = "text";
    battleText = txt;
    setBattleText(txt);
    renderBattle();
}

function equipArmor(meta) {
    const old = currentPlayer.armor;
    const oldBonus = currentPlayer.armorBonus;
    currentPlayer.armor = meta.name;
    currentPlayer.armorBonus = meta.df || 0;
    const idx = currentPlayer.inventory.findIndex(i => i.name === meta.name && i.type === "armor");
    if (idx !== -1) currentPlayer.inventory.splice(idx, 1);
    if (old && old !== meta.name && currentPlayer.inventory.length < INVENTORY_LIMIT) {
        currentPlayer.inventory.push({ name: old, type: "armor" });
    }
    const txt = `* You equipped the ${meta.name}.`;
    battleSubState = "text";
    battleText = txt;
    setBattleText(txt);
    renderBattle();
}

function useBattleItem() {
    const item = currentPlayer.inventory[itemIndex];
    if (!item) return;
    const meta = getItemMeta(item.name);
    if (item.type === "heal") {
        let heal = meta.heal || 10;
        if (item.name === "BUTTERSCOTCH PIE") heal = currentPlayer.maxHP;
        const before = currentPlayer.HP;
        currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + heal);
        const gained = currentPlayer.HP - before;
        let txt = "";
        if (item.name === "MONSTER CANDY") {
            txt = "* You ate the MONSTER CANDY.\n* You recovered 10 HP.";
        } else if (item.name === "SPIDER DONUT") {
            txt = "* You ate the SPIDER DONUT.\n* You recovered 12 HP.";
        } else if (item.name === "BUTTERSCOTCH PIE") {
            txt = "* You ate the BUTTERSCOTCH PIE.\n* Your HP was maxed out.";
        } else {
            txt = `* You used ${item.name}.\n* You recovered ${gained} HP.`;
        }
        currentPlayer.inventory.splice(itemIndex, 1);
        battleSubState = "text";
        battleText = txt;
        setBattleText(txt);
    } else {
        const txt = `* You can't use that here.`;
        battleSubState = "text";
        battleText = txt;
        setBattleText(txt);
    }
    renderBattle();
}

function handleMercyAction() {
    if (mercyIndex === 0) {
        // SPARE
        if (canSpare) {
            lastSpared = true;
            const txt = "* You spared the enemy.";
            battleSubState = "text";
            battleText = txt;
            setBattleText(txt);
            endBattleMercy();
        } else {
            const txt = "* The enemy is not ready to be spared.";
            battleSubState = "text";
            battleText = txt;
            setBattleText(txt);
            renderBattle();
        }
    } else {
        // FLEE
        lastSpared = false;
        if (enemyInterval) clearInterval(enemyInterval);
        if (fightInterval) clearInterval(fightInterval);
        const txt = "* You ran away...";
        battleSubState = "text";
        battleText = txt;
        setBattleText(txt);
        document.onkeydown = (e) => {
            if (e.key.toLowerCase() === "z") {
                document.onkeydown = handleKeyDown;
                gameState = "mainMenu";
                render();
            }
        };
        renderBattle();
    }
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
    let chosen = patterns[Math.floor(Math.random() * patterns.length)];
    if (currentEnemy.id === "mad_dummy") {
        const hpRatio = currentEnemy.HP / currentEnemy.maxHP;
        if (hpRatio < 0.33) chosen = "dummyAimBurst";
        else if (hpRatio < 0.66) chosen = "dummyAim";
    }
    spawnPattern(chosen, bullets, soulX, soulY);

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
                const txt = "* The enemy is watching you.";
                battleText = txt;
                setBattleText(txt);
                renderBattle();
            }
        } else {
            renderBattle();
        }
    }, 40);
    renderBattle();
}

function updateSoul() {
    const speed = currentEnemy.soulType === "red" ? 3.5 : 3.2;
    if (currentEnemy.soulType === "red") {
        if (keyState["w"]) soulY -= speed;
        if (keyState["s"]) soulY += speed;
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
    } else {
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
        if (keyState["w"] && onGround) {
            soulVY = -7.5;
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
    bullets = bullets.filter(b => b.x > -40 && b.x < 300 && b.y > -40 && b.y < 200 && !b.remove);
}

function checkBulletCollisions() {
    bullets.forEach(b => {
        const dx = soulX - b.x;
        const dy = soulY - b.y;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && !b.remove) {
            let dmg = Math.max(1, (currentEnemy.AT || 1) - totalDF(currentPlayer));
            if (currentEnemy.id === "toriel" && currentPlayer.HP <= 10) {
                dmg = 1; // she pulls back
            }
            currentPlayer.HP = Math.max(0, currentPlayer.HP - dmg);
            b.remove = true;
        }
    });
    bullets = bullets.filter(b => !b.remove);
}

function endBattleWin() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    battleSubState = "text";
    lastSpared = false;
    const g = currentEnemy.gold || 0;
    const e = currentEnemy.exp || 0;
    const txt = `* You won!\n* You earned ${g}G and ${e} EXP. (Z)`;
    battleText = txt;
    setBattleText(txt);
    currentPlayer.G += g;
    currentPlayer.EXP += e;
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
        const ch = gameOverText[gameOverIndex];
        gameOverShownText += ch;
        gameOverIndex++;
        renderGameOver();
    }, 50);
    renderGameOver();
}

function endBattleLose() {
    startGameOver();
}

function endBattleMercy() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    const baseG = currentEnemy.gold || 0;
    const bonus = currentEnemy.spareBonusGold || 0;
    const totalG = baseG + bonus;
    currentPlayer.G += totalG;
    // no EXP on spare if flagged
    if (!currentEnemy.noExpOnSpare) {
        currentPlayer.EXP += currentEnemy.exp || 0;
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
    const lostPercent = 100 - hpPercent;

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
            let itemsHTML = `<div class="sub-box"><p>* ITEM</p>`;
            currentPlayer.inventory.forEach((it, i) => {
                itemsHTML += `<div class="sub-option">${i === itemIndex ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}${it.name}</div>`;
            });
            itemsHTML += `</div>`;
            subBoxHTML = itemsHTML;
        }
    } else if (battleSubState === "itemAction") {
        subBoxHTML = `
            <div class="sub-box">
                <div class="sub-option">${itemActionIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}USE</div>
                <div class="sub-option">${itemActionIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}INFO</div>
                <div class="sub-option">${itemActionIndex === 2 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}DROP</div>
            </div>
        `;
    } else if (battleSubState === "mercyMenu") {
        subBoxHTML = `
            <div class="sub-box">
                <div class="sub-option">${mercyIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}SPARE</div>
                <div class="sub-option">${mercyIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}FLEE</div>
            </div>
        `;
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

    const textToShow = shownBattleText || battleText;

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="enemy-area">
                    <div class="enemy-sprite ${enemySpriteClass()}"></div>
                </div>
                <div class="battle-text">
                    <p>${textToShow.replace(/\n/g,"<br>")}</p>
                </div>
                ${soulBoxHTML}
                ${subBoxHTML}
            </div>
            <div class="top-battle-info">
                <span>${currentPlayer.name || "HUMAN"}</span>
                <span>LV ${currentPlayer.LV}</span>
                <span class="hp-label">HP</span>
                <span class="hp-bar">
                    <span class="hp-fill hp-fill-current" style="width:${hpPercent}%;"></span>
                    <span class="hp-fill hp-fill-lost" style="width:${lostPercent}%;"></span>
                </span>
                <span class="hp-numbers">${currentPlayer.HP}/${currentPlayer.maxHP}</span>
            </div>
            <div class="bottom-menu">
                <div>
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
    const lines = gameOverShownText.split("\n").map(l => l.replace(/ /g, "&nbsp;")).join("<br>");
    g.innerHTML = `
        <div class="center game-over-screen">
            <p class="game-over-title">GAME OVER</p>
            <p class="game-over-text">${lines}</p>
            <p class="small-text">(Press Z)</p>
        </div>
    `;
}
