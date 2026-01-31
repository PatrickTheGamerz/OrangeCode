// data.js - player data, saves, enemies and shop

const SAVE_SLOTS = 4;
const ITEM_LIMIT = 8;

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
    inventory: [
        { name: "MONSTER CANDY", type: "heal", heal: 10, info: "Heals 10 HP." }
    ]
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
        { name: "STICK", cost: 0, at: 0, info: "Its bark is worse than its bite." },
        { name: "TOY KNIFE", cost: 20, at: 3, info: "Made of plastic. A rarity nowadays." },
        { name: "TOUGH GLOVE", cost: 40, at: 5, info: "A worn pink leather glove." }
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0, info: "It has already been used several times." },
        { name: "FADED RIBBON", cost: 25, df: 3, info: "If you're cuter, monsters won't hit you as hard." },
        { name: "MANLY BANDANNA", cost: 45, df: 5, info: "It has seen some wear. It has abs drawn on it." }
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10, info: "Heals 10 HP. Has a distinct, non-licorice flavor." },
        { name: "SPIDER DONUT", cost: 15, heal: 12, info: "Heals 12 HP. Made with Spider Cider in the batter." },
        { name: "BUTTERSCOTCH PIE", cost: 60, heal: 99, info: "Heals all HP. Butterscotch-cinnamon pie, one slice." }
    ]
};

/*
   Enemies: adjusted AT/DF, HP, and rewards.
   killExp/killGold: for killing
   spareGold: for sparing (no EXP)
*/

const enemies = [
    {
        id: "dummy",
        name: "DUMMY",
        maxHP: 30,
        HP: 30,
        AT: 1,
        DF: 1,
        killExp: 3,
        killGold: 2,
        spareGold: 4,
        spareTalks: 2,
        soulType: "red",
        pattern: "dummySimple",
        patterns: ["dummySimple"],
        introText: "* DUMMY blocks the way!",
        checkText: "* DUMMY - 1 ATK 1 DEF\n* A cotton heart and a button eye.",
        dialogueLines: [
            "* ...",
            "* The dummy just stands there."
        ]
    },
    {
        id: "mad_dummy",
        name: "MAD DUMMY",
        maxHP: 40,
        HP: 40,
        AT: 5,
        DF: 2,
        killExp: 10,
        killGold: 8,
        spareGold: 12,
        spareTalks: 3,
        soulType: "red",
        pattern: "madDummySimple",
        patterns: ["madDummySimple", "madDummyWalls", "madDummyChase"],
        introText: "* Mad Dummy blocks the way!",
        checkText: "* MAD DUMMY - ATK 30 DEF YES\n* The dummy looks mad.",
        dialogueLines: [
            "* Mad Dummy glares into the distance.",
            "* Mad Dummy is hopping mad."
        ]
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440,
        HP: 440,
        AT: 10,
        DF: 4,
        killExp: 80,
        killGold: 40,
        spareGold: 60,
        spareTalks: 3,
        soulType: "red",
        pattern: "torielFireRain",
        patterns: ["torielFireRain", "torielFireWalls", "torielHandShot"],
        introText: "* Toriel is acting aloof.",
        checkText: "* TORIEL - ATK 80 DEF 80\n* Knows best for you.",
        dialogueLines: [
            "* Toriel looks through you.",
            "* Toriel takes a deep breath.",
            "* Toriel prepares a magical attack."
        ]
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680,
        HP: 680,
        AT: 8,
        DF: 2,
        killExp: 120,
        killGold: 50,
        spareGold: 80,
        spareTalks: 4,
        soulType: "blue",
        pattern: "papyrusPhase1",
        patterns: ["papyrusPhase1", "papyrusPhase2", "papyrusBlueAttack", "papyrusSpecial"],
        introText: "* Papyrus blocks the way!",
        checkText: "* PAPYRUS - ATK 8 DEF 2\n* He likes to say: 'Nyeh heh heh!'",
        dialogueLines: [
            "* NYEH HEH HEH!",
            "* Papyrus is thinking about what to wear.",
            "* Papyrus is rattling his bones."
        ]
    },
    {
        id: "p_sans",
        name: "PACIFIST SANS",
        maxHP: 80,
        HP: 80,
        AT: 10,
        DF: 4,
        killExp: 0,
        killGold: 0,
        spareGold: 0,
        spareTalks: 5,
        soulType: "blue",
        pattern: "sansFastBones",
        patterns: ["sansFastBones", "sansKarma", "sansSideSpam"],
        introText: "* Sans is taking it easy.",
        checkText: "* SANS - ATK ? DEF ?\n* The easiest enemy. Can only deal 1 damage.",
        dialogueLines: [
            "* heya.",
            "* sans is smiling.",
            "* sans is sleeping."
        ]
    },
    {
        id: "us_sans",
        name: "UNDERSWAP SANS",
        maxHP: 90,
        HP: 90,
        AT: 11,
        DF: 5,
        killExp: 0,
        killGold: 0,
        spareGold: 0,
        spareTalks: 5,
        soulType: "blue",
        pattern: "usSansMixedBones",
        patterns: ["usSansMixedBones", "boneRain", "sansSideSpam"],
        introText: "* Swap Sans is ready!",
        checkText: "* SANS? - ATK ?? DEF ??\n* He looks different...",
        dialogueLines: [
            "* ...",
            "* He hums a tune.",
            "* He seems excited."
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
                        // convert legacy string items to objects
                        const heal = shopData.heal.find(h => h.name === it);
                        if (heal) return { name: it, type: "heal", heal: heal.heal, info: heal.info };
                        const w = shopData.weapon.find(w => w.name === it);
                        if (w) return { name: it, type: "weapon", at: w.at, info: w.info };
                        const a = shopData.armor.find(a => a.name === it);
                        if (a) return { name: it, type: "armor", df: a.df, info: a.info };
                        return { name: it, type: "heal", heal: 10, info: "Heals 10 HP." };
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
