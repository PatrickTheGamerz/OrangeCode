// main.js - game states, input handling, menus, shop, name entry and rendering

loadSaves();
gameState = "title";
currentMenuIndex = 0;
render();
document.onkeydown = handleKeyDown;

let monsterSelectIndex = 0;

let nameGrid = [];
let nameCursor = { row: 0, col: 0 };
let chosenName = "";
let pendingName = "";
let nameConfirmIndex = 0;
let nameEntryMessage = "";

let shopSectionIndex = 0;
let shopItemIndex = 0;

let itemMenuIndex = 0; // which item in list
let itemActionIndex = 0; // USE / INFO / DROP / EQUIP
const ITEM_ACTIONS = ["USE", "INFO", "DROP", "EQUIP"];

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
                itemMenuIndex = 0;
                itemActionIndex = 0;
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
        const wing = buildWingdingsLayer(5); // way more wingdings
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
            html += `<div class="menu-option menu-large ${i === currentMenuIndex ? "selected" : ""}">
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
}

/* Name entry */

function startNameEntry() {
    gameState = "nameEntry";
    chosenName = "";
    pendingName = "";
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
            if (chosenName.length > 0 && chosenName.length <= 6) {
                pendingName = chosenName;
                nameConfirmIndex = 0;
                nameEntryMessage = "";
                gameState = "nameConfirm";
                renderNameConfirm();
                return;
            }
        } else {
            if (chosenName.length < 6) {
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

function handleSpecialName(name) {
    const n = name.toLowerCase();
    if (n === "gaster") {
        nameEntryMessage = "* ........";
        return "refresh";
    }
    if (n === "sans") {
        nameEntryMessage = "* nope.";
        return "lock";
    }
    if (n === "toriel") {
        nameEntryMessage = "* I think you should choose your own name, my child.";
        return "lock";
    }
    if (n === "asgore") {
        nameEntryMessage = "* You cannot.";
        return "lock";
    }
    if (n === "asriel") {
        nameEntryMessage = "* ...";
        return "lock";
    }
    if (n === "alphys") {
        nameEntryMessage = "* D-don't do that.";
        return "lock";
    }
    if (n === "undyne") {
        nameEntryMessage = "* Get your OWN name!";
        return "lock";
    }
    if (n === "flowey") {
        nameEntryMessage = "* I already CHOSE that name.";
        return "lock";
    }
    if (n === "frisk") {
        nameEntryMessage = "* Warning: This name will make your life hell. Proceed anyway?";
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
    if (n === "bratty") {
        nameEntryMessage = "* Like, OK I guess.";
        return "ok";
    }
    if (n === "catty") {
        nameEntryMessage = "* Bratty! Bratty! That's MY name!!";
        return "ok";
    }
    if (n === "temmie") {
        nameEntryMessage = "* hOI!";
        return "ok";
    }
    if (n === "gerson") {
        nameEntryMessage = "* Whaaaat's your name?";
        return "ok";
    }
    if (n === "mettaton" || n === "mettat") {
        nameEntryMessage = "* OOOOOOOOH!!! ARE YOU PROMOTING MY BRAND?";
        return "ok";
    }
    if (n === "napstablook" || n === "napsta") {
        nameEntryMessage = "* ...";
        return "ok";
    }
    if (n === "bpants") {
        nameEntryMessage = "* You're gonna have a BAD time.";
        return "ok";
    }
    if (n === "murder") {
        nameEntryMessage = "* That's a little on-the-nose, isn't it...?";
        return "ok";
    }
    if (n === "mercy") {
        nameEntryMessage = "* The true name.";
        return "ok";
    }
    if (n === "shyren") {
        nameEntryMessage = "* ...";
        return "ok";
    }
    if (n === "aaaaaa") {
        nameEntryMessage = "* Not very creative...";
        return "ok";
    }
    if (n === "orange") {
        nameEntryMessage = "* NOT a true name.";
        return "ok";
    }
    nameEntryMessage = "";
    return "ok";
}

function handleNameConfirmKey(key) {
    if (key === "a" || key === "d") {
        const special = handleSpecialName(pendingName);
        if (special !== "lock") {
            nameConfirmIndex = 1 - nameConfirmIndex;
        }
        renderNameConfirm();
    } else if (key === "z") {
        const special = handleSpecialName(pendingName);
        if (nameConfirmIndex === 0 && special !== "lock") {
            if (special === "refresh") {
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

function renderNameEntry() {
    const g = document.getElementById("game");
    let html = `<div class="center" style="margin-top:60px;">
        <p>Name the fallen human.</p>
        <div class="name-display">
            <p>${chosenName}</p>
        </div>
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
    </div>`;
    g.innerHTML = html;
}

function renderNameConfirm() {
    const g = document.getElementById("game");
    const special = handleSpecialName(pendingName);
    const yesSel = nameConfirmIndex === 0 ? "selected" : "";
    const noSel = nameConfirmIndex === 1 ? "selected" : "";
    const yesLocked = special === "lock";
    g.innerHTML = `
        <div class="center" style="margin-top:80px;">
            <div class="undertale-box">
                <p>"${pendingName}"</p>
                <p>Is this name correct?</p>
                <p>
                    ${yesLocked ? `<span style="color:#555;">YES</span>` : `<span class="${yesSel}">YES</span>`}
                    /
                    <span class="${noSel}">NO</span>
                </p>
                ${nameEntryMessage ? `<p>${nameEntryMessage}</p>` : ""}
            </div>
        </div>
    `;
}

/* Shop */

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
    if (currentPlayer.inventory.length >= INVENTORY_LIMIT && section === "heal") return;

    currentPlayer.G -= item.cost;
    if (section === "weapon") {
        currentPlayer.weapon = item.name;
        currentPlayer.weaponBonus = item.at;
        // Put old weapon into inventory if space
        if (currentPlayer.inventory.length < INVENTORY_LIMIT) {
            currentPlayer.inventory.push({ name: "STICK", type: "weapon", at: 0, info: "Weapon AT 0. A useless stick." });
        }
    } else if (section === "armor") {
        currentPlayer.armor = item.name;
        currentPlayer.armorBonus = item.df;
        // Put old armor into inventory if space
        if (currentPlayer.inventory.length < INVENTORY_LIMIT) {
            currentPlayer.inventory.push({ name: "BANDAGE", type: "armor", df: 0, info: "Armor DF 0. It has already been used several times." });
        }
    } else if (section === "heal") {
        currentPlayer.inventory.push({
            name: item.name,
            type: "heal",
            heal: item.heal,
            info: item.info
        });
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

/* ITEM menu (USE / INFO / DROP / EQUIP) */

function handleItemMenuKey(key) {
    const inv = currentPlayer.inventory;

    if (key === "x") {
        gameState = "mainMenu";
        currentMenuIndex = 2;
        render();
        return;
    }

    if (inv.length === 0) {
        if (key === "z") {
            gameState = "mainMenu";
            currentMenuIndex = 2;
            render();
        }
        return;
    }

    if (key === "w") {
        itemMenuIndex = (itemMenuIndex + inv.length - 1) % inv.length;
        renderItemMenu();
    } else if (key === "s") {
        itemMenuIndex = (itemMenuIndex + 1) % inv.length;
        renderItemMenu();
    } else if (key === "a") {
        itemActionIndex = (itemActionIndex + ITEM_ACTIONS.length - 1) % ITEM_ACTIONS.length;
        renderItemMenu();
    } else if (key === "d") {
        itemActionIndex = (itemActionIndex + 1) % ITEM_ACTIONS.length;
        renderItemMenu();
    } else if (key === "z") {
        performItemAction();
        renderItemMenu();
    }
}

function performItemAction() {
    const inv = currentPlayer.inventory;
    const item = inv[itemMenuIndex];
    if (!item) return;

    const action = ITEM_ACTIONS[itemActionIndex];

    if (action === "USE") {
        if (item.type === "heal") {
            currentPlayer.HP = Math.min(currentPlayer.maxHP, currentPlayer.HP + (item.heal || 0));
            inv.splice(itemMenuIndex, 1);
        } else if (item.type === "weapon") {
            // Equip weapon
            const oldWeapon = currentPlayer.weapon;
            const oldBonus = currentPlayer.weaponBonus;
            currentPlayer.weapon = item.name;
            currentPlayer.weaponBonus = item.at || 0;
            inv.splice(itemMenuIndex, 1);
            if (oldWeapon && oldWeapon !== item.name && inv.length < INVENTORY_LIMIT) {
                inv.push({ name: oldWeapon, type: "weapon", at: oldBonus });
            }
        } else if (item.type === "armor") {
            const oldArmor = currentPlayer.armor;
            const oldBonus = currentPlayer.armorBonus;
            currentPlayer.armor = item.name;
            currentPlayer.armorBonus = item.df || 0;
            inv.splice(itemMenuIndex, 1);
            if (oldArmor && oldArmor !== item.name && inv.length < INVENTORY_LIMIT) {
                inv.push({ name: oldArmor, type: "armor", df: oldBonus });
            }
        }
    } else if (action === "INFO") {
        // Just show info in console for now; battle text box will use this later
        console.log(item.info || item.name);
    } else if (action === "DROP") {
        inv.splice(itemMenuIndex, 1);
        if (itemMenuIndex >= inv.length) {
            itemMenuIndex = Math.max(0, inv.length - 1);
        }
    } else if (action === "EQUIP") {
        if (item.type === "weapon") {
            const oldWeapon = currentPlayer.weapon;
            const oldBonus = currentPlayer.weaponBonus;
            currentPlayer.weapon = item.name;
            currentPlayer.weaponBonus = item.at || 0;
            inv.splice(itemMenuIndex, 1);
            if (oldWeapon && oldWeapon !== item.name && inv.length < INVENTORY_LIMIT) {
                inv.push({ name: oldWeapon, type: "weapon", at: oldBonus });
            }
        } else if (item.type === "armor") {
            const oldArmor = currentPlayer.armor;
            const oldBonus = currentPlayer.armorBonus;
            currentPlayer.armor = item.name;
            currentPlayer.armorBonus = item.df || 0;
            inv.splice(itemMenuIndex, 1);
            if (oldArmor && oldArmor !== item.name && inv.length < INVENTORY_LIMIT) {
                inv.push({ name: oldArmor, type: "armor", df: oldBonus });
            }
        }
    }

    saves[currentSlot] = currentPlayer;
    saveSlot(currentSlot);
}

function renderItemMenu() {
    const g = document.getElementById("game");
    const inv = currentPlayer.inventory;

    let html = `<div class="center" style="margin-top:80px;">
        <div class="item-main-box">
            <p>ITEM</p>
            <div class="item-list">
    `;

    if (inv.length === 0) {
        html += `<p>(empty)</p>`;
    } else {
        inv.forEach((it, i) => {
            const sel = (i === itemMenuIndex) ? "item-entry selected" : "item-entry";
            html += `<p class="${sel}">${it.name}</p>`;
        });
    }

    html += `</div>
            <div class="item-actions">
    `;

    ITEM_ACTIONS.forEach((act, i) => {
        const sel = (i === itemActionIndex) ? "item-action selected" : "item-action";
        html += `<span class="${sel}">${act}</span>`;
        if (i < ITEM_ACTIONS.length - 1) html += " ";
    });

    html += `</div>
        </div>
    </div>`;

    g.innerHTML = html;
}
