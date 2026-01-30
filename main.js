loadSaves();
gameState = "title";
currentMenuIndex = 0;
render();
document.onkeydown = handleKeyDown;

let monsterSelectIndex = 0;

function handleKeyDown(e) {
    const key = e.key.toLowerCase();

    if (gameState === "title") {
        if (key === "z") {
            gameState = "fileSelect";
            currentMenuIndex = 0;
            render();
        }
        return;
    }

    if (gameState === "fileSelect") {
        if (key === "w") {
            currentMenuIndex = (currentMenuIndex + SAVE_SLOTS - 1) % SAVE_SLOTS;
            render();
        } else if (key === "s") {
            currentMenuIndex = (currentMenuIndex + 1) % SAVE_SLOTS;
            render();
        } else if (key === "z") {
            const slot = currentMenuIndex;
            if (!saves[slot]) {
                currentSlot = slot;
                startNameEntry();
            } else {
                useSave(slot);
                gameState = "mainMenu";
                currentMenuIndex = 0;
                render();
            }
        }
        return;
    }

    if (gameState === "nameEntry") {
        handleNameEntryKey(key);
        return;
    }

    if (gameState === "mainMenu") {
        const max = 5; // MONSTERS, SHOP, INVENTORY, STATS, SETTINGS, CREDITS
        if (key === "w") {
            currentMenuIndex = (currentMenuIndex + max) % (max + 1);
            render();
        } else if (key === "s") {
            currentMenuIndex = (currentMenuIndex + 1) % (max + 1);
            render();
        } else if (key === "z") {
            if (currentMenuIndex === 0) {
                gameState = "monsterSelect";
                monsterSelectIndex = 0;
                render();
            } else if (currentMenuIndex === 1) {
                gameState = "shop";
                currentMenuIndex = 0;
                render();
            } else if (currentMenuIndex === 2) {
                gameState = "inventory";
                currentMenuIndex = 0;
                render();
            } else if (currentMenuIndex === 3) {
                gameState = "stats";
                render();
            } else if (currentMenuIndex === 4) {
                gameState = "settings";
                render();
            } else if (currentMenuIndex === 5) {
                gameState = "credits";
                render();
            }
        }
        return;
    }

    if (gameState === "monsterSelect") {
        if (key === "w") {
            monsterSelectIndex = (monsterSelectIndex + monsterList.length - 1) % monsterList.length;
            render();
        } else if (key === "s") {
            monsterSelectIndex = (monsterSelectIndex + 1) % monsterList.length;
            render();
        } else if (key === "z") {
            const m = monsterList[monsterSelectIndex];
            if (currentPlayer.LV >= m.reqLV) {
                startBattle(m.id);
            }
        } else if (key === "x") {
            gameState = "mainMenu";
            currentMenuIndex = 0;
            render();
        }
        return;
    }

    if (gameState === "shop") {
        handleShopKey(key);
        return;
    }

    if (gameState === "inventory") {
        if (key === "z" || key === "x") {
            gameState = "mainMenu";
            currentMenuIndex = 2;
            render();
        }
        return;
    }

    if (gameState === "stats") {
        if (key === "z" || key === "x") {
            gameState = "mainMenu";
            currentMenuIndex = 3;
            render();
        }
        return;
    }

    if (gameState === "settings") {
        if (key === "z" || key === "x") {
            gameState = "mainMenu";
            currentMenuIndex = 4;
            render();
        }
        return;
    }

    if (gameState === "credits") {
        if (key === "z" || key === "x") {
            gameState = "mainMenu";
            currentMenuIndex = 5;
            render();
        }
        return;
    }

    if (gameState === "battle") {
        battleKeyDown(e);
        return;
    }
}

function render() {
    const g = document.getElementById("game");

    if (gameState === "title") {
        g.innerHTML = `
            <div class="center" style="margin-top:160px;">
                <h1>UNDERTALE: Fallen Timelines</h1>
                <p class="small-text">Press Z</p>
            </div>
        `;
        return;
    }

    if (gameState === "fileSelect") {
        let html = `<div class="center" style="margin-top:40px;">
            <div class="undertale-box" style="width:80%;">
                <p>SELECT A SAVE:</p>
                <div class="file-container">
        `;
        for (let i = 0; i < SAVE_SLOTS; i++) {
            const s = saves[i];
            const selected = (i === currentMenuIndex) ? "selected" : "";
            html += `<div class="file-slot ${selected}">
                        <div class="file-row">
                            <span>SAVE ${i + 1}</span>
                            <span>${s && s.name ? s.name : ""}</span>
                        </div>
                        <div class="file-row">
                            <span>LV ${s ? s.LV : 1}</span>
                            <span>EXP ${s ? s.EXP : 0}</span>
                            <span>G ${s ? s.G : 0}</span>
                        </div>
                    </div>`;
        }
        html += `</div>
                <p style="margin-top:10px; font-size:10px;">☞ ᚷᚨᛊᛏᛖᚱ ᚹᛁᚾᛞᛁᚾᚷᛊ ☜</p>
            </div></div>`;
        g.innerHTML = html;
        return;
    }

    if (gameState === "nameEntry") {
        renderNameEntry();
        return;
    }

    if (gameState === "mainMenu") {
        const options = ["MONSTERS", "SHOP", "INVENTORY", "STATS", "SETTINGS", "CREDITS"];
        let html = `<div class="center" style="margin-top:120px;">`;
        options.forEach((opt, i) => {
            html += `<div class="menu-option ${i === currentMenuIndex ? "selected" : ""}">
                        <span>${opt}</span>
                    </div>`;
        });
        html += `</div>`;
        g.innerHTML = html;
        return;
    }

    if (gameState === "monsterSelect") {
        let html = `<div class="center" style="margin-top:80px;">
            <div class="undertale-box" style="width:70%;">
                <p>SELECT MONSTER</p>
                <div class="monster-list">
        `;
        monsterList.forEach((m, i) => {
            const locked = currentPlayer.LV < m.reqLV;
            const sel = i === monsterSelectIndex ? "selected" : "";
            html += `<p class="${sel}">${locked ? "[LOCKED]" : ""} ${m.name} (LV ${m.reqLV}+)</p>`;
        });
        html += `</div></div></div>`;
        g.innerHTML = html;
        return;
    }

    if (gameState === "shop") {
        renderShop();
        return;
    }

    if (gameState === "inventory") {
        let html = `<div class="center" style="margin-top:80px;">
            <div class="undertale-box"><p>INVENTORY</p>`;
        if (currentPlayer.inventory.length === 0) {
            html += `<p>(empty)</p>`;
        } else {
            currentPlayer.inventory.forEach(i => {
                html += `<p>${i}</p>`;
            });
        }
        html += `</div></div>`;
        g.innerHTML = html;
        return;
    }

    if (gameState === "stats") {
        const p = currentPlayer;
        let html = `<div class="center" style="margin-top:60px;">
            <div class="undertale-box stats-box">
                <p>"${p.name || "HUMAN"}"</p>
                <div class="flex-between">
                    <span>LV ${p.LV}</span>
                    <span>HP ${p.HP}/${p.maxHP}</span>
                </div>
                <div class="flex-between">
                    <span>AT ${p.AT}</span>
                    <span>EXP: ${p.EXP}</span>
                </div>
                <div class="flex-between">
                    <span>DF ${p.DF}</span>
                    <span>NEXT: ${p.NEXT}</span>
                </div>
                <p>WEAPON: ${p.weapon}</p>
                <p>ARMOR: ${p.armor}</p>
                <div class="flex-between">
                    <span>GOLD: ${p.G}</span>
                    <span>KILLS: ${p.kills}</span>
                </div>
            </div>
        </div>`;
        g.innerHTML = html;
        return;
    }

    if (gameState === "settings") {
        g.innerHTML = `
            <div class="center" style="margin-top:80px;">
                <div class="undertale-box">
                    <p>SETTINGS</p>
                    <p>(placeholder: sound, difficulty, controls)</p>
                </div>
            </div>
        `;
        return;
    }

    if (gameState === "credits") {
        g.innerHTML = `
            <div class="center" style="margin-top:80px;">
                <div class="undertale-box">
                    <p>CREDITS</p>
                    <p>Made by Orange_Toaster</p>
                </div>
            </div>
        `;
        return;
    }

    if (gameState === "battle") {
        renderBattle();
        return;
    }
}

/* ---------- NAME ENTRY ---------- */

let nameGrid = [];
let nameCursor = { row: 0, col: 0 };
let chosenName = "";

function startNameEntry() {
    gameState = "nameEntry";
    chosenName = "";
    nameCursor = { row: 0, col: 0 };
    const rows = [
        ["A","B","C","D","E","F","G"],
        ["H","I","J","K","L","M","N"],
        ["O","P","Q","R","S","T","U"],
        ["V","W","X","Y","Z","-","_"],
        ["a","b","c","d","e","f","g"],
        ["h","i","j","k","l","m","n"],
        ["o","p","q","r","s","t","u"],
        ["v","w","x","y","z","0","1"],
        ["2","3","4","5","6","7","8"],
        ["9","DEL","END","","","",""]
    ];
    nameGrid = rows;
    renderNameEntry();
}

function handleNameEntryKey(key) {
    const maxRow = nameGrid.length - 1;
    const maxCol = nameGrid[0].length - 1;

    if (key === "w") {
        do {
            nameCursor.row = (nameCursor.row + maxRow) % (maxRow + 1);
        } while (!nameGrid[nameCursor.row][nameCursor.col]);
        renderNameEntry();
    } else if (key === "s") {
        do {
            nameCursor.row = (nameCursor.row + 1) % (maxRow + 1);
        } while (!nameGrid[nameCursor.row][nameCursor.col]);
        renderNameEntry();
    } else if (key === "a") {
        do {
            nameCursor.col = (nameCursor.col + maxCol) % (maxCol + 1);
        } while (!nameGrid[nameCursor.row][nameCursor.col]);
        renderNameEntry();
    } else if (key === "d") {
        do {
            nameCursor.col = (nameCursor.col + 1) % (maxCol + 1);
        } while (!nameGrid[nameCursor.row][nameCursor.col]);
        renderNameEntry();
    } else if (key === "z") {
        const val = nameGrid[nameCursor.row][nameCursor.col];
        if (!val) return;
        if (val === "DEL") {
            chosenName = chosenName.slice(0, -1);
        } else if (val === "END") {
            if (chosenName.length > 0) {
                createNewSave(currentSlot, chosenName);
                useSave(currentSlot);
                gameState = "mainMenu";
                currentMenuIndex = 0;
                render();
            }
        } else {
            if (chosenName.length < 8) {
                chosenName += val;
            }
        }
        renderNameEntry();
    } else if (key === "x") {
        gameState = "fileSelect";
        currentMenuIndex = 0;
        render();
    }
}

function renderNameEntry() {
    const g = document.getElementById("game");
    let html = `<div class="center" style="margin-top:60px;">
        <p>Name the fallen human.</p>
        <div class="name-grid undertale-box">
    `;
    for (let r = 0; r < nameGrid.length; r++) {
        html += `<div class="name-row">`;
        for (let c = 0; c < nameGrid[r].length; c++) {
            const val = nameGrid[r][c];
            if (!val) {
                html += `<div class="name-cell"></div>`;
            } else {
                const sel = (r === nameCursor.row && c === nameCursor.col) ? "selected" : "";
                html += `<div class="name-cell ${sel}">${val}</div>`;
            }
        }
        html += `</div>`;
    }
    html += `</div>
        <div class="name-display">
            <p>${chosenName}</p>
        </div>
    </div>`;
    g.innerHTML = html;
}

/* ---------- SHOP ---------- */

let shopSectionIndex = 0; // 0 weapon, 1 armor, 2 heal
let shopItemIndex = 0;

function handleShopKey(key) {
    const sections = ["weapon", "armor", "heal"];
    const section = sections[shopSectionIndex];
    const items = shopData[section];

    if (key === "a") {
        shopSectionIndex = (shopSectionIndex + 2) % 3;
        shopItemIndex = 0;
        renderShop();
    } else if (key === "d") {
        shopSectionIndex = (shopSectionIndex + 1) % 3;
        shopItemIndex = 0;
        renderShop();
    } else if (key === "w") {
        shopItemIndex = (shopItemIndex + items.length - 1) % items.length;
        renderShop();
    } else if (key === "s") {
        shopItemIndex = (shopItemIndex + 1) % items.length;
        renderShop();
    } else if (key === "z") {
        buyShopItem(section, items[shopItemIndex]);
        renderShop();
    } else if (key === "x") {
        gameState = "mainMenu";
        currentMenuIndex = 1;
        render();
    }
}

function buyShopItem(section, item) {
    if (currentPlayer.G < item.cost) return;
    currentPlayer.G -= item.cost;
    if (section === "weapon") {
        currentPlayer.weapon = item.name;
        currentPlayer.AT += item.at;
    } else if (section === "armor") {
        currentPlayer.armor = item.name;
        currentPlayer.DF += item.df;
    } else if (section === "heal") {
        currentPlayer.inventory.push(item.name);
    }
    saves[currentSlot] = currentPlayer;
    saveSlot(currentSlot);
}

function renderShop() {
    const g = document.getElementById("game");
    const sections = ["weapon", "armor", "heal"];
    const section = sections[shopSectionIndex];
    const items = shopData[section];

    let html = `<div class="center" style="margin-top:80px;">
        <div class="undertale-box" style="width:70%;">
            <p>SHOP</p>
            <p>G: ${currentPlayer.G}</p>
            <p>
                <span class="${shopSectionIndex === 0 ? "selected" : ""}">WEAPON</span> |
                <span class="${shopSectionIndex === 1 ? "selected" : ""}">ARMOR</span> |
                <span class="${shopSectionIndex === 2 ? "selected" : ""}">HEAL</span>
            </p>
    `;

    items.forEach((it, i) => {
        const sel = (i === shopItemIndex) ? "selected" : "";
        html += `<p class="${sel}">${it.name} - ${it.cost}G</p>`;
    });

    html += `</div></div>`;
    g.innerHTML = html;
}
