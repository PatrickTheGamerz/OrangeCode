<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mini Studio — Full Updated Fixed</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #1e1e1e;
      --panel: #252526;
      --sidebar: #252526;
      --border: #3c3c3c;
      --text: #cccccc;
      --muted: #9da3a6;
      --hover: #2a2a2a;
      --accent: #0e639c;
      --editor-bg: #1e1e1e;
      --terminal-bg: #111111;
      --status-bg: #0b0b0b;
      --danger: #c15555;
      --green: #89d185;
      --yellow: #ffd479;
      --blue: #85c1ff;
      --purple: #c792ea;
      --orange: #f78c6c;
      --red: #ff6b6b;
      --ghost: #9da3a6;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
      user-select: none;
      overflow: auto;
    }

    .workspace {
      display: grid;
      grid-template-rows: 32px auto 1fr 24px;
      min-height: 100vh;
    }

    /* Title bar */
    .titlebar {
      height: 32px;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .tb-btn {
      font-size: 12px;
      padding: 4px 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      border-radius: 4px;
    }
    .tb-btn:hover { background: var(--hover); }
    .brand { margin-left: auto; font-size: 12px; color: var(--muted); }

    /* File menu — perfectly under File button */
    .file-menu {
      position: fixed;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      min-width: 280px;
      display: none;
      flex-direction: column;
      padding: 6px 0;
      z-index: 1000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.35);
    }
    .file-menu .item {
      padding: 6px 12px;
      font-size: 13px;
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .file-menu .item:hover { background: var(--hover); }
    .divider { height: 1px; background: var(--border); margin: 6px 0; }

    /* Toolbar — fits without scrolling (wrap neatly), tooltips */
    .toolbar {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      position: sticky;
      top: 32px;
      z-index: 90;
    }
    .btn, .select {
      font-size: 11px;
      padding: 3px 6px;
      border-radius: 4px;
      color: var(--text);
      background: transparent;
      border: 1px solid var(--border);
      cursor: pointer;
      flex: 0 0 auto;
    }
    .btn:hover { background: var(--hover); }
    .btn.disabled { opacity: 0.4; cursor: default; }
    .select {
      background: #1b1b1b;
      min-width: 96px;
    }
    .filename { font-size: 12px; color: var(--muted); }
    .tooltip { position: relative; }
    .tooltip[data-tip]::after {
      content: attr(data-tip);
      position: absolute;
      bottom: -26px; left: 0;
      background: #111; color: #ddd;
      padding: 4px 6px; border-radius: 4px; border: 1px solid #333;
      font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none;
      transform: translateY(4px); transition: opacity 120ms ease, transform 120ms ease;
    }
    .tooltip:hover::after { opacity: 1; transform: translateY(0); }

    /* Main area */
    .main {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 0;
    }
    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      overflow: auto;
    }
    .sidebar-header {
      padding: 6px 8px;
      font-size: 12px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sd-actions { display: flex; gap: 6px; }
    .sd-btn {
      font-size: 12px;
      padding: 3px 8px;
      color: var(--text);
      border: 1px solid var(--border);
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
    }
    .sd-btn:hover { background: var(--hover); }
    .sidebar-content { padding: 6px 0; }
    .tree-item {
      padding: 6px 12px;
      font-size: 13px;
      cursor: pointer;
      display: flex; align-items: center; gap: 8px;
    }
    .tree-item:hover { background: var(--hover); }
    .tree-item.active { background: #1f1f1f; }

    /* Editor */
    .editor { display: grid; grid-template-rows: auto 1fr; min-height: 0; }
    .tabs {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex; gap: 6px; padding: 4px 6px; align-items: center;
    }
    .tab {
      background: #2d2d2d; color: var(--text);
      border: 1px solid var(--border);
      border-bottom: none;
      padding: 0 8px; height: 24px;
      display: flex; align-items: center;
      border-top-left-radius: 4px; border-top-right-radius: 4px;
      font-size: 11px; cursor: pointer;
    }
    .tab.active { background: #1f1f1f; color: #fff; }

    .editor-surface {
      display: grid;
      grid-template-rows: 28px 1fr auto;
      background: var(--editor-bg);
      min-height: 0;
    }
    .editor-toolbar {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 8px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }
    .info { font-size: 11px; color: var(--muted); user-select: none; }

    /* Code area with line numbers */
    .code-wrap { display: grid; grid-template-columns: 44px 1fr; min-height: 0; }
    .line-numbers {
      background: #252526; color: var(--muted);
      padding: 10px 6px; text-align: right; user-select: none;
      overflow: hidden;
    }
    .code-scroller {
      position: relative; overflow: auto; min-height: 0; background: var(--editor-bg);
    }
    .highlight-layer {
      position: absolute; inset: 0;
      padding: 10px 14px; line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px; white-space: pre; color: transparent;
      pointer-events: none;
    }
    .code-area {
      position: relative;
      padding: 10px 14px; line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px; white-space: pre; outline: none;
      color: var(--text); background: transparent;
      min-height: 360px;
    }
    .inline-output { color: var(--muted); font-style: italic; }
    .inline-error { color: var(--red); font-style: italic; }

    /* Syntax tokens */
    .highlight-layer .tok-comment { color: var(--muted); font-style: italic; }
    .highlight-layer .tok-string { color: var(--green); }
    .highlight-layer .tok-number { color: var(--orange); }
    .highlight-layer .tok-key { color: var(--blue); }
    .highlight-layer .tok-type { color: var(--yellow); }
    .highlight-layer .tok-func { color: var(--purple); }
    .highlight-layer .tok-using-ok { color: var(--blue); }   /* correct using */
    .highlight-layer .tok-using-wrong { color: var(--red); } /* only real typos red */

    /* Output terminal */
    .output-container {
      display: grid; grid-template-rows: 24px 1fr 28px;
      border-top: 1px solid var(--border); background: var(--terminal-bg); min-height: 160px;
    }
    .output-header {
      padding: 2px 8px; font-size: 11px; color: var(--muted);
      border-bottom: 1px solid var(--border); background: var(--terminal-bg);
      display: flex; align-items: center; gap: 8px;
    }
    .output-body {
      padding: 6px 8px; font-family: Menlo, Consolas, monospace; font-size: 12px;
      background: var(--terminal-bg); color: var(--text); overflow: auto;
    }
    .output-body .line.err { color: var(--red); }
    .output-body .line.warn { color: var(--orange); }
    .output-body .line.info { color: var(--blue); }
    .output-input {
      display: grid; grid-template-columns: 1fr;
      gap: 6px; border-top: 1px solid var(--border); padding: 4px 8px;
      align-items: center; background: var(--terminal-bg);
    }
    .term-field {
      width: 100%; background: #1a1a1a; border: 1px solid var(--border);
      color: var(--text); border-radius: 4px; padding: 6px 8px; outline: none;
    }

    /* Status bar */
    .statusbar {
      height: 24px; background: var(--status-bg); border-top: 1px solid var(--border);
      display: flex; align-items: center; padding: 0 10px; gap: 14px;
      font-size: 12px; color: var(--muted); user-select: none;
      position: sticky; bottom: 0; z-index: 50;
    }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Title bar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <span class="brand" id="brandText">Mini Studio — No folder</span>
    </div>

    <!-- File menu (full) -->
    <div class="file-menu" id="fileMenu">
      <div class="item" id="fmNewFolder">New Folder</div>
      <div class="item" id="fmNewFile">New File</div>
      <div class="divider"></div>
      <div class="item" id="fmOpenFile">Open File</div>
      <div class="item" id="fmOpenFolder">Open Folder</div>
      <div class="divider"></div>
      <div class="item" id="fmSave">Save</div>
      <div class="item" id="fmSaveAll">Save All</div>
      <div class="divider"></div>
      <div class="item" id="fmClose">Close</div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar" id="toolbar">
      <button class="btn tooltip" data-tip="Create a folder" id="btnNewFolder">📁 Folder</button>
      <button class="btn tooltip" data-tip="Create a new file" id="btnNewFile">📝 New</button>
      <button class="btn tooltip" data-tip="Open local file" id="btnOpenFile">📂 Open</button>
      <button class="btn tooltip" data-tip="Open local folder" id="btnOpenFolder">📂 Folder</button>
      <button class="btn tooltip" data-tip="Save current file" id="btnSave">💾 Save</button>
      <button class="btn tooltip" data-tip="Save all files" id="btnSaveAll">💾 Save All</button>
      <span class="filename" id="fileDisplay">No file</span>
      <button class="btn tooltip" data-tip="Run program" id="btnRun">▶ Run</button>
      <button class="btn tooltip" data-tip="Comment selection" id="btnComment">// Comment</button>
      <button class="btn tooltip" data-tip="Uncomment selection" id="btnUncomment">␡ Uncomment</button>
    </div>

    <!-- Main area -->
    <div class="main" id="mainGrid">
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <span>Explorer</span>
          <div class="sd-actions">
            <button class="sd-btn" id="sdNewFolder">New folder</button>
            <button class="sd-btn" id="sdNewFile">New file</button>
          </div>
        </div>
        <div class="sidebar-content" id="explorer">
          <div style="padding:8px; color:var(--muted);">Empty — create a folder first.</div>
        </div>
      </aside>

      <!-- Editor and output -->
      <section class="editor">
        <div class="tabs" id="tabs"></div>

        <div class="editor-surface">
          <div class="editor-toolbar">
            <span class="info" id="encodingInfo">UTF-8 | LF</span>
            <span class="info" id="languageLockInfo">Language: <em id="languageName">None</em></span>
            <span class="info" style="margin-left:auto;" id="statusMsg">Ready</span>
          </div>

          <div class="code-wrap">
            <div class="line-numbers" id="lineNumbers">1</div>
            <div class="code-scroller" id="codeScroller">
              <pre aria-hidden="true" class="highlight-layer" id="highlightLayer"></pre>
              <div class="code-area" id="codeArea" contenteditable="true"></div>
            </div>
          </div>

          <div class="output-container" id="output">
            <div class="output-header">
              <span>Output</span>
              <span style="margin-left:auto;">Press Enter to send input when program waits</span>
            </div>
            <div class="output-body" id="terminalBody"></div>
            <div class="output-input">
              <input class="term-field" id="termInput" placeholder="Program input..." />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Status bar -->
    <div class="statusbar">
      <div class="cell" id="cursorCell">Ln 1, Col 1</div>
      <div class="cell" style="margin-left:auto;" id="statusTail">Ready</div>
    </div>
  </div>

<script>
  // Elements
  const btnFile = document.getElementById('btnFile');
  const fileMenu = document.getElementById('fileMenu');
  const brandText = document.getElementById('brandText');
  const explorer = document.getElementById('explorer');
  const tabs = document.getElementById('tabs');
  const codeArea = document.getElementById('codeArea');
  const codeScroller = document.getElementById('codeScroller');
  const highlightLayer = document.getElementById('highlightLayer');
  const lineNumbers = document.getElementById('lineNumbers');
  const cursorCell = document.getElementById('cursorCell');
  const statusMsg = document.getElementById('statusMsg');
  const statusTail = document.getElementById('statusTail');
  const fileDisplay = document.getElementById('fileDisplay');
  const termInput = document.getElementById('termInput');
  const terminalBody = document.getElementById('terminalBody');

  const btnNewFolder = document.getElementById('btnNewFolder');
  const btnNewFile = document.getElementById('btnNewFile');
  const btnOpenFile = document.getElementById('btnOpenFile');
  const btnOpenFolder = document.getElementById('btnOpenFolder');
  const btnSave = document.getElementById('btnSave');
  const btnSaveAll = document.getElementById('btnSaveAll');
  const btnRun = document.getElementById('btnRun');
  const btnComment = document.getElementById('btnComment');
  const btnUncomment = document.getElementById('btnUncomment');
  const sdNewFolder = document.getElementById('sdNewFolder');
  const sdNewFile = document.getElementById('sdNewFile');
  const languageNameEl = document.getElementById('languageName');

  // File model
  let folder = null; // { name, files: Map }
  let currentFileKey = null; // full key: `${folder.name}/${filename}`
  const allFolders = new Map(); // folderName -> { name, files: Map<filename, fileObj> }

  // Templates
  const templates = {
    CS: (name='FileName', ns='ConsoleApp7') => `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ${ns}
{
    internal class ${name}
    {
    }
}
`
  };

  // Syntax highlight — correct usings are blue; only actual typos red.
  function highlightCS(text) {
    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    let E = esc(text);
    // mark correct using
    E = E.replace(/(^|\n)\s*using\s+[A-Za-z0-9_.]+;/g, m => `<span class="tok-using-ok">${m}</span>`);
    // mark obvious typo "usnig"
    E = E.replace(/(^|\n)\s*usnig\s+[A-Za-z0-9_.]+;/g, m => `<span class="tok-using-wrong">${m}</span>`);
    const rules = [
      { re: /\/\/[^\n]*/g, cls:'tok-comment' },
      { re: /"(?:\\.|[^"\\])*"/g, cls:'tok-string' },
      { re: /'(?:\\.|[^'\\])'/g, cls:'tok-string' },
      { re: /`(?:\\.|[^`\\])*`/g, cls:'tok-string' },
      { re: /\b\d+(\.\d+)?\b/g, cls:'tok-number' },
      { re: /\b(namespace|class|interface|struct|public|private|protected|internal|static|async|await|void|int|string|var|new|return|using)\b/g, cls:'tok-key' },
      { re: /\b(Console|Enumerable|Task|Guid|CancellationToken|IAsyncEnumerable|String)\b/g, cls:'tok-type' },
      { re: /\b(Main|WriteLine|ReadLine)\b/g, cls:'tok-func' },
    ];
    for (const r of rules) E = E.replace(r.re, m => `<span class="${r.cls}">${m}</span>`);
    return E;
  }

  function refreshHighlight() {
    const src = codeArea.textContent;
    highlightLayer.innerHTML = highlightCS(src);
    highlightLayer.scrollTop = codeScroller.scrollTop;
    highlightLayer.scrollLeft = codeScroller.scrollLeft;
  }

  // Position File menu under File button
  function positionFileMenu() {
    const rect = btnFile.getBoundingClientRect();
    fileMenu.style.left = (rect.left + window.scrollX) + 'px';
    fileMenu.style.top = (rect.bottom + window.scrollY) + 'px';
  }
  btnFile.addEventListener('click', (e) => {
    e.stopPropagation();
    positionFileMenu();
    fileMenu.style.display = (fileMenu.style.display === 'flex') ? 'none' : 'flex';
  });
  document.addEventListener('click', (e) => {
    if (fileMenu.style.display === 'flex' && !fileMenu.contains(e.target) && e.target !== btnFile) {
      fileMenu.style.display = 'none';
    }
  });
  window.addEventListener('scroll', () => { if (fileMenu.style.display === 'flex') positionFileMenu(); });
  window.addEventListener('resize', () => { if (fileMenu.style.display === 'flex') positionFileMenu(); });

  // Explorer render
  function renderExplorer() {
    explorer.innerHTML = '';
    if (!folder) {
      const div = document.createElement('div');
      div.style.padding = '8px';
      div.style.color = 'var(--muted)';
      div.textContent = 'Empty — create a folder first.';
      explorer.appendChild(div);
      return;
    }
    for (const [fname] of folder.files.entries()) {
      const item = document.createElement('div');
      item.className = 'tree-item' + (currentFileKey === folder.name + '/' + fname ? ' active' : '');
      item.dataset.open = folder.name + '/' + fname;
      item.textContent = fname;
      explorer.appendChild(item);
    }
  }

  // Tabs render
  function renderTabs() {
    tabs.innerHTML = '';
    if (!folder) return;
    for (const [fname] of folder.files.entries()) {
      const tab = document.createElement('div');
      tab.className = 'tab' + (currentFileKey === folder.name + '/' + fname ? ' active' : '');
      tab.dataset.file = folder.name + '/' + fname;
      tab.textContent = fname;
      tabs.appendChild(tab);
    }
  }

  // Open file
  function openFile(fullKey) {
    if (!folder) return;
    const [folderName, fname] = fullKey.split('/');
    const file = allFolders.get(folderName)?.files.get(fname);
    if (!file) return;
    currentFileKey = fullKey;
    codeArea.textContent = file.content || '';
    languageNameEl.textContent = file.language || 'CS';
    fileDisplay.textContent = fname;
    brandText.textContent = 'Mini Studio — ' + (folder?.name || 'No folder');
    renderTabs();
    renderExplorer();
    refreshHighlight();
    updateLineNumbers();
    setStatus('Opened ' + fname);
  }

  function setStatus(msg) {
    statusMsg.textContent = msg;
    statusTail.textContent = msg;
  }

  // Line numbers sync
  function updateLineNumbers() {
    const lines = codeArea.textContent.split('\n').length || 1;
    lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    lineNumbers.scrollTop = codeScroller.scrollTop;
  }
  codeScroller.addEventListener('scroll', () => {
    highlightLayer.scrollTop = codeScroller.scrollTop;
    highlightLayer.scrollLeft = codeScroller.scrollLeft;
    lineNumbers.scrollTop = codeScroller.scrollTop;
  });

  // Cursor cell + autosave
  function updateCursor() {
    const sel = window.getSelection();
    let line = 1, col = 1;
    if (sel && sel.anchorNode) {
      const idx = getCaretIndex(codeArea);
      const up = codeArea.textContent.slice(0, idx);
      line = (up.match(/\n/g) || []).length + 1;
      const lastNL = up.lastIndexOf('\n');
      col = up.length - (lastNL + 1) + 1;
    }
    cursorCell.textContent = 'Ln ' + line + ', Col ' + col;
    const file = getCurrentFile();
    if (file) file.content = codeArea.textContent;
    refreshHighlight();
    updateLineNumbers();
  }
  codeArea.addEventListener('input', updateCursor);
  codeArea.addEventListener('click', updateCursor);
  codeArea.addEventListener('keyup', updateCursor);

  function getCaretIndex(el) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
  }

  function getCurrentFile() {
    if (!currentFileKey || !folder) return null;
    const [folderName, fname] = currentFileKey.split('/');
    return allFolders.get(folderName)?.files.get(fname);
  }

  // Create folder
  function createFolder() {
    const name = prompt('Folder name?');
    if (!name) return;
    if (!allFolders.has(name)) allFolders.set(name, { name, files: new Map() });
    folder = allFolders.get(name);
    brandText.textContent = 'Mini Studio — ' + folder.name;
    setStatus('Folder created: ' + name);
    renderExplorer();
    renderTabs();
    fileDisplay.textContent = 'No file';
    languageNameEl.textContent = 'None';
    codeArea.textContent = '';
    refreshHighlight();
    updateLineNumbers();
  }

  // Create file
  function createFile() {
    if (!folder) { alert('Create a folder first'); return; }
    const fname = prompt('File name? (class name)');
    if (!fname) return;
    const content = templates.CS(fname);
    folder.files.set(fname, { name: fname, language: 'CS', ext: '.cs', content });
    const key = folder.name + '/' + fname;
    currentFileKey = key;
    codeArea.textContent = content;
    fileDisplay.textContent = fname;
    languageNameEl.textContent = 'CS';
    renderExplorer();
    renderTabs();
    refreshHighlight();
    updateLineNumbers();
    setStatus('File created: ' + fname);
  }

  // Save current
  function saveCurrent() {
    const file = getCurrentFile();
    if (!file) { setStatus('No file to save'); return; }
    const filename = (file.name || 'FileName') + (file.ext || '.txt');
    const blob = new Blob([file.content || ''], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus('Saved ' + filename);
  }

  function saveAll() {
    if (!folder) { setStatus('No folder'); return; }
    for (const [fname, file] of folder.files.entries()) {
      const blob = new Blob([file.content || ''], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fname + (file.ext || '.txt');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setStatus('Saved all files in ' + folder.name);
  }

  // Open local file
  async function openLocalFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const f = input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (!folder) {
          const fallback = 'ImportedFolder';
          allFolders.set(fallback, { name: fallback, files: new Map() });
          folder = allFolders.get(fallback);
        }
        const name = f.name.replace(/\.[^.]+$/, '');
        const ext = '.' + (f.name.split('.').pop() || 'txt');
        folder.files.set(name, { name, language: ext === '.cs' ? 'CS' : null, ext, content: reader.result });
        currentFileKey = folder.name + '/' + name;
        codeArea.textContent = reader.result;
        languageNameEl.textContent = ext === '.cs' ? 'CS' : 'None';
        fileDisplay.textContent = name;
        renderExplorer();
        renderTabs();
        refreshHighlight();
        updateLineNumbers();
        setStatus('Opened ' + f.name);
      };
      reader.readAsText(f);
    };
    input.click();
  }

  // Open local folder (basic)
  async function openLocalFolder() {
    if (!('showDirectoryPicker' in window)) { setStatus('Folder open not supported'); return; }
    try {
      const dir = await window.showDirectoryPicker();
      const name = dir.name || 'Folder';
      allFolders.set(name, { name, files: new Map() });
      folder = allFolders.get(name);
      for await (const entry of dir.values()) {
        if (entry.kind === 'file') {
          const fh = entry;
          const file = await fh.getFile();
          const text = await file.text();
          const fname = file.name.replace(/\.[^.]+$/, '');
          const ext = '.' + (file.name.split('.').pop() || 'txt');
          folder.files.set(fname, { name: fname, language: ext === '.cs' ? 'CS' : null, ext, content: text });
        }
      }
      brandText.textContent = 'Mini Studio — ' + folder.name;
      renderExplorer();
      renderTabs();
      const first = folder.files.keys().next().value;
      if (first) openFile(folder.name + '/' + first);
      else { codeArea.textContent = ''; refreshHighlight(); updateLineNumbers(); }
      setStatus('Folder opened: ' + folder.name);
    } catch {
      setStatus('Folder open canceled');
    }
  }

  // Inline output: simulate WriteLine inline; ReadLine waits for input
  function clearInlineGhosts() {
    // remove any previously appended inline ghost messages
    const ghosts = Array.from(codeArea.querySelectorAll('.inline-output, .inline-error'));
    ghosts.forEach(g => g.remove());
  }

  function runProgram() {
    terminalBody.innerHTML = ''; // clear output each run
    clearInlineGhosts();

    const source = codeArea.textContent;
    const lines = source.split('\n');

    // Simulate inline WriteLine outputs by parsing Console.WriteLine("text");
    const outputs = [];
    lines.forEach((l, i) => {
      const m = l.match(/Console\.WriteLine\(\s*(["'`].*?["'`])\s*\)\s*;/);
      if (m) {
        const text = m[1].replace(/^["'`]|["'`]$/g, '');
        outputs.push({ line: i + 1, text });
      }
    });
    outputs.forEach(o => {
      const ghost = document.createElement('div');
      ghost.className = 'inline-output';
      ghost.textContent = `// Output (Ln ${o.line}): ${o.text}`;
      codeArea.appendChild(ghost);
    });

    // ReadLine: if present, wait for input in terminal
    if (source.includes('Console.ReadLine()')) {
      const waiting = document.createElement('div');
      waiting.className = 'line info';
      waiting.textContent = '(program waiting for input...)';
      terminalBody.appendChild(waiting);
      termInput.disabled = false;
      termInput.focus();
      const handler = (e) => {
        if (e.key === 'Enter') {
          const val = termInput.value;
          termInput.value = '';
          const echo = document.createElement('div');
          echo.className = 'line';
          echo.textContent = val;
          terminalBody.appendChild(echo);
          termInput.removeEventListener('keydown', handler);
          termInput.disabled = true;
          setStatus('Program received input');
        }
      };
      termInput.addEventListener('keydown', handler);
    } else {
      termInput.disabled = true;
    }

    setStatus('Program executed');
  }

  // Comment/uncomment selection by lines
  function getSelectionLineRange() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    // normalize order
    const anchorIdx = getIndexFromNodeOffset(sel.anchorNode, sel.anchorOffset);
    const focusIdx = getIndexFromNodeOffset(sel.focusNode, sel.focusOffset);
    const startIdx = Math.min(anchorIdx, focusIdx);
    const endIdx = Math.max(anchorIdx, focusIdx);
    const text = codeArea.textContent;
    const pre = text.slice(0, startIdx);
    const mid = text.slice(startIdx, endIdx);
    const post = text.slice(endIdx);
    return { pre, mid, post };
  }
  function getIndexFromNodeOffset(node, offset) {
    const r = document.createRange();
    r.setStart(codeArea, 0);
    try { r.setEnd(node, offset); } catch { return 0; }
    return r.toString().length;
  }

  function commentSelection() {
    const r = getSelectionLineRange();
    if (!r) return;
    const commented = r.mid.split('\n').map(line => '// ' + line).join('\n');
    codeArea.textContent = r.pre + commented + r.post;
    refreshHighlight();
    updateLineNumbers();
    setStatus('Commented selection');
  }
  function uncommentSelection() {
    const r = getSelectionLineRange();
    if (!r) return;
    const uncommented = r.mid.split('\n').map(line => line.startsWith('// ') ? line.slice(3) : line).join('\n');
    codeArea.textContent = r.pre + uncommented + r.post;
    refreshHighlight();
    updateLineNumbers();
    setStatus('Uncommented selection');
  }

  // Events: Explorer and Tabs
  document.addEventListener('click', (e) => {
    const ti = e.target.closest('.tree-item');
    if (ti) openFile(ti.dataset.open);
    const tab = e.target.closest('.tab');
    if (tab) openFile(tab.dataset.file);
  });

  // Toolbar + File menu actions
  btnNewFolder.addEventListener('click', createFolder);
  sdNewFolder.addEventListener('click', createFolder);
  document.getElementById('fmNewFolder').addEventListener('click', createFolder);

  btnNewFile.addEventListener('click', createFile);
  sdNewFile.addEventListener('click', createFile);
  document.getElementById('fmNewFile').addEventListener('click', createFile);

  btnOpenFile.addEventListener('click', openLocalFile);
  document.getElementById('fmOpenFile').addEventListener('click', openLocalFile);

  btnOpenFolder.addEventListener('click', openLocalFolder);
  document.getElementById('fmOpenFolder').addEventListener('click', openLocalFolder);

  btnSave.addEventListener('click', saveCurrent);
  document.getElementById('fmSave').addEventListener('click', saveCurrent);

  btnSaveAll.addEventListener('click', saveAll);
  document.getElementById('fmSaveAll').addEventListener('click', saveAll);

  document.getElementById('fmClose').addEventListener('click', () => setStatus('Closed (mock)'));

  btnRun.addEventListener('click', runProgram);
  btnComment.addEventListener('click', commentSelection);
  btnUncomment.addEventListener('click', uncommentSelection);

  // Initialize
  codeArea.textContent = '';
  languageNameEl.textContent = 'None';
  fileDisplay.textContent = 'No file';
  refreshHighlight();
  updateLineNumbers();
  setStatus('Ready');
</script>
</body>
</html>
