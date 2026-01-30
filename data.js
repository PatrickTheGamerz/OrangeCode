const SAVE_SLOTS = 4;

const defaultPlayer = () => ({
    name: "",
    LV: 1,
    G: 0,
    HP: 20,
    maxHP: 20,
    baseAT: 5,
    baseDF: 0,
    weaponBonus: 0,
    armorBonus: 0,
    EXP: 0,
    NEXT: 10,
    weapon: "STICK",
    armor: "BANDAGE",
    kills: 0,
    inventory: ["MONSTER CANDY"],
});

function totalAT(p) {
    return p.baseAT + p.weaponBonus;
}

function totalDF(p) {
    return p.baseDF + p.armorBonus;
}

let saves = [];
let currentSlot = 0;
let currentPlayer = null;
let gameState = "title";
let currentMenuIndex = 0;

// monster list for MONSTERS menu
const monsterList = [
    { id: "dummy",       name: "DUMMY",            reqLV: 1 },
    { id: "mad_dummy",   name: "MAD DUMMY",        reqLV: 2 },
    { id: "toriel",      name: "TORIEL",           reqLV: 3 },
    { id: "papyrus",     name: "PAPYRUS",          reqLV: 5 },
    { id: "p_sans",      name: "PACIFIST SANS",    reqLV: 8 },
    { id: "us_sans",     name: "UNDERSWAP SANS",   reqLV: 9 },
];

// shop
const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 0 },
        { name: "TOY KNIFE", cost: 20, at: 3 },
        { name: "TOUGH GLOVE", cost: 40, at: 5 },
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0 },
        { name: "FADED RIBBON", cost: 25, df: 3 },
        { name: "MANLY BANDANNA", cost: 45, df: 5 },
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10 },
        { name: "SPIDER DONUT", cost: 15, heal: 12 },
        { name: "BUTTERSCOTCH PIE", cost: 60, heal: 99 },
    ]
};

// enemies
const enemies = [
    {
        id: "dummy",
        name: "DUMMY",
        maxHP: 30,
        AT: 4,
        DF: 0,
        gold: 5,
        exp: 5,
        spareTalks: 2,
        soulType: "red",
        pattern: "simpleHorizontal"
    },
    {
        id: "mad_dummy",
        name: "MAD DUMMY",
        maxHP: 40,
        AT: 6,
        DF: 1,
        gold: 10,
        exp: 8,
        spareTalks: 3,
        soulType: "red",
        pattern: "multiHorizontal"
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 60,
        AT: 7,
        DF: 2,
        gold: 15,
        exp: 12,
        spareTalks: 3,
        soulType: "red",
        pattern: "fallingFire"
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 70,
        AT: 8,
        DF: 3,
        gold: 20,
        exp: 15,
        spareTalks: 4,
        soulType: "blue",
        pattern: "bonesHorizontal"
    },
    {
        id: "p_sans",
        name: "PACIFIST SANS",
        maxHP: 80,
        AT: 10,
        DF: 4,
        gold: 30,
        exp: 20,
        spareTalks: 5,
        soulType: "blue",
        pattern: "fastBones"
    },
    {
        id: "us_sans",
        name: "UNDERSWAP SANS",
        maxHP: 90,
        AT: 11,
        DF: 5,
        gold: 35,
        exp: 25,
        spareTalks: 5,
        soulType: "blue",
        pattern: "mixedBones"
    }
];

let currentEnemy = null;

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
