// ui.js - shared UI helpers, timed text, and dialogue

let textTimer = null;
let textFull = "";
let textShown = "";
let textIndex = 0;
let textDoneCallback = null;

const TEXT_SPEED = 50;   // ms per normal char
const TEXT_PUNCT_SPEED = 200; // ms for .,!? and commas

function isPunctuation(ch) {
    return ch === "." || ch === "," || ch === "!" || ch === "?";
}

function startTimedText(text, onDone) {
    if (textTimer) {
        clearInterval(textTimer);
        textTimer = null;
    }
    textFull = text;
    textShown = "";
    textIndex = 0;
    textDoneCallback = onDone || null;

    textTimer = setInterval(() => {
        if (textIndex >= textFull.length) {
            clearInterval(textTimer);
            textTimer = null;
            if (textDoneCallback) textDoneCallback();
            return;
        }
        const ch = textFull[textIndex];
        textShown += ch;
        textIndex++;

        const delay = isPunctuation(ch) ? TEXT_PUNCT_SPEED : TEXT_SPEED;
        clearInterval(textTimer);
        textTimer = setInterval(arguments.callee, delay);
    }, TEXT_SPEED);
}

function getTimedText() {
    return textShown || "";
}

/* Simple helper to build a wingdings background for file select */

function buildWingdingsLayer(countMultiplier = 1) {
    let wing = `<div class="wingdings-layer">`;
    const chars = ["ᚷ","ᚨ","ᛊ","ᛏ","ᛖ","ᚱ","ᚹ","ᛁ","ᚾ","ᛞ","✶","✸","✹","✺"];
    const total = 80 * countMultiplier;
    for (let i = 0; i < total; i++) {
        const ch = chars[i % chars.length];
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const dur = 3 + Math.random() * 4;
        wing += `<span class="wingding" style="top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">${ch}</span>`;
    }
    wing += `</div>`;
    return wing;
}
