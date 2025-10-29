<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>VS Code-like Web Editor</title>
<style>
  :root {
    --bg: #1e1e1e;
    --panel: #252526;
    --sidebar: #252526;
    --border: #3c3c3c;
    --accent: #0e639c;
    --text: #cccccc;
    --muted: #9aa0a6;
    --hover: #2a2a2a;
    --active: #094771;
    --tab-bg: #2d2d2d;
    --tab-active: #1f1f1f;
    --status: #0b0b0b;
    --badge: #37373d;
    --shadow: rgba(0,0,0,0.6);
    --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    --sans: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--sans); }

  /* Layout */
  .root { display: grid; grid-template-rows: 32px auto 24px; height: 100vh; }
  .main { display: grid; grid-template-columns: 48px 260px auto; height: 100%; }

  /* Title Bar */
  .titlebar {
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(180deg, #2c2c2f, var(--panel));
    border-bottom: 1px solid var(--border);
    padding: 0 10px; font-size: 12px;
  }
  .titlebar .menu { display: flex; gap: 4px; }
  .titlebar .menu button {
    background: transparent; border: none; color: var(--text);
    padding: 6px 8px; cursor: pointer; border-radius: 6px;
  }
  .titlebar .menu button:hover { background: var(--hover); }
  .spacer { flex: 1; }
  .kbd { font-family: var(--mono); background: var(--badge); padding: 2px 6px; border-radius: 4px; }

  /* Activity Bar */
  .activitybar {
    width: 48px; background: #202020; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; align-items: center;
    padding: 8px 0; gap: 6px;
  }
  .activitybar .icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: grid; place-items: center; color: var(--muted); cursor: pointer;
    transition: transform 90ms ease, background 120ms ease, color 120ms ease;
  }
  .activitybar .icon:hover { background: var(--hover); color: var(--text); transform: translateY(-1px); }
  .activitybar .icon.active { background: var(--active); color: #fff; box-shadow: inset 0 0 0 1px #0e639c66; }

  /* Sidebar */
  .sidebar {
    background: var(--sidebar); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; min-width: 160px;
  }
  .section-header {
    font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--muted); padding: 10px 12px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .section-header .badge { background: var(--badge); color: var(--text); font-size: 10px; padding: 2px 6px; border-radius: 10px; }
  .search {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 8px; border-bottom: 1px solid var(--border);
    background: var(--panel);
  }
  .search input {
    flex: 1; background: #1f1f1f; border: 1px solid var(--border);
    color: var(--text); border-radius: 8px; padding: 8px 10px; font-size: 12px;
  }
  .tree { overflow: auto; padding: 6px; }
  .node {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 8px; border-radius: 6px; cursor: pointer; white-space: nowrap;
    transition: background 100ms ease, color 100ms ease;
  }
  .node:hover { background: var(--hover); }
  .node.active { background: #093a61; box-shadow: inset 0 0 0 1px #0e639c55; }
  .twisty { width: 12px; text-align: center; color: var(--muted); }
  .file { color: var(--text); }
  .dir { color: var(--muted); }

  /* Editor */
  .editor { display: grid; grid-template-rows: 32px auto; background: #151515; }
  .tabs {
    display: flex; align-items: center; overflow: auto;
    background: var(--tab-bg); border-bottom: 1px solid var(--border);
  }
  .tab {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px; cursor: pointer; color: var(--muted);
    border-right: 1px solid var(--border); user-select: none;
    transition: background 100ms ease, color 100ms ease;
  }
  .tab:hover { background: var(--hover); color: var(--text); }
  .tab.active { background: var(--tab-active); color: var(--text); border-bottom: 2px solid var(--accent); }
  .tab .close { color: var(--muted); }
  .tab .close:hover { color: var(--text); }

  .surface { position: relative; height: 100%; overflow: hidden; }
  .editor-pane {
    position: absolute; inset: 0; overflow: auto;
    padding: 12px 16px 48px 16px; font-family: var(--mono);
    font-size: 13px; line-height: 1.6; color: #d4d4d4;
    counter-reset: line; white-space: pre; outline: none;
  }
  .line { display: block; position: relative; padding-left: 52px; }
  .line::before {
    counter-increment: line; content: counter(line);
    position: absolute; left: 0; width: 40px; text-align: right; color: var(--muted);
  }

  /* Syntax colors */
  .tok-key { color: #569cd6; }
  .tok-fn  { color: #dcdcaa; }
  .tok-str { color: #ce9178; }
  .tok-num { color: #c586c0; }
  .tok-type{ color: #6a9955; }
  .tok-com { color: #6b6b6b; font-style: italic; }

  /* Status Bar */
  .statusbar {
    display: flex; align-items: center; gap: 12px;
    background: var(--status); border-top: 1px solid var(--border);
    padding: 0 12px; font-size: 12px; color: var(--muted);
  }
  .item { padding: 0 6px; border-radius: 4px; }
  .item.active { background: var(--badge); color: var(--text); }

  /* Command Palette */
  .palette {
    position: absolute; inset: 0; display: none; place-items: start center;
    background: rgba(0,0,0,0.35);
  }
  .palette.open { display: grid; }
  .box {
    margin-top: 12vh; width: min(780px, 92vw); background: var(--panel);
    border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
    box-shadow: 0 16px 50px var(--shadow);
  }
  .input {
    width: 100%; padding: 12px 14px; background: #1f1f1f; border: none; outline: none;
    color: var(--text); font-family: var(--sans); font-size: 14px; border-bottom: 1px solid var(--border);
  }
  .list { max-height: 42vh; overflow: auto; }
  .cmd {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; cursor: pointer; font-size: 13px;
  }
  .cmd:hover, .cmd.active { background: var(--hover); }
  .hint { color: var(--muted); font-family: var(--mono); }

  /* Responsive collapse */
  @media (max-width: 900px) {
    .main { grid-template-columns: 48px 0 1fr; }
    .sidebar { display: none; }
  }
</style>
</head>
<body>
<div class="root">

  <!-- Title Bar -->
  <div class="titlebar">
    <div class="menu">
      <button id="btnFile">File</button>
      <button id="btnEdit">Edit</button>
      <button id="btnView">View</button>
      <button id="btnGo">Go</button>
      <button id="btnRun">Run</button>
    </div>
    <div class="spacer"></div>
    <div style="font-size:12px; color: var(--muted);">
      VS Code‑like Web • Press <span class="kbd">Ctrl+P</span> for Command Palette
    </div>
  </div>

  <!-- Main -->
  <div class="main">
    <!-- Activity Bar -->
    <aside class="activitybar">
      <div class="icon active" title="Explorer" id="iconExplorer">🗂️</div>
      <div class="icon" title="Search" id="iconSearch">🔎</div>
      <div class="icon" title="Source Control">🔧</div>
      <div class="icon" title="Run">▶️</div>
      <div class="icon" title="Extensions">🧩</div>
    </aside>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="section-header">Explorer <span class="badge" id="fileCount">0</span></div>
      <div class="search">
        <input id="fileFilter" placeholder="Filter files..." />
        <span class="kbd">Ctrl+P</span>
      </div>
      <div id="tree" class="tree"></div>
    </aside>

    <!-- Editor -->
    <section class="editor">
      <div id="tabs" class="tabs"></div>
      <div class="surface">
        <div id="pane" class="editor-pane" tabindex="0" aria-label="Editor" role="textbox"></div>

        <!-- Command Palette -->
        <div id="palette" class="palette" aria-modal="true">
          <div class="box" role="dialog" aria-label="Command palette">
            <input id="paletteInput" class="input" placeholder="Type a command or file name" />
            <div id="paletteList" class="list"></div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Status Bar -->
  <footer class="statusbar">
    <div class="item active">UTF-8</div>
    <div class="item">LF</div>
    <div id="lang" class="item">Plain Text</div>
    <div class="item">Spaces: 2</div>
    <div class="spacer"></div>
    <div class="item">Go Live</div>
    <div id="cursor" class="item">Ln 1, Col 1</div>
  </footer>
</div>

<script>
/* ---------- File model ---------- */
const files = [
  { path: "README.md", type: "text/markdown", content: md(`
# VS Code-like Web Editor

- Explorer with file tree
- Tabs, faux line numbers
- Command Palette: Ctrl+P
- Minimal syntax coloring

Try opening src/app.ts or index.html from the Explorer or the Palette.
`) },
  { path: "index.html", type: "text/html", content: code(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello, VS Code-like world!</h1>
    <script>console.log('ready');</script>
  </body>
</html>
`) },
  { path: "src/app.ts", type: "text/typescript", content: code(`
// App entry
type User = {
  id: number
  name: string
}

function greet(u: User): string {
  return \`Hello, \${u.name}!\`
}

console.log(greet({ id: 1, name: "Roksana" }))
`) },
  { path: "src/math/util.ts", type: "text/typescript", content: code(`
// Utilities
export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max)

export function sum(nums: number[]): number {
  let s = 0
  for (const n of nums) s += n
  return s
}
`) },
  { path: "styles/main.css", type: "text/css", content: code(`
:root { --primary: #0e639c; }
body { font-family: system-ui; color: #ddd; }
h1 { color: var(--primary); }
`) },
];

/* ---------- DOM refs ---------- */
const treeEl = document.getElementById("tree");
const tabsEl = document.getElementById("tabs");
const paneEl = document.getElementById("pane");
const paletteEl = document.getElementById("palette");
const paletteInputEl = document.getElementById("paletteInput");
const paletteListEl = document.getElementById("paletteList");
const fileFilterEl = document.getElementById("fileFilter");
const sidebarEl = document.getElementById("sidebar");
const activityEl = document.querySelector(".activitybar");
const mainEl = document.querySelector(".main");
const langEl = document.getElementById("lang");
const cursorEl = document.getElementById("cursor");
const fileCountEl = document.getElementById("fileCount");

/* ---------- State ---------- */
const state = {
  openTabs: [],
  activePath: null,
  expandedDirs: new Set(["", "src", "src/math"]),
  paletteIndex: 0,
};

/* ---------- Build file tree ---------- */
function buildTree() {
  const model = nest(files.map(f => f.path));
  treeEl.innerHTML = "";
  renderDir(model, "");
  highlightActiveInTree();
  fileCountEl.textContent = String(files.length);
}
function nest(paths) {
  const root = {};
  for (const p of paths) {
    const parts = p.split("/");
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLeaf = i === parts.length - 1;
      if (!cur[part]) cur[part] = isLeaf ? null : {};
      if (!isLeaf) cur = cur[part];
    }
  }
  return root;
}
function renderDir(dir, base, pad = 0) {
  Object.entries(dir).forEach(([name, child]) => {
    const full = base ? base + "/" + name : name;
    const node = document.createElement("div");
    node.className = "node";
    node.dataset.path = full;
    node.style.paddingLeft = pad + "px";

    if (child === null) {
      node.innerHTML = `<span class="twisty"> </span><span class="file">📄 ${name}</span>`;
      node.onclick = () => openFile(full);
      treeEl.appendChild(node);
    } else {
      const expanded = state.expandedDirs.has(full);
      node.innerHTML = `<span class="twisty">${expanded ? "▾" : "▸"}</span><span class="dir">📁 ${name}</span>`;
      node.onclick = () => {
        expanded ? state.expandedDirs.delete(full) : state.expandedDirs.add(full);
        buildTree();
        applyFilter(fileFilterEl.value);
      };
      treeEl.appendChild(node);
      if (expanded) renderDir(child, full, pad + 18);
    }
  });
}

/* ---------- Tabs ---------- */
function renderTabs() {
  tabsEl.innerHTML = "";
  state.openTabs.forEach(path => {
    const el = document.createElement("div");
    el.className = "tab" + (state.activePath === path ? " active" : "");
    el.innerHTML = `<span>${basename(path)}</span><span class="spacer"></span><span class="close" title="Close">✕</span>`;
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("close")) closeTab(path);
      else activate(path);
    });
    tabsEl.appendChild(el);
  });
}

/* ---------- Open/activate/close ---------- */
function openFile(path) {
  if (!state.openTabs.includes(path)) state.openTabs.push(path);
  activate(path);
  renderTabs();
}
function activate(path) {
  state.activePath = path;
  renderTabs();
  renderEditor();
  highlightActiveInTree();
  const f = files.find(x => x.path === path);
  langEl.textContent = languageLabel(f?.type || "text/plain");
}
function closeTab(path) {
  const i = state.openTabs.indexOf(path);
  if (i >= 0) state.openTabs.splice(i, 1);
  if (state.activePath === path) {
    state.activePath = state.openTabs[state.openTabs.length - 1] ?? null;
  }
  renderTabs();
  renderEditor();
}

/* ---------- Editor render ---------- */
function renderEditor() {
  const file = files.find(f => f.path === state.activePath);
  if (!file) { paneEl.innerHTML = ""; cursorEl.textContent = "Ln 1, Col 1"; return; }
  const html = tokenize(file.content, file.type)
    .split("\n")
    .map(line => `<span class="line">${line || " "}</span>`)
    .join("\n");
  paneEl.innerHTML = html;
  paneEl.scrollTop = 0;
  updateCursor(1,1);
}

/* ---------- Command Palette ---------- */
function togglePalette(open) {
  paletteEl.classList.toggle("open", open);
  if (open) {
    paletteInputEl.value = "";
    renderPaletteList("");
    state.paletteIndex = 0;
    focusPaletteItem(0);
    paletteInputEl.focus();
  }
}
function paletteItems(query = "") {
  const q = query.toLowerCase().trim();
  const base = [
    ...files.map(f => ({ kind: "file", label: f.path, hint: "Open file" })),
    { kind: "cmd", label: "View: Toggle Sidebar", action: toggleSidebar, hint: "View" },
    { kind: "cmd", label: "File: New Untitled", action: newUntitled, hint: "File" },
    { kind: "cmd", label: "File: Close Active", action: () => closeTab(state.activePath), hint: "File" },
  ];
  return base.filter(it => it.label.toLowerCase().includes(q));
}
function renderPaletteList(q) {
  const items = paletteItems(q);
  paletteListEl.innerHTML = "";
  items.forEach((it, idx) => {
    const el = document.createElement("div");
    el.className = "cmd" + (idx === state.paletteIndex ? " active" : "");
    el.innerHTML = `<span>${it.label}</span><span class="hint">${it.hint}</span>`;
    el.addEventListener("click", () => {
      if (it.kind === "file") openFile(it.label);
      else it.action?.();
      togglePalette(false);
    });
    paletteListEl.appendChild(el);
  });
}
function focusPaletteItem(i) {
  state.paletteIndex = Math.max(0, Math.min(i, paletteListEl.children.length - 1));
  [...paletteListEl.children].forEach((el, idx) => {
    el.classList.toggle("active", idx === state.paletteIndex);
    if (idx === state.paletteIndex) el.scrollIntoView({ block: "nearest" });
  });
}

/* ---------- Sidebar toggle ---------- */
function toggleSidebar() {
  const hidden = sidebarEl.dataset.hidden === "true";
  if (hidden) {
    sidebarEl.dataset.hidden = "false";
    sidebarEl.style.display = "flex";
    activityEl.style.display = "flex";
    mainEl.style.gridTemplateColumns = "48px 260px auto";
  } else {
    sidebarEl.dataset.hidden = "true";
    sidebarEl.style.display = "none";
    activityEl.style.display = "none";
    mainEl.style.gridTemplateColumns = "0 0 1fr";
  }
}

/* ---------- New File ---------- */
function newUntitled() {
  let n = 1;
  while (files.some(f => f.path === `Untitled-${n}.txt`)) n++;
  const path = `Untitled-${n}.txt`;
  files.push({ path, type: "text/plain", content: "" });
  buildTree();
  openFile(path);
}

/* ---------- Filtering ---------- */
function applyFilter(q) {
  const query = (q || "").toLowerCase();
  const nodes = [...treeEl.querySelectorAll(".node")];
  if (!query) { nodes.forEach(n => n.style.display = ""); return; }

  const paths = nodes.map(n => n.dataset.path);
  const matchSet = new Set(paths.filter(p => p.toLowerCase().includes(query)));
  // include ancestors
  for (const p of [...matchSet]) {
    const parts = p.split("/");
    for (let i = 1; i < parts.length; i++) {
      matchSet.add(parts.slice(0, i).join("/"));
    }
  }
  nodes.forEach(n => {
    n.style.display = matchSet.has(n.dataset.path) ? "" : "none";
  });
}

/* ---------- Tokenizer ---------- */
function tokenize(text, type) {
  const esc = (s) => s.replace(/[&<>]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]));
  let out = esc(text);

  const tsLike = /typescript|javascript/.test(type);
  const cssLike = /css/.test(type);
  const htmlLike = /html/.test(type);
  const mdLike = /markdown/.test(type);

  if (tsLike) {
    out = out
      .replace(/\/\/.*$/gm, m => `<span class="tok-com">${m}</span>`)
      .replace(/("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)/g, m => `<span class="tok-str">${m}</span>`)
      .replace(/\b\d+(?:\.\d+)?\b/g, m => `<span class="tok-num">${m}</span>`)
      .replace(/\b(type|function|const|let|var|export|return|if|else|for|while|class|new|extends|import|from|as)\b/g, m => `<span class="tok-key">${m}</span>`)
      .replace(/\b(string|number|boolean|any|void|never|Array|Promise|Map|Set)\b/g, m => `<span class="tok-type">${m}</span>`)
      .replace(/\b(console|Math|JSON|document|window)\b/g, m => `<span class="tok-fn">${m}</span>`);
  } else if (cssLike) {
    out = out
      .replace(/\/\*[\s\S]*?\*\//g, m => `<span class="tok-com">${m}</span>`)
      .replace(/:[\s]*([^;}{]+)/g, (m) => m.replace(/("[^"]*"|'[^']*')/g, s => `<span class="tok-str">${s}</span>`));
  } else if (htmlLike) {
    out = out.replace(/(&lt;\/?[a-zA-Z0-9\-]+(?:\s[^&]+)?&gt;)/g, m => `<span class="tok-key">${m}</span>`);
  } else if (mdLike) {
    out = out.replace(/^#{1,6}\s.*$/gm, m => `<span class="tok-key">${m}</span>`);
  }
  return out;
}

/* ---------- Helpers ---------- */
function basename(p) { return p.split("/").pop(); }
function md(s) { return s.trim(); }
function code(s) { return s.replace(/^\n|\n$/g, ""); }
function languageLabel(type) {
  if (/typescript/.test(type)) return "TypeScript";
  if (/javascript/.test(type)) return "JavaScript";
  if (/html/.test(type)) return "HTML";
  if (/css/.test(type)) return "CSS";
  if (/markdown/.test(type)) return "Markdown";
  return "Plain Text";
}

/* ---------- Active highlight ---------- */
function highlightActiveInTree() {
  treeEl.querySelectorAll(".node").forEach(n => n.classList.toggle("active", n.dataset.path === state.activePath));
}

/* ---------- Cursor indicator ---------- */
function updateCursor(ln, col) {
  cursorEl.textContent = `Ln ${ln}, Col ${col}`;
}
paneEl.addEventListener("click", (e) => {
  const lines = [...paneEl.querySelectorAll(".line")];
  const y = e.clientY - paneEl.getBoundingClientRect().top + paneEl.scrollTop;
  const lh = parseFloat(getComputedStyle(paneEl).lineHeight) || 19.5;
  const ln = Math.max(1, Math.min(lines.length, Math.floor(y / lh)));
  updateCursor(ln, 1);
});

/* ---------- Events ---------- */
document.addEventListener("keydown", (e) => {
  const isCtrlP = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p";
  const isEnter = e.key === "Enter";
  const isEscape = e.key === "Escape";
  const isUp = e.key === "ArrowUp";
  const isDown = e.key === "ArrowDown";

  if (isCtrlP) {
    e.preventDefault();
    togglePalette(true);
    return;
  }
  if (paletteEl.classList.contains("open")) {
    if (isEscape) { togglePalette(false); return; }
    if (isDown) { e.preventDefault(); focusPaletteItem(state.paletteIndex + 1); return; }
    if (isUp) { e.preventDefault(); focusPaletteItem(state.paletteIndex - 1); return; }
    if (isEnter) {
      const activeItem = paletteListEl.children[state.paletteIndex];
      activeItem?.click();
    }
  }
});

paletteInputEl.addEventListener("input", (e) => renderPaletteList(e.target.value));
paletteEl.addEventListener("click", (e) => {
  if (e.target === paletteEl) togglePalette(false);
});
fileFilterEl.addEventListener("input", (e) => applyFilter(e.target.value));
document.getElementById("iconExplorer").addEventListener("click", () => {
  if (sidebarEl.dataset.hidden === "true") toggleSidebar();
  fileFilterEl.focus();
});
document.getElementById("iconSearch").addEventListener("click", () => {
  if (sidebarEl.dataset.hidden === "true") toggleSidebar();
  fileFilterEl.focus();
});

/* ---------- Init ---------- */
sidebarEl.dataset.hidden = "false";
buildTree();
openFile("README.md");
applyFilter("");

</script>
</body>
</html>
