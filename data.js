// data.js - Full Progression, Saves, Monsters
const SAVE_SLOTS = 4;

const defaultPlayer = () => ({
    name: "", LV: 1, G: 500, HP: 20, maxHP: 20, baseAT: 5, baseDF: 0,
    weaponBonus: 0, armorBonus: 0, EXP: 0, NEXT: 10,
    weapon: "STICK", armor: "BANDAGE", kills: 0, hardMode: false,
    inventory: []
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
    { id: "toriel",      name: "TORIEL",           reqLV: 1 },
    { id: "papyrus",     name: "PAPYRUS",          reqLV: 3 },
    { id: "p_sans",      name: "SANS (Sleep)",     reqLV: 5 },
    { id: "chara",       name: "CHARA (Endgame)",  reqLV: 19 }
];

const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 0, desc: "Its bark is worse than its bite." },
        { name: "TOY KNIFE", cost: 20, at: 3, desc: "Made of plastic. A rarity nowadays." },
        { name: "TOUGH GLOVE", cost: 50, at: 5, desc: "A worn pink leather glove." },
        { name: "BALLET SHOES", cost: 100, at: 7, desc: "These shoes make you feel dangerous." },
        { name: "BURNT PAN", cost: 200, at: 10, desc: "Damage is rather consistent." },
        { name: "EMPTY GUN", cost: 350, at: 12, desc: "An antique revolver. It has no ammo." },
        { name: "REAL KNIFE", cost: 900, at: 99, desc: "Here we are!" }
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0, desc: "It has already been used multiple times." },
        { name: "FADED RIBBON", cost: 25, df: 3, desc: "If you're cuter, monsters won't hit you as hard." },
        { name: "OLD TUTU", cost: 80, df: 5, desc: "Finally, a protective piece of armor." },
        { name: "CLOUDY GLASSES", cost: 150, df: 6, desc: "Glasses marred with wear." },
        { name: "COWBOY HAT", cost: 350, df: 12, desc: "This battle-worn hat makes you want to grow a beard." },
        { name: "THE LOCKET", cost: 900, df: 99, desc: "You can feel it beating." }
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10, desc: "Has a distinct, non-licorice flavor." },
        { name: "CINNAMON BUN", cost: 25, heal: 22, desc: "Snowdin's specialty." },
        { name: "LEGENDARY HERO", cost: 120, heal: 40, desc: "Sandwich shaped like a sword." }
    ]
};

const enemies = [
    {
        id: "dummy",
        name: "DUMMY",
        maxHP: 30, AT: 1, DF: 1, gold: 3, goldMercy: 5, exp: 2,
        spareTalks: 1, surviveTurns: 99, soulType: "red",
        pattern: "dummyNone", patterns: ["dummyNone"],
        openingText: ["* You encountered the Dummy."],
        checkAT: 0, checkDF: 0, checkDesc: "* A cotton heart and a button eye.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [["* You talk to the DUMMY.", "* It doesn't seem much for conversation.", "* DUMMY is happy with you!"]],
        turnDialogues: [["..."]]
    },
    {
        id: "toriel",
        name: "TORIEL",
        maxHP: 440, AT: 10, DF: 4, gold: 40, goldMercy: 50, exp: 30,
        spareTalks: 99, spareTurnsRequirement: 5, soulType: "red",
        pattern: "torielHandFire", patterns: ["fallingFire", "torielSideFire", "torielWaveFire", "torielHandFire"],
        openingText: ["* Toriel blocks the way!"],
        checkAT: 80, checkDF: 80, checkDesc: "* Knows best for you.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [["* You couldn't think of any conversation topics."]],
        turnDialogues: [["..."], ["What are\nyou doing?"], ["Attack or\nrun away!"], ["Fight me\nor leave!"], ["Stop it."]]
    },
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680, AT: 8, DF: 2, gold: 50, goldMercy: 60, exp: 40,
        spareTalks: 99, surviveTurns: 6, soulType: "blue",
        fontClass: "papyrus-font",
        pattern: "bonesHorizontal", patterns: ["bonesHorizontal", "bonesHorizontalHigh", "papyrusJump"],
        openingText: ["* Papyrus blocks the way!"],
        checkAT: 8, checkDF: 2, checkDesc: "* He likes to say: 'Nyeh heh heh!'",
        actOptions: ["CHECK", "FLIRT", "INSULT"],
        talkTexts: [["* You try to talk... but he is too loud."]],
        turnDialogues: [
            ["YOU'RE BLUE\nNOW!", "THAT'S MY\nATTACK!"], 
            ["NYEH HEH\nHEH!"], 
            ["HMM, YOU ARE\nA TOUGH ONE!"], 
            ["MY <span class='red-text'>SPECIAL\nATTACK</span> IS\nSOON!", "ARE YOU\nREADY?"], 
            ["HERE IT\nCOMES!"], 
            ["WHAT?!", "WHERE IS MY\n<span class='red-text'>SPECIAL\nATTACK</span>?", "THAT DOG\nSTOLE IT!", "WELL, HERE'S\nA <span class='red-text'>NORMAL\nATTACK</span>!"]
        ]
    },
    {
        id: "p_sans",
        name: "SANS",
        maxHP: 1, AT: 1, DF: 1, gold: 0, goldMercy: 0, exp: 0,
        spareTalks: 0, surviveTurns: 99, soulType: "red",
        pattern: "dummyNone", patterns: ["dummyNone"],
        openingText: ["* Sans is asleep."],
        checkAT: 1, checkDF: 1, checkDesc: "* The easiest enemy. Can only deal 1 damage.",
        actOptions: ["CHECK", "TALK"],
        talkTexts: [["* You try to talk.", "* Zzzzz..."]],
        turnDialogues: [["Zzz..."]]
    },
    {
        id: "chara",
        name: "CHARA",
        maxHP: 9999, AT: 99, DF: 99, gold: 0, goldMercy: 0, exp: 0,
        spareTalks: 0, surviveTurns: 99, soulType: "red",
        pattern: "fastBones", patterns: ["fastBones"],
        openingText: ["* Since when were you the one in control?"],
        checkAT: 99, checkDF: 99, checkDesc: "* The First Fallen Human.",
        actOptions: ["CHECK", "HOPE"],
        talkTexts: [["* ..."]],
        turnDialogues: [["=)"]],
        btnFight: "ERASE", btnAct: "SAVE", btnItem: "ITEM", btnMercy: "MERCY"
    }
];

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
function saveSlot(index) { if (!saves[index]) return; localStorage.setItem("fallen_save_" + index, JSON.stringify(saves[index])); }
function createNewSave(index, name, hardModeFlag) { const p = defaultPlayer(); p.name = name; p.hardMode = !!hardModeFlag; saves[index] = p; saveSlot(index); }
function useSave(index) { currentSlot = index; currentPlayer = saves[index]; }
