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
    { id: "dummy",       name: "DUMMY",            reqLV: 1 },
    { id: "mad_dummy",   name: "MAD DUMMY",        reqLV: 2 },
    { id: "toriel",      name: "TORIEL",           reqLV: 3 },
    { id: "papyrus",     name: "PAPYRUS",          reqLV: 5 },
    { id: "p_sans",      name: "PACIFIST SANS",    reqLV: 8 },
    { id: "us_sans",     name: "UNDERSWAP SANS",   reqLV: 9 }
];

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
        maxHP: 30, AT: 1, DF: 1, gold: 3, goldMercy: 5, exp: 2,
        spareTalks: 1, 
        soulType: "red",
        pattern: "dummyNone",
        patterns: ["dummyNone"],
        openingText: "* You encountered the Dummy.",
        checkAT: 0, checkDF: 0,
        checkDesc: "* A cotton heart and a button eye.\n* You are the apple of my eye.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: ["* You talk to the DUMMY.\n* ...\n* It doesn't seem much for\n  conversation.\n* DUMMY is happy with you!"],
        turnDialogues: ["..."]
    },
    {
        id: "mad_dummy",
        name: "MAD DUMMY",
        maxHP: 300, AT: 5, DF: 100, // High DEF so you outlast him
        gold: 15, goldMercy: 20, exp: 10,
        spareTalks: 99, 
        surviveTurns: 6, // Gives up after 6 turns
        soulType: "red",
        pattern: "dummyAim",
        patterns: ["dummyAim", "dummyAimBurst", "dummyAimFast"],
        openingText: "* Mad Dummy blocks the way!",
        checkAT: 7, checkDF: "YES",
        checkDesc: "* Because they're a ghost, physical\n  attacks will fail.",
        actOptions: ["CHECK", "TALK", "STARE"],
        talkTexts: ["* You talk to the MAD DUMMY.\n* It pretends not to hear you."],
        turnDialogues: [
            "FOOLS!\nDUMMIES!\nDUMMIES!\nDUMMIES!",
            "I'LL DEFEAT\nYOU AND\nTAKE YOUR\nSOUL!",
            "WHY DO\nPEOPLE\nLIKE YOU\nEXIST?!",
            "ARGH!!\nJUST DIE\nALREADY!",
            "ENOUGH!\nMAGIC\nMISSILES!",
            "N-NO!\nOUT OF\nAMMO?!"
        ]
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440, AT: 10, DF: 4, gold: 40, goldMercy: 50, exp: 30,
        spareTalks: 99, 
        spareTurnsRequirement: 12, // Needs 12 SPARE actions
        soulType: "red",
        pattern: "torielHandFire",
        patterns: ["fallingFire", "torielSideFire", "torielWaveFire", "torielHandFire"],
        openingText: "* Toriel blocks the way!",
        checkAT: 80, checkDF: 80,
        checkDesc: "* Knows best for you.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: ["* You couldn't think of any\n  conversation topics."],
        turnDialogues: [
            "...", "...", "...", 
            "What are\nyou doing?", 
            "Attack or\nrun away!", 
            "What are\nyou proving\nthis way?", 
            "Fight me\nor leave!", 
            "Stop it.", 
            "Stop\nlooking at\nme that\nway.", 
            "Go away!", 
            "...", "..."
        ],
        betrayalText: "* You... at my most vulnerable\n  moment...\n* To think I was worried you\n  wouldn't fit in out there...\n* Ha... ha..."
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680, AT: 8, DF: 2, gold: 50, goldMercy: 60, exp: 40,
        spareTalks: 99,
        surviveTurns: 14, // Spares you after 14 turns
        soulType: "blue",
        pattern: "bonesHorizontal",
        patterns: ["bonesHorizontal", "boneRain", "sideBones", "blueAttackPhase"],
        openingText: "* Papyrus blocks the way!",
        checkAT: 8, checkDF: 2,
        checkDesc: "* He likes to say: 'Nyeh heh heh!'",
        actOptions: ["CHECK", "FLIRT", "INSULT"],
        talkTexts: [],
        turnDialogues: [
            "YOU'RE BLUE\nNOW!", 
            "NYEH HEH\nHEH!", 
            "HMM, YOU ARE\nA TOUGH ONE!", 
            "BUT I AM\nTOUGHER!", 
            "BEHOLD MY\nMAGNIFICENT\nBONES!", 
            "WOW, YOU'RE\nSTILL HERE?", 
            "HAVE YOU\nCONSIDERED\nSPAGHETTI?",
            "NO? MORE\nBONES THEN!",
            "MY SPECIAL\nATTACK IS\nSOON!", 
            "ARE YOU\nREADY?", 
            "HERE IT\nCOMES!", 
            "WHAT?!\nWHERE IS MY\nSPECIAL\nATTACK?", 
            "THAT DOG\nSTOLE IT!", 
            "WELL, HERE'S\nA NORMAL\nATTACK!"
        ]
    },
    {
        id: "p_sans",
        name: "SANS",
        maxHP: 1, AT: 1, DF: 1, gold: 0, goldMercy: 0, exp: 0,
        spareTalks: 0,
        surviveTurns: 99,
        soulType: "red",
        pattern: "dummyNone",
        patterns: ["dummyNone"],
        openingText: "* Sans is asleep.",
        checkAT: 1, checkDF: 1,
        checkDesc: "* The easiest enemy.\n* Can only deal 1 damage.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: ["* You try to talk.\n* Zzzzz..."],
        turnDialogues: ["Zzz..."]
    },
    {
        id: "us_sans",
        name: "US SANS",
        maxHP: 680, AT: 12, DF: 5, gold: 50, goldMercy: 60, exp: 40,
        spareTalks: 99,
        surviveTurns: 8,
        soulType: "blue",
        pattern: "fastBones",
        patterns: ["fastBones", "mixedBones", "boneRain", "sansSideSpam"],
        openingText: "* MWEH HEH HEH!\n* I, THE MAGNIFICENT SANS,\n  WILL CAPTURE YOU!",
        checkAT: 12, checkDF: 5,
        checkDesc: "* Extremely energetic.\n* Loves tacos.",
        actOptions: ["CHECK", "FLIRT", "CHALLENGE"],
        talkTexts: [""],
        turnDialogues: [
            "MWEH HEH\nHEH!",
            "BEHOLD MY\nBLUE\nATTACK!",
            "YOU'RE VERY\nGOOD AT\nJUMPING!",
            "BUT CAN\nYOU DODGE\nTHIS?!",
            "TACOS ARE\nTHE BEST\nFOOD!",
            "I ALMOST\nFEEL BAD\nFOR YOU!",
            "ALPHY WILL\nBE SO\nPROUD!",
            "READY FOR\nMY ULTIMATE\nATTACK?!"
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
