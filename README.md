<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mini Studio</title>
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
      --active: #094771;
      --editor-bg: #1e1e1e;
      --terminal-bg: #111111;
      --status-bg: #0b0b0b;
      --danger: #c15555;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
      overflow: hidden;
      user-select: none; /* make UI non-copiable by default */
    }

    /* Only the code editor should be copyable/editable */
    .code-area, .code-area * { user-select: text; }

    .workspace {
      display: grid;
      grid-template-rows: 32px 32px 1fr 24px;
      height: 100%;
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

    /* File menu with hover submenus */
    .file-menu {
      position: absolute;
      top: 32px;
      left: 8px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      min-width: 260px;
      display: none;
      flex-direction: column;
      padding: 6px 0;
      z-index: 1000;
    }
    .file-menu .item {
      position: relative;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--text);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .file-menu .item:hover { background: var(--hover); }
    .file-menu .item.has-sub::after {
      content: "▸";
      color: var(--muted);
      margin-left: 8px;
    }
    .submenu {
      position: absolute;
      left: 100%;
      top: 0;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      min-width: 240px;
      display: none;
      flex-direction: column;
      padding: 6px 0;
      z-index: 1100;
    }
    .item.has-sub:hover .submenu { display: flex; }

    .divider { height: 1px; background: var(--border); margin: 6px 0; }

    /* Secondary toolbar (Run, Save, etc.) */
    .toolbar {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: grid;
      grid-template-columns: auto auto auto auto auto auto auto 1fr auto auto auto auto auto auto;
      gap: 8px;
      align-items: center;
      padding: 0 8px;
      height: 32px;
    }
    .btn {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--text);
      background: transparent;
      border: 1px solid var(--border);
      cursor: pointer;
    }
    .btn:hover { background: var(--hover); }
    .btn.disabled { opacity: 0.4; cursor: default; }
    .select {
      height: 26px;
      background: #1b1b1b;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      cursor: pointer;
    }
    .filename {
      font-size: 12px;
      color: var(--muted);
      user-select: none;
    }

    /* Main area: resizable sidebar + editor */
    .main {
      display: grid;
      grid-template-columns: 300px 1fr; /* sidebar default 300px */
      min-height: 0;
    }
    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      resize: horizontal;     /* freely resizable */
      overflow: auto;
      min-width: 160px;
      max-width: 720px;
    }
    .sidebar-header {
      padding: 8px 10px;
      font-size: 12px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
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
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tree-item:hover { background: var(--hover); }
    .tree-item.active { background: #1f1f1f; }

    /* Editor */
    .editor {
      display: grid;
      grid-template-rows: 36px 1fr;
      min-height: 0;
    }
    .tabs {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 6px;
    }
    .tab {
      background: #2d2d2d;
      color: var(--text);
      border: 1px solid var(--border);
      border-bottom: none;
      height: 28px;
      margin-top: 6px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    .tab.active { background: #1f1f1f; color: #fff; }

    .editor-surface {
      display: grid;
      grid-template-rows: 40px 1fr auto; /* toolbar, code, output */
      min-height: 0;
      background: var(--editor-bg);
    }
    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }
    .info { font-size: 12px; color: var(--muted); user-select: none; }

    /* Code area (editable + copyable) */
    .code-area {
      position: relative;
      overflow: auto;
      padding: 12px 16px;
      line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px;
      white-space: pre;
      outline: none;
    }
    .code-area[contenteditable="true"] { caret-color: #cfe8ff; }

    /* Output terminal — freely resizable up or down */
    .output-container {
      display: grid;
      grid-template-rows: 28px 1fr 32px; /* header, body, input */
      border-top: 1px solid var(--border);
      background: var(--terminal-bg);
      resize: vertical;     /* can be dragged up or down */
      overflow: auto;
      min-height: 100px;
      max-height: 70vh;
    }
    .output-header {
      padding: 4px 8px;
      font-size: 12px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none;
    }
    .output-body {
      padding: 8px;
      overflow: auto;
      font-family: Menlo, Consolas, monospace;
      font-size: 12px;
    }
    .output-input {
      display: grid;
      grid-template-columns: 36px 1fr 90px;
      gap: 6px;
      border-top: 1px solid var(--border);
      padding: 4px 8px;
      align-items: center;
    }
    .prompt { color: var(--accent); text-align: center; user-select: none; }
    .term-field {
      width: 100%;
      background: #1a1a1a;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 4px;
      padding: 6px 8px;
      outline: none;
    }
    .term-run {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      font-size: 12px;
      user-select: none;
    }
    .term-run:hover { filter: brightness(1.1); }

    /* Status bar */
    .statusbar {
      height: 24px;
      background: var(--status-bg);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 14px;
      font-size: 12px;
      color: var(--muted);
      user-select: none;
    }
    .statusbar .cell { cursor: default; }
    .statusbar .cell.interactive { cursor: pointer; }
    .statusbar .cell.interactive:hover { color: #e0e0e0; }

    /* Modal for New File (language + name) */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    .modal {
      width: 420px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      display: grid;
      gap: 8px;
    }
    .modal h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: var(--text);
      user-select: none;
    }
    .modal-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 8px;
      align-items: center;
    }
    .modal input, .modal select {
      height: 28px;
      background: #1b1b1b;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 0 8px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .danger { border-color: var(--danger); color: #f7d4d4; }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Title bar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <span class="brand" id="brandText">Mini Studio — Program</span>
    </div>

    <!-- Secondary toolbar -->
    <div class="toolbar">
      <button class="btn" id="btnNewFile">📝 New File</button>
      <button class="btn" id="btnOpenFile">📂 Open File</button>
      <button class="btn" id="btnSaveFile">💾 Save</button>
      <button class="btn" id="btnSaveAll">💾 Save All</button>
      <button class="btn disabled" id="btnUndo">↩ Undo</button>
      <button class="btn disabled" id="btnRedo">↪ Redo</button>
      <select class="select" id="buildSelect">
        <option>Debug</option>
        <option>Release</option>
      </select>
      <span class="filename" id="fileDisplay">Program</span>
      <button class="btn" id="btnRun">▶ Run</button>
      <select class="select" id="runTarget">
        <option id="optFileName">Program</option>
        <option>WSL</option>
        <option>Debugging Properties (Program)</option>
        <option>Configure Starter Projects</option>
      </select>
      <button class="btn" id="btnRunNoDebug">⏯ Run Without Debugging</button>
      <button class="btn" id="btnOpenWindow">🗔 Open Window</button>
      <button class="btn" id="btnSpell">🔤 Switch spell-check</button>
      <button class="btn" id="btnQuickInfo">💡 Quick info</button>
      <button class="btn" id="btnCommentLines">// Comment lines</button>
      <button class="btn" id="btnUncommentLines">␡ Uncomment lines</button>
      <button class="btn" id="btnSwitchTab">↹ Switch tab</button>
    </div>

    <!-- File menu -->
    <div class="file-menu" id="fileMenu">
      <div class="item has-sub" id="fmNew">New
        <div class="submenu">
          <div class="item" id="fmNewProject">Project</div>
          <div class="item" id="fmNewRepository">Repository</div>
          <div class="item" id="fmNewFile">File</div>
          <div class="item" id="fmNewFromExisting">Project from existing sources</div>
        </div>
      </div>
      <div class="item has-sub" id="fmOpen">Open
        <div class="submenu">
          <div class="item" id="fmOpenProject">Project</div>
          <div class="item" id="fmOpenFolder">Folder</div>
          <div class="item" id="fmOpenFile">File</div>
        </div>
      </div>
      <div class="item" id="fmCloneRepo">Clone Repository</div>
      <div class="item" id="fmOpenWindow">Open Window</div>
      <div class="divider"></div>
      <div class="item has-sub" id="fmAdd">Add
        <div class="submenu">
          <div class="item" id="fmAddNewProj">New Project</div>
          <div class="item" id="fmAddExistingProj">Existing Project</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="item" id="fmClose">Close</div>
      <div class="item" id="fmCloseSolution">Close Solution</div>
      <div class="divider"></div>
      <div class="item" id="fmSaveProgram">Save</div>
      <div class="item" id="fmSaveProgramAs">Save As…</div>
      <div class="item" id="fmSaveAll">Save All</div>
      <div class="divider"></div>
      <div class="item" id="fmPageSettings">Page Settings</div>
      <div class="divider"></div>
      <div class="item" id="fmRecentFiles">Recently Used Files</div>
      <div class="item" id="fmRecentSolutions">Recently Used Projects and Solutions</div>
    </div>

    <!-- Main area -->
    <div class="main" id="mainGrid">
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <span>Explorer</span>
          <div class="sd-actions">
            <button class="sd-btn" id="sdNew">New</button>
            <button class="sd-btn" id="sdRefresh">Refresh</button>
          </div>
        </div>
        <div class="sidebar-content" id="explorer">
          <div class="tree-item active" data-open="Program">Program</div>
        </div>
      </aside>

      <!-- Editor and output -->
      <section class="editor">
        <div class="tabs" id="tabs">
          <div class="tab active" data-file="Program">Program</div>
        </div>

        <div class="editor-surface">
          <div class="editor-toolbar">
            <span class="info" id="encodingInfo">UTF-8 | LF</span>
            <span class="info" id="languageLockInfo">Language: <em id="languageName">None</em> (locked after creation)</span>
            <span class="info" style="margin-left:auto;" id="statusMsg">Ready</span>
          </div>

          <div class="code-area" id="codeArea" contenteditable="true">
// Type ANYTHING here. To start, create a New File and select a language.
// This area is the ONLY copyable/editable part of the UI.
          </div>

          <div class="output-container" id="output">
            <div class="output-header">
              <span>Output</span>
              <span style="margin-left:auto;">bash • Press Enter to run</span>
            </div>
            <div class="output-body" id="terminalBody">$ echo "welcome"
welcome</div>
            <div class="output-input">
              <div class="prompt">❯</div>
              <input class="term-field" id="termInput" placeholder="Type a command, e.g., node -v" />
              <button class="term-run" id="termRun">Run</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Status bar -->
    <div class="statusbar">
      <div class="cell" id="cursorCell">Ln 1, Col 1</div>
      <div class="cell">Spaces: 2</div>
      <div class="cell">UTF-8</div>
      <div class="cell">LF</div>
      <div class="cell" style="margin-left:auto;" id="statusTail">Mini Studio Ready</div>
    </div>
  </div>

  <!-- Modal: New File -->
  <div class="modal-backdrop" id="newFileModal">
    <div class="modal">
      <h3>Create new file</h3>
      <div class="modal-row">
        <label for="nfName">File name</label>
        <input id="nfName" placeholder="e.g., Program" />
      </div>
      <div class="modal-row">
        <label for="nfLang">Language</label>
        <select id="nfLang">
          <option value="" selected>Select language…</option>
          <option value="JAVA">JAVA</option>
          <option value="CPP">C++</option>
          <option value="CS">C#</option>
          <option value="HTML">HTML</option>
          <option value="PYTHON">PYTHON</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn" id="nfCancel">Cancel</button>
        <button class="btn" id="nfCreate">Create</button>
      </div>
      <div class="info danger" id="nfError" style="display:none;">Please provide a file name and select a language.</div>
    </div>
  </div>

  <script>
    // Elements
    const btnFile = document.getElementById('btnFile');
    const fileMenu = document.getElementById('fileMenu');
    const statusMsg = document.getElementById('statusMsg');
    const statusTail = document.getElementById('statusTail');
    const brandText = document.getElementById('brandText');

    const explorer = document.getElementById('explorer');
    const tabs = document.getElementById('tabs');
    const codeArea = document.getElementById('codeArea');
    const cursorCell = document.getElementById('cursorCell');

    const output = document.getElementById('output');
    const terminalBody = document.getElementById('terminalBody');
    const termInput = document.getElementById('termInput');
    const termRun = document.getElementById('termRun');

    const fileDisplay = document.getElementById('fileDisplay');
    const optFileName = document.getElementById('optFileName');
    const runTarget = document.getElementById('runTarget');

    const btnNewFile = document.getElementById('btnNewFile');
    const btnOpenFile = document.getElementById('btnOpenFile');
    const btnSaveFile = document.getElementById('btnSaveFile');
    const btnSaveAll = document.getElementById('btnSaveAll');
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    const btnRun = document.getElementById('btnRun');
    const btnRunNoDebug = document.getElementById('btnRunNoDebug');
    const btnOpenWindow = document.getElementById('btnOpenWindow');
    const btnSpell = document.getElementById('btnSpell');
    const btnQuickInfo = document.getElementById('btnQuickInfo');
    const btnCommentLines = document.getElementById('btnCommentLines');
    const btnUncommentLines = document.getElementById('btnUncommentLines');
    const btnSwitchTab = document.getElementById('btnSwitchTab');

    // File menu items
    const fmNewFile = document.getElementById('fmNewFile');
    const fmOpenFile = document.getElementById('fmOpenFile');
    const fmSaveProgram = document.getElementById('fmSaveProgram');
    const fmSaveProgramAs = document.getElementById('fmSaveProgramAs');
    const fmSaveAll = document.getElementById('fmSaveAll');
    const fmClose = document.getElementById('fmClose');
    const fmCloseSolution = document.getElementById('fmCloseSolution');
    const fmOpenProject = document.getElementById('fmOpenProject');
    const fmOpenFolder = document.getElementById('fmOpenFolder');
    const fmNewProject = document.getElementById('fmNewProject');
    const fmNewRepository = document.getElementById('fmNewRepository');
    const fmNewFromExisting = document.getElementById('fmNewFromExisting');
    const fmCloneRepo = document.getElementById('fmCloneRepo');
    const fmOpenWindow = document.getElementById('fmOpenWindow');
    const fmAddNewProj = document.getElementById('fmAddNewProj');
    const fmAddExistingProj = document.getElementById('fmAddExistingProj');
    const fmPageSettings = document.getElementById('fmPageSettings');
    const fmRecentFiles = document.getElementById('fmRecentFiles');
    const fmRecentSolutions = document.getElementById('fmRecentSolutions');

    // Modal elements
    const newFileModal = document.getElementById('newFileModal');
    const nfName = document.getElementById('nfName');
    const nfLang = document.getElementById('nfLang');
    const nfCreate = document.getElementById('nfCreate');
    const nfCancel = document.getElementById('nfCancel');
    const nfError = document.getElementById('nfError');
    const languageNameEl = document.getElementById('languageName');

    // File model
    let currentFile = {
      name: 'Program',
      language: null,
      ext: '',
      content: codeArea.textContent,
      lockedLanguage: false
    };
    const files = new Map(); // key: filename.ext, value: {name, language, ext, content, lockedLanguage}
    files.set('Program', { ...currentFile });

    // Language extensions
    const langExt = {
      'JAVA': '.java',
      'CPP': '.cpp',
      'CS': '.cs',
      'HTML': '.html',
      'PYTHON': '.py'
    };

    // Language templates
    const templates = {
      'JAVA': `public class Program {
  public static void main(String[] args) {
    System.out.println("Hello, Java!");
  }
}
`,
      'CPP': `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, C++!" << endl;
  return 0;
}
`,
      'CS': `using System;

class Program {
  static void Main(string[] args) {
    Console.WriteLine("Hello, C#!");
  }
}
`,
      'HTML': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Hello</title>
  </head>
  <body>Hi</body>
</html>
`,
      'PYTHON': `def main():
    print("Hello, Python!")

if __name__ == "__main__":
    main()
`
    };

    // Utility: status
    function setStatus(msg) {
      statusMsg.textContent = msg;
      statusTail.textContent = msg;
    }

    // Utility: render explorer + tabs from files map
    function renderWorkspace() {
      explorer.innerHTML = '';
      tabs.innerHTML = '';
      for (const [key, f] of files.entries()) {
        const item = document.createElement('div');
        item.className = 'tree-item' + (key === (currentFile.name + (currentFile.ext || '')) ? ' active' : '');
        item.dataset.open = key;
        item.textContent = key;
        explorer.appendChild(item);

        const tab = document.createElement('div');
        tab.className = 'tab' + (key === (currentFile.name + (currentFile.ext || '')) ? ' active' : '');
        tab.dataset.file = key;
        tab.textContent = key;
        tabs.appendChild(tab);
      }
      const fullName = currentFile.name + (currentFile.ext || '');
      fileDisplay.textContent = fullName;
      optFileName.textContent = fullName;
      brandText.textContent = 'Mini Studio — ' + fullName;
      languageNameEl.textContent = currentFile.language ? currentFile.language : 'None';
    }

    // Open file into editor
    function openFile(key) {
      const f = files.get(key);
      if (!f) return;
      currentFile = { ...f };
      codeArea.textContent = currentFile.content || '';
      renderWorkspace();
      setStatus('Opened ' + key);
    }

    // Keep cursor cell updated (basic)
    codeArea.addEventListener('keyup', updateCursor);
    codeArea.addEventListener('click', updateCursor);
    function updateCursor() {
      // naive line/col
      const sel = window.getSelection();
      let line = 1, col = 1;
      if (sel && sel.anchorNode) {
        const textUpToCursor = codeArea.textContent.slice(0, getCaretIndex(codeArea));
        line = (textUpToCursor.match(/\n/g) || []).length + 1;
        const lastNL = textUpToCursor.lastIndexOf('\n');
        col = textUpToCursor.length - (lastNL + 1) + 1;
      }
      cursorCell.textContent = 'Ln ' + line + ', Col ' + col;
      currentFile.content = codeArea.textContent;
      files.set(currentFile.name + (currentFile.ext || ''), { ...currentFile });
      enableUndoRedo(); // mark actions
    }
    function getCaretIndex(el) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return 0;
      const range = selection.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(el);
      preRange.setEnd(range.endContainer, range.endOffset);
      return preRange.toString().length;
    }

    // Undo/Redo (very naive stack)
    const undoStack = [];
    const redoStack = [];
    function pushUndo() {
      undoStack.push(codeArea.textContent);
      btnUndo.classList.remove('disabled');
    }
    function enableUndoRedo() {
      if (undoStack.length > 0) btnUndo.classList.remove('disabled');
      if (redoStack.length > 0) btnRedo.classList.remove('disabled');
    }
    btnUndo.addEventListener('click', () => {
      if (undoStack.length === 0) return;
      redoStack.push(codeArea.textContent);
      const prev = undoStack.pop();
      codeArea.textContent = prev;
      updateCursor();
      btnRedo.classList.remove('disabled');
      if (undoStack.length === 0) btnUndo.classList.add('disabled');
    });
    btnRedo.addEventListener('click', () => {
      if (redoStack.length === 0) return;
      undoStack.push(codeArea.textContent);
      const next = redoStack.pop();
      codeArea.textContent = next;
      updateCursor();
      if (redoStack.length === 0) btnRedo.classList.add('disabled');
    });
    codeArea.addEventListener('input', () => {
      pushUndo();
    });

    // Sidebar resize impact: observe width and update grid column
    const sidebar = document.getElementById('sidebar');
    const mainGrid = document.getElementById('mainGrid');
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        mainGrid.style.gridTemplateColumns = w + 'px 1fr';
      }
    });
    resizeObserver.observe(sidebar);

    // File menu toggling
    btnFile.addEventListener('click', (e) => {
      e.stopPropagation();
      fileMenu.style.display = (fileMenu.style.display === 'flex') ? 'none' : 'flex';
    });
    document.addEventListener('click', (e) => {
      if (fileMenu.style.display === 'flex' && !fileMenu.contains(e.target) && e.target !== btnFile) {
        fileMenu.style.display = 'none';
      }
    });

    // Explorer click
    explorer.addEventListener('click', (e) => {
      const item = e.target.closest('.tree-item');
      if (!item) return;
      openFile(item.dataset.open);
    });

    // Tabs click
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      openFile(tab.dataset.file);
    });

    // New File modal workflow (language locked after creation)
    function showNewFileModal() {
      nfName.value = '';
      nfLang.value = '';
      nfError.style.display = 'none';
      newFileModal.style.display = 'flex';
      nfName.focus();
    }
    function hideNewFileModal() {
      newFileModal.style.display = 'none';
    }
    nfCancel.addEventListener('click', hideNewFileModal);
    nfCreate.addEventListener('click', () => {
      const name = (nfName.value || '').trim();
      const lang = nfLang.value;
      if (!name || !lang) {
        nfError.style.display = 'block';
        return;
      }
      const ext = langExt[lang] || '';
      const fullName = name + ext;
      const content = templates[lang] || '';
      const file = { name, language: lang, ext, content, lockedLanguage: true };
      files.set(fullName, file);
      currentFile = { ...file };
      codeArea.textContent = content;
      renderWorkspace();
      setStatus('Created ' + fullName + ' (language locked)');
      hideNewFileModal();
      // Update run target display to show file name
      document.getElementById('optFileName').textContent = fullName;
    });

    // Hook up menu and toolbar to modal
    btnNewFile.addEventListener('click', showNewFileModal);
    fmNewFile.addEventListener('click', showNewFileModal);

    // Save logic: always [file name].[language extension], not "Program.(ext)"
    function saveToDisk(filename, text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    async function chooseFolderAndSave(filename, text) {
      // Attempt File System Access API; fallback to download
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await window.showDirectoryPicker();
          const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(text);
          await writable.close();
          setStatus('Saved to folder: ' + filename);
          return;
        } catch {
          // fallback
          saveToDisk(filename, text);
          setStatus('Saved (fallback) ' + filename);
          return;
        }
      } else {
        saveToDisk(filename, text);
        setStatus('Saved (download) ' + filename);
      }
    }

    function currentFilename() {
      const name = currentFile.name || 'Program';
      const ext = currentFile.ext || '';
      return name + ext;
    }

    // Save / Save As / Save All
    function saveCurrent(asFolder = false) {
      const key = currentFilename();
      currentFile.content = codeArea.textContent;
      files.set(key, { ...currentFile });
      if (asFolder) {
        chooseFolderAndSave(key, currentFile.content);
      } else {
        saveToDisk(key, currentFile.content);
        setStatus('Saved ' + key);
      }
    }
    function saveAll() {
      for (const [key, f] of files.entries()) {
        saveToDisk(key, f.content || '');
      }
      setStatus('Saved all files');
    }

    btnSaveFile.addEventListener('click', () => saveCurrent(false));
    btnSaveAll.addEventListener('click', saveAll);
    fmSaveProgram.addEventListener('click', () => saveCurrent(false));
    fmSaveProgramAs.addEventListener('click', () => saveCurrent(true));
    fmSaveAll.addEventListener('click', saveAll);

    // Open File (upload), Open Folder (limited fallback)
    async function openLocalFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          // infer name and ext
          const nameParts = file.name.split('.');
          const ext = nameParts.length > 1 ? '.' + nameParts.pop() : '';
          const name = nameParts.join('.') || 'Untitled';
          const f = {
            name,
            language: Object.keys(langExt).find(k => langExt[k] === ext) || null,
            ext,
            content: reader.result,
            lockedLanguage: true
          };
          files.set(file.name, f);
          currentFile = { ...f };
          codeArea.textContent = f.content || '';
          renderWorkspace();
          setStatus('Opened file ' + file.name);
        };
        reader.readAsText(file);
      };
      input.click();
    }

    async function openLocalFolder() {
      // Try FS Access API for folder; otherwise inform fallback
      if ('showDirectoryPicker' in window) {
        try {
          const dir = await window.showDirectoryPicker();
          for await (const entry of dir.values()) {
            if (entry.kind === 'file') {
              const fileHandle = entry;
              const file = await fileHandle.getFile();
              const text = await file.text();
              const nameParts = file.name.split('.');
              const ext = nameParts.length > 1 ? '.' + nameParts.pop() : '';
              const name = nameParts.join('.') || 'Untitled';
              const f = {
                name,
                language: Object.keys(langExt).find(k => langExt[k] === ext) || null,
                ext,
                content: text,
                lockedLanguage: true
              };
              files.set(file.name, f);
            }
          }
          // Open first file if any
          const firstKey = files.keys().next().value;
          if (firstKey) openFile(firstKey);
          setStatus('Folder opened');
        } catch {
          setStatus('Folder open canceled');
        }
      } else {
        setStatus('Folder open not supported; use Open File.');
      }
    }

    btnOpenFile.addEventListener('click', openLocalFile);
    fmOpenFile.addEventListener('click', openLocalFile);
    fmOpenFolder.addEventListener('click', openLocalFolder);

    // New Project / Repository / From Existing (mock behaviors)
    fmNewProject.addEventListener('click', () => setStatus('New Project (mock) created'));
    fmNewRepository.addEventListener('click', () => setStatus('New Repository (mock) initialized'));
    fmNewFromExisting.addEventListener('click', () => setStatus('Import project from existing sources (mock)'));

    // Add New/Existing Project (mock)
    fmAddNewProj.addEventListener('click', () => setStatus('Added New Project (mock)'));
    fmAddExistingProj.addEventListener('click', () => setStatus('Added Existing Project (mock)'));

    // Close / Close Solution (mock)
    fmClose.addEventListener('click', () => setStatus('Closed current window (mock)'));
    fmCloseSolution.addEventListener('click', () => setStatus('Closed solution (mock)'));

    // Clone Repository (mock)
    fmCloneRepo.addEventListener('click', () => setStatus('Clone Repository (mock)'));

    // Open Window same as toolbar
    fmOpenWindow.addEventListener('click', () => setStatus('Opening new window (mock)'));
    btnOpenWindow.addEventListener('click', () => setStatus('Opening new window (mock)'));

    // Page Settings, Recent lists (mock)
    fmPageSettings.addEventListener('click', () => setStatus('Page Settings (mock)'));
    fmRecentFiles.addEventListener('click', () => setStatus('Recent Files (mock)'));
    fmRecentSolutions.addEventListener('click', () => setStatus('Recent Projects and Solutions (mock)'));

    // Spell-check toggle (mock)
    let spellOn = false;
    btnSpell.addEventListener('click', () => {
      spellOn = !spellOn;
      setStatus('Spell-check ' + (spellOn ? 'enabled' : 'disabled'));
    });

    // Quick info (mock)
    btnQuickInfo.addEventListener('click', () => {
      setStatus('Quick info displayed (mock)');
    });

    // Comment / Uncomment selected lines (basic)
    function commentSelection() {
      const text = codeArea.textContent;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      // naive: comment entire document if selection is collapsed
      const commented = text.split('\n').map(line => '// ' + line).join('\n');
      codeArea.textContent = commented;
      updateCursor();
      setStatus('Selected lines commented');
    }
    function uncommentSelection() {
      const text = codeArea.textContent;
      const uncommented = text.split('\n').map(line => line.startsWith('// ') ? line.slice(3) : line).join('\n');
      codeArea.textContent = uncommented;
      updateCursor();
      setStatus('Selected lines uncommented');
    }
    btnCommentLines.addEventListener('click', commentSelection);
    btnUncommentLines.addEventListener('click', uncommentSelection);

    // Switch tab (mock)
    btnSwitchTab.addEventListener('click', () => {
      const keys = Array.from(files.keys());
      if (keys.length < 2) return;
      const idx = keys.indexOf(currentFilename());
      const nextKey = keys[(idx + 1) % keys.length];
      openFile(nextKey);
      setStatus('Switched tab');
    });

    // Run actions (mock)
    function printToTerminal(text) {
      const div = document.createElement('div');
      div.textContent = text;
      terminalBody.appendChild(div);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    function runCommand(cmd) {
      printToTerminal(`$ ${cmd}`);
      if (cmd === 'node -v') printToTerminal('v18.19.0');
      else if (cmd === 'python -V') printToTerminal('Python 3.11.0');
      else if (cmd === 'javac -version') printToTerminal('javac 17.0.9');
      else if (cmd.startsWith('echo ')) printToTerminal(cmd.slice(5));
      else printToTerminal('Command not found.');
    }
    termRun.addEventListener('click', () => {
      const cmd = termInput.value.trim();
      if (!cmd) return;
      runCommand(cmd);
      termInput.value = '';
    });
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') termRun.click();
    });

    btnRun.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run ' + target);
      printToTerminal('Executing ' + currentFilename() + ' (' + (currentFile.language || 'Unknown') + ')');
      setStatus('Running ' + target);
    });
    btnRunNoDebug.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run-no-debug ' + target);
      printToTerminal('Executing without debugger: ' + currentFilename());
      setStatus('Run without debugging');
    });

    // File menu main actions hooking
    fmOpenFile.addEventListener('click', openLocalFile);
    fmOpenProject.addEventListener('click', () => setStatus('Open Project (mock)'));
    fmOpenFolder.addEventListener('click', openLocalFolder);

    // Save buttons in toolbar already wired
    // Explorer extra buttons
    document.getElementById('sdNew').addEventListener('click', showNewFileModal);
    document.getElementById('sdRefresh').addEventListener('click', () => setStatus('Explorer refreshed'));

    // Initialize UI
    renderWorkspace();
    setStatus('Ready');
  </script>
</body>
</html>
