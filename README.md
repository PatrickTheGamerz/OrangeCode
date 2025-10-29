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
      overflow: auto;
      user-select: none;
    }

    .workspace {
      display: grid;
      grid-template-rows: 32px auto 1fr 24px;
      height: 100vh;
    }

    /* Titlebar */
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
      background: transparent;
      color: var(--text);
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 4px;
    }
    .tb-btn:hover { background: var(--hover); }
    .brand { margin-left: auto; font-size: 12px; color: var(--muted); }

    /* File menu – positioned perfectly under File button */
    .file-menu {
      position: fixed;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      min-width: 260px;
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
    }
    .file-menu .item:hover { background: var(--hover); }
    .divider { height: 1px; background: var(--border); margin: 6px 0; }

    /* Toolbar – fits without scrolling, wraps neatly, tooltips on hover */
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

    /* Main area */
    .main {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 0;
    }
    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      overflow: auto;
      min-width: 180px;
      max-width: 520px;
      resize: horizontal;
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
    .tree-item { padding: 6px 12px; font-size: 13px; cursor: pointer; }
    .tree-item:hover { background: var(--hover); }
    .tree-item.active { background: #1f1f1f; }

    /* Editor */
    .editor { display: grid; grid-template-rows: auto 1fr; min-height: 0; }
    .tabs {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 6px;
      padding: 4px 6px;
      align-items: center;
    }
    .tab {
      background: #2d2d2d;
      color: var(--text);
      border: 1px solid var(--border);
      border-bottom: none;
      padding: 0 8px;
      height: 24px;
      display: flex;
      align-items: center;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    .tab.active { background: #1f1f1f; color: #fff; }

    .editor-surface {
      display: grid;
      grid-template-rows: 28px 1fr auto;
      background: var(--editor-bg);
      min-height: 0;
    }
    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }
    .info { font-size: 11px; color: var(--muted); user-select: none; }

    /* Code area – no white flash, clear text, synced highlight */
    .code-wrap { position: relative; min-height: 240px; }
    .highlight-layer {
      position: absolute;
      inset: 0;
      padding: 10px 14px;
      line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px;
      white-space: pre;
      background: var(--editor-bg);
      color: transparent;
      pointer-events: none;
      overflow: hidden;
    }
    /* token colors */
    .highlight-layer .tok-comment { color: var(--muted); font-style: italic; }
    .highlight-layer .tok-string { color: var(--green); }
    .highlight-layer .tok-number { color: var(--orange); }
    .highlight-layer .tok-key { color: var(--blue); }
    .highlight-layer .tok-type { color: var(--yellow); }
    .highlight-layer .tok-func { color: var(--purple); }
    .highlight-layer .tok-using-wrong { color: var(--red); }

    .code-area {
      position: relative;
      padding: 10px 14px;
      line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px;
      white-space: pre;
      outline: none;
      background: var(--editor-bg);
      color: var(--text);
      min-height: 240px;
      overflow: auto;
    }
    .code-area[contenteditable="true"] { caret-color: #cfe8ff; }

    /* Ghost autocomplete hint (gray, overlay near caret) */
    .ghost-hint {
      position: absolute;
      background: transparent;
      color: var(--ghost);
      pointer-events: none;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre;
      z-index: 2;
    }

    /* Output terminal – forced dark */
    .output-container {
      display: grid;
      grid-template-rows: 24px 1fr 28px;
      border-top: 1px solid var(--border);
      background: var(--terminal-bg);
      min-height: 160px;
    }
    .output-header {
      padding: 2px 8px;
      font-size: 11px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      background: var(--terminal-bg);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .output-body {
      padding: 6px 8px;
      font-family: Menlo, Consolas, monospace;
      font-size: 12px;
      background: var(--terminal-bg);
      color: var(--text);
      overflow: auto;
    }
    .output-body .line.err { color: var(--red); }
    .output-body .line.warn { color: var(--orange); }
    .output-body .line.info { color: var(--blue); }
    .output-input {
      display: grid;
      grid-template-columns: 32px 1fr 84px;
      gap: 6px;
      border-top: 1px solid var(--border);
      padding: 4px 8px;
      align-items: center;
      background: var(--terminal-bg);
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
      font-size: 11px;
    }
    .term-run:hover { filter: brightness(1.1); }

    /* Statusbar */
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
      z-index: 50;
    }
    .statusbar .cell { cursor: default; }

    /* Modal: New File */
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
    .modal h3 { margin: 0 0 8px 0; font-size: 14px; color: var(--text); user-select: none; }
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
    .danger { border-color: var(--danger); color: #f7d4d4; }
    .tooltip {
      position: relative;
    }
    .tooltip[data-tip]::after {
      content: attr(data-tip);
      position: absolute;
      bottom: -26px;
      left: 0;
      background: #111;
      color: #ddd;
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid #333;
      font-size: 11px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px);
      transition: opacity 120ms ease, transform 120ms ease;
    }
    .tooltip:hover::after {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Title bar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <span class="brand" id="brandText">Mini Studio — Program</span>
    </div>

    <!-- Secondary toolbar (wraps, no scroll needed) -->
    <div class="toolbar" id="toolbar">
      <button class="btn tooltip" data-tip="Create new file" id="btnNewFile">📝 New</button>
      <button class="btn tooltip" data-tip="Open local file" id="btnOpenFile">📂 Open</button>
      <button class="btn tooltip" data-tip="Save current file" id="btnSaveFile">💾 Save</button>
      <button class="btn tooltip" data-tip="Save all files" id="btnSaveAll">💾 Save All</button>
      <button class="btn disabled tooltip" data-tip="Undo last change" id="btnUndo">↩ Undo</button>
      <button class="btn disabled tooltip" data-tip="Redo last undo" id="btnRedo">↪ Redo</button>
      <select class="select tooltip" data-tip="Build configuration" id="buildSelect">
        <option>Debug</option>
        <option>Release</option>
      </select>
      <span class="filename" id="fileDisplay">Program</span>
      <button class="btn tooltip" data-tip="Run" id="btnRun">▶ Run</button>
      <select class="select tooltip" data-tip="Run target" id="runTarget">
        <option id="optFileName">Program</option>
        <option>WSL</option>
        <option>Debugging Properties (Program)</option>
        <option>Configure Starter Projects</option>
      </select>
      <button class="btn tooltip" data-tip="Run without debugging" id="btnRunNoDebug">⏯ No Debug</button>
      <button class="btn tooltip" data-tip="Open new window (mock)" id="btnOpenWindow">🗔 Window</button>
      <button class="btn tooltip" data-tip="Toggle spell-check (mock)" id="btnSpell">🔤 Spell</button>
      <button class="btn tooltip" data-tip="Show quick info (mock)" id="btnQuickInfo">💡 Info</button>
      <button class="btn tooltip" data-tip="Comment lines" id="btnCommentLines">// Comment</button>
      <button class="btn tooltip" data-tip="Uncomment lines" id="btnUncommentLines">␡ Uncomment</button>
      <button class="btn tooltip" data-tip="Switch tab" id="btnSwitchTab">↹ Switch</button>
    </div>

    <!-- File menu -->
    <div class="file-menu" id="fileMenu">
      <div class="item" id="fmNewFile">New File</div>
      <div class="item" id="fmOpenFile">Open File</div>
      <div class="item" id="fmOpenFolder">Open Folder</div>
      <div class="divider"></div>
      <div class="item" id="fmSaveProgram">Save</div>
      <div class="item" id="fmSaveProgramAs">Save As…</div>
      <div class="item" id="fmSaveAll">Save All</div>
      <div class="divider"></div>
      <div class="item" id="fmOpenWindow">Open Window</div>
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
            <span class="info" id="languageLockInfo">Language: <em id="languageName">None</em> (locked)</span>
            <span class="info" style="margin-left:auto;" id="statusMsg">Ready</span>
          </div>

          <div class="code-wrap">
            <pre aria-hidden="true" class="highlight-layer" id="highlightLayer"></pre>
            <div class="ghost-hint" id="ghostHint" style="display:none;"></div>
            <div class="code-area" id="codeArea" contenteditable="true">
// Type ANYTHING here. Create a New File to select language.
// This area is the ONLY copyable/editable part of the UI.
            </div>
          </div>

          <div class="output-container" id="output">
            <div class="output-header">
              <span>Output</span>
              <span style="margin-left:auto;">bash • Press Enter to run</span>
            </div>
            <div class="output-body" id="terminalBody"><div class="line">$ echo "welcome"</div><div class="line">welcome</div></div>
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
    const highlightLayer = document.getElementById('highlightLayer');
    const ghostHint = document.getElementById('ghostHint');

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
    const files = new Map();
    files.set('Program', { ...currentFile });

    // Lang extensions
    const langExt = {
      'JAVA': '.java',
      'CPP': '.cpp',
      'CS': '.cs',
      'HTML': '.html',
      'PYTHON': '.py'
    };

    // Default imports/usings (basic, non-package)
    const defaultImports = {
      'CS': [
        'using System;',
        'using System.Collections.Generic;',
        'using System.Linq;',
        'using System.Threading;',
        'using System.Threading.Tasks;'
      ],
      'JAVA': [
        'import java.util.*;',
        'import java.io.*;'
      ],
      'CPP': [
        '#include <iostream>',
        'using namespace std;'
      ],
      'PYTHON': [],
      'HTML': []
    };

    // Templates
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

    // Syntax highlight ("using" forced red in C#)
    function highlight(lang, text) {
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const E = esc(text);

      const patterns = {
        CS: [
          { re: /(^|\n)\s*(using\s+[A-Za-z0-9_.]+;)/g, cls: 'tok-using-wrong' },
          { re: /\/\/[^\n]*/g, cls: 'tok-comment' },
          { re: /"(?:\\.|[^"\\])*"/g, cls: 'tok-string' },
          { re: /\b(namespace|class|interface|struct|public|private|protected|internal|static|async|await|void|int|string|var|new|return)\b/g, cls: 'tok-key' },
          { re: /\b(Console|Enumerable|Task|Guid|CancellationToken|IAsyncEnumerable)\b/g, cls: 'tok-type' },
          { re: /\b(Main|WriteLine|ReadLine|RunAsync|RunAllAsync|ExecuteAsync|Reverse|Dequeue|Enqueue)\b/g, cls: 'tok-func' },
          { re: /\b\d+(\.\d+)?\b/g, cls: 'tok-number' }
        ],
        JAVA: [
          { re: /\/\/[^\n]*/g, cls: 'tok-comment' },
          { re: /"(?:\\.|[^"\\])*"/g, cls: 'tok-string' },
          { re: /\b(import|package|class|public|private|protected|static|void|int|String|new|return)\b/g, cls: 'tok-key' },
          { re: /\b(System|String|List|Map)\b/g, cls: 'tok-type' },
          { re: /\b(main|println)\b/g, cls: 'tok-func' },
          { re: /\b\d+(\.\d+)?\b/g, cls: 'tok-number' }
        ],
        CPP: [
          { re: /\/\/[^\n]*/g, cls: 'tok-comment' },
          { re: /"(?:\\.|[^"\\])*"/g, cls: 'tok-string' },
          { re: /\b(#include|using|namespace|int|void|return|std)\b/g, cls: 'tok-key' },
          { re: /\b(cout|endl|main)\b/g, cls: 'tok-func' },
          { re: /\b\d+(\.\d+)?\b/g, cls: 'tok-number' }
        ],
        PYTHON: [
          { re: /#.*$/gm, cls: 'tok-comment' },
          { re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, cls: 'tok-string' },
          { re: /\b(def|class|import|from|return|async|await|for|while|if|elif|else|try|except|with|as|lambda)\b/g, cls: 'tok-key' },
          { re: /\b(print|range|len|str|int)\b/g, cls: 'tok-func' },
          { re: /\b\d+(\.\d+)?\b/g, cls: 'tok-number' }
        ],
        HTML: [
          { re: /&lt;!--[\s\S]*?--&gt;/g, cls: 'tok-comment' },
          { re: /(&lt;\/?[a-zA-Z][^&]*?&gt;)/g, cls: 'tok-key' },
          { re: /"(?:\\.|[^"\\])*"/g, cls: 'tok-string' }
        ]
      };

      const langKey = lang || currentFile.language || 'CS';
      const rules = patterns[langKey] || [];
      let html = E;
      for (const { re, cls } of rules) {
        html = html.replace(re, (m) => `<span class="${cls}">${m}</span>`);
      }
      return html;
    }

    // Autocomplete words
    const autoWords = {
      CS: ['Console', 'WriteLine', 'ReadLine', 'Enumerable', 'Task', 'Guid', 'CancellationToken', 'IAsyncEnumerable'],
      JAVA: ['System', 'out', 'println', 'String', 'List', 'Map'],
      CPP: ['std', 'cout', 'endl', 'string', 'vector'],
      PYTHON: ['print', 'range', 'len', 'str', 'int'],
      HTML: ['html', 'head', 'body', 'div', 'span', 'script', 'link', 'meta', 'title']
    };

    function showGhostSuggestion(prefix) {
      const langKey = currentFile.language || 'CS';
      const list = autoWords[langKey] || [];
      const found = list.find(w => w.toLowerCase().startsWith(prefix.toLowerCase()) && w.toLowerCase() !== prefix.toLowerCase());
      if (!found) { ghostHint.style.display = 'none'; return; }
      const { x, y } = caretPixel(codeArea);
      ghostHint.style.left = x + 'px';
      ghostHint.style.top = y + 'px';
      ghostHint.textContent = found.slice(prefix.length);
      ghostHint.style.display = 'block';
    }
    function acceptGhost() {
      if (ghostHint.style.display === 'none') return false;
      document.execCommand('insertText', false, ghostHint.textContent);
      ghostHint.style.display = 'none';
      return true;
    }

    // Auto-capitalize console -> Console (C#)
    function autoCapitalizeConsole() {
      if (currentFile.language !== 'CS') return;
      const text = codeArea.textContent;
      const caret = getCaretIndex(codeArea);
      const before = text.slice(0, caret);
      const m = before.match(/([A-Za-z_][A-Za-z_0-9]*)$/);
      if (!m) return;
      const word = m[1];
      if (word === 'console') {
        const start = caret - word.length;
        const newText = text.slice(0, start) + 'Console' + text.slice(caret);
        codeArea.textContent = newText;
        placeCaret(codeArea, start + 'Console'.length);
      }
    }

    // Status
    function setStatus(msg) { statusMsg.textContent = msg; statusTail.textContent = msg; }

    // Render workspace (explorer + tabs)
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
      refreshHighlight();
    }

    function refreshHighlight() {
      highlightLayer.innerHTML = highlight(currentFile.language, codeArea.textContent);
      // Keep layers visually aligned; highlight sits under editable
      highlightLayer.scrollTop = codeArea.scrollTop;
      highlightLayer.scrollLeft = codeArea.scrollLeft;
    }

    // Open file
    function openFile(key) {
      const f = files.get(key);
      if (!f) return;
      currentFile = { ...f };
      codeArea.textContent = currentFile.content || '';
      renderWorkspace();
      setStatus('Opened ' + key);
      diagnoseIfPossible();
    }

    // Cursor / content updates
    codeArea.addEventListener('keyup', updateCursor);
    codeArea.addEventListener('click', updateCursor);
    codeArea.addEventListener('scroll', () => {
      highlightLayer.scrollTop = codeArea.scrollTop;
      highlightLayer.scrollLeft = codeArea.scrollLeft;
    });
    function updateCursor() {
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
      enableUndoRedo();
      refreshHighlight();
      autoCapitalizeConsole();
      liveAutocomplete();
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
    function placeCaret(el, idx) {
      el.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      let node = el.firstChild;
      if (!node) {
        node = document.createTextNode('');
        el.appendChild(node);
      }
      range.setStart(node, Math.min(idx, node.textContent.length));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      updateCursor();
    }
    function caretPixel(el) {
      const idx = getCaretIndex(el);
      const pre = el.textContent.slice(0, idx);
      const lines = pre.split('\n');
      const lh = 19.5;
      const y = lines.length * lh - lh + el.getBoundingClientRect().top + window.scrollY + 10;
      const last = lines[lines.length - 1] || '';
      const charW = 7.8;
      const x = last.length * charW + el.getBoundingClientRect().left + window.scrollX + 14;
      return { x, y };
    }

    // Undo/Redo (naive)
    const undoStack = [];
    const redoStack = [];
    function pushUndo() { undoStack.push(codeArea.textContent); btnUndo.classList.remove('disabled'); }
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
      refreshHighlight();
      liveAutocomplete();
    });

    // Sidebar resize -> grid column adjustment
    const sidebar = document.getElementById('sidebar');
    const mainGrid = document.getElementById('mainGrid');
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        mainGrid.style.gridTemplateColumns = w + 'px 1fr';
      }
    });
    resizeObserver.observe(sidebar);

    // File menu positioning under File button
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

    // New File modal
    function showNewFileModal() {
      nfName.value = '';
      nfLang.value = '';
      nfError.style.display = 'none';
      newFileModal.style.display = 'flex';
      nfName.focus();
    }
    function hideNewFileModal() { newFileModal.style.display = 'none'; }
    nfCancel.addEventListener('click', hideNewFileModal);
    nfCreate.addEventListener('click', () => {
      const name = (nfName.value || '').trim();
      const lang = nfLang.value;
      if (!name || !lang) { nfError.style.display = 'block'; return; }
      const ext = langExt[lang] || '';
      const fullName = name + ext;

      const base = templates[lang] || '';
      const imports = defaultImports[lang] || [];
      const content = (imports.length ? imports.join('\n') + '\n\n' : '') + base;

      const file = { name, language: lang, ext, content, lockedLanguage: true };
      files.set(fullName, file);
      currentFile = { ...file };
      codeArea.textContent = content;
      renderWorkspace();
      setStatus('Created ' + fullName + ' (language locked)');
      hideNewFileModal();
      optFileName.textContent = fullName;
      diagnoseIfPossible();
    });

    btnNewFile.addEventListener('click', showNewFileModal);
    document.getElementById('sdNew').addEventListener('click', showNewFileModal);

    // Save logic
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
    function currentFilename() {
      const name = currentFile.name || 'Program';
      const ext = currentFile.ext || '';
      return name + ext;
    }
    function saveCurrent(asFolder = false) {
      const key = currentFilename();
      currentFile.content = codeArea.textContent;
      files.set(key, { ...currentFile });
      if (asFolder) chooseFolderAndSave(key, currentFile.content);
      else { saveToDisk(key, currentFile.content); setStatus('Saved ' + key); }
    }
    function saveAll() {
      for (const [key, f] of files.entries()) saveToDisk(key, f.content || '');
      setStatus('Saved all files');
    }
    btnSaveFile.addEventListener('click', () => saveCurrent(false));
    btnSaveAll.addEventListener('click', saveAll);

    // File menu actions
    const fmNewFile = document.getElementById('fmNewFile');
    const fmOpenFile = document.getElementById('fmOpenFile');
    const fmOpenFolder = document.getElementById('fmOpenFolder');
    const fmSaveProgram = document.getElementById('fmSaveProgram');
    const fmSaveProgramAs = document.getElementById('fmSaveProgramAs');
    const fmSaveAll = document.getElementById('fmSaveAll');
    const fmOpenWindow = document.getElementById('fmOpenWindow');

    fmNewFile.addEventListener('click', showNewFileModal);
    fmSaveProgram.addEventListener('click', () => saveCurrent(false));
    fmSaveProgramAs.addEventListener('click', () => saveCurrent(true));
    fmSaveAll.addEventListener('click', saveAll);

    // Open file/folder
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
          diagnoseIfPossible();
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

    // Misc toolbar actions (mock)
    btnOpenWindow.addEventListener('click', () => setStatus('Opening new window (mock)'));
    fmOpenWindow.addEventListener('click', () => setStatus('Opening new window (mock)'));
    btnSpell.addEventListener('click', () => setStatus('Spell-check ' + ((this.spellOn = !this.spellOn) ? 'enabled' : 'disabled')));
    btnQuickInfo.addEventListener('click', () => setStatus('Quick info displayed (mock)'));

    // Comment / Uncomment
    function commentSelection() {
      const text = codeArea.textContent;
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

    // Switch tab
    btnSwitchTab.addEventListener('click', () => {
      const keys = Array.from(files.keys());
      if (keys.length < 2) return;
      const idx = keys.indexOf(currentFilename());
      const nextKey = keys[(idx + 1) % keys.length];
      openFile(nextKey);
      setStatus('Switched tab');
    });

    // Output helpers
    function printLine(text, cls) {
      const div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      div.textContent = text;
      terminalBody.appendChild(div);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    function printToTerminal(text) { printLine(text, ''); }

    // Diagnostics (mock, C# focus)
    function diagnoseCSharp(source) {
      const lines = source.split('\n');
      const diags = [];
      lines.forEach((l, i) => {
        if (/\bconsole\b/.test(l)) {
          diags.push({
            level: 'Error (active)',
            code: 'CS0246',
            desc: "The type or namespace name 'console' could not be found (did you mean 'Console'?)",
            file: currentFilename(),
            line: i + 1
          });
        }
        if (/\bconsole2\b/i.test(l)) {
          diags.push({
            level: 'Error (active)',
            code: 'CS0246',
            desc: "The type or namespace name 'console2' could not be found (are you missing a using directive or an assembly reference?)",
            file: currentFilename(),
            line: i + 1
          });
        }
        if (/\bDllImport\b/.test(l) || /\bmouse_event\b/.test(l)) {
          diags.push({
            level: 'Info',
            code: 'NETSDK',
            desc: "Mark 'mouse_event' with 'LibraryImportAttribute' instead of 'DllImportAttribute' to generate P/Invoke stub code at compile time.",
            file: currentFilename(),
            line: i + 1
          });
        }
      });
      return diags;
    }
    function showDiagnostics(diags) {
      if (!diags || diags.length === 0) return;
      printLine('Priority  Code    Description                                         File              Line  Status', 'info');
      diags.forEach(d => {
        const row = `${d.level}  ${d.code}  ${d.desc}  ${d.file}  ${d.line}  ${d.level.includes('Error') ? 'Error' : d.level}`;
        printLine(row, d.level.includes('Error') ? 'err' : (d.level.includes('Warn') ? 'warn' : 'info'));
      });
    }
    function diagnoseIfPossible() {
      if (currentFile.language === 'CS') {
        const diags = diagnoseCSharp(codeArea.textContent || '');
        showDiagnostics(diags);
      }
    }

    // Terminal commands
    function runCommand(cmd) {
      printToTerminal(`$ ${cmd}`);
      if (cmd === 'node -v') printLine('v18.19.0', 'info');
      else if (cmd === 'python -V') printLine('Python 3.11.0', 'info');
      else if (cmd === 'javac -version') printLine('javac 17.0.9', 'info');
      else if (cmd.startsWith('echo ')) printLine(cmd.slice(5), '');
      else printLine('Command not found.', 'warn');
    }
    termRun.addEventListener('click', () => {
      const cmd = termInput.value.trim();
      if (!cmd) return;
      runCommand(cmd);
      termInput.value = '';
    });
    termInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') termRun.click(); });

    btnRun.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run ' + target);
      printToTerminal('Executing ' + currentFilename() + ' (' + (currentFile.language || 'Unknown') + ')');
      diagnoseIfPossible();
      setStatus('Running ' + target);
    });
    btnRunNoDebug.addEventListener('click', () => {
      const target = runTarget.value;
      printToTerminal('$ run-no-debug ' + target);
      printToTerminal('Executing without debugger: ' + currentFilename());
      diagnoseIfPossible();
      setStatus('Run without debugging');
    });

    // Lightweight autocomplete lifecycle
    function liveAutocomplete() {
      const caret = getCaretIndex(codeArea);
      const text = codeArea.textContent;
      const before = text.slice(0, caret);
      const m = before.match(/([A-Za-z_][A-Za-z_0-9]*)$/);
      const prefix = m ? m[1] : '';
      if (prefix && prefix.length >= 3) showGhostSuggestion(prefix);
      else ghostHint.style.display = 'none';
    }
    codeArea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (acceptGhost()) return;
        document.execCommand('insertText', false, '  ');
      }
    });

    // Position terminal, editor, toolbar: ensure everything visible (no layout spill)
    function ensureLayoutStable() {
      // shrink controls if window height is tight
      const toolbar = document.getElementById('toolbar');
      const tooTall = window.innerHeight < 560;
      toolbar.style.gap = tooTall ? '2px' : '4px';
    }
    window.addEventListener('resize', ensureLayoutStable);

    // Initialize
    renderWorkspace();
    setStatus('Ready');
    refreshHighlight();
    ensureLayoutStable();
  </script>
</body>
</html>
