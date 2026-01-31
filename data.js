// data.js - player data, saves, enemies and shop

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
};

const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 0 },
        { name: "TOY KNIFE", cost: 20, at: 3 },
        { name: "TOUGH GLOVE", cost: 40, at: 5 }
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0 },
        { name: "FADED RIBBON", cost: 25, df: 3 },
        { name: "MANLY BANDANNA", cost: 45, df: 5 }
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10 },
        { name: "SPIDER DONUT", cost: 15, heal: 12 },
        { name: "BUTTERSCOTCH PIE", cost: 60, heal: 99 }
    ]
};

const enemies = [
    {
        id: "dummy",
        name: "DUMMY",
        maxHP: 30,
        AT: 1,
        DF: 1,
        gold: 3,
        goldMercy: 5,
        exp: 2,
        spareTalks: 2,
        soulType: "red",
        pattern: "simpleHorizontal",
        patterns: ["simpleHorizontal"],
        openingText: "* DUMMY blocks the way!",
        checkAT: 1,
        checkDF: 1,
        checkDesc: "* A cotton heart and a button eye.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [
            "* You talk to the DUMMY.\n* ...\n* It doesn't seem much for conversation."
        ]
    },
    {
        id: "mad_dummy",
        name: "MAD DUMMY",
        maxHP: 60,
        AT: 5,
        DF: 2,
        gold: 15,
        goldMercy: 20,
        exp: 10,
        spareTalks: 3,
        soulType: "red",
        pattern: "multiHorizontal",
        patterns: ["multiHorizontal", "dummyAim", "dummyAimBurst"],
        openingText: "* Mad Dummy blocks the way!",
        checkAT: 30,
        checkDF: "YES",
        checkDesc: "* The dummy looks mad.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [
            "* You talk to the MAD DUMMY.\n* ...\n* It doesn't seem much for conversation."
        ]
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440,
        AT: 10,
        DF: 4,
        gold: 40,
        goldMercy: 50,
        exp: 30,
        spareTalks: 3,
        soulType: "red",
        pattern: "fallingFire",
        patterns: ["fallingFire", "torielSideFire", "torielWaveFire", "torielHandFire"],
        openingText: "* Toriel is acting aloof.",
        checkAT: 80,
        checkDF: 80,
        checkDesc: "* Knows best for you.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [
            "* You couldn't think of any conversation topics."
        ]
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680,
        AT: 8,
        DF: 2,
        gold: 50,
        goldMercy: 60,
        exp: 40,
        spareTalks: 4,
        soulType: "blue",
        pattern: "bonesHorizontal",
        patterns: ["bonesHorizontal", "boneRain", "sideBones", "blueAttackPhase"],
        openingText: "* Papyrus blocks the way!",
        checkAT: 8,
        checkDF: 2,
        checkDesc: "* He likes to say: 'Nyeh heh heh!'",
        actOptions: ["CHECK", "FLIRT", "INSULT"],
        talkTexts: [
            "* You flirt with Papyrus.\n* He becomes flustered.",
            "* You insult Papyrus.\n* He doesn't seem to understand."
        ]
    },
    {
        id: "p_sans",
        name: "PACIFIST SANS",
        maxHP: 80,
        AT: 10,
        DF: 4,
        gold: 30,
        goldMercy: 35,
        exp: 20,
        spareTalks: 5,
        soulType: "blue",
        pattern: "fastBones",
        patterns: ["fastBones", "sansKarma", "sansSideSpam"],
        openingText: "* Sans is taking it easy.",
        checkAT: 10,
        checkDF: 4,
        checkDesc: "* Just a friendly shortcut guy.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [
            "* You try to talk.\n* He shrugs."
        ]
    },
    {
        id: "us_sans",
        name: "UNDERSWAP SANS",
        maxHP: 90,
        AT: 11,
        DF: 5,
        gold: 35,
        goldMercy: 40,
        exp: 25,
        spareTalks: 5,
        soulType: "blue",
        pattern: "mixedBones",
        patterns: ["mixedBones", "boneRain", "sansSideSpam"],
        openingText: "* Sans is ready to swap it up!",
        checkAT: 11,
        checkDF: 5,
        checkDesc: "* Seems excited.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [
            "* You say hi.\n* He waves enthusiastically."
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
            if (!Array.isArray(merged.inventory)) {
                merged.inventory = base.inventory.slice();
            } else {
                merged.inventory = merged.inventory.map(it => {
                    if (typeof it === "string") {
                        const heal = shopData.heal.find(h => h.name === it);
                        if (heal) return { name: it, type: "heal" };
                        const w = shopData.weapon.find(w => w.name === it);
                        if (w) return { name: it, type: "weapon" };
                        const a = shopData.armor.find(a => a.name === it);
                        if (a) return { name: it, type: "armor" };
                        return { name: it, type: "heal" };
                    }
                    return it;
                });
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
