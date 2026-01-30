function loadMenu() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="menu">
            <h1>Monster Arena</h1>
            <button onclick="loadFightSelect()">Fight</button>
            <button onclick="loadShop()">Shop</button>
            <button onclick="loadInventory()">Inventory</button>
            <button onclick="loadStats()">Stats</button>
            <button onclick="loadSettings()">Settings</button>
            <button onclick="loadCredits()">Credits</button>
        </div>
    `;
}

function loadFightSelect() {
    const app = document.getElementById("app");
    let html = `<div class="screen"><h1>Select Monster</h1>`;

    for (let m in monsters) {
        if (player.LV >= monsters[m].unlockLV) {
            html += `<button onclick="startFight('${m}')">${m}</button>`;
        } else {
            html += `<button disabled>${m} (LV ${monsters[m].unlockLV})</button>`;
        }
    }

    html += `<button onclick="loadMenu()">Back</button></div>`;
    app.innerHTML = html;
}

function loadShop() {
    const app = document.getElementById("app");
    let html = `<div class="screen"><h1>Shop</h1><p>G: ${player.G}</p>`;

    shopItems.forEach(item => {
        html += `<button onclick="buyItem('${item.name}')">${item.name} - ${item.cost}G</button>`;
    });

    html += `<button onclick="loadMenu()">Back</button></div>`;
    app.innerHTML = html;
}

function buyItem(name) {
    const item = shopItems.find(i => i.name === name);
    if (player.G >= item.cost) {
        player.G -= item.cost;
        player.inventory.push(item.name);
    }
    loadShop();
}

function loadInventory() {
    const app = document.getElementById("app");
    let html = `<div class="screen"><h1>Inventory</h1>`;

    if (player.inventory.length === 0) {
        html += `<p>No items</p>`;
    } else {
        player.inventory.forEach(i => html += `<p>${i}</p>`);
    }

    html += `<button onclick="loadMenu()">Back</button></div>`;
    app.innerHTML = html;
}

function loadStats() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="screen">
            <h1>Stats</h1>
            <p>LV: ${player.LV}</p>
            <p>G: ${player.G}</p>
            <p>Unlocked Monsters: ${player.unlockedMonsters.join(", ")}</p>
            <button onclick="loadMenu()">Back</button>
        </div>
    `;
}

function loadSettings() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="screen">
            <h1>Settings</h1>
            <p>(placeholder)</p>
            <button onclick="loadMenu()">Back</button>
        </div>
    `;
}

function loadCredits() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="screen">
            <h1>Credits</h1>
            <p>Made by Roksana & Copilot</p>
            <button onclick="loadMenu()">Back</button>
        </div>
    `;
}

loadMenu();
