const SAVE_SLOTS = 4;

const defaultPlayer = () => ({
    name: "FRISK", LV: 1, G: 0, HP: 20, maxHP: 20, baseAT: 5, baseDF: 0,
    weaponBonus: 0, armorBonus: 0, EXP: 0, NEXT: 10,
    weapon: "STICK", armor: "BANDAGE", kills: 0, hardMode: false,
    hasReset: false, // NEW: Tracks if they unlocked page 2
    inventory: []
});

function totalAT(p) { return (p.baseAT || 0) + (p.weaponBonus || 0); }
function totalDF(p) { return (p.baseDF || 0) + (p.armorBonus || 0); }

let saves = []; let currentSlot = 0; let currentPlayer = null;
let gameState = "title"; let currentMenuIndex = 0;

// PAGE 1: Standard, PAGE 2: Post-Reset AUs
const monsterList = [
    { id: "dummy",       name: "DUMMY",            reqLV: 1, page: 1 },
    { id: "toriel",      name: "TORIEL",           reqLV: 1, page: 1 },
    { id: "papyrus",     name: "PAPYRUS",          reqLV: 3, page: 1 },
    { id: "p_sans",      name: "SANS (Sleep)",     reqLV: 5, page: 1 },
    { id: "g_sans",      name: "SANS (Genocide)",  reqLV: 19, page: 1 },
    
    // PAGE 2 (Requires LV 20 Reset)
    { id: "dust_sans",   name: "DUSTTALE SANS",    reqLV: 1, page: 2 },
    { id: "ink_sans",    name: "INK SANS",         reqLV: 1, page: 2 },
    { id: "error_sans",  name: "ERROR SANS",       reqLV: 1, page: 2 },
    { id: "nmd_chara",   name: "NO MORE DEALS",    reqLV: 20, page: 2 }
];

const shopData = {
    weapon: [
        { name: "STICK", cost: 0, at: 0, desc: "Its bark is worse than its bite." },
        { name: "TOY KNIFE", cost: 20, at: 3, desc: "Made of plastic. A rarity nowadays." },
        { name: "REAL KNIFE", cost: 900, at: 99, desc: "Here we are!" }
    ],
    armor: [
        { name: "BANDAGE", cost: 0, df: 0, desc: "It has already been used multiple times." },
        { name: "FADED RIBBON", cost: 25, df: 3, desc: "If you're cuter, monsters won't hit you as hard." },
        { name: "THE LOCKET", cost: 900, df: 99, desc: "You can feel it beating." }
    ],
    heal: [
        { name: "MONSTER CANDY", cost: 5, heal: 10, desc: "Has a distinct, non-licorice flavor." },
        { name: "LEGENDARY HERO", cost: 120, heal: 40, desc: "Sandwich shaped like a sword." }
    ]
};

const enemies = [
    {
        id: "papyrus",
        name: "PAPYRUS",
        maxHP: 680, AT: 8, DF: 2, gold: 50, goldMercy: 60, exp: 40,
        spareTalks: 99, surviveTurns: 14, soulType: "blue",
        pattern: "bonesHorizontal", patterns: ["bonesHorizontal", "papyrusJump"],
        openingText: ["* Papyrus blocks the way!"],
        checkAT: 8, checkDF: 2, checkDesc: "* He likes to say: 'Nyeh heh heh!'",
        actOptions: ["CHECK", "FLIRT"], talkTexts: [["* You try to talk... but he is too loud."]],
        turnDialogues: [["YOU'RE BLUE\nNOW!"]]
    },
    {
        id: "g_sans",
        name: "SANS",
        maxHP: 1, AT: 1, DF: 1, gold: 0, goldMercy: 0, exp: 0,
        spareTalks: 99, surviveTurns: 24, soulType: "red",
        pattern: "gasterBlaster", patterns: ["gasterBlaster", "fastBones"],
        openingText: ["* You feel like you're going to have a bad time."],
        checkAT: 1, checkDF: 1, checkDesc: "* The easiest enemy. Can only deal 1 damage.",
        actOptions: ["CHECK"], talkTexts: [["* ..."]],
        turnDialogues: [["It's a beautiful\nday outside."]]
    },
    {
        id: "nmd_chara",
        name: "CHARA",
        maxHP: 9999, AT: 99, DF: 99, gold: 0, goldMercy: 0, exp: 0,
        spareTalks: 0, surviveTurns: 99, soulType: "red",
        pattern: "fastBones", patterns: ["fastBones"],
        openingText: ["* Since when were you the one in control?"],
        checkAT: 99, checkDF: 99, checkDesc: "* No More Deals.",
        actOptions: ["CHECK", "HOPE"], talkTexts: [["* ..."]], turnDialogues: [["=)"]],
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
        } else saves.push(null);
    }
}
function saveSlot(index) { if (!saves[index]) return; localStorage.setItem("fallen_save_" + index, JSON.stringify(saves[index])); }
function createNewSave(index, name, hardModeFlag) { const p = defaultPlayer(); p.name = name; p.hardMode = !!hardModeFlag; saves[index] = p; saveSlot(index); }
function useSave(index) { currentSlot = index; currentPlayer = saves[index]; }
