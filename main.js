// main.js - State Machine, VHS File Select, Shop UI
loadSaves(); gameState = "title"; currentMenuIndex = 0; render();
document.onkeydown = handleKeyDown;
let monsterSelectIndex = 0, shopSectionIndex = 0, shopItemIndex = 0;

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (gameState === "title" && (key === "z" || key === "enter")) { gameState = "fileSelect"; currentMenuIndex = 0; render(); return; }
    
    if (gameState === "fileSelect") {
        if (key === "w" || key === "arrowup") { currentMenuIndex = (currentMenuIndex + SAVE_SLOTS - 1) % SAVE_SLOTS; render(); }
        else if (key === "s" || key === "arrowdown") { currentMenuIndex = (currentMenuIndex + 1) % SAVE_SLOTS; render(); }
        else if (key === "z" || key === "enter") {
            const slot = currentMenuIndex; gameState = "loading"; render();
            setTimeout(() => {
                if (!saves[slot]) { currentSlot = slot; createNewSave(slot, "FRISK", false); useSave(slot); }
                else useSave(slot);
                gameState = "mainMenu"; currentMenuIndex = 0; render();
            }, 1500);
        }
        return;
    }
    
    if (gameState === "mainMenu") {
        const max = 2;
        if (key === "w" || key === "arrowup") { currentMenuIndex = (currentMenuIndex + max) % (max + 1); render(); }
        else if (key === "s" || key === "arrowdown") { currentMenuIndex = (currentMenuIndex + 1) % (max + 1); render(); }
        else if (key === "z" || key === "enter") {
            if (currentMenuIndex === 0) { gameState = "monsterSelect"; monsterSelectIndex = 0; render(); }
            else if (currentMenuIndex === 1) { gameState = "shop"; shopSectionIndex = 0; shopItemIndex = 0; render(); }
            else if (currentMenuIndex === 2) { gameState = "title"; render(); }
        }
        return;
    }

    if (gameState === "monsterSelect") {
        if (key === "w" || key === "arrowup") { monsterSelectIndex = (monsterSelectIndex + monsterList.length - 1) % monsterList.length; render(); }
        else if (key === "s" || key === "arrowdown") { monsterSelectIndex = (monsterSelectIndex + 1) % monsterList.length; render(); }
        else if (key === "z" || key === "enter") { const m = monsterList[monsterSelectIndex]; if (currentPlayer.LV >= m.reqLV) startBattle(m.id); }
        else if (key === "x" || key === "shift") { gameState = "mainMenu"; currentMenuIndex = 0; render(); }
        return;
    }

    if (gameState === "shop") {
        const sections = ["weapon", "armor", "heal"], items = shopData[sections[shopSectionIndex]];
        if (key === "a" || key === "arrowleft") { shopSectionIndex = (shopSectionIndex + 2) % 3; shopItemIndex = 0; render(); }
        else if (key === "d" || key === "arrowright") { shopSectionIndex = (shopSectionIndex + 1) % 3; shopItemIndex = 0; render(); }
        else if (key === "w" || key === "arrowup") { shopItemIndex = (shopItemIndex + items.length - 1) % items.length; render(); }
        else if (key === "s" || key === "arrowdown") { shopItemIndex = (shopItemIndex + 1) % items.length; render(); }
        else if (key === "z" || key === "enter") {
            const item = items[shopItemIndex];
            if (currentPlayer.G >= item.cost && currentPlayer.inventory.length < 8) {
                currentPlayer.G -= item.cost;
                currentPlayer.inventory.push({ name: item.name, heal: item.heal, type: sections[shopSectionIndex] });
                saveSlot(currentSlot); render();
            }
        }
        else if (key === "x" || key === "shift") { gameState = "mainMenu"; currentMenuIndex = 1; render(); }
        return;
    }

    if (gameState === "battle") battleKeyDown(e);
}

function render() {
    const g = document.getElementById("game"); g.className = "";
    if (gameState === "title") { g.innerHTML = `<div class="center" style="margin-top:160px;"><h1 style="font-size:48px;">UNDERTALE: Fallen Timelines</h1><p class="small-text">Press Z</p></div>`; return; }
    
    if (gameState === "fileSelect") {
        g.classList.add("vhs-effect");
        let wing = `<div class="wingdings-layer">`; const chars = ["❄︎", "🖳", "⬧", "⧫", "♏︎", "❒", "⬥", "♓︎", "■", "♎︎"];
        for (let i = 0; i < 30; i++) wing += `<span class="wingding" style="top:${Math.random()*100}%;left:${Math.random()*100}%;animation-delay:${Math.random()*2}s;animation-duration:${2+Math.random()*3}s;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
        wing += `</div>`;
        let html = `${wing}<div class="center" style="margin-top:40px;"><div class="undertale-box file-container"><p>SELECT A SAVE:</p>`;
        for (let i = 0; i < SAVE_SLOTS; i++) {
            const s = saves[i], sel = (i === currentMenuIndex) ? "selected" : "";
            html += `<div class="file-slot ${sel}"><div class="file-row"><span>SAVE ${i + 1}</span><span>${s ? s.name : "EMPTY"}</span></div><div class="file-row"><span>LV ${s ? s.LV : "--"}</span><span>G ${s ? s.G : "--"}</span></div></div>`;
        }
        html += `</div></div>`; g.innerHTML = html; return;
    }

    if (gameState === "loading") { g.innerHTML = `<div class="center loading-screen">* Loading...</div>`; return; }

    if (gameState === "mainMenu") {
        const options = ["MONSTERS", "SHOP", "QUIT"];
        let html = `<div class="center" style="margin-top:120px;">`;
        options.forEach((opt, i) => html += `<div class="menu-option menu-large ${i === currentMenuIndex ? "selected" : ""}"><span>${opt}</span></div>`);
        html += `</div>`; g.innerHTML = html; return;
    }

    if (gameState === "monsterSelect") {
        let html = `<div class="center" style="margin-top:80px;"><div class="undertale-box" style="width:70%;"><p>SELECT MONSTER</p><div class="monster-list">`;
        monsterList.forEach((m, i) => { const locked = currentPlayer.LV < m.reqLV; const sel = i === monsterSelectIndex ? "selected" : ""; html += `<p class="${sel}">${locked ? "[LOCKED]" : ""} ${m.name} (LV ${m.reqLV}+)</p>`; });
        html += `</div></div></div>`; g.innerHTML = html; return;
    }

    if (gameState === "shop") {
        const sections = ["weapon", "armor", "heal"], section = sections[shopSectionIndex], items = shopData[section], currentItem = items[shopItemIndex];
        let html = `<div class="center" style="margin-top:20px;"><p>SHOP - GOLD: ${currentPlayer.G}G</p><p><span class="${shopSectionIndex === 0 ? "selected" : ""}">WEAPONS</span> &nbsp;&nbsp; <span class="${shopSectionIndex === 1 ? "selected" : ""}">ARMOR</span> &nbsp;&nbsp; <span class="${shopSectionIndex === 2 ? "selected" : ""}">ITEMS</span></p><div class="shop-container"><div class="shop-left">`;
        items.forEach((it, i) => html += `<div class="shop-item ${i === shopItemIndex ? "selected" : ""}">${it.name} - ${it.cost}G</div>`);
        html += `</div><div class="shop-right"><div><p style="font-size:32px; color:#ffff00;">${currentItem.name}</p><p>Cost: ${currentItem.cost}G</p>${currentItem.at ? `<p>ATK +${currentItem.at}</p>` : ""}${currentItem.df ? `<p>DEF +${currentItem.df}</p>` : ""}${currentItem.heal ? `<p>Heals ${currentItem.heal} HP</p>` : ""}</div><div class="shop-desc">* ${currentItem.desc}</div></div></div></div>`;
        g.innerHTML = html; return;
    }
}
