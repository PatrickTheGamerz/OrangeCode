loadSaves(); gameState = "title"; currentMenuIndex = 0; render();
document.onkeydown = handleKeyDown;
let monsterSelectIndex = 0, shopSectionIndex = 0, shopItemIndex = 0;
let currentMonsterPage = 1;
let itemMenuIndex = 0;

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (gameState === "title" && (key === "z" || key === "enter")) { gameState = "fileSelect"; currentMenuIndex = 0; render(); return; }
    
    if (gameState === "fileSelect") {
        if (key === "w" || key === "arrowup") { currentMenuIndex = (currentMenuIndex + SAVE_SLOTS - 1) % SAVE_SLOTS; render(); }
        else if (key === "s" || key === "arrowdown") { currentMenuIndex = (currentMenuIndex + 1) % SAVE_SLOTS; render(); }
        else if (key === "z" || key === "enter") {
            const slot = currentMenuIndex;
            if (!saves[slot]) { currentSlot = slot; createNewSave(slot, "FRISK", false); useSave(slot); }
            else useSave(slot);
            gameState = "mainMenu"; currentMenuIndex = 0; render();
        }
        return;
    }

    if (gameState === "mainMenu") {
        let optionsCount = currentPlayer.LV >= 20 ? 4 : 3; // +1 for RESET
        if (key === "w" || key === "arrowup") { currentMenuIndex = (currentMenuIndex + optionsCount - 1) % optionsCount; render(); }
        else if (key === "s" || key === "arrowdown") { currentMenuIndex = (currentMenuIndex + 1) % optionsCount; render(); }
        else if (key === "z" || key === "enter") {
            if (currentMenuIndex === 0) { gameState = "monsterSelect"; currentMonsterPage = 1; monsterSelectIndex = 0; render(); }
            else if (currentMenuIndex === 1) { gameState = "shop"; shopSectionIndex = 0; shopItemIndex = 0; render(); }
            else if (currentMenuIndex === 2) { gameState = "stats"; render(); }
            else if (currentMenuIndex === 3 && currentPlayer.LV >= 20) { 
                // DO TRUE RESET
                currentPlayer.hasReset = true; currentPlayer.LV = 1; currentPlayer.G = 0; currentPlayer.EXP = 0; currentPlayer.HP = 20; currentPlayer.maxHP = 20;
                saveSlot(currentSlot); render();
            }
        }
        else if (key === "x") { gameState = "title"; render(); }
        return;
    }

    if (gameState === "stats") { if (key === "z" || key === "x") { gameState = "mainMenu"; render(); } return; }

    if (gameState === "monsterSelect") {
        let available = monsterList.filter(m => m.page === currentMonsterPage);
        if (key === "w" || key === "arrowup") { monsterSelectIndex = (monsterSelectIndex + available.length - 1) % available.length; render(); }
        else if (key === "s" || key === "arrowdown") { monsterSelectIndex = (monsterSelectIndex + 1) % available.length; render(); }
        else if (key === "a" || key === "d") { 
            if (currentPlayer.hasReset) { currentMonsterPage = currentMonsterPage === 1 ? 2 : 1; monsterSelectIndex = 0; render(); }
        }
        else if (key === "z" || key === "enter") { const m = available[monsterSelectIndex]; if (currentPlayer.LV >= m.reqLV) startBattle(m.id); }
        else if (key === "x" || key === "shift") { gameState = "mainMenu"; currentMenuIndex = 0; render(); }
        return;
    }

    if (gameState === "battle") battleKeyDown(e);
}

function render() {
    const g = document.getElementById("game");
    if (gameState === "title") { g.innerHTML = `<div class="center" style="margin-top:160px;"><h1 style="font-size:48px;">UNDERTALE: Fallen Timelines</h1><p class="small-text">Press Z</p></div>`; return; }
    
    if (gameState === "fileSelect") {
        let html = `<div class="center" style="margin-top:40px;"><div class="undertale-box file-container"><p>SELECT A SAVE:</p>`;
        for (let i = 0; i < SAVE_SLOTS; i++) {
            const s = saves[i], sel = (i === currentMenuIndex) ? "selected" : "";
            html += `<div class="file-slot ${sel}"><div class="file-row"><span>SAVE ${i + 1}</span><span>${s ? s.name : "EMPTY"}</span></div><div class="file-row"><span>LV ${s ? s.LV : "--"}</span><span>G ${s ? s.G : "--"}</span></div></div>`;
        }
        html += `</div></div>`; g.innerHTML = html; return;
    }

    if (gameState === "mainMenu") {
        let options = ["MONSTERS", "SHOP", "STATS"];
        if (currentPlayer.LV >= 20) options.push("<span class='red-text'>TRUE RESET</span>");
        let html = `<div class="center" style="margin-top:120px;">`;
        options.forEach((opt, i) => html += `<div class="menu-option menu-large ${i === currentMenuIndex ? "selected" : ""}"><span>${opt}</span></div>`);
        html += `</div>`; g.innerHTML = html; return;
    }

    if (gameState === "stats") {
        const p = currentPlayer;
        g.innerHTML = `<div class="center" style="margin-top:60px;"><div class="undertale-box stats-box"><p>"${p.name}"</p><div class="flex-between"><span>LV ${p.LV}</span><span>HP ${p.HP}/${p.maxHP}</span></div><div class="flex-between"><span>AT ${p.baseAT} (${totalAT(p)})</span><span>EXP: ${p.EXP}</span></div><div class="flex-between"><span>DF ${p.baseDF} (${totalDF(p)})</span><span>NEXT: ${p.NEXT}</span></div><p>WEAPON: ${p.weapon}</p><p>ARMOR: ${p.armor}</p><div class="flex-between"><span>GOLD: ${p.G}</span><span>KILLS: ${p.kills}</span></div></div></div>`;
        return;
    }

    if (gameState === "monsterSelect") {
        let available = monsterList.filter(m => m.page === currentMonsterPage);
        let html = `<div class="center" style="margin-top:80px;"><div class="undertale-box" style="width:70%;"><p>SELECT MONSTER - PAGE ${currentMonsterPage}</p><div class="monster-list" style="text-align:left;">`;
        available.forEach((m, i) => { const locked = currentPlayer.LV < m.reqLV; const sel = i === monsterSelectIndex ? "selected" : ""; html += `<p class="${sel}">${locked ? "[LOCKED]" : ""} ${m.name} (LV ${m.reqLV}+)</p>`; });
        html += `</div>`;
        if (currentPlayer.hasReset) html += `<div class="page-controls">[A] / [D] TO CHANGE PAGES</div>`;
        html += `</div></div>`; g.innerHTML = html; return;
    }
}
