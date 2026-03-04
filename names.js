// names.js - Secret Name Logic
const secretNames = {
    chara: { message: "* The true name.", behavior: "ok", hardMode: false },
    frisk: { message: "* Warning: This name will make your life hell.\n* Proceed anyway?", behavior: "ok", hardMode: true },
    sans: { message: "* nope.", behavior: "lock", hardMode: false },
    papyru: { message: "* I, THE GREAT PAPYRUS, APPROVE!", behavior: "ok", hardMode: false },
    toriel: { message: "* I think you should choose your own name, my child.", behavior: "lock", hardMode: false },
    asgore: { message: "* You cannot.", behavior: "lock", hardMode: false },
    flowey: { message: "* I already CHOSE that name.", behavior: "lock", hardMode: false },
    gaster: { message: "* ........", behavior: "refresh", hardMode: false }
};

function getNameMeta(name) {
    if (!name) return { message: "", behavior: "ok", hardMode: false };
    const key = name.toLowerCase();
    if (secretNames[key]) return secretNames[key];
    return { message: "", behavior: "ok", hardMode: false };
}
