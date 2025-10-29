<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mini Studio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* ------------------------------
       VS Code–style dark theme base
       ------------------------------ */
    :root {
      --bg: #1e1e1e;
      --panel: #252526;
      --sidebar: #252526;
      --hover: #2a2a2a;
      --border: #3c3c3c;
      --active: #094771;
      --accent: #0e639c;
      --text: #cccccc;
      --muted: #9da3a6;
      --danger: #d16b6b;
      --success: #5ab880;
      --warning: #e5c07b;
      --tab-bg: #2d2d2d;
      --tab-active-bg: #1f1f1f;
      --editor-bg: #1e1e1e;
      --terminal-bg: #111111;
      --status-bg: #0b0b0b;
      --shadow: rgba(0,0,0,0.35);
      --focus-ring: #2878cc;
      --selection: rgba(14, 99, 156, 0.35);
      --scroll-thumb: #4b4b4b;
      --scroll-track: #2a2a2a;
      --badge-bg: #385a7b;
      --badge-text: #cfe8ff;
      --cmd-bg: #252526f2;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
      overflow: hidden;
    }

    /* ------------------------------
       Top title bar
       ------------------------------ */
    .titlebar {
      height: 32px;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 8px;
      gap: 8px;
      user-select: none;
    }
    .titlebar .app-name {
      font-size: 12px;
      color: var(--muted);
      margin-right: auto;
    }
    .titlebar .tb-btn {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--text);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
    }
    .titlebar .tb-btn:hover {
      background: var(--hover);
      border-color: var(--border);
    }

    /* ------------------------------
       Activity bar (icons)
       ------------------------------ */
    .activitybar {
      width: 48px;
      background: #202020;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 0;
      gap: 6px;
    }
    .activitybar .icon {
      width: 100%;
      height: 40px;
      display: grid;
      place-items: center;
      color: var(--muted);
      cursor: pointer;
    }
    .activitybar .icon:hover { background: var(--hover); color: var(--text); }
    .activitybar .icon.active { background: var(--active); color: #cfe8ff; }

    /* ------------------------------
       Main layout
       ------------------------------ */
    .workspace {
      display: grid;
      grid-template-rows: 32px 1fr 24px;
      height: 100%;
    }
    .main {
      display: grid;
      grid-template-columns: 48px 280px 1fr;
      grid-template-rows: 100%;
      min-height: 0;
    }

    /* ------------------------------
       Sidebar: Explorer
       ------------------------------ */
    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      min-width: 160px;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      min-height: 0;
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
    .sidebar-content {
      overflow: auto;
      padding: 6px 0;
    }
    .tree-item {
      padding: 4px 10px 4px 24px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      position: relative;
    }
    .tree-item:hover { background: var(--hover); }
    .tree-item.active { background: var(--tab-active-bg); }
    .tree-item .twist {
      position: absolute;
      left: 8px;
      color: var(--muted);
    }
    .tree-item .badge {
      margin-left: auto;
      background: var(--badge-bg);
      color: var(--badge-text);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
    }

    /* ------------------------------
       Editor area
       ------------------------------ */
    .editor {
      display: grid;
      grid-template-rows: 36px 1fr 160px;
      min-height: 0;
    }

    /* Tabs */
    .tabs {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 6px;
      overflow: hidden;
    }
    .tab {
      background: var(--tab-bg);
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
      box-shadow: 0 1px 0 var(--shadow) inset;
    }
    .tab.active {
      background: var(--tab-active-bg);
      border-color: var(--border);
      color: #ffffff;
    }
    .tab .close {
      opacity: 0.6;
    }
    .tab:hover .close { opacity: 1; }

    /* Editor panels */
    .editor-surface {
      position: relative;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 32px 1fr;
      background: var(--editor-bg);
    }
    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
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
    .btn.primary {
      border-color: var(--accent);
      color: #cfe8ff;
    }
    .btn.primary:hover { background: var(--active); }

    /* Code editor lookalike */
    .code-area {
      position: relative;
      overflow: auto;
      padding: 12px 16px;
      line-height: 1.5;
      font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
      font-size: 13px;
      counter-reset: ln;
    }
    .code-line {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 16px;
      white-space: pre;
    }
    .line-num {
      color: #6b6b6b;
      text-align: right;
      padding-right: 8px;
      user-select: none;
    }
    .code {
      color: #d4d4d4;
    }
    .code .kw { color: #c586c0; }
    .code .fn { color: #dcdcaa; }
    .code .str { color: #ce9178; }
    .code .num { color: #b5cea8; }
    .code .cm { color: #6a9955; }
    .code .obj { color: #9cdcfe; }

    /* Selection mock */
    .selection {
      background: var(--selection);
      border-radius: 2px;
    }

    /* ------------------------------
       Bottom panel: Terminal
       ------------------------------ */
    .terminal {
      background: var(--terminal-bg);
      border-top: 1px solid var(--border);
      display: grid;
      grid-template-rows: 28px 1fr 28px;
      min-height: 0;
    }
    .terminal-header {
      padding: 4px 8px;
      font-size: 12px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .term-tabs {
      display: flex;
      gap: 4px;
    }
    .term-tab {
      padding: 2px 6px;
      border: 1px solid var(--border);
      background: #191919;
      color: var(--muted);
      border-radius: 4px;
      cursor: pointer;
    }
    .term-tab.active {
      color: #e0e0e0;
      background: #202020;
      border-color: var(--accent);
    }
    .terminal-body {
      padding: 8px;
      overflow: auto;
      font-family: Menlo, Consolas, monospace;
      font-size: 12px;
      color: #c7c7c7;
    }
    .terminal-input {
      display: grid;
      grid-template-columns: 32px 1fr 80px;
      gap: 6px;
      border-top: 1px solid var(--border);
      padding: 4px 8px;
      align-items: center;
    }
    .prompt {
      color: var(--accent);
      text-align: center;
      user-select: none;
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
    }
    .term-run:hover { filter: brightness(1.1); }

    /* ------------------------------
       Status bar
       ------------------------------ */
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
    }
    .statusbar .cell { cursor: default; }
    .statusbar .cell.interactive { cursor: pointer; }
    .statusbar .cell.interactive:hover { color: #e0e0e0; }

    /* ------------------------------
       Command palette
       ------------------------------ */
    .cmd-palette {
      position: fixed;
      left: 50%;
      top: 12%;
      transform: translateX(-50%);
      width: min(680px, 92vw);
      background: var(--cmd-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 12px 28px var(--shadow);
      display: none;
      overflow: hidden;
      backdrop-filter: blur(6px);
    }
    .cmd-header {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      color: var(--muted);
    }
    .cmd-input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text);
      font-size: 14px;
      padding: 10px;
    }
    .cmd-list {
      max-height: 320px;
      overflow: auto;
      border-top: 1px solid var(--border);
    }
    .cmd-item {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .cmd-item:hover { background: var(--hover); }
    .keyboard-hint {
      color: var(--muted);
      font-size: 11px;
    }

    /* ------------------------------
       Scrollbars (WebKit)
       ------------------------------ */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 6px; }
    ::-webkit-scrollbar-track { background: var(--scroll-track); }
    ::selection { background: var(--selection); }

    /* ------------------------------
       Resizers
       ------------------------------ */
    .resizer {
      position: relative;
    }
    .resizer-col {
      position: absolute;
      right: -4px;
      top: 0;
      width: 8px;
      height: 100%;
      cursor: col-resize;
    }
    .resizer-row {
      position: absolute;
      left: 0;
      bottom: -4px;
      width: 100%;
      height: 8px;
      cursor: row-resize;
    }

    /* Focus ring helper */
    .focusable:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Title bar -->
    <div class="titlebar">
      <button class="tb-btn" id="btnFile">File</button>
      <button class="tb-btn" id="btnEdit">Edit</button>
      <button class="tb-btn" id="btnView">View</button>
      <button class="tb-btn" id="btnRun">Run</button>
      <span class="app-name">Mini Studio — Untitled (Workspace)</span>
      <button class="tb-btn" id="btnPalette">⌘/Ctrl+Shift+P</button>
    </div>

    <!-- Main -->
    <div class="main">
      <!-- Activity bar -->
      <div class="activitybar">
        <div class="icon active" title="Explorer">🗂️</div>
        <div class="icon" title="Search">🔎</div>
        <div class="icon" title="Source Control">🔱</div>
        <div class="icon" title="Run & Debug">🐞</div>
        <div class="icon" title="Extensions">🧩</div>
      </div>

      <!-- Sidebar (Explorer) -->
      <aside class="sidebar resizer" id="sidebar">
        <div class="sidebar-header">
          <span>Explorer</span>
          <div>
            <button class="tb-btn" id="btnNewFile">New</button>
            <button class="tb-btn" id="btnRefresh">Refresh</button>
          </div>
        </div>
        <div class="sidebar-content" id="explorer">
          <div class="tree-item">
            <span class="twist">▸</span><strong>mini-studio</strong>
          </div>
          <div class="tree-item active" data-open="index.html">
            <span class="twist">•</span><span>index.html</span>
            <span class="badge">HTML</span>
          </div>
          <div class="tree-item" data-open="style.css">
            <span class="twist">•</span><span>style.css</span>
            <span class="badge">CSS</span>
          </div>
          <div class="tree-item" data-open="main.js">
            <span class="twist">•</span><span>main.js</span>
            <span class="badge">JS</span>
          </div>
          <div class="tree-item" data-open="README.md">
            <span class="twist">•</span><span>README.md</span>
            <span class="badge">MD</span>
          </div>
        </div>
        <div class="resizer-col" id="sidebarResizer"></div>
      </aside>

      <!-- Editor -->
      <section class="editor resizer" id="editor">
        <!-- Tabs -->
        <div class="tabs" id="tabs">
          <div class="tab active" data-file="index.html">
            <span>index.html</span>
            <span class="close">✕</span>
          </div>
          <div class="tab" data-file="style.css">
            <span>style.css</span>
            <span class="close">✕</span>
          </div>
          <div class="tab" data-file="main.js">
            <span>main.js</span>
            <span class="close">✕</span>
          </div>
        </div>

        <!-- Editor surface -->
        <div class="editor-surface">
          <div class="editor-toolbar">
            <button class="btn primary" id="btnSave">Save</button>
            <button class="btn" id="btnFormat">Format</button>
            <button class="btn" id="btnToggleTerminal">Toggle Terminal</button>
            <span style="margin-left:auto;color:var(--muted);">UTF-8 | LF | JavaScript</span>
          </div>
          <div class="code-area" id="codeArea" tabindex="0" class="focusable">
            <!-- index.html content -->
            <div class="code-view" data-file="index.html">
              <div class="code-line"><span class="line-num">1</span><span class="code"><span class="cm">&lt;!-- Demo HTML --&gt;</span></span></div>
              <div class="code-line"><span class="line-num">2</span><span class="code">&lt;<span class="kw">!DOCTYPE</span> html&gt;</span></div>
              <div class="code-line"><span class="line-num">3</span><span class="code">&lt;<span class="kw">html</span> lang=<span class="str">"en"</span>&gt;</span></div>
              <div class="code-line"><span class="line-num">4</span><span class="code">&nbsp;&nbsp;&lt;<span class="kw">head</span>&gt;</span></div>
              <div class="code-line"><span class="line-num">5</span><span class="code">&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="kw">meta</span> charset=<span class="str">"UTF-8"</span>&gt;</span></div>
              <div class="code-line"><span class="line-num">6</span><span class="code">&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="kw">title</span>&gt;Hello&lt;/<span class="kw">title</span>&gt;</span></div>
              <div class="code-line"><span class="line-num">7</span><span class="code">&nbsp;&nbsp;&lt;/<span class="kw">head</span>&gt;</span></div>
              <div class="code-line"><span class="line-num">8</span><span class="code">&nbsp;&nbsp;&lt;<span class="kw">body</span>&gt;Hi&lt;/<span class="kw">body</span>&gt;</span></div>
              <div class="code-line"><span class="line-num">9</span><span class="code">&lt;/<span class="kw">html</span>&gt;</span></div>
            </div>

            <!-- style.css content -->
            <div class="code-view" data-file="style.css" style="display:none;">
              <div class="code-line"><span class="line-num">1</span><span class="code"><span class="cm">/* Demo CSS */</span></span></div>
              <div class="code-line"><span class="line-num">2</span><span class="code"><span class="obj">body</span> { <span class="obj">background</span>: <span class="str">#202020</span>; <span class="obj">color</span>: <span class="str">#eee</span>; }</span></div>
              <div class="code-line"><span class="line-num">3</span><span class="code"><span class="obj">button</span> { <span class="obj">border-radius</span>: <span class="num">6px</span>; }</span></div>
            </div>

            <!-- main.js content -->
            <div class="code-view" data-file="main.js" style="display:none;">
              <div class="code-line"><span class="line-num">1</span><span class="code"><span class="cm">// Demo JS</span></span></div>
              <div class="code-line"><span class="line-num">2</span><span class="code"><span class="kw">const</span> msg <span class="kw">=</span> <span class="str">"Hello Studio"</span>;</span></div>
              <div class="code-line"><span class="line-num">3</span><span class="code"><span class="fn">console</span>.<span class="fn">log</span>(msg);</span></div>
            </div>
          </div>
        </div>

        <!-- Resizer for terminal height -->
        <div class="resizer-row" id="terminalResizer"></div>

        <!-- Terminal -->
        <div class="terminal" id="terminal">
          <div class="terminal-header">
            <div class="term-tabs">
              <div class="term-tab active" data-term="bash">bash</div>
              <div class="term-tab" data-term="node">node</div>
            </div>
            <span style="margin-left:auto;">Press Enter to run</span>
          </div>
          <div class="terminal-body" id="terminalBody">
            <div>$ echo "welcome"</div>
            <div>welcome</div>
          </div>
          <div class="terminal-input">
            <div class="prompt">❯</div>
            <input class="term-field" id="termInput" placeholder="Type a command, e.g., node -v" />
            <button class="term-run" id="termRun">Run</button>
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
      <div class="cell interactive" id="toggleTheme">Dark+</div>
      <div class="cell" style="margin-left:auto;">Mini Studio Ready</div>
    </div>
  </div>

  <!-- Command palette -->
  <div class="cmd-palette" id="palette">
    <div class="cmd-header">Command Palette — Type to filter</div>
    <input class="cmd-input" id="paletteInput" placeholder="> e.g., Toggle Sidebar, Toggle Terminal, Save" />
    <div class="cmd-list" id="paletteList"></div>
  </div>

  <script>
    // ------------------------------
    // Basic state
    // ------------------------------
    const tabsEl = document.getElementById('tabs');
    const codeArea = document.getElementById('codeArea');
    const sidebar = document.getElementById('sidebar');
    const terminal = document.getElementById('terminal');
    const terminalBody = document.getElementById('terminalBody');
    const termInput = document.getElementById('termInput');
    const termRun = document.getElementById('termRun');
    const palette = document.getElementById('palette');
    const paletteInput = document.getElementById('paletteInput');
    const paletteList = document.getElementById('paletteList');
    const toggleTheme = document.getElementById('toggleTheme');

    // ------------------------------
    // Tabs switching
    // ------------------------------
    function openFile(file) {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.file === file);
      });
      document.querySelectorAll('.code-view').forEach(v => {
        v.style.display = (v.dataset.file === file) ? 'block' : 'none';
      });
      // Update statusbar line/col mock
      setStatus('Mini Studio Ready');
    }

    tabsEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      if (e.target.classList.contains('close')) {
        tab.remove();
        const first = document.querySelector('.tab');
        if (first) openFile(first.dataset.file);
        return;
      }
      openFile(tab.dataset.file);
    });

    document.getElementById('explorer').addEventListener('click', (e) => {
      const item = e.target.closest('.tree-item');
      if (!item) return;
      const file = item.dataset.open;
      if (file) {
        openFile(file);
        document.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const exists = [...document.querySelectorAll('.tab')].some(t => t.dataset.file === file);
        if (!exists) {
          const t = document.createElement('div');
          t.className = 'tab';
          t.dataset.file = file;
          t.innerHTML = `<span>${file}</span><span class="close">✕</span>`;
          tabsEl.appendChild(t);
        }
      }
    });

    // ------------------------------
    // Terminal mock
    // ------------------------------
    function printToTerminal(text) {
      const div = document.createElement('div');
      div.textContent = text;
      terminalBody.appendChild(div);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    function runCommand(cmd) {
      printToTerminal(`$ ${cmd}`);
      // Primitive mock responses
      if (cmd === 'node -v') printToTerminal('v18.19.0');
      else if (cmd === 'help') printToTerminal('Commands: help, node -v, echo <text>');
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
      if (e.key === 'Enter') {
        termRun.click();
      }
    });

    // ------------------------------
    // Command palette
    // ------------------------------
    const commands = [
      { name: 'Save', action: () => setStatus('Saved ✔') },
      { name: 'Format Document', action: () => setStatus('Formatted ✨') },
      { name: 'Toggle Sidebar', action: toggleSidebar },
      { name: 'Toggle Terminal', action: toggleTerminal },
      { name: 'New File', action: () => setStatus('New file (mock)') },
      { name: 'Refresh Explorer', action: () => setStatus('Explorer refreshed') },
      { name: 'Change Theme: Dark+', action: () => setTheme('dark') },
      { name: 'Change Theme: Light+', action: () => setTheme('light') },
    ];

    function showPalette() {
      palette.style.display = 'block';
      paletteInput.value = '';
      renderPaletteList('');
      paletteInput.focus();
    }
    function hidePalette() {
      palette.style.display = 'none';
    }
    function renderPaletteList(filter) {
      paletteList.innerHTML = '';
      const items = commands.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
      items.forEach(c => {
        const el = document.createElement('div');
        el.className = 'cmd-item';
        el.innerHTML = `<span>${c.name}</span><span class="keyboard-hint">Enter</span>`;
        el.addEventListener('click', () => { c.action(); hidePalette(); });
        paletteList.appendChild(el);
      });
    }
    paletteInput.addEventListener('input', (e) => renderPaletteList(e.target.value));
    paletteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hidePalette();
      if (e.key === 'Enter') {
        const first = paletteList.querySelector('.cmd-item');
        if (first) first.click();
      }
    });
    document.getElementById('btnPalette').addEventListener('click', showPalette);
    document.addEventListener('keydown', (e) => {
      const mod = (navigator.platform.includes('Mac')) ? e.metaKey : e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        showPalette();
      }
    });

    // ------------------------------
    // Sidebar and terminal toggles
    // ------------------------------
    function toggleSidebar() {
      const isHidden = sidebar.style.display === 'none';
      sidebar.style.display = isHidden ? 'flex' : 'none';
      document.querySelector('.main').style.gridTemplateColumns = isHidden ? '48px 280px 1fr' : '48px 0px 1fr';
      setStatus(isHidden ? 'Sidebar shown' : 'Sidebar hidden');
    }
    function toggleTerminal() {
      const isHidden = terminal.style.display === 'none';
      terminal.style.display = isHidden ? 'grid' : 'none';
      setStatus(isHidden ? 'Terminal shown' : 'Terminal hidden');
    }
    document.getElementById('btnToggleTerminal').addEventListener('click', toggleTerminal);

    // ------------------------------
    // Simple status updates
    // ------------------------------
    function setStatus(text) {
      const cells = document.querySelectorAll('.statusbar .cell');
      const last = cells[cells.length - 1];
      last.textContent = text;
    }
    document.getElementById('btnSave').addEventListener('click', () => setStatus('Saved ✔'));
    document.getElementById('btnFormat').addEventListener('click', () => setStatus('Formatted ✨'));
    document.getElementById('btnNewFile').addEventListener('click', () => setStatus('New file (mock)'));
    document.getElementById('btnRefresh').addEventListener('click', () => setStatus('Explorer refreshed'));

    // ------------------------------
    // Resizers (sidebar width, terminal height)
    // ------------------------------
    const sidebarResizer = document.getElementById('sidebarResizer');
    const terminalResizer = document.getElementById('terminalResizer');
    let isDraggingSidebar = false;
    let isDraggingTerminal = false;
    sidebarResizer.addEventListener('mousedown', () => { isDraggingSidebar = true; });
    terminalResizer.addEventListener('mousedown', () => { isDraggingTerminal = true; });
    window.addEventListener('mouseup', () => { isDraggingSidebar = false; isDraggingTerminal = false; });
    window.addEventListener('mousemove', (e) => {
      if (isDraggingSidebar) {
        const min = 160, max = 480;
        const newW = Math.min(max, Math.max(min, e.clientX - 48));
        sidebar.style.width = newW + 'px';
        document.querySelector('.main').style.gridTemplateColumns = `48px ${newW}px 1fr`;
      }
      if (isDraggingTerminal) {
        const editorRect = document.getElementById('editor').getBoundingClientRect();
        const minH = 80, maxH = 400;
        const newH = Math.min(maxH, Math.max(minH, editorRect.bottom - e.clientY));
        terminal.style.gridTemplateRows = `28px 1fr 28px`;
        terminal.style.height = newH + 'px';
      }
    });

    // ------------------------------
    // Theme switch
    // ------------------------------
    function setTheme(kind) {
      if (kind === 'light') {
        document.documentElement.style.setProperty('--bg', '#f3f3f3');
        document.documentElement.style.setProperty('--panel', '#eaeaea');
        document.documentElement.style.setProperty('--sidebar', '#efefef');
        document.documentElement.style.setProperty('--text', '#222');
        document.documentElement.style.setProperty('--muted', '#555');
        document.documentElement.style.setProperty('--border', '#d0d0d0');
        document.documentElement.style.setProperty('--tab-bg', '#e0e0e0');
        document.documentElement.style.setProperty('--tab-active-bg', '#ffffff');
        document.documentElement.style.setProperty('--editor-bg', '#ffffff');
        document.documentElement.style.setProperty('--terminal-bg', '#f7f7f7');
        document.documentElement.style.setProperty('--status-bg', '#e0e0e0');
        toggleTheme.textContent = 'Light+';
      } else {
        // back to dark
        const reset = {
          '--bg': '#1e1e1e',
          '--panel': '#252526',
          '--sidebar': '#252526',
          '--text': '#cccccc',
          '--muted': '#9da3a6',
          '--border': '#3c3c3c',
          '--tab-bg': '#2d2d2d',
          '--tab-active-bg': '#1f1f1f',
          '--editor-bg': '#1e1e1e',
          '--terminal-bg': '#111111',
          '--status-bg': '#0b0b0b'
        };
        Object.entries(reset).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
        toggleTheme.textContent = 'Dark+';
      }
    }
    toggleTheme.addEventListener('click', () => {
      const isDark = toggleTheme.textContent.includes('Dark');
      setTheme(isDark ? 'light' : 'dark');
    });

    // ------------------------------
    // Titlebar buttons (mock)
    // ------------------------------
    document.getElementById('btnFile').addEventListener('click', showPalette);
    document.getElementById('btnEdit').addEventListener('click', showPalette);
    document.getElementById('btnView').addEventListener('click', showPalette);
    document.getElementById('btnRun').addEventListener('click', () => {
      setStatus('Running (mock)');
      printToTerminal('$ npm run dev');
      printToTerminal('Starting dev server...');
      printToTerminal('Ready on http://localhost:5173');
    });

    // Initialize
    openFile('index.html');
  </script>
</body>
</html>
