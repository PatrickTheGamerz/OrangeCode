function finishAttackBar() {
    if (fightInterval) clearInterval(fightInterval);
    const center = 250; const dist = Math.abs(fightMarkerPos - center);
    const multiplier = Math.max(0.2, 1 - dist / 200);
    const base = totalAT(currentPlayer) + 3;
    let raw = Math.max(1, Math.round(base * multiplier));
    
    // SANS DODGE LOGIC
    if (currentEnemy.id.includes("sans")) {
        battleSubState = "text"; setBattleText(["* Sans dodged."]); renderBattle(); return;
    }

    // PAPYRUS / TORIEL BETRAYAL KILL
    if (canSpare) currentEnemy.DF = -999999;
    
    let damage = Math.max(1, raw - (currentEnemy.DF || 0));
    currentEnemy.HP = Math.max(0, currentEnemy.HP - damage);
    battleSubState = "text";
    
    // Add screen shake on massive hits
    if (damage > 1000) document.getElementById("game").classList.add("shake");
    setTimeout(() => document.getElementById("game").classList.remove("shake"), 400);
    
    if (canSpare && currentEnemy.HP <= 0) setBattleText([`* You dealt ${damage} damage!`, "* You monster..."]);
    else if (multiplier <= 0.2) setBattleText(["* MISS!"]);
    else setBattleText([`* You hit ${currentEnemy.name} for ${damage} damage!`]);
}

function applyEnemyDamage(b) {
    let dmg = Math.max(1, currentEnemy.AT - totalDF(currentPlayer));
    
    // Screen shake on getting hit
    document.getElementById("game").classList.add("shake");
    setTimeout(() => document.getElementById("game").classList.remove("shake"), 400);

    // Papyrus spares at 1 HP
    if (currentEnemy.id === "papyrus" && currentPlayer.HP - dmg <= 0) dmg = Math.max(0, currentPlayer.HP - 1);
    currentPlayer.HP = Math.max(0, currentPlayer.HP - dmg);
}
