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

let saves = [];
let currentSlot = 0;
let currentPlayer = null;
let gameState = "title";
let currentMenuIndex = 0;

// monster list for MONSTERS menu
const monsterList = [
    { id: "dummy", name: "TRAINING DUMMY", reqLV: 1 },
    { id: "ghost", name: "LONELY GHOST", reqLV: 2 },
    { id: "golem", name: "STONE GOLEM", reqLV: 4 }
];

// shop
const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 0 },
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
        spareTalks: 2
    },
    {
        id: "ghost",
        name: "GHOST",
        maxHP: 40,
        AT: 5,
        DF: 1,
        gold: 8,
        exp: 7,
        spareTalks: 3
    },
    {
        id: "golem",
        name: "GOLEM",
        maxHP: 60,
        AT: 8,
        DF: 3,
        gold: 15,
        exp: 12,
        spareTalks: 4
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
