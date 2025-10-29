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
      --danger: #d16b6b;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }

    /* By default, everything is non-selectable (non-copiable) */
    body {
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
      overflow: hidden;
      user-select: none;
    }

    /* Code area (only this is copyable/editable) */
    .code-area,
    .code-area * {
      user-select: text;
    }

    .workspace {
      display: grid;
      grid-template-rows: 32px 1fr 24px;
      height: 100%;
    }

    /* Title bar and File menu */
    .titlebar {
      height: 32px;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
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
    .titlebar .brand {
      margin-left: auto;
      font-size: 12px;
      color: var(--muted);
    }

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
    .file-menu .group {
      border-top: 1px solid var(--border);
      margin: 6px 0 0 0;
      padding-top: 6px;
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

    /* Main split: resizable sidebar and editor+output */
    .main {
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: 0;
      gap: 0;
    }

    /* Sidebar (files) — freely resizable */
    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      min-width: 160px;
      max-width: 600px;
      resize: horizontal;
      overflow: auto;
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
    .sidebar-actions {
      display: flex;
      gap: 6px;
    }
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
    .sidebar-content {
      padding: 6px 0;
    }
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

    /* Editor area */
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
    .tab.active {
      background: #1f1f1f;
      color: #ffffff;
    }

    /* Editor surface: language selection + code area */
    .editor-surface {
      display: grid;
      grid-template-rows: 40px 1fr;
      min-height: 0;
      background: var(--editor-bg);
    }
    .editor-toolbar {
      display: grid;
      grid-template-columns: 220px 1fr auto;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }
    .select {
      width: 100%;
      background: #1b1b1b;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      height: 28px;
      padding: 2px 6px;
      cursor: pointer;
      user-select: none; /* non-copiable */
    }
    .toolbar-actions {
      display: flex;
      gap: 6px;
    }
    .btn {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--text);
      background: transparent;
      border: 1px solid var(--border);
      cursor: pointer;
      user-select: none; /* non-copiable */
    }
    .btn:hover { background: var(--hover); }
    .btn.primary {
      border-color: var(--accent);
      color: #cfe8ff;
    }
    .info {
      font-size: 12px;
      color: var(--muted);
      user-select: none; /* non-copiable */
    }

    /* Code editor lookalike (editable, copyable) */
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
    .code-area[contenteditable="true"] {
      caret-color: #cfe8ff;
    }

    /* Output window — wider by default and freely resizable with command input glued */
    .output-container {
      display: grid;
      grid-template-rows: 28px 1fr 32px; /* header, body, command input */
      border-top: 1px solid var(--border);
      background: var(--terminal-bg);
      resize: vertical;        /* freely scalable */
      overflow: auto;
      min-height: 160px;
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
      user-select: none; /* non-copiable */
    }
    .output-body {
      padding: 8px;
      overflow: auto;
      font-family: Menlo, Consolas, monospace;
      font-size: 12px;
    }
    .output-input {
      display: grid;
      grid-template-columns: 36px 1fr 80px;
      gap: 6px;
      border-top: 1px solid var(--border);
      padding: 4px 8px;
      align-items: center;
    }
    .prompt {
      color: var(--accent);
      text-align: center;
      user-select: none; /* non-copiable */
    }
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
      user-select: none; /* non-copiable */
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
      user-select: none; /* non-copiable */
    }
    .statusbar .cell { cursor: default; }
    .statusbar .cell.interactive { cursor: pointer; }
    .statusbar .cell.interactive:hover { color: #e0e0e0; }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Title bar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <span class="brand">Mini Studio — Program</span>
    </div>

    <!-- File menu (clicking File toggles, clicking elsewhere closes) -->
    <div class="file-menu" id="fileMenu">
      <div class="item">New: Project</div>
      <div class="item">New: Repository</div>
      <div class="item">New: File</div>
      <div class="item">New: Project from existing sources</div>

      <div class="group"></div>
      <div class="item">Open: Project</div>
      <div class="item">Open: Folder</div>
      <div class="item">Open: File</div>

      <div class="group"></div>
      <div class="item">Clone Repository</div>
      <div class="item">Open Window</div>

      <div class="group"></div>
      <div class="item">Add: New Project</div>
      <div class="item">Add: Existing Project</div>

      <div class="group"></div>
      <div class="item">Close</div>
      <div class="item">Close Solution</div>

      <div class="group"></div>
      <div class="item" id="saveProgram">Save Program<span id="saveExt"></span></div>
      <div class="item" id="saveProgramAs">Save Program<span id="saveExtAs"></span> As...</div>
      <div class="item">Save All</div>

      <div class="group"></div>
      <div class="item">Page Settings</div>

      <div class="group"></div>
      <div class="item">Recently Used Files</div>
      <div class="item">Recently Used Projects and Solutions</div>
    </div>

    <!-- Main area -->
    <div class="main">
      <!-- Sidebar (Files) -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <span>Explorer</span>
          <div class="sidebar-actions">
            <button class="sd-btn" id="btnNewFile">New</button>
            <button class="sd-btn" id="btnRefresh">Refresh</button>
          </div>
        </div>
        <div class="sidebar-content" id="explorer">
          <!-- Only one file at start -->
          <div class="tree-item active" data-open="Program">Program</div>
        </div>
      </aside>

      <!-- Editor + Output -->
      <section class="editor">
        <!-- Tabs -->
        <div class="tabs" id="tabs">
          <div class="tab active" data-file="Program">Program</div>
        </div>

        <!-- Editor surface -->
        <div class="editor-surface">
          <div class="editor-toolbar">
            <select class="select" id="languageSelect" title="Choose language">
              <option value="" selected>Select language…</option>
              <option value="JAVA">JAVA</option>
              <option value="CPP">C++</option>
              <option value="CS">C#</option>
              <option value="HTML">HTML</option>
              <option value="PYTHON">PYTHON</option>
            </select>

            <div class="toolbar-actions">
              <button class="btn primary" id="btnSave">Save Program</button>
              <button class="btn" id="btnSaveAs">Save Program As…</button>
            </div>

            <span class="info" id="formatInfo">UTF-8 | LF</span>
          </div>

          <!-- Code area: the ONLY copyable, editable region -->
          <div class="code-area" id="codeArea" contenteditable="true">
<!-- Type ANYTHING here. Choose a language to preload a template. -->
          </div>

          <!-- Output window: wider by default and freely scalable; command input glued -->
          <div class="output-container" id="output">
            <div class="output-header">
              <span>Output</span>
              <span style="margin-left:auto">bash • Press Enter to run</span>
            </div>
            <div class="output-body" id="terminalBody">
$ echo "welcome"
welcome
            </div>
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
      <div class="cell">Ln 1, Col 1</div>
      <div class="cell">Spaces: 2</div>
      <div class="cell">UTF-8</div>
      <div class="cell">LF</div>
      <div class="cell" style="margin-left:auto;" id="statusMsg">Ready</div>
    </div>
  </div>

  <script>
    // Elements
    const btnFile = document.getElementById('btnFile');
    const fileMenu = document.getElementById('fileMenu');
    const saveProgramItem = document.getElementById('saveProgram');
    const saveProgramAsItem = document.getElementById('saveProgramAs');
    const saveExt = document.getElementById('saveExt');
    const saveExtAs = document.getElementById('saveExtAs');
    const languageSelect = document.getElementById('languageSelect');
    const codeArea = document.getElementById('codeArea');
    const statusMsg = document.getElementById('statusMsg');

    const termInput = document.getElementById('termInput');
    const termRun = document.getElementById('termRun');
    const terminalBody = document.getElementById('terminalBody');

    const btnSave = document.getElementById('btnSave');
    const btnSaveAs = document.getElementById('btnSaveAs');

    // File menu toggle + close on outside click or re-click
    btnFile.addEventListener('click', (e) => {
      e.stopPropagation();
      fileMenu.style.display = (fileMenu.style.display === 'flex') ? 'none' : 'flex';
    });
    document.addEventListener('click', (e) => {
      if (fileMenu.style.display === 'flex' && !fileMenu.contains(e.target) && e.target !== btnFile) {
        fileMenu.style.display = 'none';
      }
    });

    // Language to extension map
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
      'HTML': `<!-- Demo HTML -->
<!DOCTYPE html>
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

    // Handle language selection: preload template and update Save menu label extensions
    languageSelect.addEventListener('change', () => {
      const val = languageSelect.value;
      if (!val) {
        saveExt.textContent = '';
        saveExtAs.textContent = '';
        statusMsg.textContent = 'Language cleared';
        return;
      }
      codeArea.textContent = templates[val] || '';
      const ext = langExt[val] || '';
      saveExt.textContent = ext ? ' (' + ext + ')' : '';
      saveExtAs.textContent = ext ? ' (' + ext + ')' : '';
      statusMsg.textContent = 'Template loaded for ' + val;
    });

    // Save actions (mock)
    function saveProgram(kind) {
      const lang = languageSelect.value;
      const ext = langExt[lang] || '';
      const content = codeArea.textContent;
      // Mock "download"
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Program' + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      statusMsg.textContent = (kind === 'as' ? 'Saved As ' : 'Saved ') + ('Program' + ext || 'Program');
    }

    btnSave.addEventListener('click', () => saveProgram('normal'));
    btnSaveAs.addEventListener('click', () => saveProgram('as'));
    saveProgramItem.addEventListener('click', () => saveProgram('normal'));
    saveProgramAsItem.addEventListener('click', () => saveProgram('as'));

    // Explorer mock: single item "Program"
    document.getElementById('explorer').addEventListener('click', (e) => {
      const item = e.target.closest('.tree-item');
      if (!item) return;
      document.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      statusMsg.textContent = 'Program opened';
    });

    // Tabs mock: single tab "Program"
    document.getElementById('tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      statusMsg.textContent = 'Tab: Program';
    });

    // Output: terminal-like mock
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

    // Initialize: code area shows hint, output wider, menu labels empty until language chosen
    codeArea.textContent = `// Select a language from the dropdown to start coding.
// This area is editable and copyable.
// Everything else in the UI is non-copiable by design.`;
    document.getElementById('statusMsg').textContent = 'Ready';
    saveExt.textContent = '';
    saveExtAs.textContent = '';
  </script>
</body>
</html>
