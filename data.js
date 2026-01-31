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
    inventory: [
        { name: "MONSTER CANDY", type: "heal", heal: 10 }
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
        { name: "STICK", cost: 0, at: 0, info: "Weapon AT 0. A useless stick." },
        { name: "TOY KNIFE", cost: 20, at: 3, info: "Weapon AT 3. Made of plastic." },
        { name: "TOUGH GLOVE", cost: 40, at: 5, info: "Weapon AT 5. For strong punches." }
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0, info: "Armor DF 0. It has already been used several times." },
        { name: "FADED RIBBON", cost: 25, df: 3, info: "Armor DF 3. If you're cuter, monsters won't hit you as hard." },
        { name: "MANLY BANDANNA", cost: 45, df: 5, info: "Armor DF 5. It has seen some wear." }
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10, info: "Heals 10 HP. Has a distinct, non-licorice flavor." },
        { name: "SPIDER DONUT", cost: 15, heal: 12, info: "Heals 12 HP. Made with spiders in spider webs." },
        { name: "BUTTERSCOTCH PIE", cost: 60, heal: 99, info: "Heals all HP. Butterscotch-cinnamon pie, one slice." }
    ]
};

const enemies = [
    {
        id: "dummy",
        name: "DUMMY",
        maxHP: 30,
        AT: 1,
        DF: 1,
        goldKill: 3,
        goldSpare: 5,
        expKill: 1,
        expSpare: 0,
        spareTalks: 2,
        soulType: "red",
        pattern: "dummySimple",
        patterns: ["dummySimple"],
        checkText: "* DUMMY - 1 ATK 1 DEF\n* A cotton heart and a button eye.",
        introText: "* DUMMY blocks the way!"
    },
    {
        id: "mad_dummy",
        name: "MAD DUMMY",
        maxHP: 60,
        AT: 5,
        DF: 2,
        goldKill: 20,
        goldSpare: 25,
        expKill: 10,
        expSpare: 0,
        spareTalks: 3,
        soulType: "red",
        pattern: "madDummyPhase1",
        patterns: ["madDummyPhase1", "madDummyWalls", "madDummyChase"],
        checkText: "* MAD DUMMY - ATK 30 DEF YES\n* The dummy looks mad.",
        introText: "* Mad Dummy blocks the way!"
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440,
        AT: 10,
        DF: 4,
        goldKill: 40,
        goldSpare: 50,
        expKill: 30,
        expSpare: 0,
        spareTalks: 3,
        soulType: "red",
        pattern: "torielFire",
        patterns: ["torielFire", "torielWalls", "torielHand"],
        checkText: "* TORIEL - ATK 80 DEF 80\n* Knows best for you.",
        introText: "* Toriel is acting aloof."
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680,
        AT: 8,
        DF: 2,
        goldKill: 60,
        goldSpare: 70,
        expKill: 40,
        expSpare: 0,
        spareTalks: 4,
        soulType: "blue",
        pattern: "papyrusPhase1",
        patterns: ["papyrusPhase1", "papyrusPhase2", "papyrusBlueAttack", "papyrusSpecial"],
        checkText: "* PAPYRUS - ATK 8 DEF 2\n* He likes to say: 'Nyeh heh heh!'",
        introText: "* Papyrus blocks the way!"
    },
    {
        id: "p_sans",
        name: "PACIFIST SANS",
        maxHP: 80,
        AT: 10,
        DF: 4,
        goldKill: 30,
        goldSpare: 35,
        expKill: 20,
        expSpare: 0,
        spareTalks: 5,
        soulType: "blue",
        pattern: "fastBones",
        patterns: ["fastBones", "sansKarma", "sansSideSpam"],
        checkText: "* PACIFIST SANS - ATK ? DEF ?\n* He seems lazy, but serious.",
        introText: "* Sans stands there, smiling."
    },
    {
        id: "us_sans",
        name: "UNDERSWAP SANS",
        maxHP: 90,
        AT: 11,
        DF: 5,
        goldKill: 35,
        goldSpare: 40,
        expKill: 25,
        expSpare: 0,
        spareTalks: 5,
        soulType: "blue",
        pattern: "mixedBones",
        patterns: ["mixedBones", "boneRain", "sansSideSpam"],
        checkText: "* US!SANS - ATK 11 DEF 5\n* He looks excited to fight.",
        introText: "* Sans bounces in place!"
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
                        // Try to resolve from shop data
                        const heal = shopData.heal.find(h => h.name === it);
                        if (heal) return { name: it, type: "heal", heal: heal.heal, info: heal.info };
                        const w = shopData.weapon.find(w => w.name === it);
                        if (w) return { name: it, type: "weapon", at: w.at, info: w.info };
                        const a = shopData.armor.find(a => a.name === it);
                        if (a) return { name: it, type: "armor", df: a.df, info: a.info };
                        return { name: it, type: "heal", heal: 10 };
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
