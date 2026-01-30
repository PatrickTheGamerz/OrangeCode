const player = {
    LV: 1,
    G: 0,
    inventory: [],
    unlockedMonsters: ["Dummy"],
};

const monsters = {
    "Dummy": { hp: 50, atk: 5, rewardG: 10, rewardLV: 1, unlockLV: 1 },
    "Frost Golem": { hp: 120, atk: 12, rewardG: 25, rewardLV: 1, unlockLV: 2 },
    "Shadow Beast": { hp: 200, atk: 20, rewardG: 40, rewardLV: 2, unlockLV: 4 },
    "Omega Reaper": { hp: 350, atk: 35, rewardG: 80, rewardLV: 3, unlockLV: 7 }
};

const shopItems = [
    { name: "Small Heal", cost: 20, effect: "heal" },
    { name: "ATK Boost", cost: 50, effect: "atk" }
];
