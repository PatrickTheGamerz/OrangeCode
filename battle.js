// Battle system: FIGHT / ACT / ITEM / MERCY with a simple flow

let battleMenuIndex = 0; // 0-3 for FIGHT, ACT, ITEM, MERCY
let battleSubState = "menu"; // menu, attack, enemyTurn, text
let battleText = "";
let playerHPDisplay = 0;
let enemyHPDisplay = 0;

function startBattle(enemyId) {
    currentEnemy = JSON.parse(JSON.stringify(enemies.find(e => e.id === enemyId)));
    currentEnemy.HP = currentEnemy.maxHP;
    battleMenuIndex = 0;
    battleSubState = "menu";
    battleText = `${currentEnemy.name} blocks the way!`;
    playerHPDisplay = currentPlayer.HP;
    enemyHPDisplay = currentEnemy.HP;
    gameState = "battle";
    render();
}

function battleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (battleSubState === "menu") {
        if (key === "a") {
            battleMenuIndex = (battleMenuIndex + 3) % 4;
            render();
        } else if (key === "d") {
            battleMenuIndex = (battleMenuIndex + 1) % 4;
            render();
        } else if (key === "z") {
            handleBattleMenuConfirm();
        }
    } else if (battleSubState === "attack") {
        if (key === "z") {
            performAttack();
        }
    } else if (battleSubState === "text") {
        if (key === "z") {
            // after text, enemy turn or back to menu
            if (currentEnemy.HP <= 0) {
                endBattleWin();
            } else if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                startEnemyTurn();
            }
        }
    } else if (battleSubState === "enemyTurn") {
        if (key === "z") {
            // after enemy attack text
            if (currentPlayer.HP <= 0) {
                endBattleLose();
            } else {
                battleSubState = "menu";
                battleText = `${currentEnemy.name} is staring at you.`;
                render();
            }
        }
    }
}

function handleBattleMenuConfirm() {
    if (battleMenuIndex === 0) {
        // FIGHT
        battleSubState = "attack";
        battleText = "Press Z to attack!";
        render();
    } else if (battleMenuIndex === 1) {
        // ACT
        battleSubState = "text";
        battleText = "You talk to the enemy. It doesn't seem much for conversation.";
        render();
    } else if (battleMenuIndex === 2) {
        // ITEM
        if (currentPlayer.inventory.length === 0) {
            battleSubState = "text";
            battleText = "You have no items.";
        } else {
            // use first item for now
            const item = currentPlayer.inventory[0];
            if (item === "MONSTER CANDY") {
                currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + 10);
                battleText = "You ate the MONSTER CANDY. You recovered 10 HP.";
                currentPlayer.inventory.shift();
            } else {
                battleText = `You used ${item}.`;
                currentPlayer.inventory.shift();
            }
            battleSubState = "text";
        }
        render();
    } else if (battleMenuIndex === 3) {
        // MERCY
        battleSubState = "text";
        battleText = "You spared the enemy.";
        endBattleMercy();
    }
}

function performAttack() {
    // Simple fixed damage: AT + weapon bonus
    const damage = currentPlayer.AT + 3;
    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleText = `You hit ${currentEnemy.name} for ${damage} damage!`;
    battleSubState = "text";
    render();
}

function startEnemyTurn() {
    battleSubState = "enemyTurn";
    const damage = Math.max(1, currentEnemy.AT - currentPlayer.DF);
    currentPlayer.HP = Math.max(0, currentPlayer.HP - damage);
    battleText = `${currentEnemy.name} attacks! You take ${damage} damage.`;
    render();
}

function endBattleWin() {
    battleSubState = "text";
    battleText = `You won! You earned ${currentEnemy.gold}G and ${currentEnemy.exp} EXP.`;
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
    // After pressing Z, return to main menu
    battleSubState = "text";
    battleText += " (Press Z)";
    render();
    // override key handler temporarily
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z") {
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }
    };
}

function endBattleLose() {
    battleSubState = "text";
    battleText = "You died. (Press Z)";
    render();
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z") {
            document.onkeydown = handleKeyDown;
            // reload from save
            loadSaves();
            useSave(currentSlot);
            gameState = "mainMenu";
            render();
        }
    };
}

function endBattleMercy() {
    // Just go back to menu
    render();
    document.onkeydown = (e) => {
        if (e.key.toLowerCase() === "z") {
            document.onkeydown = handleKeyDown;
            gameState = "mainMenu";
            render();
        }
    };
}

function renderBattle() {
    const g = document.getElementById("game");
    const hpPercent = (currentPlayer.HP / currentPlayer.maxHP) * 100;
    const enemyHPPercent = (currentEnemy.HP / currentEnemy.maxHP) * 100;

    g.innerHTML = `
        <div class="center">
            <div class="battle-box">
                <div class="battle-text">
                    <p>${battleText}</p>
                </div>
                <div class="battle-info">
                    <p>${currentEnemy.name}  HP:
                        <span class="hp-bar">
                            <span class="hp-fill" style="width:${enemyHPPercent}%;"></span>
                        </span>
                    </p>
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
