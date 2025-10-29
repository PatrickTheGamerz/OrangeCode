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

      /* Syntax colors (Dark+ style-ish) */
      --cs-keyword: #569cd6;
      --cs-type: #4ec9b0;
      --cs-string: #ce9178;
      --cs-number: #b5cea8;
      --cs-method: #dcdcaa;
      --cs-namespace: #9cdcfe;
      --cs-comment: #6a9955;
      --cs-attr: #c586c0;
      --ghost: rgba(207,232,255,0.35);
      --ghost-border: rgba(14,99,156,0.35);
      --error: #ff6b6b;
      --warn: #e5c07b;
      --info: #8ab4f8;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
      overflow: auto; /* page is scrollable */
      user-select: none; /* UI non-copiable by default */
    }
    /* Only code area should be copyable/editable */
    .code-area, .code-area * { user-select: text; }

    .workspace {
      display: grid;
      grid-template-rows: 32px auto 1fr 24px; /* titlebar, toolbar, main, status */
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

    /* File menu aligned directly under File button */
    .file-menu {
      position: absolute;
      left: 8px; /* same X as File button padding */
      top: 32px; /* exactly below titlebar */
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
    .file-menu .item.has-sub::after { content: "▸"; color: var(--muted); margin-left: 8px; }
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

    /* Toolbar placed in same Y line block right under File */
    .toolbar {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;            /* ensure single row alignment */
      align-items: center;      /* same Y for all buttons */
      gap: 8px;
      padding: 4px 8px;         /* placed directly below titlebar */
      position: sticky;
      top: 32px;                /* sticks under titlebar when scrolling */
      z-index: 900;
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
    .filename { font-size: 12px; color: var(--muted); user-select: none; }

    /* Main: resizable sidebar + editor */
    .main {
      display: grid;
      grid-template-columns: 300px 1fr; /* sidebar default */
      min-height: 0;
    }
    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      resize: horizontal; /* freely resizable */
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
      position: sticky;
      top: 0;
      background: var(--sidebar);
      z-index: 2;
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
      position: sticky;
      top: calc(32px + 32px); /* under title + toolbar when scrolling */
      z-index: 800;
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
      grid-template-rows: 40px auto auto; /* editor-toolbar, code-area, output */
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
      position: sticky;
      top: calc(32px + 32px + 36px); /* title + toolbar + tabs */
      z-index: 700;
    }
    .info { font-size: 12px; color: var(--muted); user-select: none; }

    /* Code area: editable + copyable + syntax highlighting */
    .code-area {
      position: relative;
      overflow: auto;
      padding: 12px 16px 60px; /* extra bottom space before output */
      line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px;
      outline: none;
      white-space: pre-wrap; /* allow wrapping but keep newlines */
      word-break: break-word;
    }
    .token.kw { color: var(--cs-keyword); }
    .token.type { color: var(--cs-type); }
    .token.str { color: var(--cs-string); }
    .token.num { color: var(--cs-number); }
    .token.ns { color: var(--cs-namespace); }
    .token.method { color: var(--cs-method); }
    .token.attr { color: var(--cs-attr); }
    .token.comment { color: var(--cs-comment); }

    /* Ghost completion */
    .ghost {
      position: absolute;
      pointer-events: none;
      color: var(--ghost);
    }
    .ghost-box {
      position: absolute;
      border: 1px dashed var(--ghost-border);
      border-radius: 4px;
      padding: 2px 4px;
      background: transparent;
      color: var(--ghost);
      font-size: 12px;
    }

    /* Output terminal — freely resizable up or down */
    .output-container {
      display: grid;
      grid-template-rows: 28px 1fr 32px;
      border-top: 1px solid var(--border);
      background: var(--terminal-bg);
      resize: vertical;     /* drag handle bottom edge */
      overflow: auto;
      min-height: 140px;
      max-height: 75vh;
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
      white-space: pre-wrap;
    }
    .output-line.error { color: var(--error); }
    .output-line.warn { color: var(--warn); }
    .output-line.info { color: var(--info); }

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
      position: sticky;
      bottom: 0;
      z-index: 1000;
    }
    .statusbar .cell { cursor: default; }
    .statusbar .cell.interactive { cursor: pointer; }
    .statusbar .cell.interactive:hover { color: #e0e0e0; }

    /* Modal: New File (language lock) */
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
      width: 460px;
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
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .danger { color: var(--error); }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Title bar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <span class="brand" id="brandText">Mini Studio — Program</span>
    </div>

    <!-- Toolbar: aligned under File, same Y for buttons -->
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

    <!-- File menu (hover submenus) -->
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

          <!-- Code editor -->
          <div class="code-area" id="codeArea" contenteditable="true">
// Type ANYTHING here. Create a New File to lock language and load templates.
// This editor has syntax coloring, ghost completions, and simple error hints.
          </div>

          <!-- Output terminal -->
          <div class="output-container" id="output">
            <div class="output-header">
              <span>Output</span>
              <span style="margin-left:auto;">bash • Press Enter to run</span>
            </div>
            <div class="output-body" id="terminalBody">$ echo "welcome"
welcome</div>
            <div class="output-input">
              <div class="prompt">❯</div>
              <input class="term-field" id="termInput" placeholder="Type a command, e.g., dotnet --info" />
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
    /* Elements */
    const btnFile = document.getElementById('btnFile');
    const fileMenu = document.getElementById('fileMenu');
    const statusMsg = document.getElementById('statusMsg');
    const statusTail = document.getElementById('statusTail');
    const brandText = document.getElementById('brandText');

    const explorer = document.getElementById('explorer');
    const tabs = document.getElementById('tabs');
    const codeArea = document.getElementById('codeArea');
    const cursorCell = document.getElementById('cursorCell');

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

    /* File menu items */
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

    /* Modal elements */
    const newFileModal = document.getElementById('newFileModal');
    const nfName = document.getElementById('nfName');
    const nfLang = document.getElementById('nfLang');
    const nfCreate = document.getElementById('nfCreate');
    const nfCancel = document.getElementById('nfCancel');
    const nfError = document.getElementById('nfError');
    const languageNameEl = document.getElementById('languageName');

    /* File model */
    let currentFile = {
      name: 'Program',
      language: null,
      ext: '',
      content: codeArea.textContent,
      lockedLanguage: false
    };
    const files = new Map(); // key: filename.ext
    files.set('Program', { ...currentFile });

    /* Language extensions */
    const langExt = {
      'JAVA': '.java',
      'CPP': '.cpp',
      'CS': '.cs',
      'HTML': '.html',
      'PYTHON': '.py'
    };

    /* Language templates (richer C# templates to handle Console.ReadLine, async, LINQ) */
    const templates = {
      'JAVA': `public class Program {
  public static void main(String[] args) throws java.io.IOException {
    System.out.println("Hello, Java!");
  }
}
`,
      'CPP': `#include <iostream>
#include <string>
using namespace std;

int main() {
  cout << "Hello, C++!" << endl;
  string name;
  cout << "Name: ";
  getline(cin, name);
  cout << "Nice to meet you, " << name << "!" << endl;
  return 0;
}
`,
      'CS': `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Demo {
  class Program {
    static async Task Main() {
      Console.WriteLine("Hello, what's your name?");
      var name = Console.ReadLine();
      Console.WriteLine($"Nice to meet you, {name}!");

      var nums = Enumerable.Range(1, 5).Select(n => n * n).ToList();
      await Task.Delay(200);
      Console.WriteLine(string.Join(", ", nums));
    }
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
      'PYTHON': `import asyncio

async def main():
    name = input("Hello, what's your name? ")
    print(f"Nice to meet you, {name}!")
    await asyncio.sleep(0.2)
    nums = [n*n for n in range(1,6)]
    print(", ".join(map(str, nums)))

if __name__ == "__main__":
    asyncio.run(main())
`
    };

    /* Syntax highlighting (basic tokenization for C#, minimal for others) */
    function highlight(text, lang) {
      if (lang === 'CS') {
        const escape = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
        // comments
        text = text.replace(/\/\/.*$/gm, m => `<span class="token comment">${escape(m)}</span>`);
        // strings (including interpolated)
        text = text.replace(/(\$?@"[^"]*"|@"[^"]*"|\$"[^"]*"|"[^"\\]

*(?:\\.[^"\\]

*)*")/g,
          m => `<span class="token str">${escape(m)}</span>`);
        // attributes
        text = text.replace(/^\s*

\[([A-Za-z_][\w.]*)\]

/gm,
          (_, a) => `[<span class="token attr">${escape(a)}</span>]`);
        // keywords
        const kw = ['using','namespace','class','interface','struct','public','private','protected','internal','static','async','await','return','new','var','void','int','string','bool','Guid','Task'];
        const kwRe = new RegExp(`\\b(${kw.join('|')})\\b`, 'g');
        text = text.replace(kwRe, m => `<span class="token kw">${m}</span>`);
        // methods common
        const meth = ['Console','WriteLine','ReadLine','Select','ToList','Range','Delay','Join','Any','Enqueue','Dequeue','Main','RunAllAsync','ExecuteAsync'];
        const methRe = new RegExp(`\\b(${meth.join('|')})\\b`, 'g');
        text = text.replace(methRe, m => `<span class="token method">${m}</span>`);
        // numbers
        text = text.replace(/\b\d+\b/g, m => `<span class="token num">${m}</span>`);
        // namespaces
        text = text.replace(/\b(System|System\.[A-Za-z\.]+)\b/g, m => `<span class="token ns">${m}</span>`);
        return text;
      }
      if (lang === 'HTML') {
        const escape = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
        return escape(text); // keep simple
      }
      if (lang === 'PYTHON' || lang === 'JAVA' || lang === 'CPP') {
        const escape = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
        // simple strings and comments
        let out = text.replace(/#.*$/gm, m => `<span class="token comment">${escape(m)}</span>`);
        out = out.replace(/\/\/.*$/gm, m => `<span class="token comment">${escape(m)}</span>`);
        out = out.replace(/"[^"]*"|'[^']*'/g, m => `<span class="token str">${escape(m)}</span>`);
        out = out.replace(/\b\d+\b/g, m => `<span class="token num">${m}</span>`);
        return out;
      }
      return text;
    }

    /* Ghost completion for C#: suggest common identifiers by prefix */
    const csDictionary = [
      'Console','Console.WriteLine','Console.ReadLine','IAsyncEnumerable','CancellationToken','Task','Guid','Enumerable','Range','Select','ToList','Any'
    ];
    let ghostActive = null;

    function suggestGhost(prefix, caretRect, lineLeft) {
      const suggests = csDictionary.filter(x => x.toLowerCase().startsWith(prefix.toLowerCase()) && x.toLowerCase() !== prefix.toLowerCase());
      if (suggests.length === 0) { hideGhost(); return; }
      const best = suggests[0];
      const suggestion = best.slice(prefix.length);
      showGhost(suggestion, caretRect, lineLeft);
    }

    function showGhost(suffix, caretRect, lineLeft) {
      hideGhost();
      const g = document.createElement('div');
      g.className = 'ghost';
      g.style.left = (caretRect.left - lineLeft) + 'px';
      g.style.top = caretRect.top + 'px';
      g.textContent = suffix;
      codeArea.appendChild(g);
      ghostActive = { node: g, suffix };
    }
    function hideGhost() {
      if (ghostActive && ghostActive.node) {
        ghostActive.node.remove();
      }
      ghostActive = null;
    }

    function getCaretClientRect() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      const range = sel.getRangeAt(0).cloneRange();
      if (range.collapsed) {
        const span = document.createElement('span');
        span.appendChild(document.createTextNode('\u200b'));
        range.insertNode(span);
        const rect = span.getBoundingClientRect();
        span.parentNode.removeChild(span);
        return rect;
      } else {
        return range.getBoundingClientRect();
      }
    }

    function getLineLeft() {
      const rect = codeArea.getBoundingClientRect();
      return rect.left;
    }

    /* Error hints (mock parser for a few C# issues) */
    function analyzeCS(text) {
      const lines = text.split('\n');
      const issues = [];
      lines.forEach((line, idx) => {
        if (/\bconsole2\b/i.test(line)) {
          issues.push({
            level: 'error',
            code: 'CS0246',
            desc: "The type or namespace name 'console2' could not be found (are you missing a using directive or an assembly reference?)",
            file: currentFilename(),
            line: idx + 1
          });
        }
        if (/DllImportAttribute/.test(line)) {
          issues.push({
            level: 'info',
            code: 'IL0001',
            desc: "Mark the 'mouse_event' method with the 'LibraryImportAttribute' instead of the 'DllImportAttribute' to generate P/Invoke stub code at compile time.",
            file: currentFilename(),
            line: idx + 1
          });
        }
      });
      return issues;
    }

    function renderIssues(issues) {
      issues.forEach(it => {
        const div = document.createElement('div');
        div.className = 'output-line ' + (it.level === 'error' ? 'error' : it.level === 'warn' ? 'warn' : 'info');
        div.textContent =
          `${it.level.toUpperCase()} ${it.code} ${it.desc} — ${it.file} (Line ${it.line})`;
        terminalBody.appendChild(div);
      });
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    /* Status updates */
    function setStatus(msg) {
      statusMsg.textContent = msg;
      statusTail.textContent = msg;
    }

    /* Workspace rendering */
    function renderWorkspace() {
      explorer.innerHTML = '';
      tabs.innerHTML = '';
      for (const [key] of files.entries()) {
        const item = document.createElement('div');
        item.className = 'tree-item' + (key === currentFilename() ? ' active' : '');
        item.dataset.open = key;
        item.textContent = key;
        explorer.appendChild(item);

        const tab = document.createElement('div');
        tab.className = 'tab' + (key === currentFilename() ? ' active' : '');
        tab.dataset.file = key;
        tab.textContent = key;
        tabs.appendChild(tab);
      }
      const fullName = currentFilename();
      fileDisplay.textContent = fullName;
      optFileName.textContent = fullName;
      brandText.textContent = 'Mini Studio — ' + fullName;
      languageNameEl.textContent = currentFile.language ? currentFile.language : 'None';
    }

    function currentFilename() {
      const name = currentFile.name || 'Program';
      const ext = currentFile.ext || '';
      return name + ext;
    }

    /* Open file */
    function openFile(key) {
      const f = files.get(key);
      if (!f) return;
      currentFile = { ...f };
      codeArea.textContent = currentFile.content || '';
      applyHighlight();
      renderWorkspace();
      setStatus('Opened ' + key);
    }

    explorer.addEventListener('click', (e) => {
      const item = e.target.closest('.tree-item');
      if (!item) return;
      openFile(item.dataset.open);
    });
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      openFile(tab.dataset.file);
    });

    /* File menu toggle + close when clicking outside */
    btnFile.addEventListener('click', (e) => {
      e.stopPropagation();
      fileMenu.style.display = (fileMenu.style.display === 'flex') ? 'none' : 'flex';
    });
    document.addEventListener('click', (e) => {
      if (fileMenu.style.display === 'flex' && !fileMenu.contains(e.target) && e.target !== btnFile) {
        fileMenu.style.display = 'none';
      }
    });

    /* Sidebar resize affects grid */
    const sidebar = document.getElementById('sidebar');
    const mainGrid = document.getElementById('mainGrid');
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        mainGrid.style.gridTemplateColumns = w + 'px 1fr';
      }
    });
    resizeObserver.observe(sidebar);

    /* New file modal: language locked after creation */
    function showNewFileModal() {
      nfName.value = '';
      nfLang.value = '';
      nfError.style.display = 'none';
      newFileModal.style.display = 'flex';
      nfName.focus();
    }
    function hideNewFileModal() { newFileModal.style.display = 'none'; }
    document.getElementById('sdNew').addEventListener('click', showNewFileModal);
    btnNewFile.addEventListener('click', showNewFileModal);
    fmNewFile.addEventListener('click', showNewFileModal);
    nfCancel.addEventListener('click', hideNewFileModal);
    nfCreate.addEventListener('click', () => {
      const name = (nfName.value || '').trim();
      const lang = nfLang.value;
      if (!name || !lang) { nfError.style.display = 'block'; return; }
      const ext = langExt[lang] || '';
      const fullName = name + ext;
      const content = templates[lang] || '';
      const file = { name, language: lang, ext, content, lockedLanguage: true };
      files.set(fullName, file);
      currentFile = { ...file };
      codeArea.textContent = content;
      applyHighlight();
      renderWorkspace();
      setStatus('Created ' + fullName + ' (language locked)');
      hideNewFileModal();
    });

    /* Save logic: always [file name].[lang ext] */
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
          saveToDisk(filename, text);
          setStatus('Saved (fallback) ' + filename);
          return;
        }
      } else {
        saveToDisk(filename, text);
        setStatus('Saved (download) ' + filename);
      }
    }
    function saveCurrent(asFolder = false) {
      const key = currentFilename();
      currentFile.content = codeArea.textContent;
      files.set(key, { ...currentFile });
      if (asFolder) { chooseFolderAndSave(key, currentFile.content); }
      else { saveToDisk(key, currentFile.content); setStatus('Saved ' + key); }
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

    /* Open file / folder */
    async function openLocalFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const nameParts = file.name.split('.');
          const ext = nameParts.length > 1 ? '.' + nameParts.pop() : '';
          const name = nameParts.join('.') || 'Untitled';
          const lang = Object.keys(langExt).find(k => langExt[k] === ext) || null;
          const f = { name, language: lang, ext, content: reader.result, lockedLanguage: true };
          files.set(file.name, f);
          currentFile = { ...f };
          codeArea.textContent = f.content || '';
          applyHighlight();
          renderWorkspace();
          setStatus('Opened file ' + file.name);
        };
        reader.readAsText(file);
      };
      input.click();
    }
    async function openLocalFolder() {
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
              const lang = Object.keys(langExt).find(k => langExt[k] === ext) || null;
              const f = { name, language: lang, ext, content: text, lockedLanguage: true };
              files.set(file.name, f);
            }
          }
          const firstKey = files.keys().next().value;
          if (firstKey) openFile(firstKey);
          setStatus('Folder opened');
        } catch { setStatus('Folder open canceled'); }
      } else { setStatus('Folder open not supported; use Open File.'); }
    }
    btnOpenFile.addEventListener('click', openLocalFile);
    fmOpenFile.addEventListener('click', openLocalFile);
    fmOpenFolder.addEventListener('click', openLocalFolder);

    /* Misc menu */
    fmNewProject.addEventListener('click', () => setStatus('New Project (mock) created'));
    fmNewRepository.addEventListener('click', () => setStatus('New Repository (mock) initialized'));
    fmNewFromExisting.addEventListener('click', () => setStatus('Import project from existing sources (mock)'));
    fmAddNewProj.addEventListener('click', () => setStatus('Added New Project (mock)'));
    fmAddExistingProj.addEventListener('click', () => setStatus('Added Existing Project (mock)'));
    fmClose.addEventListener('click', () => setStatus('Closed current window (mock)'));
    fmCloseSolution.addEventListener('click', () => setStatus('Closed solution (mock)'));
    fmCloneRepo.addEventListener('click', () => setStatus('Clone Repository (mock)'));
    fmOpenWindow.addEventListener('click', () => setStatus('Opening new window (mock)'));
    document.getElementById('sdRefresh').addEventListener('click', () => setStatus('Explorer refreshed'));
    fmPageSettings.addEventListener('click', () => setStatus('Page Settings (mock)'));
    fmRecentFiles.addEventListener('click', () => setStatus('Recent Files (mock)'));
    fmRecentSolutions.addEventListener('click', () => setStatus('Recent Projects and Solutions (mock)'));

    /* Spell check, quick info (mock) */
    let spellOn = false;
    btnSpell.addEventListener('click', () => { spellOn = !spellOn; setStatus('Spell-check ' + (spellOn ? 'enabled' : 'disabled')); });
    btnQuickInfo.addEventListener('click', () => { setStatus('Quick info displayed (mock)'); });

    /* Comment / Uncomment lines (basic) */
    function commentSelection() {
      const text = codeArea.textContent;
      const commented = text.split('\n').map(line => '// ' + line).join('\n');
      codeArea.textContent = commented;
      applyHighlight();
      updateCursor();
      setStatus('Selected lines commented');
    }
    function uncommentSelection() {
      const text = codeArea.textContent;
      const uncommented = text.split('\n').map(line => line.startsWith('// ') ? line.slice(3) : line).join('\n');
      codeArea.textContent = uncommented;
      applyHighlight();
      updateCursor();
      setStatus('Selected lines uncommented');
    }
    btnCommentLines.addEventListener('click', commentSelection);
    btnUncommentLines.addEventListener('click', uncommentSelection);

    /* Switch tab (mock) */
    btnSwitchTab.addEventListener('click', () => {
      const keys = Array.from(files.keys());
      if (keys.length < 2) return;
      const idx = keys.indexOf(currentFilename());
      const nextKey = keys[(idx + 1) % keys.length];
      openFile(nextKey);
      setStatus('Switched tab');
    });

    /* Terminal commands mock */
    function printToTerminal(text, cls) {
      const div = document.createElement('div');
      div.className = 'output-line' + (cls ? ' ' + cls : '');
      div.textContent = text;
      terminalBody.appendChild(div);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    function runCommand(cmd) {
      printToTerminal(`$ ${cmd}`);
      if (cmd === 'node -v') printToTerminal('v18.19.0');
      else if (cmd === 'python -V') printToTerminal('Python 3.11.0');
      else if (cmd === 'javac -version') printToTerminal('javac 17.0.9');
      else if (cmd === 'dotnet --info') printToTerminal('.NET SDK info (mock)');
      else if (cmd.startsWith('echo ')) printToTerminal(cmd.slice(5));
      else printToTerminal('Command not found.');
    }
    termRun.addEventListener('click', () => {
      const cmd = termInput.value.trim();
      if (!cmd) return;
      runCommand(cmd);
      termInput.value = '';
    });
    termInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') termRun.click(); });

    /* Run actions (mock execute + show issues for C#) */
    btnRun.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run ' + target, 'info');
      printToTerminal('Executing ' + currentFilename() + ' (' + (currentFile.language || 'Unknown') + ')', 'info');
      if (currentFile.language === 'CS') {
        renderIssues(analyzeCS(codeArea.textContent));
      }
      setStatus('Running ' + target);
    });
    btnRunNoDebug.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run-no-debug ' + target, 'info');
      printToTerminal('Executing without debugger: ' + currentFilename(), 'info');
      if (currentFile.language === 'CS') {
        renderIssues(analyzeCS(codeArea.textContent));
      }
      setStatus('Run without debugging');
    });

    /* Cursor position + undo/redo */
    function updateCursor() {
      const sel = window.getSelection();
      let line = 1, col = 1;
      if (sel && sel.anchorNode) {
        const idx = getCaretIndex(codeArea);
        const text = codeArea.textContent;
        const upTo = text.slice(0, idx);
        line = (upTo.match(/\n/g) || []).length + 1;
        const lastNL = upTo.lastIndexOf('\n');
        col = upTo.length - (lastNL + 1) + 1;
      }
      cursorCell.textContent = 'Ln ' + line + ', Col ' + col;
      currentFile.content = codeArea.textContent;
      files.set(currentFilename(), { ...currentFile });
      enableUndoRedo();
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
    const undoStack = [];
    const redoStack = [];
    function pushUndo() { undoStack.push(codeArea.textContent); btnUndo.classList.remove('disabled'); }
    function enableUndoRedo() {
      if (undoStack.length > 0) btnUndo.classList.remove('disabled'); else btnUndo.classList.add('disabled');
      if (redoStack.length > 0) btnRedo.classList.remove('disabled'); else btnRedo.classList.add('disabled');
    }
    btnUndo.addEventListener('click', () => {
      if (undoStack.length === 0) return;
      redoStack.push(codeArea.textContent);
      const prev = undoStack.pop();
      codeArea.textContent = prev;
      applyHighlight();
      updateCursor();
    });
    btnRedo.addEventListener('click', () => {
      if (redoStack.length === 0) return;
      undoStack.push(codeArea.textContent);
      const next = redoStack.pop();
      codeArea.textContent = next;
      applyHighlight();
      updateCursor();
    });
    codeArea.addEventListener('input', () => { pushUndo(); applyHighlight(); autoCaseFix(); triggerGhost(); });

    /* Auto-case fix: "console" -> "Console" (C#) */
    function autoCaseFix() {
      if (currentFile.language !== 'CS') return;
      const text = codeArea.textContent;
      const fixed = text.replace(/\bconsole\b/g, 'Console');
      if (fixed !== text) {
        const idx = getCaretIndex(codeArea);
        codeArea.textContent = fixed;
        applyHighlight();
        // restore caret approximately
        placeCaret(codeArea, Math.min(idx + ('Console'.length - 'console'.length), fixed.length));
      }
    }
    function placeCaret(el, idx) {
      const range = document.createRange();
      const sel = window.getSelection();
      let count = 0, nodeStack = [el], node, lastText = null;
      while (nodeStack.length) {
        node = nodeStack.pop();
        if (node.nodeType === 3) {
          const nextCount = count + node.length;
          if (idx <= nextCount) {
            range.setStart(node, idx - count);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          count = nextCount;
          lastText = node;
        } else {
          let i = node.childNodes.length;
          while (i--) nodeStack.push(node.childNodes[i]);
        }
      }
      if (lastText) {
        range.setStart(lastText, lastText.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    /* Ghost completion trigger on typing */
    function triggerGhost() {
      hideGhost();
      if (currentFile.language !== 'CS') return;
      const idx = getCaretIndex(codeArea);
      const text = codeArea.textContent;
      const upTo = text.slice(0, idx);
      const match = upTo.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
      if (!match) return;
      const prefix = match[1];
      const rect = getCaretClientRect();
      if (!rect) return;
      suggestGhost(prefix, rect, getLineLeft());
    }
    codeArea.addEventListener('keyup', () => { updateCursor(); triggerGhost(); });
    codeArea.addEventListener('click', () => { updateCursor(); triggerGhost(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && ghostActive) {
        e.preventDefault();
        // Accept ghost suffix
        const idx = getCaretIndex(codeArea);
        const text = codeArea.textContent;
        const upTo = text.slice(0, idx);
        const after = text.slice(idx);
        const match = upTo.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
        if (!match) return;
        const accepted = upTo + ghostActive.suffix + after;
        codeArea.textContent = accepted;
        applyHighlight();
        placeCaret(codeArea, (upTo + ghostActive.suffix).length);
        hideGhost();
      }
    });

    /* Apply syntax highlight by replacing content with spans (keep editable by using textContent for source of truth) */
    function applyHighlight() {
      // We re-render by setting innerHTML of codeArea using highlighted version of textContent.
      // This resets selection; we restore cursor after where possible (handled in other calls where needed).
      const text = codeArea.textContent;
      const lang = currentFile.language;
      const html = highlight(text, lang);
      // Preserve editability: replace with HTML but keep plain text basis by setting innerHTML
      codeArea.innerHTML = html.replace(/\n/g, '<br/>');
    }

    /* Initialize */
    renderWorkspace();
    setStatus('Ready');
    applyHighlight();

    /* Hook toolbar run/open/save duplication with menu */
    btnOpenFile.addEventListener('click', openLocalFile);
    btnSaveFile.addEventListener('click', () => saveCurrent(false));

    /* Done */
  </script>
</body>
</html>
