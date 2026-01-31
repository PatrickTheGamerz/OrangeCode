// ui.js - typewriter text + helpers

let typeTextTimer = null;
let typeTextFull = "";
let typeTextShown = "";
let typeTextIndex = 0;
let typeTextDone = true;
let typeTextOnDone = null;

function startTypeText(text, onDone) {
    if (typeTextTimer) clearInterval(typeTextTimer);
    typeTextFull = text;
    typeTextShown = "";
    typeTextIndex = 0;
    typeTextDone = false;
    typeTextOnDone = onDone || null;

    const speedBase = 50; // 0.05s per char

    typeTextTimer = setInterval(() => {
        if (typeTextIndex >= typeTextFull.length) {
            clearInterval(typeTextTimer);
            typeTextTimer = null;
            typeTextDone = true;
            if (typeof typeTextOnDone === "function") {
                typeTextOnDone();
            }
            return;
        }
        const ch = typeTextFull[typeTextIndex];
        typeTextShown += ch;
        typeTextIndex++;

        // small pause on punctuation
        if (ch === "." || ch === "," || ch === "!" || ch === "?") {
            // just skip one tick by not adding extra chars this frame
        }

        if (typeof onBattleTextUpdate === "function") {
            onBattleTextUpdate(typeTextShown);
        }
    }, speedBase);
}

function skipTypeText() {
    if (!typeTextDone) {
        if (typeTextTimer) clearInterval(typeTextTimer);
        typeTextTimer = null;
        typeTextShown = typeTextFull;
        typeTextDone = true;
        if (typeof onBattleTextUpdate === "function") {
            onBattleTextUpdate(typeTextShown);
        }
    }
}

function isTypeTextDone() {
    return typeTextDone;
}
