// battle.js - battle system and combat rendering

let battleMenuIndex = 0;
let battleSubState = "menu"; // menu, attackBar, actMenu, itemMenu, mercyMenu, text, enemyTurn
let battleText = "";
let battleShownText = "";
let actIndex = 0;
let itemIndex = 0;
let talksDone = 0;
let canSpare = false;

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

let papyrusBlueActivated = false;
let papyrusSpecialReady = false;

function onBattleTextUpdate(str) {
    battleShownText = str;
    renderBattle();
}

function setBattleText(text) {
    battleText = text;
    battleShownText = "";
    startTypeText(text);
}

function startBattle(enemyId) {
    const baseEnemy = enemies.find(e => e.id === enemyId);
    currentEnemy = JSON.parse(JSON.stringify(baseEnemy));
    currentEnemy.HP = currentEnemy.maxHP;
    battleMenuIndex = 0;
    battleSubState = "text";
    talksDone = 0;
    canSpare = false;
    papyrusBlueActivated = false;
    papyrusSpecialReady = false;
    gameState = "battle";
    setBattleText(currentEnemy.introText || `* ${currentEnemy.name} blocks the way!`);
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
            actIndex = (actIndex + 1) % 3; // CHECK / TALK / (extra like FLIRT/INSULT for Papyrus)
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
        handleBattleItemMenuKey(key);
        return;
    }

    if (battleSubState === "mercyMenu") {
        handleMercyMenuKey(key);
        return;
    }

    if (battleSubState === "text") {
        if (key === "z") {
            if (!isTypeTextDone()) {
                skipTypeText();
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
        renderBattle();
    }
}

/* ATTACK BAR */

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
    let raw = base - (currentEnemy.DF || 0);
    if (raw < 1) raw = 1;
    const damage = Math.max(1, Math.round(raw * multiplier));

    // Toriel betrayal kill if she is spareable and player attacks
    if (currentEnemy.id === "toriel" && canSpare) {
        currentEnemy.HP = 0;
        setBattleText(`* You hit ${currentEnemy.name} for 999999 damage!`);
    } else if (currentEnemy.id === "papyrus" && papyrusSpecialReady) {
        // after special, Papyrus DEF is effectively -9999
        currentEnemy.HP = 0;
        setBattleText(`* You hit ${currentEnemy.name} for 999999 damage!`);
    } else {
        currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
        setBattleText(`* You hit ${currentEnemy.name} for ${damage} damage!`);
    }

    battleSubState = "text";
    renderBattle();
}

/* ACT */

function handleActConfirm() {
    const enemyId = currentEnemy.id;

    if (enemyId === "papyrus") {
        // Papyrus ACT: CHECK / FLIRT / INSULT
        if (actIndex === 0) {
            battleSubState = "text";
            setBattleText(currentEnemy.checkText);
        } else if (actIndex === 1) {
            talksDone++;
            setBattleText("* You flirt with Papyrus.\n* He is very flattered.");
        } else if (actIndex === 2) {
            talksDone++;
            setBattleText("* You insult Papyrus.\n* He doesn't understand why.");
        }
    } else {
        // generic: CHECK / TALK
        if (actIndex === 0) {
            battleSubState = "text";
            setBattleText(currentEnemy.checkText || `* ${currentEnemy.name} - ATK ${currentEnemy.AT} DEF ${currentEnemy.DF}`);
        } else {
            talksDone++;
            if (talksDone >= currentEnemy.spareTalks) {
                canSpare = true;
                setBattleText(`* You talk to ${currentEnemy.name}.\n* It seems satisfied with your words.`);
            } else {
                setBattleText(`* You talk to ${currentEnemy.name}.\n* It doesn't seem much for conversation.`);
            }
            battleSubState = "text";
        }
    }
    renderBattle();
}

/* ITEM MENU (battle) */

function handleBattleItemMenuKey(key) {
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
}

function useBattleItem() {
    const item = currentPlayer.inventory[itemIndex];
    if (!item) return;

    if (item.type === "heal") {
        const healAmount = item.heal || 10;
        currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + healAmount);
        setBattleText(`* You used ${item.name}.\n* You recovered ${healAmount} HP.`);
        currentPlayer.inventory.splice(itemIndex, 1);
    } else if (item.type === "weapon" || item.type === "armor") {
        // equipping inside battle is allowed, like Undertale
        if (item.type === "weapon") {
            // unequip current weapon into inventory if space
            if (currentPlayer.weapon && currentPlayer.inventory.length < ITEM_LIMIT) {
                currentPlayer.inventory.push({
                    name: currentPlayer.weapon,
                    type: "weapon",
                    at: currentPlayer.weaponBonus,
                    info: ""
                });
            }
            currentPlayer.weapon = item.name;
            currentPlayer.weaponBonus = item.at || 0;
        } else {
            if (currentPlayer.armor && currentPlayer.inventory.length < ITEM_LIMIT) {
                currentPlayer.inventory.push({
                    name: currentPlayer.armor,
                    type: "armor",
                    df: currentPlayer.armorBonus,
                    info: ""
                });
            }
            currentPlayer.armor = item.name;
            currentPlayer.armorBonus = item.df || 0;
        }
        setBattleText(`* You equipped the ${item.name}.`);
        currentPlayer.inventory.splice(itemIndex, 1);
    } else {
        setBattleText(`* You can't use that here.`);
    }

    battleSubState = "text";
    renderBattle();
}

/* MERCY MENU */

let mercyIndex = 0; // 0 = SPARE, 1 = FLEE

function handleMercyMenuKey(key) {
    if (key === "w" || key === "s") {
        mercyIndex = 1 - mercyIndex;
        renderBattle();
    } else if (key === "z") {
        if (mercyIndex === 0) {
            // SPARE
            if (canSpare) {
                setBattleText("* You spared the enemy.");
                endBattleMercy();
            } else {
                battleSubState = "text";
                setBattleText("* The enemy is not ready to be spared.");
                renderBattle();
            }
        } else {
            // FLEE
            setBattleText("* You ran away...!");
            battleSubState = "text";
            // after text, just go back to menu
            document.onkeydown = (e) => {
                if (e.key.toLowerCase() === "z") {
                    document.onkeydown = handleKeyDown;
                    gameState = "mainMenu";
                    render();
                }
            };
        }
    } else if (key === "x") {
        battleSubState = "menu";
        renderBattle();
    }
}

/* ENEMY TURN */

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
        if (hpRatio < 0.33) chosen = "madDummyChase";
        else if (hpRatio < 0.66) chosen = "madDummyWalls";
    }

    if (currentEnemy.id === "papyrus") {
        if (!papyrusBlueActivated) {
            chosen = "papyrusPhase1";
        } else if (!papyrusSpecialReady) {
            chosen = "papyrusBlueAttack";
            papyrusSpecialReady = true;
        } else {
            chosen = "papyrusSpecial";
        }
    }

    spawnPattern(chosen, soulX, soulY, currentEnemy);

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
                const line = currentEnemy.dialogueLines
                    ? currentEnemy.dialogueLines[Math.floor(Math.random() * currentEnemy.dialogueLines.length)]
                    : "* The enemy is watching you.";
                setBattleText(line);
                renderBattle();
            }
        } else {
            renderBattle();
        }
    }, 40);
    renderBattle();
}

/* SOUL MOVEMENT */

function updateSoul() {
    const speed = currentEnemy.soulType === "red" ? 4 : 3.5;

    if (currentEnemy.soulType === "red") {
        if (keyState["w"]) soulY -= speed;
        if (keyState["s"]) soulY += speed;
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
    } else {
        // blue soul: gravity + variable jump
        if (keyState["a"]) soulX -= speed;
        if (keyState["d"]) soulX += speed;
        if (keyState["w"] && onGround) {
            soulVY = -7.5; // higher jump
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

/* BULLETS */

function updateBullets() {
    bullets.forEach(b => {
        if (b.type === "chase" && b.life > 0) {
            const dx = soulX - b.x;
            const dy = soulY - b.y;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const sp = 2.5;
            b.vx = (dx / len) * sp;
            b.vy = (dy / len) * sp;
            b.life--;
        } else if (b.type === "fireDelay") {
            if (b.delay > 0) {
                b.delay--;
                return;
            } else if (b.delay === 0) {
                // shoot toward player
                const dx = soulX - b.x;
                const dy = soulY - b.y;
                const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                const sp = 3;
                b.vx = (dx / len) * sp;
                b.vy = (dy / len) * sp;
                b.type = "fire";
            }
        }

        b.x += b.vx || 0;
        b.y += b.vy || 0;
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

            // Papyrus blue bones: blue damage rule
            if (b.type === "boneBlue") {
                const moving = keyState["w"] || keyState["a"] || keyState["s"] || keyState["d"];
                if (!moving) {
                    dmg = 0;
                }
            }

            if (dmg > 0) {
                currentPlayer.HP = Math.max(0, currentPlayer.HP - dmg);
            }
            b.remove = true;
        }
    });
    bullets = bullets.filter(b => !b.remove);

    // Papyrus can't kill: HP floor 1
    if (currentEnemy && currentEnemy.id === "papyrus" && currentPlayer.HP <= 0) {
        currentPlayer.HP = 1;
        // capture sequence
        startPapyrusCapture();
    }
}

/* PAPYRUS CAPTURE */

function startPapyrusCapture() {
    if (enemyInterval) clearInterval(enemyInterval);
    battleSubState = "text";
    setBattleText("* Papyrus captured you!\n* You are sent back...");
    document.body.classList.add("game-over-bg");
    setTimeout(() => {
        document.body.classList.remove("game-over-bg");
        document.onkeydown = handleKeyDown;
        gameState = "mainMenu";
        currentPlayer.HP = currentPlayer.maxHP;
        render();
    }, 2000);
}

/* END BATTLE */

function endBattleWin() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);

    const killExp = currentEnemy.killExp || currentEnemy.exp || 0;
    const killGold = currentEnemy.killGold || currentEnemy.gold || 0;

    battleSubState = "text";
    setBattleText(`* You won!\n* You earned ${killGold}G and ${killExp} EXP. (Z)`);

    currentPlayer.G += killGold;
    currentPlayer.EXP += killExp;
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
    document.body.classList.add("game-over-bg");
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
    // normal game over (except Papyrus)
    if (currentEnemy && currentEnemy.id === "papyrus") {
        startPapyrusCapture();
    } else {
        startGameOver();
    }
}

function endBattleMercy() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);

    const spareGold = currentEnemy.spareGold || (currentEnemy.gold || 0);
    currentPlayer.G += spareGold;

    setBattleText(`* You won!\n* You earned ${spareGold}G and 0 EXP. (Z)`);
    renderBattle();
    saves[currentSlot] = currentPlayer;
    saveSlot(currentSlot);

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

/* RENDERING */

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
        if (currentEnemy.id === "papyrus") {
            subBoxHTML = `
                <div class="sub-box">
                    <div class="sub-option">${actIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}CHECK</div>
                    <div class="sub-option">${actIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}FLIRT</div>
                    <div class="sub-option">${actIndex === 2 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}INSULT</div>
                </div>
            `;
        } else {
            subBoxHTML = `
                <div class="sub-box">
                    <div class="sub-option">${actIndex === 0 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}CHECK</div>
                    <div class="sub-option">${actIndex === 1 ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}TALK</div>
                </div>
            `;
        }
    } else if (battleSubState === "itemMenu") {
        if (currentPlayer.inventory.length === 0) {
            subBoxHTML = `<div class="sub-box"><p>* You have no items.</p></div>`;
        } else {
            let itemsHTML = `<div class="sub-box"><p>* ITEMS</p>`;
            currentPlayer.inventory.forEach((it, i) => {
                itemsHTML += `<div class="sub-option">${i === itemIndex ? '<span class="heart">♥</span>' : '&nbsp;&nbsp;'}${it.name}</div>`;
            });
            itemsHTML += `</div>`;
            subBoxHTML = itemsHTML;
        }
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
            if (b.type === "bone" || b.type === "boneBlue") {
                const blueClass = b.type === "boneBlue" ? "bone blue" : "bone";
                bulletsHTML += `<div class="${blueClass}" style="left:${b.x}px; top:${b.y}px;"></div>`;
            } else if (b.type === "fire" || b.type === "fireDelay") {
                bulletsHTML += `<div class="fire" style="left:${b.x}px; top:${b.y}px;"></div>`;
            } else {
                bulletsHTML += `<div class="bullet" style="left:${b.x}px; top:${b.y}px;"></div>`;
            }
        });
        soulBoxHTML = `
            <div class="soul-box">
                <div class="${soulClass}" style="left:${soulX}px; top:${soulY}px;"></div>
                ${bulletsHTML}
            </div>
        `;
    }

    const enemyDialogue = ""; // could be used for special lines

    const textToShow = battleShownText || battleText;

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="enemy-area">
                    <div class="enemy-sprite ${enemySpriteClass()}"></div>
                    ${enemyDialogue ? `<div class="monster-dialogue">${enemyDialogue}</div>` : ""}
                </div>
                <div class="battle-text">
                    <p>${textToShow.replace(/\n/g,"<br>")}</p>
                </div>
                ${soulBoxHTML}
                ${subBoxHTML}
            </div>
            <div class="bottom-menu">
                <div style="margin-bottom:4px;">
                    <span>${currentPlayer.name || "HUMAN"}</span>
                    <span style="margin-left:12px;">LV ${currentPlayer.LV}</span>
                    <span style="margin-left:12px;">HP ${currentPlayer.HP}/${currentPlayer.maxHP}</span>
                    <span class="hp-bar">
                        <span class="hp-fill-yellow" style="width:${hpPercent}%;"></span>
                        <span class="hp-fill-red" style="width:${lostPercent}%;"></span>
                    </span>
                </div>
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
