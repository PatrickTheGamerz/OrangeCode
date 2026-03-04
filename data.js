// data.js - player data, saves, enemies and shop

const SAVE_SLOTS = 4;

const defaultPlayer = () => ({
    name: "", LV: 1, G: 0, HP: 20, maxHP: 20, baseAT: 5, baseDF: 0,
    weaponBonus: 0, armorBonus: 0, EXP: 0, NEXT: 10,
    weapon: "STICK", armor: "BANDAGE", kills: 0, hardMode: false,
    inventory: [{ name: "MONSTER CANDY", type: "heal" }]
});

function totalAT(p) { return (p.baseAT || 0) + (p.weaponBonus || 0); }
function totalDF(p) { return (p.baseDF || 0) + (p.armorBonus || 0); }

let saves = [];
let currentSlot = 0;
let currentPlayer = null;
let gameState = "title";
let currentMenuIndex = 0;

const monsterList = [
    { id: "toriel",      name: "TORIEL",           reqLV: 1 },
    { id: "papyrus",     name: "PAPYRUS",          reqLV: 1 }
];

const shopData = {
    weapon: [{ name: "STICK", cost: 0, at: 0 }],
    armor: [{ name: "BANDAGE", cost: 0, df: 0 }],
    heal: [{ name: "MONSTER CANDY", cost: 5, heal: 10 }]
};

const enemies = [
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440, AT: 10, DF: 4, gold: 40, goldMercy: 50, exp: 30,
        spareTalks: 99, 
        spareTurnsRequirement: 5, // Shortened for testing
        soulType: "red",
        pattern: "torielHandFire",
        patterns: ["fallingFire", "torielSideFire", "torielWaveFire", "torielHandFire"],
        openingText: ["* Toriel blocks the way!"],
        checkAT: 80, checkDF: 80,
        checkDesc: "* Knows best for you.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [["* You couldn't think of any\n  conversation topics."]],
        turnDialogues: [
            ["..."], ["What are\nyou doing?"], ["Attack or\nrun away!"], ["Fight me\nor leave!"], ["Stop it."]
        ]
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680, AT: 8, DF: 2, gold: 50, goldMercy: 60, exp: 40,
        spareTalks: 99,
        surviveTurns: 6, // Shortened for testing
        soulType: "blue",
        fontClass: "papyrus-font", // Applies the custom font!
        pattern: "bonesHorizontal",
        patterns: ["bonesHorizontal", "bonesHorizontalHigh", "papyrusJump"],
        openingText: ["* Papyrus blocks the way!"],
        checkAT: 8, checkDF: 2,
        checkDesc: "* He likes to say: 'Nyeh heh heh!'",
        actOptions: ["CHECK", "FLIRT", "INSULT"],
        talkTexts: [],
        // Arrays inside arrays allow multi-box dialogue!
        turnDialogues: [
            ["YOU'RE BLUE\nNOW!", "THAT'S MY\nATTACK!"], 
            ["NYEH HEH\nHEH!"], 
            ["HMM, YOU ARE\nA TOUGH ONE!"], 
            ["MY <span class='red-text'>SPECIAL\nATTACK</span> IS\nSOON!", "ARE YOU\nREADY?"], 
            ["HERE IT\nCOMES!"], 
            // The dog scene!
            ["WHAT?!", "WHERE IS MY\n<span class='red-text'>SPECIAL\nATTACK</span>?", "THAT DOG\nSTOLE IT!", "WELL, HERE'S\nA <span class='red-text'>NORMAL\nATTACK</span>!"]
        ]
    }
];

let currentEnemy = null;

function loadSaves() {
    saves = [];
    for (let i = 0; i < SAVE_SLOTS; i++) {
        const raw = localStorage.getItem("fallen_save_" + i);
        if (raw) {
            const parsed = JSON.parse(raw);
            const base = defaultPlayer();
            const merged = Object.assign(base, parsed);
            if (!Array.isArray(merged.inventory)) merged.inventory = base.inventory.slice();
            saves.push(merged);
        } else {
            saves.push(null);
        }
    }
}

function saveSlot(index) {
    if (!saves[index]) return;
    localStorage.setItem("fallen_save_" + index, JSON.stringify(saves[index]));
}

function createNewSave(index, name, hardModeFlag) {
    const p = defaultPlayer();
    p.name = name;
    p.hardMode = !!hardModeFlag;
    saves[index] = p;
    saveSlot(index);
}

function useSave(index) {
    currentSlot = index;
    currentPlayer = saves[index];
}
