// names.js - secret name logic, messages, behaviors

// behavior: "ok", "lock", "refresh"
// hardMode: true for FRISK

const secretNames = {
    chara: {
        message: "* The true name.",
        behavior: "ok",
        hardMode: false
    },
    mercy: {
        message: "* The true name.",
        behavior: "ok",
        hardMode: false
    },
    frisk: {
        message: "* Warning: This name will make your life hell.\n* Proceed anyway?",
        behavior: "ok",
        hardMode: true
    },
    sans: {
        message: "* nope.",
        behavior: "lock",
        hardMode: false
    },
    papyru: {
        message: "* I, THE GREAT PAPYRUS, APPROVE!",
        behavior: "ok",
        hardMode: false
    },
    papyrus: {
        message: "* I, THE GREAT PAPYRUS, APPROVE!",
        behavior: "ok",
        hardMode: false
    },
    toriel: {
        message: "* I think you should choose your own name, my child.",
        behavior: "lock",
        hardMode: false
    },
    asgore: {
        message: "* You cannot.",
        behavior: "lock",
        hardMode: false
    },
    asriel: {
        message: "* ...",
        behavior: "lock",
        hardMode: false
    },
    alphys: {
        message: "* D-don't do that.",
        behavior: "lock",
        hardMode: false
    },
    undyne: {
        message: "* Get your OWN name!",
        behavior: "lock",
        hardMode: false
    },
    flowey: {
        message: "* I already CHOSE that name.",
        behavior: "lock",
        hardMode: false
    },
    gaster: {
        message: "* ........",
        behavior: "refresh",
        hardMode: false
    },
    bratty: {
        message: "* Like, OK I guess.",
        behavior: "ok",
        hardMode: false
    },
    catty: {
        message: "* Bratty! Bratty! That's MY name!!",
        behavior: "ok",
        hardMode: false
    },
    temmie: {
        message: "* hOI!",
        behavior: "ok",
        hardMode: false
    },
    gerson: {
        message: "* Whaaaat's your name?",
        behavior: "ok",
        hardMode: false
    },
    mettatt: {
        message: "* OOOOOOOOH!!! ARE YOU PROMOTING MY BRAND?",
        behavior: "ok",
        hardMode: false
    },
    mettaton: {
        message: "* OOOOOOOOH!!! ARE YOU PROMOTING MY BRAND?",
        behavior: "ok",
        hardMode: false
    },
    napsta: {
        message: "* ...",
        behavior: "ok",
        hardMode: false
    },
    bpants: {
        message: "* You're gonna have a BAD time.",
        behavior: "ok",
        hardMode: false
    },
    murder: {
        message: "* That's a little on-the-nose, isn't it...?",
        behavior: "ok",
        hardMode: false
    },
    shyren: {
        message: "* ...",
        behavior: "ok",
        hardMode: false
    },
    aaaaaa: {
        message: "* Not very creative...",
        behavior: "ok",
        hardMode: false
    },
    orange: {
        message: "* NOT a true name.",
        behavior: "ok",
        hardMode: false
    }
};

function getNameMeta(name) {
    if (!name) return { message: "", behavior: "ok", hardMode: false };
    const key = name.toLowerCase();
    if (secretNames[key]) return secretNames[key];
    return { message: "", behavior: "ok", hardMode: false };
}
