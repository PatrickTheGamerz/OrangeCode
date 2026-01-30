let battleMenuIndex = 0; // 0 FIGHT, 1 ACT, 2 ITEM, 3 MERCY
let battleSubState = "menu"; // menu, attackBar, actMenu, itemMenu, text, enemyTurn
let battleText = "";
let actIndex = 0; // 0 CHECK, 1 TALK
let itemIndex = 0;
let talksDone = 0;
let canSpare = false;

// fight bar
let fightMarkerPos = 0;
let fightMarkerDir = 1;
let fightInterval = null;

// soul box
let soulX = 120, soulY = 100;
let bulletX = 0, bulletY = 0, bulletVX = 3, bulletVY = 0;
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
        if (key === "a" || key === "d") {
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
        const speed = 4;
        if (key === "w") soulY -= speed;
        if (key === "s") soulY += speed;
        if (key === "a") soulX -= speed;
        if (key === "d") soulX += speed;
        soulX = Math.max(10, Math.min(240, soulX));
        soulY = Math.max(10, Math.min(140, soulY));
        renderBattle();
        return;
    }
}

function handleBattleMenuConfirm() {
    if (battleMenuIndex === 0) {
        // FIGHT
        startAttackBar();
    } else if (battleMenuIndex === 1) {
        // ACT
        battleSubState = "actMenu";
        actIndex = 0;
        renderBattle();
    } else if (battleMenuIndex === 2) {
        // ITEM
        battleSubState = "itemMenu";
        itemIndex = 0;
        renderBattle();
    } else if (battleMenuIndex === 3) {
        // MERCY
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

/* ---- FIGHT BAR ---- */

function startAttackBar() {
    battleSubState = "attackBar";
    fightMarkerPos = 0;
    fightMarkerDir = 1;
    if (fightInterval) clearInterval(fightInterval);
    fightInterval = setInterval(() => {
        fightMarkerPos += fightMarkerDir * 6;
        if (fightMarkerPos >= 296) {
            fightMarkerPos = 296;
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
    const center = 150;
    const dist = Math.abs(fightMarkerPos - center);
    const multiplier = Math.max(0.3, 1 - dist / 160);
    const base = currentPlayer.AT + 3;
    const damage = Math.max(1, Math.round(base * multiplier));
    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleSubState = "text";
    battleText = `* You hit ${currentEnemy.name} for ${damage} damage!`;
    renderBattle();
}

/* ---- ACT ---- */

function handleActConfirm() {
    if (actIndex === 0) {
        // CHECK
        battleSubState = "text";
        battleText = `* ${currentEnemy.name} - ATK ${currentEnemy.AT} DEF ${currentEnemy.DF}`;
    } else {
        // TALK
        talksDone++;
        if (talksDone >= currentEnemy.spareTalks) {
            canSpare = true;
            battleText = "* You talk to the DUMMY.\n* It seems satisfied with your words.";
        } else {
            battleText = "* You talk to the DUMMY.\n* It doesn't seem much for conversation.";
        }
        battleSubState = "text";
    }
    renderBattle();
}

/* ---- ITEM ---- */

function useBattleItem() {
    const item = currentPlayer.inventory[itemIndex];
    if (!item) return;
    if (item === "MONSTER CANDY") {
        currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 10);
        battleText = "* You ate the MONSTER CANDY.\n* You recovered 10 HP.";
    } else if (item === "SPIDER DONUT") {
        currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 12);
        battleText = "* You ate the SPIDER DONUT.\n* You recovered 12 HP.";
    } else {
        battleText = `* You used ${item}.`;
    }
    currentPlayer.inventory.splice(itemIndex, 1);
    battleSubState = "text";
    renderBattle();
}

/* ---- ENEMY TURN WITH SOUL BOX ---- */

function startEnemyTurn() {
    battleSubState = "enemyTurn";
    soulX = 120;
    soulY = 100;
    bulletX = 0;
    bulletY = 80;
    bulletVX = 4;
    bulletVY = 0;
    enemyTurnTicks = 0;
    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(() => {
        enemyTurnTicks++;
        bulletX += bulletVX;
        if (bulletX < 0 || bulletX > 252) {
            bulletVX *= -1;
        }
        const dx = soulX - bulletX;
        const dy = soulY - bulletY;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            const damage = Math.max(1, currentEnemy.AT - currentPlayer.DF);
            currentPlayer.HP = Math.max(0, currentPlayer.HP - damage);
        }
        if (enemyTurnTicks > 60) {
            clearInterval(enemyInterval);
            if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                battleSubState = "menu";
                battleText = "* The DUMMY is staring into the distance.";
                renderBattle();
            }
        } else {
            renderBattle();
        }
    }, 60);
    renderBattle();
}

/* ---- ENDINGS ---- */

function endBattleWin() {
    if (enemyInterval) clearInterval(enemyInterval);
    if (fightInterval) clearInterval(fightInterval);
    battleSubState = "text";
    battleText = `* You won!\n* You earned ${currentEnemy.gold}G and ${currentEnemy.exp} EXP. (Z)`;
    currentPlayer.G += currentEnemy.gold;
    currentPlayer.EXP += currentEnemy.exp;
    currentPlayer.kills += 1;
    if (currentPlayer.EXP >= currentPlayer.NEXT) {
        currentPlayer.LV += 1;
        currentPlayer.EXP = 0;
        currentPlayer.NEXT += 10;
        currentPlayer.maxHP += 4;
        currentPlayer.HP = currentPlayer.maxHP;
        currentPlayer.AT += 1;
        currentPlayer.DF += 1;
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

/* ---- RENDER ---- */

function renderBattle() {
    const g = document.getElementById("game");
    const hpPercent = (currentPlayer.HP / currentPlayer.maxHP) * 100;
    const enemyHPPercent = (currentEnemy.HP / currentEnemy.maxHP) * 100;

    let extra = "";

    if (battleSubState === "attackBar") {
        extra += `
            <div class="fight-bar">
                <div class="fight-marker" style="left:${fightMarkerPos}px;"></div>
            </div>
        `;
    } else if (battleSubState === "actMenu") {
        const opts = ["CHECK", "TALK"];
        extra += `<p>* ACT: ${opts[actIndex]}</p>`;
    } else if (battleSubState === "itemMenu") {
        if (currentPlayer.inventory.length === 0) {
            extra += `<p>* You have no items.</p>`;
        } else {
            extra += `<p>* ITEMS:</p>`;
            currentPlayer.inventory.forEach((it, i) => {
                extra += `<p class="${i === itemIndex ? "selected" : ""}">${it}</p>`;
            });
        }
    }

    let soulBoxHTML = "";
    if (battleSubState === "enemyTurn") {
        soulBoxHTML = `
            <div class="soul-box">
                <div class="soul" style="left:${soulX}px; top:${soulY}px;"></div>
                <div class="bullet" style="left:${bulletX}px; top:${bulletY}px;"></div>
            </div>
        `;
    }

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="battle-text">
                    <p>${battleText.replace(/\n/g,"<br>")}</p>
                </div>
                <div class="battle-info">
                    <p>${currentEnemy.name}
                        <span class="hp-bar">
                            <span class="hp-fill" style="width:${enemyHPPercent}%;"></span>
                        </span>
                    </p>
                    ${soulBoxHTML}
                    ${extra}
                </div>
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
                </div>
            </div>
        </div>
    `;
}
