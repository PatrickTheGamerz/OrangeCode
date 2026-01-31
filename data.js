// data.js - player data, saves, enemies and shop

const SAVE_SLOTS = 4;
const INVENTORY_LIMIT = 8;

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
    hardMode: false,
    inventory: [{ name: "MONSTER CANDY", type: "heal" }]
});

function totalAT(p) {
    return (p.baseAT || 0) + (p.weaponBonus || 0);
}

function totalDF(p) {
    return (p.baseDF || 0) + (p.armorBonus || 0);
}

let saves = [];
let currentSlot = 0;
let currentPlayer = null;
let gameState = "title";
let currentMenuIndex = 0;

const monsterList = [
    { id: "dummy",       name: "DUMMY",            reqLV: 1 },
    { id: "mad_dummy",   name: "MAD DUMMY",        reqLV: 2 },
    { id: "toriel",      name: "TORIEL",           reqLV: 3 },
    { id: "papyrus",     name: "PAPYRUS",          reqLV: 5 },
    { id: "p_sans",      name: "PACIFIST SANS",    reqLV: 8 },
    { id: "us_sans",     name: "UNDERSWAP SANS",   reqLV: 9 }
];

const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 0, desc: "STICK - Weapon\n* A simple stick." },
        { name: "TOY KNIFE", cost: 20, at: 3, desc: "TOY KNIFE - Weapon\n* Made of plastic. A rarity nowadays." },
        { name: "TOUGH GLOVE", cost: 40, at: 5, desc: "TOUGH GLOVE - Weapon\n* A worn pink leather glove." }
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0, desc: "BANDAGE - Armor\n* It has already been used several times." },
        { name: "FADED RIBBON", cost: 25, df: 3, desc: "FADED RIBBON - Armor\n* If you're cuter, monsters won't hit you as hard." },
        { name: "MANLY BANDANNA", cost: 45, df: 5, desc: "MANLY BANDANNA - Armor\n* It has seen some wear. It has abs drawn on it." }
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10, desc: "MONSTER CANDY - Heals 10 HP\n* Has a distinct, non-licorice flavor." },
        { name: "SPIDER DONUT", cost: 15, heal: 12, desc: "SPIDER DONUT - Heals 12 HP\n* A donut made with Spider Cider in the batter." },
        { name: "BUTTERSCOTCH PIE", cost: 60, heal: 99, desc: "BUTTERSCOTCH PIE - Heals all HP\n* Butterscotch-cinnamon pie, one slice." }
    ]
};

// quick lookup for item descriptions
function getItemMeta(name) {
    for (const cat of ["weapon", "armor", "heal"]) {
        const found = shopData[cat].find(i => i.name === name);
        if (found) return { ...found, type: cat === "heal" ? "heal" : cat };
    }
    // fallback
    return { name, type: "heal", heal: 10, desc: `${name} - ???` };
}

const enemies = [
    {
        id: "dummy",
        name: "DUMMY",
        maxHP: 30,
        AT: 1,
        DF: 1,
        gold: 2,
        exp: 0,
        spareBonusGold: 3,
        noExpOnSpare: true,
        spareTalks: 2,
        soulType: "red",
        pattern: "simpleHorizontal",
        patterns: ["simpleHorizontal"],
        introText: "* DUMMY blocks the way!",
        checkText: "* DUMMY - 1 ATK 1 DEF\n* A cotton heart and a button eye."
    },
    {
        id: "mad_dummy",
        name: "MAD DUMMY",
        maxHP: 60,
        AT: 5,
        DF: 2,
        gold: 10,
        exp: 8,
        spareTalks: 3,
        soulType: "red",
        pattern: "multiHorizontal",
        patterns: ["multiHorizontal", "dummyAim", "dummyAimBurst"],
        introText: "* Mad Dummy blocks the way!",
        checkText: "* MAD DUMMY - ATK 30 DEF YES\n* The dummy looks mad."
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440,
        AT: 10,
        DF: 4,
        gold: 30,
        exp: 40,
        spareTalks: 3,
        soulType: "red",
        pattern: "fallingFire",
        patterns: ["fallingFire", "torielSideFire", "torielWaveFire"],
        introText: "* Toriel is acting aloof.",
        checkText: "* TORIEL - ATK 80 DEF 80\n* Knows best for you."
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680,
        AT: 8,
        DF: 2,
        gold: 40,
        exp: 80,
        spareTalks: 4,
        soulType: "blue",
        pattern: "bonesHorizontal",
        patterns: ["bonesHorizontal", "boneRain", "sideBones"],
        introText: "* Papyrus blocks the way!",
        checkText: "* PAPYRUS - ATK 8 DEF 2\n* He likes to say: 'Nyeh heh heh!'"
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
        pattern: "fastBones",
        patterns: ["fastBones", "sansKarma", "sansSideSpam"],
        introText: "* Sans is judging you.",
        checkText: "* SANS - ATK 1 DEF 1\n* The easiest enemy. Can only deal 1 damage."
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
        pattern: "mixedBones",
        patterns: ["mixedBones", "boneRain", "sansSideSpam"],
        introText: "* Blueberry appears!",
        checkText: "* SANS? - ATK 11 DEF 5\n* He looks... different."
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
            if (!Array.isArray(merged.inventory)) {
                merged.inventory = base.inventory.slice();
            } else {
                merged.inventory = merged.inventory.map(it => {
                    if (typeof it === "string") {
                        const meta = getItemMeta(it);
                        return { name: meta.name, type: meta.type };
                    }
                    return it;
                }).slice(0, INVENTORY_LIMIT);
            }
            if (typeof merged.weaponBonus !== "number") merged.weaponBonus = 0;
            if (typeof merged.armorBonus !== "number") merged.armorBonus = 0;
            if (typeof merged.baseAT !== "number") merged.baseAT = 5;
            if (typeof merged.baseDF !== "number") merged.baseDF = 0;
            if (typeof merged.maxHP !== "number") merged.maxHP = 20;
            if (typeof merged.HP !== "number") merged.HP = merged.maxHP;
            if (typeof merged.hardMode !== "boolean") merged.hardMode = false;
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
