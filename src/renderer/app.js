// VS Code Clone — main renderer process
// Architecture reverse-engineered from VS Code v1.139.1 using REA

const state = {
  tabs: [],
  activeTabId: null,
  sidebarVisible: true,
  terminalVisible: false,
  terminalId: null,
  editor: null,
  rootFolder: null,
  commandPaletteOpen: false,
};

// Language detection from file extension
const LANG_MAP = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', mts: 'typescript',
  py: 'python', rb: 'ruby', rs: 'rust', go: 'go',
  java: 'java', kt: 'kotlin', swift: 'swift', cs: 'csharp',
  cpp: 'cpp', c: 'c', h: 'cpp', hpp: 'cpp',
  html: 'html', htm: 'html', xml: 'xml', svg: 'xml',
  css: 'css', scss: 'scss', less: 'less', sass: 'scss',
  json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'ini',
  md: 'markdown', mdx: 'markdown',
  sql: 'sql', sh: 'shell', bash: 'shell', zsh: 'shell',
  php: 'php', lua: 'lua', r: 'r', dart: 'dart',
  dockerfile: 'dockerfile', makefile: 'makefile',
  graphql: 'graphql', gql: 'graphql',
  vue: 'html', svelte: 'html',
};

function getLanguage(filePath) {
  const name = filePath.split('/').pop().toLowerCase();
  if (name === 'dockerfile') return 'dockerfile';
  if (name === 'makefile') return 'makefile';
  const ext = name.split('.').pop();
  return LANG_MAP[ext] || 'plaintext';
}

function getFileName(filePath) {
  return filePath.split('/').pop() || filePath;
}

// File icon based on extension
function getFileIcon(name, isDir) {
  if (isDir) return '📁';
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = {
    js: '🟨', ts: '🔷', jsx: '⚛️', tsx: '⚛️',
    py: '🐍', rb: '💎', rs: '🦀', go: '🔵',
    html: '🌐', css: '🎨', scss: '🎨',
    json: '📋', md: '📝', yaml: '⚙️', yml: '⚙️',
    sql: '🗄️', sh: '🖥️', bash: '🖥️',
    png: '🖼️', jpg: '🖼️', svg: '🖼️', gif: '🖼️',
    txt: '📄', env: '🔒', lock: '🔒',
  };
  return icons[ext] || '📄';
}

// Initialize Monaco Editor
async function initMonaco() {
  const monacoPath = require.resolve('monaco-editor/min/vs/loader.js').replace(/loader\.js$/, '');

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = require.resolve('monaco-editor/min/vs/loader.js');
    script.onload = () => {
      window.require.config({
        paths: { vs: monacoPath },
      });
      window.require(['vs/editor/editor.main'], () => {
        monaco.editor.defineTheme('vscode-dark-clone', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#1e1e1e',
            'editor.foreground': '#d4d4d4',
            'editorCursor.foreground': '#aeafad',
            'editor.lineHighlightBackground': '#2a2d2e',
            'editorLineNumber.foreground': '#858585',
            'editorLineNumber.activeForeground': '#c6c6c6',
            'editor.selectionBackground': '#264f78',
            'editor.inactiveSelectionBackground': '#3a3d41',
          },
        });

        state.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
          value: '',
          language: 'plaintext',
          theme: 'vscode-dark-clone',
          automaticLayout: true,
          minimap: { enabled: true, maxColumn: 80 },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', 'SF Mono', Menlo, Monaco, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollBeyondLastLine: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          wordWrap: 'off',
          tabSize: 2,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          padding: { top: 8 },
          suggest: { showIcons: true },
        });

        state.editor.onDidChangeCursorPosition((e) => {
          document.getElementById('status-cursor').textContent =
            `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        state.editor.onDidChangeModelContent(() => {
          const tab = state.tabs.find(t => t.id === state.activeTabId);
          if (tab) {
            tab.modified = true;
            tab.content = state.editor.getValue();
            renderTabs();
          }
        });

        resolve();
      });
    };
    document.head.appendChild(script);
  });
}

// Tab management
let tabIdCounter = 0;

function createTab(filePath, content) {
  const existing = state.tabs.find(t => t.path === filePath);
  if (existing) {
    activateTab(existing.id);
    return;
  }

  const id = ++tabIdCounter;
  const tab = {
    id,
    path: filePath,
    name: getFileName(filePath),
    content,
    language: getLanguage(filePath),
    modified: false,
    originalContent: content,
  };
  state.tabs.push(tab);
  activateTab(id);
  renderTabs();
  renderOpenEditors();
}

function activateTab(id) {
  state.activeTabId = id;
  const tab = state.tabs.find(t => t.id === id);
  if (!tab) return;

  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('monaco-editor').style.display = 'block';

  const model = monaco.editor.createModel(tab.content, tab.language);
  state.editor.setModel(model);

  document.getElementById('status-language').textContent =
    tab.language.charAt(0).toUpperCase() + tab.language.slice(1);

  updateBreadcrumbs(tab.path);
  updateTitle(tab);
  renderTabs();
  renderOpenEditors();
}

function closeTab(id) {
  const idx = state.tabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  state.tabs.splice(idx, 1);

  if (state.activeTabId === id) {
    if (state.tabs.length > 0) {
      const next = state.tabs[Math.min(idx, state.tabs.length - 1)];
      activateTab(next.id);
    } else {
      state.activeTabId = null;
      document.getElementById('welcome-screen').style.display = '';
      document.getElementById('monaco-editor').style.display = 'none';
      document.getElementById('breadcrumbs').classList.remove('visible');
      document.getElementById('titlebar-text').textContent = 'Code Clone';
    }
  }
  renderTabs();
  renderOpenEditors();
}

function renderTabs() {
  const container = document.getElementById('tabs-container');
  container.innerHTML = '';
  for (const tab of state.tabs) {
    const el = document.createElement('div');
    el.className = `tab${tab.id === state.activeTabId ? ' active' : ''}${tab.modified ? ' modified' : ''}`;
    el.innerHTML = `<span class="tab-label">${tab.name}</span><span class="tab-close">×</span>`;
    el.querySelector('.tab-label').addEventListener('click', () => activateTab(tab.id));
    el.querySelector('.tab-close').addEventListener('click', (e) => { e.stopPropagation(); closeTab(tab.id); });
    container.appendChild(el);
  }
}

function renderOpenEditors() {
  const list = document.getElementById('open-editors-list');
  list.innerHTML = '';
  for (const tab of state.tabs) {
    const el = document.createElement('div');
    el.className = `open-editor-item${tab.id === state.activeTabId ? ' active' : ''}`;
    el.textContent = tab.name;
    el.addEventListener('click', () => activateTab(tab.id));
    list.appendChild(el);
  }
}

function updateBreadcrumbs(filePath) {
  const bc = document.getElementById('breadcrumbs');
  const parts = filePath.split('/').filter(Boolean);
  bc.innerHTML = parts.map((p, i) =>
    `<span class="breadcrumb-item">${p}</span>${i < parts.length - 1 ? '<span class="breadcrumb-sep">›</span>' : ''}`
  ).join('');
  bc.classList.add('visible');
}

function updateTitle(tab) {
  const title = tab ? `${tab.name} — Code Clone` : 'Code Clone';
  document.getElementById('titlebar-text').textContent = title;
  document.title = title;
}

// File Tree
function renderFileTree(items, container, depth = 0) {
  for (const item of items) {
    const el = document.createElement('div');
    el.className = 'tree-item';
    el.style.paddingLeft = `${12 + depth * 16}px`;
    el.innerHTML = `
      <span class="tree-icon">${item.isDirectory ? '▸' : ''}</span>
      <span class="tree-icon">${getFileIcon(item.name, item.isDirectory)}</span>
      <span class="tree-label">${item.name}</span>
    `;

    if (item.isDirectory) {
      let expanded = false;
      el.addEventListener('click', async () => {
        expanded = !expanded;
        el.querySelector('.tree-icon').textContent = expanded ? '▾' : '▸';
        const childContainer = el.nextElementSibling;
        if (childContainer?.classList.contains('tree-children')) {
          childContainer.style.display = expanded ? '' : 'none';
        } else if (expanded) {
          const children = await window.api.readDir(item.path);
          const wrapper = document.createElement('div');
          wrapper.className = 'tree-children';
          renderFileTree(children, wrapper, depth + 1);
          el.after(wrapper);
        }
      });
    } else {
      el.addEventListener('click', async () => {
        try {
          const content = await window.api.readFile(item.path);
          createTab(item.path, content);
        } catch (err) {
          console.error('Failed to open file:', err);
        }
      });
    }
    container.appendChild(el);
  }
}

// Terminal
let terminal = null;

async function initTerminal() {
  const { Terminal } = require('@xterm/xterm');
  const { FitAddon } = require('@xterm/addon-fit');

  // Load xterm CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = require.resolve('@xterm/xterm/css/xterm.css');
  document.head.appendChild(link);

  terminal = new Terminal({
    theme: {
      background: '#1e1e1e',
      foreground: '#cccccc',
      cursor: '#aeafad',
      selectionBackground: '#264f78',
      black: '#1e1e1e',
      red: '#f44747',
      green: '#89d185',
      yellow: '#cca700',
      blue: '#3794ff',
      magenta: '#c586c0',
      cyan: '#4ec9b0',
      white: '#d4d4d4',
    },
    fontFamily: "'Fira Code', 'Cascadia Code', 'SF Mono', Menlo, Monaco, monospace",
    fontSize: 13,
    cursorBlink: true,
    allowTransparency: true,
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  const container = document.getElementById('terminal-container');
  terminal.open(container);
  fitAddon.fit();

  const cwd = state.rootFolder || undefined;
  const result = await window.api.createTerminal({ cols: terminal.cols, rows: terminal.rows, cwd });

  if (result.error) {
    terminal.writeln(`\x1b[31mFailed to create terminal: ${result.error}\x1b[0m`);
    terminal.writeln('\x1b[33mInstall node-pty: npm rebuild node-pty --runtime=electron --target=33.4.0\x1b[0m');
    return;
  }

  state.terminalId = result.id;

  terminal.onData((data) => {
    window.api.writeTerminal(state.terminalId, data);
  });

  window.api.onTerminalData(({ id, data }) => {
    if (id === state.terminalId) terminal.write(data);
  });

  window.api.onTerminalExit(({ id }) => {
    if (id === state.terminalId) {
      terminal.writeln('\r\n\x1b[90m[Process exited]\x1b[0m');
      state.terminalId = null;
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    fitAddon.fit();
    if (state.terminalId) {
      window.api.resizeTerminal(state.terminalId, terminal.cols, terminal.rows);
    }
  });
  resizeObserver.observe(container);
}

function toggleTerminal() {
  const panel = document.getElementById('terminal-panel');
  const resize = document.getElementById('terminal-resize');
  state.terminalVisible = !state.terminalVisible;
  panel.style.display = state.terminalVisible ? '' : 'none';
  resize.style.display = state.terminalVisible ? '' : 'none';

  if (state.terminalVisible && !terminal) {
    initTerminal();
  } else if (terminal) {
    terminal.focus();
  }
}

// Command Palette
const COMMANDS = [
  { label: 'New File', shortcut: '⌘N', action: () => newFile() },
  { label: 'Open File...', shortcut: '⌘O', action: () => window.api.openFile() },
  { label: 'Open Folder...', shortcut: '⌘⇧O', action: () => window.api.openFolder() },
  { label: 'Save', shortcut: '⌘S', action: () => saveCurrentFile() },
  { label: 'Toggle Sidebar', shortcut: '⌘B', action: () => toggleSidebar() },
  { label: 'Toggle Terminal', shortcut: '⌘`', action: () => toggleTerminal() },
  { label: 'Command Palette', shortcut: '⌘⇧P', action: () => toggleCommandPalette() },
  { label: 'Settings', shortcut: '⌘,', action: () => window.api.openSettings() },
  { label: 'Word Wrap', shortcut: '', action: () => toggleWordWrap() },
  { label: 'Minimap', shortcut: '', action: () => toggleMinimap() },
  { label: 'Zoom In', shortcut: '⌘+', action: () => {} },
  { label: 'Zoom Out', shortcut: '⌘-', action: () => {} },
  { label: 'Close Tab', shortcut: '⌘W', action: () => state.activeTabId && closeTab(state.activeTabId) },
];

function toggleCommandPalette() {
  const palette = document.getElementById('command-palette');
  state.commandPaletteOpen = !state.commandPaletteOpen;
  palette.style.display = state.commandPaletteOpen ? '' : 'none';
  if (state.commandPaletteOpen) {
    const input = document.getElementById('palette-input');
    input.value = '';
    input.focus();
    renderPaletteResults('');
  }
}

function renderPaletteResults(query) {
  const results = document.getElementById('palette-results');
  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  results.innerHTML = filtered.map((cmd, i) => `
    <div class="palette-item${i === 0 ? ' selected' : ''}" data-index="${i}">
      <span>${cmd.label}</span>
      <span class="shortcut">${cmd.shortcut}</span>
    </div>
  `).join('');

  results.querySelectorAll('.palette-item').forEach((el, i) => {
    el.addEventListener('click', () => {
      filtered[i].action();
      toggleCommandPalette();
    });
  });
}

// Actions
function newFile() {
  const id = ++tabIdCounter;
  const tab = {
    id, path: `Untitled-${id}`, name: `Untitled-${id}`,
    content: '', language: 'plaintext', modified: false, originalContent: '',
  };
  state.tabs.push(tab);
  activateTab(id);
}

async function saveCurrentFile() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  let savePath = tab.path;
  if (tab.path.startsWith('Untitled-')) {
    savePath = await window.api.saveFile(tab.name);
    if (!savePath) return;
    tab.path = savePath;
    tab.name = getFileName(savePath);
    tab.language = getLanguage(savePath);
    const model = state.editor.getModel();
    monaco.editor.setModelLanguage(model, tab.language);
    document.getElementById('status-language').textContent =
      tab.language.charAt(0).toUpperCase() + tab.language.slice(1);
  }

  await window.api.writeFile(savePath, tab.content || state.editor.getValue());
  tab.modified = false;
  tab.originalContent = tab.content;
  renderTabs();
  updateTitle(tab);
}

function toggleSidebar() {
  state.sidebarVisible = !state.sidebarVisible;
  document.getElementById('sidebar').style.display = state.sidebarVisible ? '' : 'none';
  document.getElementById('sidebar-resize').style.display = state.sidebarVisible ? '' : 'none';
}

function toggleWordWrap() {
  const current = state.editor.getOption(monaco.editor.EditorOption.wordWrap);
  state.editor.updateOptions({ wordWrap: current === 'on' ? 'off' : 'on' });
}

function toggleMinimap() {
  const current = state.editor.getOption(monaco.editor.EditorOption.minimap);
  state.editor.updateOptions({ minimap: { enabled: !current.enabled } });
}

// Sidebar resize
function initResizeHandlers() {
  const sidebarResize = document.getElementById('sidebar-resize');
  const sidebar = document.getElementById('sidebar');

  let startX, startWidth;
  sidebarResize.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    const onMove = (e) => {
      const w = Math.max(180, Math.min(600, startWidth + e.clientX - startX));
      sidebar.style.width = w + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  const terminalResize = document.getElementById('terminal-resize');
  const terminalPanel = document.getElementById('terminal-panel');

  terminalResize.addEventListener('mousedown', (e) => {
    const startY = e.clientY;
    const startH = terminalPanel.offsetHeight;
    const onMove = (e) => {
      const h = Math.max(100, Math.min(600, startH - (e.clientY - startY)));
      terminalPanel.style.height = h + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// Event Listeners
function setupEventListeners() {
  // Activity bar
  document.querySelectorAll('.activity-item[data-panel]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.activity-item').forEach(a => a.classList.remove('active'));
      el.classList.add('active');
      if (!state.sidebarVisible) toggleSidebar();
    });
  });

  document.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
    window.api.openSettings();
  });

  // Welcome actions
  document.getElementById('welcome-open-file')?.addEventListener('click', () => window.api.openFile());
  document.getElementById('welcome-open-folder')?.addEventListener('click', () => window.api.openFolder());
  document.getElementById('welcome-new-file')?.addEventListener('click', () => newFile());
  document.getElementById('welcome-terminal')?.addEventListener('click', () => toggleTerminal());
  document.getElementById('btn-open-folder')?.addEventListener('click', () => window.api.openFolder());

  // Terminal buttons
  document.getElementById('btn-new-terminal')?.addEventListener('click', () => {
    if (terminal) { terminal.dispose(); terminal = null; }
    initTerminal();
  });
  document.getElementById('btn-kill-terminal')?.addEventListener('click', () => {
    if (state.terminalId) window.api.killTerminal(state.terminalId);
  });

  // Command palette
  const paletteInput = document.getElementById('palette-input');
  paletteInput?.addEventListener('input', (e) => renderPaletteResults(e.target.value));
  paletteInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleCommandPalette();
    if (e.key === 'Enter') {
      const selected = document.querySelector('.palette-item.selected');
      selected?.click();
    }
  });
  document.querySelector('.palette-backdrop')?.addEventListener('click', () => toggleCommandPalette());

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.shiftKey && e.key === 'P') { e.preventDefault(); toggleCommandPalette(); }
    if (mod && e.key === '`') { e.preventDefault(); toggleTerminal(); }
    if (mod && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
    if (mod && e.key === 's') { e.preventDefault(); saveCurrentFile(); }
    if (mod && e.key === 'n') { e.preventDefault(); newFile(); }
    if (mod && e.key === 'w') { e.preventDefault(); if (state.activeTabId) closeTab(state.activeTabId); }
    if (e.key === 'Escape' && state.commandPaletteOpen) { toggleCommandPalette(); }
  });

  // IPC menu events
  window.api.onMenuEvent('file:opened', (data) => createTab(data.path, data.content));
  window.api.onMenuEvent('folder:opened', (data) => {
    state.rootFolder = data.path;
    document.getElementById('folder-name').textContent = getFileName(data.path).toUpperCase();
    const tree = document.getElementById('file-tree');
    tree.innerHTML = '';
    renderFileTree(data.tree, tree);
  });
  window.api.onMenuEvent('menu:new-file', () => newFile());
  window.api.onMenuEvent('menu:save', () => saveCurrentFile());
  window.api.onMenuEvent('menu:toggle-sidebar', () => toggleSidebar());
  window.api.onMenuEvent('menu:toggle-terminal', () => toggleTerminal());
  window.api.onMenuEvent('menu:command-palette', () => toggleCommandPalette());
  window.api.onMenuEvent('menu:find', () => state.editor?.trigger('', 'actions.find'));
  window.api.onMenuEvent('menu:replace', () => state.editor?.trigger('', 'editor.action.startFindReplaceAction'));
}

// Initialize
async function init() {
  await initMonaco();
  initResizeHandlers();
  setupEventListeners();
}

init().catch(console.error);
