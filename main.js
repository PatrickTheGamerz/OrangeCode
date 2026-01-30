// main.js - game states, menus, shop, name entry and rendering

loadSaves();
gameState = "title";
currentMenuIndex = 0;
render();
document.onkeydown = handleKeyDown;

let monsterSelectIndex = 0;

let nameGrid = [];
let nameCursor = { row: 0, col: 0 };
let chosenName = "";
let nameConfirmIndex = 0;
let pendingName = "";
let nameEntryMessage = "";

let shopSectionIndex = 0;
let shopItemIndex = 0;

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

    if (gameState === "nameConfirm") {
        handleNameConfirmKey(key);
        return;
    }

    if (gameState === "mainMenu") {
        const max = 5;
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
                gameState = "item";
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

    if (gameState === "item") {
        handleItemMenuKey(key);
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

    if (gameState === "gameOver") {
        if (key === "z") {
            gameState = "mainMenu";
            currentMenuIndex = 0;
            render();
        }
        return;
    }
}

function render() {
    const g = document.getElementById("game");
    document.body.classList.remove("file-select-bg-active");

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
        document.body.classList.add("file-select-bg-active");
        let wing = `<div class="wingdings-layer">`;
        const chars = ["ᚷ","ᚨ","ᛊ","ᛏ","ᛖ","ᚱ","ᚹ","ᛁ","ᚾ","ᛞ","ᛁ","ᚾ","ᚷ","ᛊ"];
        for (let i = 0; i < 60; i++) {
            const ch = chars[i % chars.length];
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const dur = 2 + Math.random() * 3;
            wing += `<span class="wingding" style="top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">${ch}</span>`;
        }
        wing += `</div>`;
        let html = `${wing}<div class="center" style="margin-top:40px;">
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

    if (gameState === "nameConfirm") {
        renderNameConfirm();
        return;
    }

    if (gameState === "mainMenu") {
        const options = ["MONSTERS", "SHOP", "ITEM", "STATS", "SETTINGS", "CREDITS"];
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

    if (gameState === "item") {
        renderItemMenu();
        return;
    }

    if (gameState === "stats") {
        const p = currentPlayer;
        const atTotal = totalAT(p);
        const dfTotal = totalDF(p);
        let html = `<div class="center" style="margin-top:60px;">
            <div class="undertale-box stats-box">
                <p>"${p.name || "HUMAN"}"</p>
                <div class="flex-between">
                    <span>LV ${p.LV}</span>
                    <span>HP ${p.HP}/${p.maxHP}</span>
                </div>
                <div class="flex-between">
                    <span>AT ${p.baseAT} (${atTotal})</span>
                    <span>EXP: ${p.EXP}</span>
                </div>
                <div class="flex-between">
                    <span>DF ${p.baseDF} (${dfTotal})</span>
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

    if (gameState === "gameOver") {
        renderGameOver();
        return;
    }
}

function startNameEntry() {
    gameState = "nameEntry";
    chosenName = "";
    nameEntryMessage = "";
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
                pendingName = chosenName;
                nameConfirmIndex = 0;
                gameState = "nameConfirm";
            }
        } else {
            if (chosenName.length < 8) {
                chosenName += val;
            }
        }
        if (gameState === "nameEntry") renderNameEntry();
        else renderNameConfirm();
    } else if (key === "x") {
        gameState = "fileSelect";
        currentMenuIndex = 0;
        render();
    }
}

function handleNameConfirmKey(key) {
    if (key === "a" || key === "d") {
        nameConfirmIndex = 1 - nameConfirmIndex;
        renderNameConfirm();
    } else if (key === "z") {
        if (nameConfirmIndex === 0) {
            const special = handleSpecialName(pendingName);
            if (special === "reject") {
                gameState = "nameEntry";
                chosenName = "";
                renderNameEntry();
                return;
            }
            if (special === "reset") {
                localStorage.clear();
                location.reload();
                return;
            }
            createNewSave(currentSlot, pendingName);
            useSave(currentSlot);
            gameState = "mainMenu";
            currentMenuIndex = 0;
            render();
        } else {
            gameState = "nameEntry";
            renderNameEntry();
        }
    } else if (key === "x") {
        gameState = "nameEntry";
        renderNameEntry();
    }
}

function handleSpecialName(name) {
    const n = name.toLowerCase();
    if (n === "gaster") {
        nameEntryMessage = "* ........";
        return "reset";
    }
    if (n === "sans") {
        nameEntryMessage = "* no.";
        return "reject";
    }
    if (n === "toriel") {
        nameEntryMessage = "* You really think you should?";
        return "reject";
    }
    if (n === "asgore") {
        nameEntryMessage = "* Not very creative...";
        return "reject";
    }
    if (n === "frisk") {
        const p = defaultPlayer();
        p.name = name;
        p.hardMode = true;
        saves[currentSlot] = p;
        saveSlot(currentSlot);
        currentPlayer = p;
        return "ok";
    }
    if (n === "chara") {
        nameEntryMessage = "* The true name.";
        return "ok";
    }
    if (n === "papyrus") {
        nameEntryMessage = "* I, THE GREAT PAPYRUS, APPROVE!";
        return "ok";
    }
    return "ok";
}

function renderNameEntry() {
    const g = document.getElementById("game");
    let html = `<div class="center" style="margin-top:60px;">
        <p>Name the fallen human.</p>
        ${nameEntryMessage ? `<p>${nameEntryMessage}</p>` : ""}
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

function renderNameConfirm() {
    const g = document.getElementById("game");
    const yesSel = nameConfirmIndex === 0 ? "selected" : "";
    const noSel = nameConfirmIndex === 1 ? "selected" : "";
    g.innerHTML = `
        <div class="center" style="margin-top:80px;">
            <div class="undertale-box">
                <p>"${pendingName}"</p>
                <p>Is this name correct?</p>
                <p>
                    <span class="${yesSel}">YES</span> / <span class="${noSel}">NO</span>
                </p>
            </div>
        </div>
    `;
}

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
        currentPlayer.weaponBonus = item.at;
        currentPlayer.inventory.push({ name: item.name, type: "weapon" });
    } else if (section === "armor") {
        currentPlayer.armor = item.name;
        currentPlayer.armorBonus = item.df;
        currentPlayer.inventory.push({ name: item.name, type: "armor" });
    } else if (section === "heal") {
        currentPlayer.inventory.push({ name: item.name, type: "heal" });
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

let itemMenuIndex = 0;
let itemSubMode = "list";

function handleItemMenuKey(key) {
    if (itemSubMode === "list") {
        if (key === "w") {
            if (currentPlayer.inventory.length === 0) return;
            itemMenuIndex = (itemMenuIndex + currentPlayer.inventory.length - 1) % currentPlayer.inventory.length;
            renderItemMenu();
        } else if (key === "s") {
            if (currentPlayer.inventory.length === 0) return;
            itemMenuIndex = (itemMenuIndex + 1) % currentPlayer.inventory.length;
            renderItemMenu();
        } else if (key === "z") {
            if (currentPlayer.inventory.length === 0) return;
            itemSubMode = "action";
            renderItemMenu();
        } else if (key === "x") {
            gameState = "mainMenu";
            currentMenuIndex = 2;
            render();
        }
    } else if (itemSubMode === "action") {
        if (key === "a" || key === "d") {
            itemActionIndex = 1 - itemActionIndex;
            renderItemMenu();
        } else if (key === "w" || key === "s") {
            itemActionIndex = (itemActionIndex + 1) % 3;
            renderItemMenu();
        } else if (key === "z") {
            performItemAction();
            if (gameState === "item") renderItemMenu();
        } else if (key === "x") {
            itemSubMode = "list";
            renderItemMenu();
        }
    }
}

let itemActionIndex = 0;

function renderItemMenu() {
    const g = document.getElementById("game");
    let html = `<div class="center" style="margin-top:80px;">
        <div class="undertale-box"><p>ITEM</p>`;
    if (currentPlayer.inventory.length === 0) {
        html += `<p>(empty)</p>`;
    } else {
        currentPlayer.inventory.forEach((it, i) => {
            const sel = i === itemMenuIndex && itemSubMode === "list" ? "selected" : "";
            html += `<p class="${sel}">${it.name}</p>`;
        });
    }
    if (itemSubMode === "action" && currentPlayer.inventory.length > 0) {
        const actions = ["USE/EQUIP", "INFO", "THROW"];
        html += `<p>----------------</p><p>`;
        actions.forEach((a, i) => {
            const sel = i === itemActionIndex ? "selected" : "";
            html += `<span class="${sel}" style="margin:0 4px;">${a}</span>`;
        });
        html += `</p>`;
    }
    html += `</div></div>`;
    g.innerHTML = html;
}

function performItemAction() {
    const item = currentPlayer.inventory[itemMenuIndex];
    if (!item) {
        itemSubMode = "list";
        return;
    }
    if (itemActionIndex === 0) {
        if (item.type === "weapon") {
            const w = shopData.weapon.find(w => w.name === item.name);
            if (w) {
                currentPlayer.weapon = w.name;
                currentPlayer.weaponBonus = w.at;
            }
        } else if (item.type === "armor") {
            const a = shopData.armor.find(a => a.name === item.name);
            if (a) {
                currentPlayer.armor = a.name;
                currentPlayer.armorBonus = a.df;
            }
        }
    } else if (itemActionIndex === 2) {
        currentPlayer.inventory.splice(itemMenuIndex, 1);
        if (itemMenuIndex >= currentPlayer.inventory.length) itemMenuIndex = Math.max(0, currentPlayer.inventory.length - 1);
    }
    saves[currentSlot] = currentPlayer;
    saveSlot(currentSlot);
    itemSubMode = "list";
}
