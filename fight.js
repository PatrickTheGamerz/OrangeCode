function startFight(monsterName) {
    const m = monsters[monsterName];
    let mHP = m.hp;
    let pHP = 100 + player.LV * 10;

    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="screen">
            <h1>Fighting ${monsterName}</h1>
            <p>Monster HP: <span id="mhp">${mHP}</span></p>
            <p>Your HP: <span id="php">${pHP}</span></p>
            <button id="attackBtn">Attack</button>
            <button onclick="loadMenu()">Run</button>
        </div>
    `;

    document.getElementById("attackBtn").onclick = () => {
        mHP -= 10 + player.LV * 2;
        pHP -= m.atk;

        document.getElementById("mhp").textContent = mHP;
        document.getElementById("php").textContent = pHP;

        if (mHP <= 0) {
            player.G += m.rewardG;
            player.LV += m.rewardLV;

            if (!player.unlockedMonsters.includes(monsterName)) {
                player.unlockedMonsters.push(monsterName);
            }

            loadMenu();
        }

        if (pHP <= 0) {
            loadMenu();
        }
    };
}
