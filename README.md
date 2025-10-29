<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mini Studio — Working Build</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #0f1115;
      --panel: #161a22;
      --panel-2: #1a1f29;
      --sidebar: #141923;
      --border: #2a3342;
      --text: #cbd5e1;
      --muted: #8a93a5;
      --hover: #202635;
      --accent: #3b82f6;
      --accent-2: #22d3ee;
      --active: #0b5ed7;
      --editor-bg: #0f1115;
      --terminal-bg: #0c0f14;
      --status-bg: #0c0f14;

      --error: #ef4444;
      --warn: #eab308;
      --info: #60a5fa;

      /* Syntax */
      --kw: #569cd6;
      --type: #4ec9b0;
      --str: #ce9178;
      --num: #b5cea8;
      --method: #dcdcaa;
      --ns: #9cdcfe;
      --comment: #6a9955;
      --attr: #c586c0;
      --ghost: rgba(96, 165, 250, 0.35);
      --ghost-border: rgba(34, 211, 238, 0.35);
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
      overflow: auto; /* page scrollable */
      user-select: none; /* UI non-copiable */
    }
    /* Only the editor text is copyable/editable */
    .code-area, .code-area * { user-select: text; }

    .workspace {
      display: grid;
      grid-template-rows: 40px auto 1fr 28px;
      min-height: 100vh;
    }

    /* Titlebar */
    .titlebar {
      height: 40px;
      background: linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .tb-btn {
      font-size: 12px;
      padding: 6px 10px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      border-radius: 6px;
    }
    .tb-btn:hover { background: var(--hover); }
    .brand { margin-left: auto; font-size: 12px; color: var(--muted); }

    /* File menu exactly under File */
    .file-menu {
      position: absolute;
      left: 12px; /* aligns with titlebar padding */
      top: 40px; /* directly under titlebar */
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 10px;
      min-width: 280px;
      display: none;
      flex-direction: column;
      padding: 6px 0;
      z-index: 1001;
      box-shadow: 0 12px 28px rgba(0,0,0,0.35);
    }
    .file-menu .item {
      position: relative;
      padding: 8px 14px;
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
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 10px;
      min-width: 260px;
      display: none;
      flex-direction: column;
      padding: 6px 0;
      z-index: 1100;
      box-shadow: 0 12px 28px rgba(0,0,0,0.35);
    }
    .item.has-sub:hover .submenu { display: flex; }
    .divider { height: 1px; background: var(--border); margin: 6px 0; }

    /* Toolbar (directly under titlebar, aligned single Y row) */
    .toolbar {
      background: linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      position: sticky;
      top: 40px;
      z-index: 900;
    }
    .btn {
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      color: var(--text);
      background: #121722;
      border: 1px solid var(--border);
      cursor: pointer;
    }
    .btn:hover { background: var(--hover); }
    .btn.primary { border-color: var(--accent); color: #cfe8ff; }
    .btn.disabled { opacity: 0.45; cursor: default; }
    .select {
      height: 30px;
      background: #121722;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 2px 8px;
      cursor: pointer;
    }
    .filename { font-size: 12px; color: var(--muted); user-select: none; }

    /* Main layout */
    .main {
      display: grid;
      grid-template-columns: 320px 1fr;
      min-height: 0;
      gap: 12px;
      padding: 12px;
    }

    /* Sidebar (resizable) */
    .sidebar {
      background: var(--sidebar);
      border: 1px solid var(--border);
      border-radius: 12px;
      resize: horizontal;
      overflow: auto;
      min-width: 180px;
      max-width: 720px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }
    .sidebar-header {
      padding: 10px 12px;
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
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    .sd-actions { display: flex; gap: 6px; }
    .sd-btn {
      font-size: 12px;
      padding: 4px 8px;
      color: var(--text);
      border: 1px solid var(--border);
      background: #101521;
      border-radius: 6px;
      cursor: pointer;
    }
    .sd-btn:hover { background: var(--hover); }
    .sidebar-content { padding: 6px 8px; }
    .tree-item {
      padding: 8px 10px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 6px;
    }
    .tree-item:hover { background: var(--hover); }
    .tree-item.active { background: #182235; }

    /* Editor area */
    .editor-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      display: grid;
      grid-template-rows: 40px auto auto;
      min-height: 0;
    }
    .tabs {
      background: var(--panel-2);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    .tab {
      background: #182235;
      color: var(--text);
      border: 1px solid var(--border);
      height: 28px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 8px 8px 0 0;
    }
    .tab.active { background: #1e2a41; color: #fff; border-color: var(--accent); }

    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
      background: var(--panel-2);
      position: sticky;
      top: calc(40px + 40px + 0px); /* title+toolbar (sticky), tabs are inside card */
      z-index: 10;
      border-top: 1px solid var(--border);
    }
    .info { font-size: 12px; color: var(--muted); user-select: none; }

    .code-area {
      position: relative;
      overflow: auto;
      padding: 14px 16px 80px;
      line-height: 1.6;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13.5px;
      outline: none;
      white-space: pre-wrap;
      word-break: break-word;
      background: var(--editor-bg);
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    .token.kw { color: var(--kw); }
    .token.type { color: var(--type); }
    .token.str { color: var(--str); }
    .token.num { color: var(--num); }
    .token.method { color: var(--method); }
    .token.ns { color: var(--ns); }
    .token.comment { color: var(--comment); }
    .token.attr { color: var(--attr); }

    .ghost { position: absolute; pointer-events: none; color: var(--ghost); }

    /* Output (resizable) */
    .output-container {
      margin-top: 10px;
      display: grid;
      grid-template-rows: 32px 1fr 38px;
      border-top: 1px solid var(--border);
      background: var(--terminal-bg);
      resize: vertical;
      overflow: auto;
      min-height: 160px;
      max-height: 75vh;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    .output-header {
      padding: 6px 10px;
      font-size: 12px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none;
    }
    .output-body {
      padding: 10px;
      overflow: auto;
      font-family: Menlo, Consolas, monospace;
      font-size: 12.5px;
      white-space: pre-wrap;
    }
    .output-line.error { color: var(--error); }
    .output-line.warn { color: var(--warn); }
    .output-line.info { color: var(--info); }

    .output-input {
      display: grid;
      grid-template-columns: 36px 1fr 100px;
      gap: 6px;
      border-top: 1px solid var(--border);
      padding: 6px 10px;
      align-items: center;
    }
    .prompt { color: var(--accent-2); text-align: center; user-select: none; }
    .term-field {
      width: 100%;
      background: #11151f;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 8px;
      padding: 8px 10px;
      outline: none;
    }
    .term-run {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
      font-size: 12px;
      user-select: none;
    }
    .term-run:hover { filter: brightness(1.1); }

    /* Status bar */
    .statusbar {
      height: 28px;
      background: var(--status-bg);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 14px;
      font-size: 12px;
      color: var(--muted);
      user-select: none;
      position: sticky;
      bottom: 0;
      z-index: 1000;
    }
    .statusbar .cell { cursor: default; }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Titlebar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <span class="brand" id="brandText">Mini Studio — Program</span>
    </div>

    <!-- Toolbar -->
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
      <button class="btn" id="btnSpell">🔤 Spell-check</button>
      <button class="btn" id="btnQuickInfo">💡 Quick info</button>
      <button class="btn" id="btnCommentLines">// Comment</button>
      <button class="btn" id="btnUncommentLines">␡ Uncomment</button>
      <button class="btn" id="btnSwitchTab">↹ Switch tab</button>
    </div>

    <!-- File menu -->
    <div class="file-menu" id="fileMenu">
      <div class="item has-sub">New
        <div class="submenu">
          <div class="item" id="fmNewProject">Project</div>
          <div class="item" id="fmNewRepository">Repository</div>
          <div class="item" id="fmNewFile">File</div>
          <div class="item" id="fmNewFromExisting">Project from existing sources</div>
        </div>
      </div>
      <div class="item has-sub">Open
        <div class="submenu">
          <div class="item" id="fmOpenProject">Project</div>
          <div class="item" id="fmOpenFolder">Folder</div>
          <div class="item" id="fmOpenFile">File</div>
        </div>
      </div>
      <div class="item" id="fmCloneRepo">Clone Repository</div>
      <div class="item" id="fmOpenWindow">Open Window</div>
      <div class="divider"></div>
      <div class="item has-sub">Add
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

    <!-- Main -->
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

      <!-- Editor card -->
      <section class="editor-card">
        <div class="tabs" id="tabs">
          <div class="tab active" data-file="Program">Program</div>
        </div>

        <div class="editor-toolbar">
          <span class="info" id="encodingInfo">UTF-8 | LF</span>
          <span class="info">Language: <em id="languageName">None</em> (locked after creation)</span>
          <span class="info" style="margin-left:auto;" id="statusMsg">Ready</span>
        </div>

        <div class="code-area" id="codeArea" contenteditable="true">
// Type ANYTHING here. Create a New File to lock language and load templates.
// Syntax coloring, ghost completions (Tab), error hints on Run.
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
            <input class="term-field" id="termInput" placeholder="Type a command, e.g., dotnet --info" />
            <button class="term-run" id="termRun">Run</button>
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

  <!-- New File Modal -->
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
        <button class="btn primary" id="nfCreate">Create</button>
      </div>
      <div class="info" id="nfError" style="display:none;color:var(--error);">Provide file name and language.</div>
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

    /* Extensions & templates */
    const langExt = { 'JAVA': '.java', 'CPP': '.cpp', 'CS': '.cs', 'HTML': '.html', 'PYTHON': '.py' };
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

    /* Syntax highlight (basic) */
    function escapeHTML(s) { return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
    function highlight(text, lang) {
      if (lang === 'CS') {
        let t = escapeHTML(text);
        t = t.replace(/\/\/.*$/gm, m => `<span class="token comment">${m}</span>`);
        t = t.replace(/(\$?@"[^"]*"|@"[^"]*"|\$"[^"]*"|"[^"\\]

*(?:\\.[^"\\]

*)*")/g, m => `<span class="token str">${m}</span>`);
        t = t.replace(/^\s*

\[([A-Za-z_][\w.]*)\]

/gm, (_, a) => `[<span class="token attr">${a}</span>]`);
        const kw = ['using','namespace','class','interface','struct','public','private','protected','internal','static','async','await','return','new','var','void','int','string','bool','Guid','Task'];
        t = t.replace(new RegExp(`\\b(${kw.join('|')})\\b`,'g'), m => `<span class="token kw">${m}</span>`);
        const meth = ['Console','WriteLine','ReadLine','Select','ToList','Range','Delay','Join','Any','Main','RunAllAsync','ExecuteAsync'];
        t = t.replace(new RegExp(`\\b(${meth.join('|')})\\b`,'g'), m => `<span class="token method">${m}</span>`);
        t = t.replace(/\b\d+\b/g, m => `<span class="token num">${m}</span>`);
        t = t.replace(/\b(System(?:\.[A-Za-z\.]+)?)\b/g, m => `<span class="token ns">${m}</span>`);
        return t;
      }
      if (lang === 'HTML') return escapeHTML(text);
      let t = escapeHTML(text);
      t = t.replace(/#.*$/gm, m => `<span class="token comment">${m}</span>`);
      t = t.replace(/\/\/.*$/gm, m => `<span class="token comment">${m}</span>`);
      t = t.replace(/"[^"]*"|'[^']*'/g, m => `<span class="token str">${m}</span>`);
      t = t.replace(/\b\d+\b/g, m => `<span class="token num">${m}</span>`);
      return t;
    }

    /* Ghost completion (C#) */
    const csDictionary = ['Console','Console.WriteLine','Console.ReadLine','IAsyncEnumerable','CancellationToken','Task','Guid','Enumerable','Range','Select','ToList','Any'];
    let ghostActive = null;
    function hideGhost() { if (ghostActive?.node) ghostActive.node.remove(); ghostActive = null; }
    function getCaretClientRect() {
      const sel = window.getSelection(); if (!sel || sel.rangeCount === 0) return null;
      const range = sel.getRangeAt(0).cloneRange();
      if (range.collapsed) {
        const span = document.createElement('span'); span.appendChild(document.createTextNode('\u200b'));
        range.insertNode(span); const rect = span.getBoundingClientRect(); span.parentNode.removeChild(span); return rect;
      }
      return range.getBoundingClientRect();
    }
    function suggestGhost(prefix) {
      const suggestions = csDictionary.filter(x => x.toLowerCase().startsWith(prefix.toLowerCase()) && x.toLowerCase() !== prefix.toLowerCase());
      if (!suggestions.length) { hideGhost(); return; }
      const suffix = suggestions[0].slice(prefix.length);
      const rect = getCaretClientRect(); if (!rect) return;
      const hostRect = codeArea.getBoundingClientRect();
      hideGhost();
      const g = document.createElement('div');
      g.className = 'ghost';
      g.style.left = (rect.left - hostRect.left) + 'px';
      g.style.top = (rect.top - hostRect.top + codeArea.scrollTop) + 'px';
      g.textContent = suffix;
      codeArea.appendChild(g);
      ghostActive = { node: g, suffix };
    }

    /* Error hints (mock C# analyzer) */
    function analyzeCS(text) {
      const lines = text.split('\n'); const issues = [];
      lines.forEach((line, i) => {
        if (/\bconsole2\b/i.test(line)) {
          issues.push({ level:'error', code:'CS0246',
            desc:"The type or namespace name 'console2' could not be found (are you missing a using directive or an assembly reference?)",
            file: currentFilename(), line: i+1 });
        }
        if (/DllImportAttribute/.test(line)) {
          issues.push({ level:'info', code:'IL0001',
            desc:"Mark the 'mouse_event' method with the 'LibraryImportAttribute' instead of the 'DllImportAttribute' to generate P/Invoke stub code at compile time.",
            file: currentFilename(), line: i+1 });
        }
      });
      return issues;
    }
    function printToTerminal(text, cls) {
      const div = document.createElement('div'); div.className = 'output-line' + (cls ? ' ' + cls : '');
      div.textContent = text; terminalBody.appendChild(div); terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    function renderIssues(issues) {
      issues.forEach(it => printToTerminal(
        `${it.level.toUpperCase()} ${it.code} ${it.desc} — ${it.file} (Line ${it.line})`,
        it.level === 'error' ? 'error' : it.level === 'warn' ? 'warn' : 'info'
      ));
    }

    /* Status helpers */
    function setStatus(msg) { statusMsg.textContent = msg; statusTail.textContent = msg; }
    function currentFilename() { return (currentFile.name || 'Program') + (currentFile.ext || ''); }
    function renderWorkspace() {
      explorer.innerHTML = ''; tabs.innerHTML = '';
      for (const [key] of files.entries()) {
        const active = key === currentFilename();
        const item = document.createElement('div'); item.className = 'tree-item' + (active ? ' active' : '');
        item.dataset.open = key; item.textContent = key; explorer.appendChild(item);
        const tab = document.createElement('div'); tab.className = 'tab' + (active ? ' active' : '');
        tab.dataset.file = key; tab.textContent = key; tabs.appendChild(tab);
      }
      const full = currentFilename();
      fileDisplay.textContent = full; optFileName.textContent = full; brandText.textContent = 'Mini Studio — ' + full;
      languageNameEl.textContent = currentFile.language ? currentFile.language : 'None';
    }

    /* Open file into editor */
    function openFile(key) {
      const f = files.get(key); if (!f) return;
      currentFile = { ...f }; codeArea.textContent = currentFile.content || ''; applyHighlightSafe();
      renderWorkspace(); setStatus('Opened ' + key);
    }
    explorer.addEventListener('click', e => { const item = e.target.closest('.tree-item'); if (!item) return; openFile(item.dataset.open); });
    tabs.addEventListener('click', e => { const tab = e.target.closest('.tab'); if (!tab) return; openFile(tab.dataset.file); });

    /* File menu toggle & close on outside click */
    btnFile.addEventListener('click', e => { e.stopPropagation(); fileMenu.style.display = fileMenu.style.display === 'flex' ? 'none' : 'flex'; });
    document.addEventListener('click', e => { if (fileMenu.style.display === 'flex' && !fileMenu.contains(e.target) && e.target !== btnFile) fileMenu.style.display = 'none'; });

    /* Sidebar resize affecting grid */
    const sidebar = document.getElementById('sidebar');
    const mainGrid = document.getElementById('mainGrid');
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        mainGrid.style.gridTemplateColumns = w + 'px 1fr';
      }
    });
    resizeObserver.observe(sidebar);

    /* New File modal */
    function showNewFileModal() { nfName.value=''; nfLang.value=''; nfError.style.display='none'; newFileModal.style.display='flex'; nfName.focus(); }
    function hideNewFileModal() { newFileModal.style.display='none'; }
    btnNewFile.addEventListener('click', showNewFileModal);
    fmNewFile.addEventListener('click', showNewFileModal);
    document.getElementById('sdNew').addEventListener('click', showNewFileModal);
    nfCancel.addEventListener('click', hideNewFileModal);
    nfCreate.addEventListener('click', () => {
      const name = (nfName.value || '').trim(); const lang = nfLang.value;
      if (!name || !lang) { nfError.style.display = 'block'; return; }
      const ext = langExt[lang] || ''; const fullName = name + ext; const content = templates[lang] || '';
      const file = { name, language: lang, ext, content, lockedLanguage: true };
      files.set(fullName, file); currentFile = { ...file };
      codeArea.textContent = content; applyHighlightSafe(); renderWorkspace();
      setStatus('Created ' + fullName + ' (language locked)'); hideNewFileModal();
    });

    /* Save logic */
    function saveToDisk(filename, text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
    async function chooseFolderAndSave(filename, text) {
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await window.showDirectoryPicker();
          const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(text); await writable.close();
          setStatus('Saved to folder: ' + filename); return;
        } catch { saveToDisk(filename, text); setStatus('Saved (fallback) ' + filename); return; }
      } else { saveToDisk(filename, text); setStatus('Saved (download) ' + filename); }
    }
    function saveCurrent(asFolder=false) {
      const key = currentFilename(); currentFile.content = codeArea.textContent; files.set(key, { ...currentFile });
      if (asFolder) chooseFolderAndSave(key, currentFile.content); else { saveToDisk(key, currentFile.content); setStatus('Saved ' + key); }
    }
    function saveAll() { for (const [key, f] of files.entries()) saveToDisk(key, f.content || ''); setStatus('Saved all files'); }
    btnSaveFile.addEventListener('click', () => saveCurrent(false));
    btnSaveAll.addEventListener('click', saveAll);
    fmSaveProgram.addEventListener('click', () => saveCurrent(false));
    fmSaveProgramAs.addEventListener('click', () => saveCurrent(true));
    fmSaveAll.addEventListener('click', saveAll);

    /* Open File / Folder */
    async function openLocalFile() {
      const input = document.createElement('input'); input.type = 'file';
      input.onchange = () => {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const parts = file.name.split('.'); const ext = parts.length > 1 ? '.' + parts.pop() : ''; const name = parts.join('.') || 'Untitled';
          const lang = Object.keys(langExt).find(k => langExt[k] === ext) || null;
          const f = { name, language: lang, ext, content: reader.result, lockedLanguage: true };
          files.set(file.name, f); currentFile = { ...f }; codeArea.textContent = f.content || '';
          applyHighlightSafe(); renderWorkspace(); setStatus('Opened file ' + file.name);
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
              const fileHandle = entry; const file = await fileHandle.getFile(); const text = await file.text();
              const parts = file.name.split('.'); const ext = parts.length > 1 ? '.' + parts.pop() : ''; const name = parts.join('.') || 'Untitled';
              const lang = Object.keys(langExt).find(k => langExt[k] === ext) || null;
              files.set(file.name, { name, language: lang, ext, content: text, lockedLanguage: true });
            }
          }
          const firstKey = files.keys().next().value; if (firstKey) openFile(firstKey); setStatus('Folder opened');
        } catch { setStatus('Folder open canceled'); }
      } else { setStatus('Folder open not supported; use Open File.'); }
    }
    btnOpenFile.addEventListener('click', openLocalFile);
    fmOpenFile.addEventListener('click', openLocalFile);
    fmOpenFolder.addEventListener('click', openLocalFolder);

    /* Other file menu actions */
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

    /* Spell-check & quick info */
    let spellOn = false;
    btnSpell.addEventListener('click', () => { spellOn = !spellOn; setStatus('Spell-check ' + (spellOn ? 'enabled' : 'disabled')); });
    btnQuickInfo.addEventListener('click', () => { setStatus('Quick info displayed (mock)'); });

    /* Comment / Uncomment */
    btnCommentLines.addEventListener('click', () => {
      const text = codeArea.textContent;
      codeArea.textContent = text.split('\n').map(line => '// ' + line).join('\n');
      applyHighlightSafe(); updateCursor(); setStatus('Commented selection (naive)');
    });
    btnUncommentLines.addEventListener('click', () => {
      const text = codeArea.textContent;
      codeArea.textContent = text.split('\n').map(line => line.startsWith('// ') ? line.slice(3) : line).join('\n');
      applyHighlightSafe(); updateCursor(); setStatus('Uncommented selection (naive)');
    });

    /* Switch tab */
    btnSwitchTab.addEventListener('click', () => {
      const keys = Array.from(files.keys()); if (keys.length < 2) return;
      const idx = keys.indexOf(currentFilename()); const nextKey = keys[(idx + 1) % keys.length];
      openFile(nextKey); setStatus('Switched tab');
    });

    /* Terminal (mock) */
    function runCommand(cmd) {
      printToTerminal(`$ ${cmd}`, 'info');
      if (cmd === 'node -v') printToTerminal('v18.19.0');
      else if (cmd === 'python -V') printToTerminal('Python 3.11.0');
      else if (cmd === 'javac -version') printToTerminal('javac 17.0.9');
      else if (cmd === 'dotnet --info') printToTerminal('.NET SDK info (mock)');
      else if (cmd.startsWith('echo ')) printToTerminal(cmd.slice(5));
      else printToTerminal('Command not found.');
    }
    termRun.addEventListener('click', () => { const cmd = termInput.value.trim(); if (!cmd) return; runCommand(cmd); termInput.value=''; });
    termInput.addEventListener('keydown', e => { if (e.key === 'Enter') termRun.click(); });

    /* Run actions */
    btnRun.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run ' + target, 'info');
      printToTerminal('Executing ' + currentFilename() + ' (' + (currentFile.language || 'Unknown') + ')', 'info');
      if (currentFile.language === 'CS') renderIssues(analyzeCS(codeArea.textContent));
      setStatus('Running ' + target);
    });
    btnRunNoDebug.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run-no-debug ' + target, 'info');
      printToTerminal('Executing without debugger: ' + currentFilename(), 'info');
      if (currentFile.language === 'CS') renderIssues(analyzeCS(codeArea.textContent));
      setStatus('Run without debugging');
    });
    btnOpenWindow.addEventListener('click', () => setStatus('Open Window (mock)'));

    /* Cursor, undo/redo, typing behaviors */
    function getCaretIndex(el) {
      const selection = window.getSelection(); if (!selection || selection.rangeCount === 0) return 0;
      const range = selection.getRangeAt(0); const pre = range.cloneRange(); pre.selectNodeContents(el); pre.setEnd(range.endContainer, range.endOffset);
      return pre.toString().length;
    }
    function placeCaret(el, idx) {
      const range = document.createRange(); const sel = window.getSelection();
      let count=0, nodeStack=[el], node, lastText=null;
      while (nodeStack.length) {
        node = nodeStack.pop();
        if (node.nodeType === 3) {
          const next = count + node.length;
          if (idx <= next) { range.setStart(node, idx - count); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); return; }
          count = next; lastText = node;
        } else { let i=node.childNodes.length; while(i--) nodeStack.push(node.childNodes[i]); }
      }
      if (lastText) { range.setStart(lastText, lastText.length); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); }
    }
    function updateCursor() {
      const sel = window.getSelection(); let line=1, col=1;
      if (sel && sel.anchorNode) {
        const idx = getCaretIndex(codeArea); const text = codeArea.textContent; const upTo = text.slice(0, idx);
        line = (upTo.match(/\n/g) || []).length + 1; const lastNL = upTo.lastIndexOf('\n'); col = upTo.length - (lastNL + 1) + 1;
      }
      cursorCell.textContent = 'Ln ' + line + ', Col ' + col;
      currentFile.content = codeArea.textContent; files.set(currentFilename(), { ...currentFile });
      enableUndoRedo();
    }

    const undoStack = []; const redoStack = [];
    function pushUndo() { undoStack.push(codeArea.textContent); btnUndo.classList.remove('disabled'); }
    function enableUndoRedo() {
      if (undoStack.length > 0) btnUndo.classList.remove('disabled'); else btnUndo.classList.add('disabled');
      if (redoStack.length > 0) btnRedo.classList.remove('disabled'); else btnRedo.classList.add('disabled');
    }
    btnUndo.addEventListener('click', () => {
      if (!undoStack.length) return;
      redoStack.push(codeArea.textContent);
      const prev = undoStack.pop(); codeArea.textContent = prev; applyHighlightSafe(); updateCursor();
    });
    btnRedo.addEventListener('click', () => {
      if (!redoStack.length) return;
      undoStack.push(codeArea.textContent);
      const next = redoStack.pop(); codeArea.textContent = next; applyHighlightSafe(); updateCursor();
    });

    /* Auto-case fix for C#: console -> Console */
    function autoCaseFix() {
      if (currentFile.language !== 'CS') return;
      const text = codeArea.textContent; const fixed = text.replace(/\bconsole\b/g, 'Console');
      if (fixed !== text) {
        const idx = getCaretIndex(codeArea); codeArea.textContent = fixed; applyHighlightSafe();
        placeCaret(codeArea, Math.min(idx + 1, fixed.length)); // approximate caret
      }
    }

    /* Ghost trigger */
    function triggerGhost() {
      hideGhost(); if (currentFile.language !== 'CS') return;
      const idx = getCaretIndex(codeArea); const text = codeArea.textContent; const upTo = text.slice(0, idx);
      const match = upTo.match(/([A-Za-z_][A-Za-z0-9_]*)$/); if (!match) return; suggestGhost(match[1]);
    }
    window.addEventListener('keydown', e => {
      if (e.key === 'Tab' && ghostActive) {
        e.preventDefault();
        const idx = getCaretIndex(codeArea); const text = codeArea.textContent;
        const upTo = text.slice(0, idx); const after = text.slice(idx); const m = upTo.match(/([A-Za-z_][A-Za-z0-9_]*)$/); if (!m) return;
        const accepted = upTo + ghostActive.suffix + after; codeArea.textContent = accepted; applyHighlightSafe();
        placeCaret(codeArea, (upTo + ghostActive.suffix).length); hideGhost();
      }
    });

    /* Highlight renderer with selection preservation when possible */
    function applyHighlightSafe() {
      const idx = getCaretIndex(codeArea); const plain = codeArea.textContent;
      const html = highlight(plain, currentFile.language).replace(/\n/g, '<br/>');
      codeArea.innerHTML = html;
      placeCaret(codeArea, idx);
    }

    /* Input events — make buttons work */
    codeArea.addEventListener('input', () => { pushUndo(); autoCaseFix(); applyHighlightSafe(); triggerGhost(); });
    codeArea.addEventListener('keyup', () => { updateCursor(); triggerGhost(); });
    codeArea.addEventListener('click', () => { updateCursor(); triggerGhost(); });

    /* Hook menu & toolbar duplicates */
    btnOpenFile.addEventListener('click', openLocalFile);
    btnSaveFile.addEventListener('click', () => saveCurrent(false));

    /* Initialize */
    renderWorkspace(); setStatus('Ready'); applyHighlightSafe();
  </script>
</body>
</html>
