// Basic data and helpers

const SAVE_SLOTS = 4;

const defaultPlayer = () => ({
    name: "",
    LV: 1,
    G: 0,
    HP: 20,
    maxHP: 20,
    AT: 5,
    DF: 0,
    EXP: 0,
    NEXT: 10,
    weapon: "STICK",
    armor: "BANDAGE",
    kills: 0,
    inventory: ["MONSTER CANDY"],
});

let saves = []; // filled from localStorage
let currentSlot = 0;
let currentPlayer = null;
let gameState = "title"; // title, fileSelect, nameEntry, mainMenu, shop, inventory, stats, settings, credits, battle
let currentMenuIndex = 0;

// Shop data
const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 1 },
        { name: "TOY KNIFE", cost: 20, at: 3 },
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0 },
        { name: "FADED RIBBON", cost: 25, df: 3 },
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10 },
        { name: "SPIDER DONUT", cost: 15, heal: 12 },
    ]
};

// Simple enemy
const enemies = [
    {
        id: "dummy",
        name: "TRAINING DUMMY",
        maxHP: 30,
        AT: 4,
        DF: 0,
        gold: 5,
        exp: 5
    }
];

let currentEnemy = null;
let battleState = null; // handled in battle.js

function loadSaves() {
    saves = [];
    for (let i = 0; i < SAVE_SLOTS; i++) {
        const raw = localStorage.getItem("fallen_save_" + i);
        if (raw) {
            saves.push(JSON.parse(raw));
        } else {
            saves.push(null);
        }
    }
}

function saveSlot(index) {
    if (!saves[index]) return;
    localStorage.setItem("fallen_save_" + index, JSON.stringify(saves[index]));
}

function createNewSave(index, name) {
    const p = defaultPlayer();
    p.name = name;
    saves[index] = p;
    saveSlot(index);
}

function useSave(index) {
    currentSlot = index;
    currentPlayer = saves[index];
}
