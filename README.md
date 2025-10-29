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
    --muted: #8a8a8a;
    --hover: #2a2a2a;
    --active: #094771;
    --tab-bg: #2d2d2d;
    --tab-active: #1f1f1f;
    --status: #0b0b0b;
    --badge: #37373d;
    --danger: #d16969;
    --success: #4fc1ff;
    --warning: #d7ba7d;
    --green: #6a9955;
    --blue: #569cd6;
    --purple: #c586c0;
    --yellow: #dcdcaa;
    --orange: #ce9178;
    --red: #f44747;
    --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    --sans: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
  }

  /* Activity Bar */
  .activitybar {
    width: 48px;
    background: #202020;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 8px;
  }
  .activitybar .icon {
    width: 32px; height: 32px;
    border-radius: 6px;
    display: grid; place-items: center;
    color: var(--muted);
    cursor: pointer;
  }
  .activitybar .icon:hover { background: var(--hover); color: var(--text); }
  .activitybar .icon.active { background: var(--active); color: #fff; }

  /* Layout */
  .root { display: grid; grid-template-rows: 32px auto 24px; height: 100vh; }
  .main { display: grid; grid-template-columns: 48px 260px auto; height: 100%; }

  /* Title Bar */
  .titlebar {
    display: flex; align-items: center; gap: 12px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    padding: 0 8px;
    font-size: 12px;
  }
  .titlebar .menu button {
    background: transparent; border: none; color: var(--text);
    padding: 6px 8px; cursor: pointer; border-radius: 4px;
  }
  .titlebar .menu button:hover { background: var(--hover); }

  /* Side Bar (Explorer) */
  .sidebar {
    background: var(--sidebar);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .sidebar .section-header {
    font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--muted);
    padding: 10px 12px; border-bottom: 1px solid var(--border);
  }
  .tree { overflow: auto; padding: 6px; }
  .tree .node {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 6px; border-radius: 4px; cursor: pointer; white-space: nowrap;
  }
  .tree .node:hover { background: var(--hover); }
  .tree .node.active { background: var(--active); }
  .tree .twisty { width: 12px; text-align: center; color: var(--muted); }
  .tree .file { color: var(--text); }
  .tree .dir { color: var(--muted); }

  /* Editor Group */
  .editor {
    display: grid; grid-template-rows: 32px auto;
    background: #1a1a1a;
  }

  /* Tabs */
  .tabs {
    display: flex; align-items: center; overflow: auto;
    background: var(--tab-bg); border-bottom: 1px solid var(--border);
  }
  .tab {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px; cursor: pointer; color: var(--muted);
    border-right: 1px solid var(--border);
    user-select: none;
  }
  .tab:hover { background: var(--hover); color: var(--text); }
  .tab.active {
    background: var(--tab-active);
    color: var(--text); border-bottom: 2px solid var(--accent);
  }
  .tab .close { color: var(--muted); }
  .tab .close:hover { color: var(--text); }

  /* Editor Surface */
  .surface {
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .editor-pane {
    position: absolute; inset: 0;
    overflow: auto;
    padding: 12px 16px 48px 16px;
    font-family: var(--mono);
    font-size: 13px; line-height: 1.5;
    color: #d4d4d4;
    counter-reset: line;
    white-space: pre;
  }
  .editor-pane code {
    display: block; white-space: pre;
  }
  /* Faux line numbers */
  .editor-pane .line {
    display: block; position: relative; padding-left: 48px;
  }
  .editor-pane .line::before {
    counter-increment: line; content: counter(line);
    position: absolute; left: 0; width: 36px; text-align: right;
    color: var(--muted);
  }
  /* Simple syntax colors */
  .tok-key { color: var(--blue); }
  .tok-fn { color: var(--yellow); }
  .tok-str { color: var(--orange); }
  .tok-num { color: var(--purple); }
  .tok-kw { color: var(--red); }
  .tok-type { color: var(--green); }
  .tok-com { color: #6b6b6b; font-style: italic; }

  /* Status Bar */
  .statusbar {
    display: flex; align-items: center; gap: 12px;
    background: var(--status); border-top: 1px solid var(--border);
    padding: 0 12px; font-size: 12px; color: var(--muted);
  }
  .statusbar .item { padding: 0 6px; border-radius: 4px; }
  .statusbar .item.active { background: var(--badge); color: var(--text); }

  /* Command Palette */
  .palette {
    position: absolute; inset: 0;
    display: none; place-items: start center;
    background: rgba(0,0,0,0.35);
  }
  .palette.open { display: grid; }
  .palette .box {
    margin-top: 12vh;
    width: min(720px, 92vw);
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  }
  .palette .input {
    width: 100%; padding: 12px 14px;
    background: #1f1f1f; border: none; outline: none;
    color: var(--text); font-family: var(--sans); font-size: 14px;
    border-bottom: 1px solid var(--border);
  }
  .palette .list { max-height: 40vh; overflow: auto; }
  .palette .cmd {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; cursor: pointer; font-size: 13px;
  }
  .palette .cmd:hover { background: var(--hover); }
  .cmd .hint { color: var(--muted); font-family: var(--mono); }

  /* Search bar (mock) */
  .search {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 8px; border-bottom: 1px solid var(--border);
    background: var(--panel);
  }
  .search input {
    flex: 1; background: #1f1f1f; border: 1px solid var(--border);
    color: var(--text); border-radius: 6px; padding: 6px 8px;
  }

  /* Utility */
  .spacer { flex: 1; }
  .kbd { font-family: var(--mono); background: var(--badge); padding: 2px 6px; border-radius: 4px; }
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
    <div style="font-size:12px; color: var(--muted);">VS Code‑like Web • Press <span class="kbd">Ctrl+P</span> to open Command Palette</div>
  </div>

  <!-- Main -->
  <div class="main">
    <!-- Activity Bar -->
    <aside class="activitybar">
      <div class="icon active" title="Explorer">🗂️</div>
      <div class="icon" title="Search">🔎</div>
      <div class="icon" title="Source Control">🔧</div>
      <div class="icon" title="Run">▶️</div>
      <div class="icon" title="Extensions">🧩</div>
    </aside>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="section-header">Explorer</div>
      <div class="search">
        <input id="fileFilter" placeholder="Filter files..." />
        <span class="kbd">Ctrl+P</span>
      </div>
      <div id="tree" class="tree">
        <!-- Tree populated by JS -->
      </div>
    </aside>

    <!-- Editor -->
    <section class="editor">
      <div id="tabs" class="tabs"></div>
      <div class="surface">
        <div id="pane" class="editor-pane" aria-label="Editor" role="textbox"></div>
      </div>

      <!-- Command Palette -->
      <div id="palette" class="palette" aria-modal="true">
        <div class="box">
          <input id="paletteInput" class="input" placeholder="Type a command or file name" />
          <div id="paletteList" class="list"></div>
        </div>
      </div>
    </section>
  </div>

  <!-- Status Bar -->
  <footer class="statusbar">
    <div class="item active">UTF-8</div>
    <div class="item">LF</div>
    <div class="item">JavaScript</div>
    <div class="item">Spaces: 2</div>
    <div class="spacer"></div>
    <div class="item">Go Live</div>
    <div class="item">Ln 1, Col 1</div>
  </footer>
</div>

<script>
/* --- File model --- */
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

/* --- DOM refs --- */
const treeEl = document.getElementById("tree");
const tabsEl = document.getElementById("tabs");
const paneEl = document.getElementById("pane");
const paletteEl = document.getElementById("palette");
const paletteInputEl = document.getElementById("paletteInput");
const paletteListEl = document.getElementById("paletteList");
const fileFilterEl = document.getElementById("fileFilter");

/* --- State --- */
const state = {
  openTabs: [],
  activePath: null,
  expandedDirs: new Set(["", "src", "src/math"]),
};

/* --- Build file tree --- */
function buildTree() {
  treeEl.innerHTML = "";
  const root = nest(files.map(f => f.path));
  renderDir(root, "");
}

function nest(paths) {
  const tree = {};
  for (const p of paths) {
    const parts = p.split("/");
    let cur = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLeaf = i === parts.length - 1;
      cur[part] ??= isLeaf ? null : {};
      if (!isLeaf) cur = cur[part];
    }
  }
  return tree;
}

function renderDir(dir, base) {
  Object.entries(dir).forEach(([name, child]) => {
    const full = base ? base + "/" + name : name;
    const node = document.createElement("div");
    node.className = "node";
    node.dataset.path = full;

    if (child === null) {
      node.innerHTML = `
        <span class="twisty"> </span>
        <span class="file">📄 ${name}</span>
      `;
      node.onclick = () => openFile(full);
    } else {
      const expanded = state.expandedDirs.has(full);
      node.innerHTML = `
        <span class="twisty">${expanded ? "▾" : "▸"}</span>
        <span class="dir">📁 ${name}</span>
      `;
      node.onclick = () => {
        if (expanded) state.expandedDirs.delete(full);
        else state.expandedDirs.add(full);
        buildTree();
        applyFilter(fileFilterEl.value);
      };
    }
    treeEl.appendChild(node);

    if (child !== null && state.expandedDirs.has(full)) {
      // children
      Object.entries(child).forEach(([cname, cchild]) => {
        const cfull = full + "/" + cname;
        const cnode = document.createElement("div");
        cnode.className = "node";
        cnode.style.paddingLeft = "18px";
        cnode.dataset.path = cfull;

        if (cchild === null) {
          cnode.innerHTML = `
            <span class="twisty"> </span>
            <span class="file">📄 ${cname}</span>
          `;
          cnode.onclick = () => openFile(cfull);
        } else {
          const cexp = state.expandedDirs.has(cfull);
          cnode.innerHTML = `
            <span class="twisty">${cexp ? "▾" : "▸"}</span>
            <span class="dir">📁 ${cname}</span>
          `;
          cnode.onclick = () => {
            if (cexp) state.expandedDirs.delete(cfull);
            else state.expandedDirs.add(cfull);
            buildTree();
            applyFilter(fileFilterEl.value);
          };
        }
        treeEl.appendChild(cnode);

        if (cchild !== null && state.expandedDirs.has(cfull)) {
          // grand children
          Object.entries(cchild).forEach(([gname, gchild]) => {
            const gfull = cfull + "/" + gname;
            const gnode = document.createElement("div");
            gnode.className = "node";
            gnode.style.paddingLeft = "36px";
            gnode.dataset.path = gfull;

            if (gchild === null) {
              gnode.innerHTML = `
                <span class="twisty"> </span>
                <span class="file">📄 ${gname}</span>
              `;
              gnode.onclick = () => openFile(gfull);
            } else {
              // deeper nesting could be added similarly
            }
            treeEl.appendChild(gnode);
          });
        }
      });
    }
  });
}

/* --- Tabs --- */
function renderTabs() {
  tabsEl.innerHTML = "";
  state.openTabs.forEach(path => {
    const el = document.createElement("div");
    el.className = "tab" + (state.activePath === path ? " active" : "");
    el.innerHTML = `<span>${basename(path)}</span><span class="spacer"></span><span class="close">✕</span>`;
    el.onclick = (e) => {
      if (e.target.classList.contains("close")) closeTab(path);
      else activate(path);
    };
    tabsEl.appendChild(el);
  });
}

/* --- Open/activate/close --- */
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

/* --- Editor render --- */
function renderEditor() {
  const file = files.find(f => f.path === state.activePath);
  if (!file) {
    paneEl.innerHTML = "";
    return;
  }
  paneEl.innerHTML = tokenize(file.content, file.type)
    .split("\n")
    .map(line => `<span class="line">${line || " "}</span>`)
    .join("\n");
}

/* --- Command Palette --- */
function togglePalette(open) {
  paletteEl.classList.toggle("open", open);
  if (open) {
    paletteInputEl.value = "";
    paletteInputEl.focus();
    renderPaletteList("");
  }
}

function renderPaletteList(q) {
  const items = [
    ...files.map(f => ({ kind: "file", label: f.path, hint: "Open File" })),
    { kind: "cmd", label: "Toggle Sidebar", action: toggleSidebar, hint: "View" },
    { kind: "cmd", label: "New Untitled File", action: newUntitled, hint: "File" },
    { kind: "cmd", label: "Close Active Editor", action: () => closeTab(state.activePath), hint: "File" },
  ].filter(it => it.label.toLowerCase().includes(q.toLowerCase()));
  paletteListEl.innerHTML = "";
  items.forEach(it => {
    const el = document.createElement("div");
    el.className = "cmd";
    el.innerHTML = `<span>${it.label}</span><span class="hint">${it.hint}</span>`;
    el.onclick = () => {
      if (it.kind === "file") openFile(it.label);
      else it.action?.();
      togglePalette(false);
    };
    paletteListEl.appendChild(el);
  });
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const activity = document.querySelector(".activitybar");
  const main = document.querySelector(".main");
  const hidden = sidebar.style.display === "none";
  sidebar.style.display = hidden ? "flex" : "none";
  activity.style.display = hidden ? "flex" : "none";
  main.style.gridTemplateColumns = hidden ? "48px 260px auto" : "0 0 auto";
}

function newUntitled() {
  let n = 1;
  while (files.some(f => f.path === `Untitled-${n}.txt`)) n++;
  const path = `Untitled-${n}.txt`;
  files.push({ path, type: "text/plain", content: code(``) });
  buildTree();
  openFile(path);
}

/* --- Filtering --- */
function applyFilter(q) {
  const nodes = treeEl.querySelectorAll(".node");
  nodes.forEach(n => {
    const p = n.dataset.path.toLowerCase();
    n.style.display = p.includes(q.toLowerCase()) ? "" : "none";
  });
}

/* --- Tokenizer (very minimal) --- */
function tokenize(text, type) {
  const esc = (s) => s.replace(/[&<>]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]));
  const h = esc(text);

  const patterns = [
    { re: /\/\/.*$/gm, cls: "tok-com" },
    { re: /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)/g, cls: "tok-str" },
    { re: /\b\d+(?:\.\d+)?\b/g, cls: "tok-num" },
    { re: /\b(type|function|const|let|var|export|return|if|else|for|while|class|new|extends|import|from|as)\b/g, cls: "tok-key" },
    { re: /\b(string|number|boolean|any|void|never|Array|Promise|Map|Set)\b/g, cls: "tok-type" },
    { re: /\b(console|Math|JSON|document|window)\b/g, cls: "tok-fn" },
  ];

  let out = h;
  for (const { re, cls } of patterns) {
    out = out.replace(re, (m) => `<span class="${cls}">${m}</span>`);
  }
  return out;
}

/* --- Helpers --- */
function basename(p) { return p.split("/").pop(); }
function md(s) { return s.trim(); }
function code(s) { return s.replace(/^\n|\n$/g, ""); }

/* --- Active item highlight in tree --- */
function highlightActiveInTree() {
  treeEl.querySelectorAll(".node").forEach(n => n.classList.toggle("active", n.dataset.path === state.activePath));
}

/* --- Events --- */
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
    e.preventDefault();
    togglePalette(true);
  } else if (e.key === "Escape") {
    togglePalette(false);
  }
});
paletteInputEl.addEventListener("input", (e) => renderPaletteList(e.target.value));
fileFilterEl.addEventListener("input", (e) => applyFilter(e.target.value));

/* --- Init --- */
buildTree();
openFile("README.md");
</script>
</body>
</html>
