// VS Code Clone — Complete Renderer Application
// Reverse-engineered from VS Code v1.139.1 using REA (5,966 files, 29M AST nodes)

(function () {
  'use strict';

  // ════════════════════════════════════════════════════════════════
  //  STATE
  // ════════════════════════════════════════════════════════════════
  const state = {
    tabs: [],
    activeTabId: null,
    sidebarVisible: true,
    sidebarWidth: 260,
    activePanel: 'explorer',
    panelVisible: false,
    panelHeight: 250,
    activeBottomTab: 'terminal',
    terminalInstances: [],
    activeTerminalId: null,
    editor: null,
    diffEditor: null,
    rootFolder: null,
    rootFolderName: '',
    commandPaletteOpen: false,
    quickOpenMode: null,
    paletteSelectedIndex: 0,
    paletteFilteredCommands: [],
    recentFiles: [],
    gitBranch: 'main',
    gitChanges: [],
    isGitRepo: false,
    breakpoints: [],
    watchExpressions: [],
    notifications: [],
    searchResults: [],
    problems: [],
    installedExtensions: new Set(),
    outputLog: [],
    zenMode: false,
    autoSave: false,
    wordWrap: false,
    minimapEnabled: true,
    breadcrumbsEnabled: true,
    theme: 'dark',
    contextMenu: null,
  };

  let tabIdCounter = 0;
  let monacoReady = false;

  // ════════════════════════════════════════════════════════════════
  //  LANGUAGE MAP
  // ════════════════════════════════════════════════════════════════
  const LANG_MAP = {
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
    py: 'python', pyw: 'python', pyi: 'python',
    rb: 'ruby', rake: 'ruby', gemspec: 'ruby',
    rs: 'rust', go: 'go', java: 'java', kt: 'kotlin', kts: 'kotlin',
    swift: 'swift', cs: 'csharp', fs: 'fsharp', fsx: 'fsharp',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c', h: 'cpp', hpp: 'cpp', hxx: 'cpp',
    m: 'objective-c', mm: 'objective-c',
    html: 'html', htm: 'html', xhtml: 'html',
    xml: 'xml', xsl: 'xml', xslt: 'xml', svg: 'xml', plist: 'xml',
    css: 'css', scss: 'scss', less: 'less', sass: 'scss', styl: 'css',
    json: 'json', jsonc: 'json', json5: 'json',
    yaml: 'yaml', yml: 'yaml',
    toml: 'ini', ini: 'ini', cfg: 'ini', conf: 'ini', properties: 'ini',
    md: 'markdown', mdx: 'markdown', rmd: 'markdown',
    sql: 'sql', mysql: 'sql', pgsql: 'sql',
    sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell', ksh: 'shell',
    ps1: 'powershell', psm1: 'powershell', psd1: 'powershell',
    php: 'php', phtml: 'php',
    lua: 'lua', r: 'r', R: 'r',
    dart: 'dart', ex: 'elixir', exs: 'elixir', erl: 'erlang',
    zig: 'zig', nim: 'nim', v: 'v', vala: 'vala',
    pl: 'perl', pm: 'perl', perl: 'perl',
    dockerfile: 'dockerfile', makefile: 'makefile',
    graphql: 'graphql', gql: 'graphql',
    vue: 'html', svelte: 'html', astro: 'html',
    tf: 'hcl', hcl: 'hcl',
    proto: 'protobuf', prisma: 'prisma',
    bat: 'bat', cmd: 'bat',
    clj: 'clojure', cljs: 'clojure', cljc: 'clojure',
    scala: 'scala', groovy: 'groovy',
    hs: 'haskell', lhs: 'haskell', ml: 'fsharp', mli: 'fsharp',
    tex: 'latex', sty: 'latex', bib: 'bibtex',
    rst: 'restructuredtext', txt: 'plaintext', log: 'log',
    env: 'dotenv', gitignore: 'ignore', dockerignore: 'ignore',
    csv: 'plaintext', tsv: 'plaintext',
  };

  const FILE_ICONS = {
    js: { color: '#f0db4f', letter: 'JS' },
    ts: { color: '#3178c6', letter: 'TS' },
    jsx: { color: '#61dafb', letter: 'JX' },
    tsx: { color: '#3178c6', letter: 'TX' },
    py: { color: '#3572a5', letter: 'Py' },
    rb: { color: '#cc342d', letter: 'Rb' },
    rs: { color: '#dea584', letter: 'Rs' },
    go: { color: '#00add8', letter: 'Go' },
    java: { color: '#b07219', letter: 'Jv' },
    html: { color: '#e34c26', letter: '<>' },
    css: { color: '#563d7c', letter: '#' },
    scss: { color: '#c6538c', letter: 'Sc' },
    json: { color: '#a6a61e', letter: '{}' },
    md: { color: '#519aba', letter: 'Md' },
    yaml: { color: '#cb171e', letter: 'Ym' },
    yml: { color: '#cb171e', letter: 'Ym' },
    sql: { color: '#e38c00', letter: 'SQ' },
    sh: { color: '#89e051', letter: '$_' },
    php: { color: '#4f5d95', letter: 'Ph' },
    vue: { color: '#41b883', letter: 'Vu' },
    svelte: { color: '#ff3e00', letter: 'Sv' },
    dart: { color: '#00b4ab', letter: 'Da' },
    swift: { color: '#f05138', letter: 'Sw' },
    kt: { color: '#a97bff', letter: 'Kt' },
    c: { color: '#555555', letter: 'C' },
    cpp: { color: '#f34b7d', letter: 'C+' },
    cs: { color: '#178600', letter: 'C#' },
    lua: { color: '#000080', letter: 'Lu' },
    r: { color: '#198ce7', letter: 'R' },
    toml: { color: '#9c4221', letter: 'Tm' },
    xml: { color: '#0060ac', letter: 'Xm' },
    svg: { color: '#ff9900', letter: 'Sv' },
    dockerfile: { color: '#384d54', letter: 'Dk' },
    txt: { color: '#888', letter: 'Tx' },
    env: { color: '#ecd53f', letter: '.e' },
    lock: { color: '#888', letter: 'Lk' },
    gitignore: { color: '#f05032', letter: '.g' },
    graphql: { color: '#e10098', letter: 'GQ' },
    gql: { color: '#e10098', letter: 'GQ' },
    prisma: { color: '#2d3748', letter: 'Pr' },
    tf: { color: '#5c4ee5', letter: 'Tf' },
    hcl: { color: '#5c4ee5', letter: 'Hc' },
    zig: { color: '#f7a41d', letter: 'Zg' },
    wasm: { color: '#654ff0', letter: 'Wm' },
    astro: { color: '#ff5d01', letter: 'As' },
    mdx: { color: '#fcb32c', letter: 'Mx' },
    mjs: { color: '#f0db4f', letter: 'MJ' },
    cjs: { color: '#f0db4f', letter: 'CJ' },
    mts: { color: '#3178c6', letter: 'MT' },
    cts: { color: '#3178c6', letter: 'CT' },
    less: { color: '#1d365d', letter: 'Le' },
    styl: { color: '#ff6347', letter: 'St' },
    coffee: { color: '#244776', letter: 'Cf' },
    elm: { color: '#60b5cc', letter: 'El' },
    ex: { color: '#6e4a7e', letter: 'Ex' },
    exs: { color: '#6e4a7e', letter: 'Ex' },
    erl: { color: '#b83998', letter: 'Er' },
    hs: { color: '#5e5086', letter: 'Hs' },
    ml: { color: '#e98407', letter: 'ML' },
    fs: { color: '#b845fc', letter: 'F#' },
    clj: { color: '#db5855', letter: 'Cl' },
    scala: { color: '#c22d40', letter: 'Sc' },
    pl: { color: '#0298c3', letter: 'Pl' },
    tex: { color: '#3d6117', letter: 'Tx' },
    ini: { color: '#d1dbe0', letter: 'Ini' },
    cfg: { color: '#d1dbe0', letter: 'Cf' },
    bat: { color: '#c1f12e', letter: 'Bt' },
    ps1: { color: '#012456', letter: 'PS' },
    fish: { color: '#4aae47', letter: 'Fi' },
    zsh: { color: '#89e051', letter: 'Zs' },
    bash: { color: '#89e051', letter: 'Bs' },
    makefile: { color: '#427819', letter: 'Mk' },
    cmake: { color: '#064f8c', letter: 'CM' },
    proto: { color: '#aac148', letter: 'Pb' },
    sol: { color: '#aa6746', letter: 'So' },
    v: { color: '#4FC1FF', letter: 'V' },
    nim: { color: '#ffc200', letter: 'Nm' },
    d: { color: '#ba595e', letter: 'D' },
    m: { color: '#438eff', letter: 'Ob' },
    h: { color: '#555555', letter: 'H' },
    hpp: { color: '#f34b7d', letter: 'H+' },
    pug: { color: '#a86454', letter: 'Pg' },
    ejs: { color: '#a91e50', letter: 'EJ' },
    hbs: { color: '#f0772b', letter: 'Hb' },
    log: { color: '#999', letter: 'Lg' },
    csv: { color: '#237346', letter: 'Cv' },
    tsv: { color: '#237346', letter: 'Tv' },
  };

  function getLanguage(filePath) {
    const name = (filePath || '').split('/').pop().toLowerCase();
    if (name === 'dockerfile' || name.startsWith('dockerfile.')) return 'dockerfile';
    if (name === 'makefile' || name === 'gnumakefile') return 'makefile';
    if (name === '.gitignore' || name === '.dockerignore') return 'ignore';
    if (name === '.env' || name.startsWith('.env.')) return 'dotenv';
    const ext = name.includes('.') ? name.split('.').pop() : '';
    return LANG_MAP[ext] || 'plaintext';
  }

  function getFileName(filePath) {
    return (filePath || '').split('/').pop() || filePath;
  }

  function getFileExtension(name) {
    const n = (name || '').toLowerCase();
    if (n === 'dockerfile') return 'dockerfile';
    if (n === 'makefile') return 'makefile';
    if (n.startsWith('.env')) return 'env';
    if (n === '.gitignore') return 'gitignore';
    return n.includes('.') ? n.split('.').pop() : '';
  }

  // ════════════════════════════════════════════════════════════════
  //  MONACO EDITOR
  // ════════════════════════════════════════════════════════════════
  function initMonaco() {
    return new Promise((resolve, reject) => {
      const base = '../../node_modules/monaco-editor/min';
      const absBase = new URL(base, window.location.href).href;
      const loaderScript = document.createElement('script');
      loaderScript.src = base + '/vs/loader.js';
      loaderScript.onload = () => {
        window.require.config({ paths: { vs: base + '/vs' } });
        window.MonacoEnvironment = {
          getWorkerUrl: function (moduleId, label) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(
              `self.MonacoEnvironment = { baseUrl: '${absBase}/' }; importScripts('${absBase}/vs/base/worker/workerMain.js');`
            )}`;
          },
        };
        window.require(['vs/editor/editor.main'], () => {
          monaco.editor.defineTheme('vscode-clone-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '6A9955' },
              { token: 'keyword', foreground: '569CD6' },
              { token: 'string', foreground: 'CE9178' },
              { token: 'number', foreground: 'B5CEA8' },
              { token: 'type', foreground: '4EC9B0' },
              { token: 'function', foreground: 'DCDCAA' },
              { token: 'variable', foreground: '9CDCFE' },
              { token: 'constant', foreground: '4FC1FF' },
              { token: 'regexp', foreground: 'D16969' },
              { token: 'tag', foreground: '569CD6' },
              { token: 'attribute.name', foreground: '9CDCFE' },
              { token: 'attribute.value', foreground: 'CE9178' },
              { token: 'delimiter', foreground: 'D4D4D4' },
            ],
            colors: {
              'editor.background': '#1e1e1e',
              'editor.foreground': '#d4d4d4',
              'editorCursor.foreground': '#aeafad',
              'editor.lineHighlightBackground': '#2a2d2e',
              'editorLineNumber.foreground': '#858585',
              'editorLineNumber.activeForeground': '#c6c6c6',
              'editor.selectionBackground': '#264f78',
              'editor.inactiveSelectionBackground': '#3a3d41',
              'editorIndentGuide.background': '#404040',
              'editorIndentGuide.activeBackground': '#707070',
              'editorBracketMatch.background': '#0064001a',
              'editorBracketMatch.border': '#888888',
              'editor.findMatchBackground': '#515c6a',
              'editor.findMatchHighlightBackground': '#ea5c0055',
              'editorWidget.background': '#252526',
              'editorWidget.border': '#454545',
              'editorSuggestWidget.background': '#252526',
              'editorSuggestWidget.border': '#454545',
              'editorSuggestWidget.selectedBackground': '#04395e',
              'editorHoverWidget.background': '#252526',
              'editorHoverWidget.border': '#454545',
              'peekViewEditor.background': '#001f33',
              'peekViewResult.background': '#252526',
            },
          });

          monaco.editor.defineTheme('vscode-clone-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#ffffff',
              'editor.foreground': '#000000',
            },
          });

          monaco.editor.defineTheme('vscode-clone-hc', {
            base: 'hc-black',
            inherit: true,
            rules: [],
            colors: {},
          });

          state.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '',
            language: 'plaintext',
            theme: 'vscode-clone-dark',
            automaticLayout: true,
            minimap: { enabled: true, maxColumn: 80, renderCharacters: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollBeyondLastLine: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            wordWrap: 'off',
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true, highlightActiveIndentation: true },
            padding: { top: 8 },
            suggest: { showIcons: true, preview: true },
            parameterHints: { enabled: true },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',
            matchBrackets: 'always',
            renderWhitespace: 'selection',
            colorDecorators: true,
            linkedEditing: true,
            stickyScroll: { enabled: true },
            inlayHints: { enabled: 'on' },
            formatOnPaste: false,
            formatOnType: false,
            quickSuggestions: true,
            snippetSuggestions: 'inline',
            accessibilitySupport: 'auto',
          });

          state.editor.onDidChangeCursorPosition((e) => {
            const pos = e.position;
            const el = document.getElementById('status-cursor');
            if (el) el.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
          });

          state.editor.onDidChangeModelContent(() => {
            const tab = state.tabs.find(t => t.id === state.activeTabId);
            if (tab && !tab._settingContent) {
              tab.modified = tab.originalContent !== state.editor.getValue();
              tab.content = state.editor.getValue();
              renderTabs();
            }
          });

          state.editor.onDidChangeModel(() => {
            updateStatusBarLanguage();
          });

          state.editor.addAction({
            id: 'save-file',
            label: 'Save File',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            run: () => saveCurrentFile(),
          });

          monacoReady = true;
          resolve();
        });
      };
      loaderScript.onerror = reject;
      document.body.appendChild(loaderScript);
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  TAB MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  function createTab(filePath, content) {
    const existing = state.tabs.find(t => t.path === filePath);
    if (existing) {
      activateTab(existing.id);
      return existing;
    }

    const id = ++tabIdCounter;
    const tab = {
      id, path: filePath,
      name: getFileName(filePath),
      content: content,
      language: getLanguage(filePath),
      modified: false,
      originalContent: content,
      _settingContent: false,
    };
    state.tabs.push(tab);
    addRecentFile(filePath);
    activateTab(id);
    return tab;
  }

  function activateTab(id) {
    state.activeTabId = id;
    const tab = state.tabs.find(t => t.id === id);
    if (!tab || !monacoReady) return;

    if (tab.isDiff) {
      activateDiffTab(tab);
      return;
    }

    showElement('monaco-editor');
    hideElement('welcome-screen');
    hideElement('diff-editor');

    if (state.diffEditor) {
      state.diffEditor.dispose();
      state.diffEditor = null;
    }

    tab._settingContent = true;
    const uri = monaco.Uri.parse('file://' + (tab.path || 'untitled-' + id));
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(tab.content, tab.language, uri);
    } else {
      if (model.getValue() !== tab.content) {
        model.setValue(tab.content);
      }
    }
    state.editor.setModel(model);
    tab._settingContent = false;

    updateBreadcrumbs(tab.path);
    updateTitle(tab);
    updateStatusBarLanguage();
    highlightActiveFileInTree(tab.path);
    renderTabs();
    renderOpenEditors();
    state.editor.focus();
    applyGitGutterDecorations(tab);
  }

  function closeTab(id, force = false) {
    const tab = state.tabs.find(t => t.id === id);
    if (!tab) return;

    if (tab.modified && !force) {
      showNotification('warning', `Do you want to save changes to "${tab.name}"?`, 0, [
        { label: 'Save', action: async () => { await window.fs.writeFile(tab.path, tab.content); closeTab(id, true); } },
        { label: "Don't Save", action: () => closeTab(id, true) },
        { label: 'Cancel', action: () => {} },
      ]);
      return;
    }

    const idx = state.tabs.indexOf(tab);
    state.tabs.splice(idx, 1);

    if (!tab.isDiff) {
      const uri = monaco.Uri.parse('file://' + (tab.path || 'untitled-' + id));
      const model = monaco.editor.getModel(uri);
      if (model) model.dispose();
    }

    if (state.activeTabId === id) {
      if (state.diffEditor) { state.diffEditor.dispose(); state.diffEditor = null; }
      if (state.tabs.length > 0) {
        activateTab(state.tabs[Math.min(idx, state.tabs.length - 1)].id);
      } else {
        state.activeTabId = null;
        hideElement('monaco-editor');
        hideElement('diff-editor');
        showElement('welcome-screen');
        updateBreadcrumbs(null);
        updateTitle(null);
      }
    }
    renderTabs();
    renderOpenEditors();
  }

  function closeOtherTabs(keepId) {
    const toClose = state.tabs.filter(t => t.id !== keepId).map(t => t.id);
    toClose.forEach(id => closeTab(id, true));
  }

  function closeAllTabs() {
    [...state.tabs].forEach(t => closeTab(t.id, true));
  }

  function closeSavedTabs() {
    state.tabs.filter(t => !t.modified).map(t => t.id).forEach(id => closeTab(id, true));
  }

  function renderTabs() {
    const container = document.getElementById('tabs-container');
    if (!container) return;
    container.innerHTML = '';

    for (const tab of state.tabs) {
      const el = document.createElement('div');
      el.className = 'tab' + (tab.id === state.activeTabId ? ' active' : '') + (tab.modified ? ' modified' : '') + (tab.isDiff ? ' diff-tab' : '');
      el.draggable = true;
      el.dataset.tabId = tab.id;

      const ext = getFileExtension(tab.name);
      const iconInfo = FILE_ICONS[ext];
      const iconHtml = iconInfo
        ? `<span class="tab-icon" style="color:${iconInfo.color}">${iconInfo.letter}</span>`
        : '<span class="tab-icon">F</span>';

      el.innerHTML = `${iconHtml}<span class="tab-label">${tab.name}</span>` +
        (tab.modified ? '<span class="tab-dot"></span>' : '') +
        '<span class="tab-close" title="Close">&times;</span>';

      el.querySelector('.tab-label').addEventListener('click', () => activateTab(tab.id));
      el.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tab.id);
      });

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, [
          { label: 'Close', action: () => closeTab(tab.id) },
          { label: 'Close Others', action: () => closeOtherTabs(tab.id) },
          { label: 'Close All', action: () => closeAllTabs() },
          { label: 'Close Saved', action: () => closeSavedTabs() },
          { type: 'separator' },
          { label: 'Copy Path', action: () => navigator.clipboard?.writeText(tab.path) },
          { label: 'Reveal in Finder', action: () => window.appApi.showItemInFolder(tab.path) },
        ]);
      });

      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', tab.id.toString());
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
      el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const dragId = parseInt(e.dataTransfer.getData('text/plain'));
        const dragIdx = state.tabs.findIndex(t => t.id === dragId);
        const dropIdx = state.tabs.findIndex(t => t.id === tab.id);
        if (dragIdx !== -1 && dropIdx !== -1 && dragIdx !== dropIdx) {
          const [moved] = state.tabs.splice(dragIdx, 1);
          state.tabs.splice(dropIdx, 0, moved);
          renderTabs();
        }
      });

      el.addEventListener('mousedown', (e) => {
        if (e.button === 1) { e.preventDefault(); closeTab(tab.id); }
      });

      container.appendChild(el);
    }
  }

  function renderOpenEditors() {
    const list = document.getElementById('open-editors-list');
    if (!list) return;
    list.innerHTML = '';
    for (const tab of state.tabs) {
      const el = document.createElement('div');
      el.className = 'tree-item open-editor-item' + (tab.id === state.activeTabId ? ' active' : '');
      const ext = getFileExtension(tab.name);
      const iconInfo = FILE_ICONS[ext];
      el.innerHTML =
        '<span class="oe-close" title="Close">&times;</span>' +
        (iconInfo ? `<span class="file-icon" style="color:${iconInfo.color}">${iconInfo.letter}</span>` : '<span class="file-icon">F</span>') +
        `<span class="tree-label">${tab.name}</span>` +
        (tab.modified ? '<span class="oe-modified"></span>' : '');
      el.querySelector('.tree-label').addEventListener('click', () => activateTab(tab.id));
      el.querySelector('.oe-close').addEventListener('click', (e) => { e.stopPropagation(); closeTab(tab.id); });
      list.appendChild(el);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  BREADCRUMBS
  // ════════════════════════════════════════════════════════════════
  function updateBreadcrumbs(filePath) {
    const bc = document.getElementById('breadcrumbs');
    if (!bc) return;

    if (!filePath || !state.breadcrumbsEnabled) {
      bc.classList.remove('visible');
      return;
    }
    bc.classList.add('visible');

    let parts;
    if (state.rootFolder && filePath.startsWith(state.rootFolder)) {
      const rel = filePath.slice(state.rootFolder.length + 1);
      parts = [state.rootFolderName, ...rel.split('/')];
    } else {
      parts = filePath.split('/').filter(Boolean);
      if (parts.length > 4) parts = ['...', ...parts.slice(-3)];
    }

    bc.innerHTML = parts.map((p, i) =>
      `<span class="breadcrumb-item" data-index="${i}">${p}</span>` +
      (i < parts.length - 1 ? '<span class="breadcrumb-sep"></span>' : '')
    ).join('');
  }

  function updateTitle(tab) {
    const titleEl = document.getElementById('titlebar-text');
    if (!titleEl) return;
    const folder = state.rootFolderName ? ` — ${state.rootFolderName}` : '';
    const title = tab ? `${tab.modified ? '● ' : ''}${tab.name}${folder} — Code Clone` : `Code Clone${folder}`;
    titleEl.textContent = title;
    document.title = title;
  }

  function updateStatusBarLanguage() {
    const el = document.getElementById('status-language');
    if (!el) return;
    const tab = state.tabs.find(t => t.id === state.activeTabId);
    if (tab) {
      const lang = tab.language;
      el.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  FILE EXPLORER
  // ════════════════════════════════════════════════════════════════
  function renderFileTree(items, container, depth = 0, parentPath = '') {
    for (const item of items) {
      const el = document.createElement('div');
      el.className = 'tree-item' + (item.isDirectory ? ' tree-dir' : ' tree-file');
      el.style.paddingLeft = (12 + depth * 16) + 'px';
      el.dataset.path = item.path;

      const ext = getFileExtension(item.name);
      let iconHtml;
      if (item.isDirectory) {
        iconHtml = '<span class="tree-chevron">&#9656;</span><span class="folder-icon"></span>';
      } else {
        const info = FILE_ICONS[ext];
        iconHtml = info
          ? `<span class="file-icon" style="color:${info.color}">${info.letter}</span>`
          : '<span class="file-icon">F</span>';
      }

      el.innerHTML = iconHtml + `<span class="tree-label">${item.name}</span>`;

      if (item.isDirectory) {
        let expanded = false;
        let childContainer = null;

        if (item.children && item.children.length > 0) {
          childContainer = document.createElement('div');
          childContainer.className = 'tree-children';
          childContainer.style.display = 'none';
          renderFileTree(item.children, childContainer, depth + 1, item.path);
        }

        el.addEventListener('click', async (e) => {
          if (e.target.closest('.tree-item') !== el) return;
          expanded = !expanded;
          const chevron = el.querySelector('.tree-chevron');
          if (chevron) chevron.innerHTML = expanded ? '&#9662;' : '&#9656;';
          el.classList.toggle('expanded', expanded);

          if (!childContainer) {
            const children = await window.fs.readDir(item.path, 5);
            childContainer = document.createElement('div');
            childContainer.className = 'tree-children';
            renderFileTree(children, childContainer, depth + 1, item.path);
            el.after(childContainer);
          }
          if (childContainer) childContainer.style.display = expanded ? '' : 'none';
        });

        container.appendChild(el);
        if (childContainer) container.appendChild(childContainer);
      } else {
        el.addEventListener('click', async () => {
          try {
            const content = await window.fs.readFile(item.path);
            createTab(item.path, content);
          } catch (err) {
            showNotification('error', `Failed to open: ${err.message || err}`);
          }
        });
        container.appendChild(el);
      }

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const menuItems = item.isDirectory ? [
          { label: 'New File...', action: () => createNewFileInDir(item.path, container, depth) },
          { label: 'New Folder...', action: () => createNewFolderInDir(item.path, container, depth) },
          { type: 'separator' },
          { label: 'Rename...', action: () => startRename(el, item) },
          { label: 'Delete', action: () => deleteItem(item) },
          { type: 'separator' },
          { label: 'Copy Path', action: () => navigator.clipboard?.writeText(item.path) },
          { label: 'Copy Relative Path', action: () => {
            const rel = state.rootFolder ? item.path.replace(state.rootFolder + '/', '') : item.path;
            navigator.clipboard?.writeText(rel);
          }},
          { label: 'Reveal in Finder', action: () => window.appApi.showItemInFolder(item.path) },
        ] : [
          { label: 'Open', action: async () => { const c = await window.fs.readFile(item.path); createTab(item.path, c); } },
          { type: 'separator' },
          { label: 'Rename...', action: () => startRename(el, item) },
          { label: 'Delete', action: () => deleteItem(item) },
          { type: 'separator' },
          { label: 'Copy Path', action: () => navigator.clipboard?.writeText(item.path) },
          { label: 'Copy Relative Path', action: () => {
            const rel = state.rootFolder ? item.path.replace(state.rootFolder + '/', '') : item.path;
            navigator.clipboard?.writeText(rel);
          }},
          { label: 'Reveal in Finder', action: () => window.appApi.showItemInFolder(item.path) },
        ];
        showContextMenu(e.clientX, e.clientY, menuItems);
      });
    }
  }

  async function createNewFileInDir(dirPath) {
    const name = prompt('File name:');
    if (!name) return;
    const fullPath = dirPath + '/' + name;
    await window.fs.createFile(fullPath);
    createTab(fullPath, '');
    refreshFileTree();
  }

  async function createNewFolderInDir(dirPath) {
    const name = prompt('Folder name:');
    if (!name) return;
    await window.fs.mkdir(dirPath + '/' + name);
    refreshFileTree();
  }

  function startRename(el, item) {
    const label = el.querySelector('.tree-label');
    const oldName = item.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-rename';
    input.value = oldName;
    label.replaceWith(input);
    input.focus();
    input.select();

    const finish = async () => {
      const newName = input.value.trim();
      if (newName && newName !== oldName) {
        const dir = item.path.substring(0, item.path.lastIndexOf('/'));
        const newPath = dir + '/' + newName;
        await window.fs.rename(item.path, newPath);
        refreshFileTree();
      } else {
        const span = document.createElement('span');
        span.className = 'tree-label';
        span.textContent = oldName;
        input.replaceWith(span);
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish();
      if (e.key === 'Escape') {
        const span = document.createElement('span');
        span.className = 'tree-label';
        span.textContent = oldName;
        input.replaceWith(span);
      }
    });
    input.addEventListener('blur', finish);
  }

  async function deleteItem(item) {
    const ok = confirm(`Delete "${item.name}"?`);
    if (!ok) return;
    await window.fs.delete(item.path);
    const tab = state.tabs.find(t => t.path === item.path);
    if (tab) closeTab(tab.id, true);
    refreshFileTree();
  }

  async function refreshFileTree() {
    if (!state.rootFolder) return;
    const tree = await window.fs.readDir(state.rootFolder, 5);
    const container = document.getElementById('file-tree');
    if (container) {
      container.innerHTML = '';
      renderFileTree(tree, container, 0, state.rootFolder);
    }
  }

  function highlightActiveFileInTree(filePath) {
    document.querySelectorAll('.tree-item.active-file').forEach(el => el.classList.remove('active-file'));
    if (filePath) {
      const el = document.querySelector(`.tree-item[data-path="${CSS.escape(filePath)}"]`);
      if (el) el.classList.add('active-file');
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  SEARCH PANEL
  // ════════════════════════════════════════════════════════════════
  let searchDebounce = null;

  function initSearch() {
    const input = document.getElementById('search-input');
    const replaceInput = document.getElementById('search-replace-input');
    const caseSensitive = document.getElementById('search-case');
    const wholeWord = document.getElementById('search-whole');
    const useRegex = document.getElementById('search-regex');
    const replaceToggle = document.getElementById('search-toggle-replace');
    const replaceRow = document.getElementById('search-replace-row');

    if (replaceToggle) {
      replaceToggle.addEventListener('click', () => {
        const visible = replaceRow.style.display !== 'none';
        replaceRow.style.display = visible ? 'none' : '';
        replaceToggle.classList.toggle('active', !visible);
      });
    }

    const doSearch = async () => {
      const query = input?.value;
      if (!query || query.length < 2) {
        renderSearchResults([]);
        return;
      }
      const results = await window.search.inFiles(query, {
        caseSensitive: caseSensitive?.classList.contains('active'),
        wholeWord: wholeWord?.classList.contains('active'),
        useRegex: useRegex?.classList.contains('active'),
      });
      state.searchResults = results;
      renderSearchResults(results);
    };

    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(doSearch, 300);
      });
    }

    [caseSensitive, wholeWord, useRegex].forEach(btn => {
      if (btn) btn.addEventListener('click', () => { btn.classList.toggle('active'); doSearch(); });
    });

    const replaceAllBtn = document.getElementById('search-replace-all-btn');
    if (replaceAllBtn) {
      replaceAllBtn.addEventListener('click', async () => {
        const query = input?.value;
        const replacement = replaceInput?.value;
        if (!query || replacement === undefined || replacement === null) return;
        if (state.searchResults.length === 0) { showNotification('warning', 'No search results to replace'); return; }
        let replaced = 0;
        for (const result of state.searchResults) {
          const content = await window.fs.readFile(result.path).catch(() => null);
          if (content === null) continue;
          let flags = 'g';
          if (!caseSensitive?.classList.contains('active')) flags += 'i';
          const re = useRegex?.classList.contains('active')
            ? new RegExp(query, flags)
            : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
          const newContent = content.replace(re, replacement);
          if (newContent !== content) {
            await window.fs.writeFile(result.path, newContent);
            replaced++;
            const openTab = state.tabs.find(t => t.path === result.path);
            if (openTab) {
              openTab.content = newContent;
              openTab.originalContent = newContent;
              openTab.modified = false;
              if (state.activeTabId === openTab.id && state.editor) {
                openTab._settingContent = true;
                state.editor.getModel()?.setValue(newContent);
                openTab._settingContent = false;
              }
            }
          }
        }
        showNotification('info', `Replaced in ${replaced} file(s)`);
        doSearch();
      });
    }

    const detailsToggle = document.getElementById('search-toggle-details');
    if (detailsToggle) {
      detailsToggle.addEventListener('click', () => {
        const details = document.getElementById('search-details');
        if (details) details.style.display = details.style.display === 'none' ? '' : 'none';
      });
    }
  }

  function renderSearchResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;
    const total = results.reduce((sum, r) => sum + r.matches.length, 0);
    const header = document.getElementById('search-results-count');
    if (header) header.textContent = results.length ? `${total} results in ${results.length} files` : '';

    container.innerHTML = '';
    for (const result of results) {
      const fileEl = document.createElement('div');
      fileEl.className = 'search-file-group';

      const fileHeader = document.createElement('div');
      fileHeader.className = 'search-file-header tree-item';
      fileHeader.innerHTML = `<span class="tree-chevron expanded">&#9662;</span>` +
        `<span class="search-file-name">${result.relativePath || getFileName(result.path)}</span>` +
        `<span class="search-match-count">${result.matches.length}</span>`;

      let matchesVisible = true;
      fileHeader.addEventListener('click', () => {
        matchesVisible = !matchesVisible;
        matchesEl.style.display = matchesVisible ? '' : 'none';
        fileHeader.querySelector('.tree-chevron').innerHTML = matchesVisible ? '&#9662;' : '&#9656;';
      });

      const matchesEl = document.createElement('div');
      matchesEl.className = 'search-matches';

      for (const match of result.matches) {
        const matchEl = document.createElement('div');
        matchEl.className = 'search-match-item tree-item';
        matchEl.innerHTML = `<span class="search-line-num">${match.line}</span><span class="search-match-text">${escapeHtml(match.text)}</span>`;
        matchEl.addEventListener('click', async () => {
          const content = await window.fs.readFile(result.path);
          const tab = createTab(result.path, content);
          if (state.editor) {
            state.editor.revealLineInCenter(match.line);
            state.editor.setPosition({ lineNumber: match.line, column: 1 });
            state.editor.focus();
          }
        });
        matchesEl.appendChild(matchEl);
      }

      fileEl.appendChild(fileHeader);
      fileEl.appendChild(matchesEl);
      container.appendChild(fileEl);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  SOURCE CONTROL (GIT)
  // ════════════════════════════════════════════════════════════════
  async function refreshGitStatus() {
    if (!state.rootFolder) return;
    state.isGitRepo = await window.git.isRepo();
    if (!state.isGitRepo) {
      renderGitPanel();
      return;
    }
    state.gitBranch = await window.git.branch();
    state.gitChanges = await window.git.status();
    renderGitPanel();
    renderGitLog();
    updateStatusBarGit();
  }

  function renderGitPanel() {
    const stagedList = document.getElementById('scm-staged-list');
    const changesList = document.getElementById('scm-changes-list');
    const stagedCount = document.getElementById('scm-staged-count');
    const changesCount = document.getElementById('scm-changes-count');
    const branchEl = document.getElementById('branch-name');

    if (branchEl) branchEl.textContent = state.gitBranch;

    if (!state.isGitRepo) {
      if (stagedList) stagedList.innerHTML = '';
      if (changesList) changesList.innerHTML = '<div class="empty-state-inline">Not a git repository</div>';
      return;
    }

    const staged = state.gitChanges.filter(c => 'MADRC'.includes(c.status[0]) && c.status[0] !== '?');
    const unstaged = state.gitChanges.filter(c => c.status === '??' || (c.status[1] && c.status[1] !== ' '));

    if (stagedCount) stagedCount.textContent = staged.length;
    if (changesCount) changesCount.textContent = unstaged.length;

    if (stagedList) {
      stagedList.innerHTML = '';
      renderScmFiles(staged, stagedList, true);
    }
    if (changesList) {
      changesList.innerHTML = '';
      if (unstaged.length === 0 && staged.length === 0) {
        changesList.innerHTML = '<div class="empty-state-inline">No changes</div>';
      } else {
        renderScmFiles(unstaged.length > 0 ? unstaged : state.gitChanges, changesList, false);
      }
    }
  }

  function renderScmFiles(changes, container, isStaged) {
    for (const change of changes) {
      const item = document.createElement('div');
      item.className = 'scm-file-item';
      const statusMap = { M: 'M', A: 'A', D: 'D', '?': 'U', R: 'R', C: 'C' };
      const st = change.status.trim()[0] || 'M';
      const label = statusMap[st] || st;

      item.innerHTML =
        `<span class="scm-file-name">${getFileName(change.file)}</span>` +
        `<span class="scm-file-actions">` +
        `<button class="icon-btn icon-btn-sm scm-action-btn" title="${isStaged ? 'Unstage' : 'Stage'}">` +
        `${isStaged ? '−' : '+'}` +
        `</button>` +
        `</span>` +
        `<span class="scm-file-status ${label}">${label}</span>`;

      item.querySelector('.scm-action-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (isStaged) await window.git.unstage(change.file);
        else await window.git.stage(change.file);
        refreshGitStatus();
      });

      item.addEventListener('click', async () => {
        if (label === 'U' || label === 'A') {
          const content = await window.fs.readFile(state.rootFolder + '/' + change.file).catch(() => '');
          createTab(state.rootFolder + '/' + change.file, content);
        } else {
          await openDiffForFile(change.file);
        }
      });

      container.appendChild(item);
    }
  }

  async function openDiffForFile(relativePath) {
    if (!monacoReady || !state.rootFolder) return;
    const fullPath = state.rootFolder + '/' + relativePath;
    const currentContent = await window.fs.readFile(fullPath).catch(() => '');
    const originalContent = await window.git.show('HEAD:' + relativePath).catch(() => '');
    const lang = getLanguage(relativePath);
    const fileName = getFileName(relativePath);

    const existing = state.tabs.find(t => t.path === fullPath && t.isDiff);
    if (existing) { activateTab(existing.id); return; }

    const id = ++tabIdCounter;
    const tab = {
      id, path: fullPath, name: fileName,
      content: currentContent, language: lang,
      modified: false, originalContent: currentContent,
      isDiff: true, diffOriginal: originalContent,
      _settingContent: false,
    };
    state.tabs.push(tab);
    addRecentFile(fullPath);
    activateDiffTab(tab);
  }

  function activateDiffTab(tab) {
    state.activeTabId = tab.id;
    hideElement('monaco-editor');
    hideElement('welcome-screen');

    const diffContainer = document.getElementById('diff-editor');
    if (!diffContainer) return;
    diffContainer.style.display = '';

    if (state.diffEditor) {
      state.diffEditor.dispose();
      state.diffEditor = null;
    }

    const originalModel = monaco.editor.createModel(tab.diffOriginal || '', tab.language);
    const modifiedModel = monaco.editor.createModel(tab.content || '', tab.language);

    state.diffEditor = monaco.editor.createDiffEditor(diffContainer, {
      theme: state.theme === 'light' ? 'vscode-clone-light' : state.theme === 'high-contrast' ? 'vscode-clone-hc' : 'vscode-clone-dark',
      automaticLayout: true,
      renderSideBySide: true,
      originalEditable: false,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Menlo, Monaco, monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });

    state.diffEditor.setModel({ original: originalModel, modified: modifiedModel });
    updateBreadcrumbs(tab.path);
    updateTitle(tab);
    renderTabs();
    renderOpenEditors();
  }

  async function renderGitLog() {
    const logList = document.getElementById('scm-log-list');
    if (!logList || !state.isGitRepo) return;
    const logs = await window.git.log(15).catch(() => []);
    logList.innerHTML = '';
    if (!logs || logs.length === 0) {
      logList.innerHTML = '<div class="empty-state-inline">No commits</div>';
      return;
    }
    for (const entry of logs) {
      const el = document.createElement('div');
      el.className = 'git-log-item';
      const hash = typeof entry === 'string' ? entry.slice(0, 7) : (entry.hash || '').slice(0, 7);
      const msg = typeof entry === 'string' ? entry.slice(8) : (entry.message || entry);
      el.innerHTML = `<span class="git-log-hash">${hash}</span><span class="git-log-msg">${escapeHtml(String(msg))}</span>`;
      logList.appendChild(el);
    }
  }

  function updateStatusBarGit() {
    const branchEl = document.getElementById('status-branch');
    if (branchEl) {
      branchEl.innerHTML = state.isGitRepo
        ? `<span class="status-icon branch-icon"></span> ${state.gitBranch}`
        : '';
    }
    const errEl = document.getElementById('status-errors');
    const warnEl = document.getElementById('status-warnings');
    if (errEl) errEl.textContent = `${state.problems.filter(p => p.severity === 'error').length}`;
    if (warnEl) warnEl.textContent = `${state.problems.filter(p => p.severity === 'warning').length}`;
  }

  async function gitCommit() {
    const input = document.getElementById('scm-commit-input');
    if (!input || !input.value.trim()) {
      showNotification('warning', 'Please enter a commit message');
      return;
    }
    const result = await window.git.commit(input.value.trim());
    if (result.ok) {
      showNotification('info', 'Changes committed successfully');
      input.value = '';
      refreshGitStatus();
    } else {
      showNotification('error', `Commit failed: ${result.stderr}`);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  DEBUG PANEL
  // ════════════════════════════════════════════════════════════════
  function renderDebugPanel() {
    const bpList = document.getElementById('debug-breakpoints');
    if (!bpList) return;

    if (state.breakpoints.length === 0) {
      bpList.innerHTML = '<div class="debug-empty">No breakpoints set</div>';
    } else {
      bpList.innerHTML = '';
      for (const bp of state.breakpoints) {
        const el = document.createElement('div');
        el.className = 'tree-item';
        el.innerHTML = `<input type="checkbox" checked><span>${getFileName(bp.file)}:${bp.line}</span>`;
        bpList.appendChild(el);
      }
    }

    const watchList = document.getElementById('debug-watch');
    if (watchList) {
      watchList.innerHTML = '';
      for (const expr of state.watchExpressions) {
        const el = document.createElement('div');
        el.className = 'tree-item';
        el.innerHTML = `<span class="watch-expr">${escapeHtml(expr)}</span><span class="watch-value">not available</span>`;
        watchList.appendChild(el);
      }
      if (state.watchExpressions.length === 0) {
        watchList.innerHTML = '<div class="debug-empty">No watch expressions</div>';
      }
    }
  }

  function addWatchExpression() {
    const expr = prompt('Expression to watch:');
    if (expr) {
      state.watchExpressions.push(expr);
      renderDebugPanel();
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  EXTENSIONS PANEL
  // ════════════════════════════════════════════════════════════════
  const MOCK_EXTENSIONS = [
    { id: 'ms-python.python', name: 'Python', publisher: 'Microsoft', description: 'Python language support with IntelliSense, linting, debugging, and Jupyter', icon: 'Py', color: '#3572A5', downloads: '112M', rating: 4.5 },
    { id: 'dbaeumer.vscode-eslint', name: 'ESLint', publisher: 'Microsoft', description: 'Integrates ESLint JavaScript into VS Code', icon: 'ES', color: '#4B32C3', downloads: '34M', rating: 4.3 },
    { id: 'esbenp.prettier-vscode', name: 'Prettier', publisher: 'Prettier', description: 'Code formatter using prettier', icon: 'Pr', color: '#56B3B4', downloads: '42M', rating: 4.0 },
    { id: 'eamodio.gitlens', name: 'GitLens', publisher: 'GitKraken', description: 'Supercharge Git — visualize code authorship, navigate repos, and more', icon: 'GL', color: '#F05033', downloads: '31M', rating: 4.4 },
    { id: 'ritwickdey.liveserver', name: 'Live Server', publisher: 'Ritwick Dey', description: 'Launch a development local server with live reload', icon: 'LS', color: '#41D1FF', downloads: '49M', rating: 4.2 },
    { id: 'rangav.vscode-thunder-client', name: 'Thunder Client', publisher: 'Ranga Vadhineni', description: 'Lightweight REST API Client for VS Code', icon: 'TC', color: '#FFB900', downloads: '8M', rating: 4.6 },
    { id: 'ms-azuretools.vscode-docker', name: 'Docker', publisher: 'Microsoft', description: 'Makes it easy to create, manage, and debug containerized applications', icon: 'Dk', color: '#2496ED', downloads: '22M', rating: 4.3 },
    { id: 'bradlc.vscode-tailwindcss', name: 'Tailwind CSS IntelliSense', publisher: 'Tailwind Labs', description: 'Intelligent Tailwind CSS tooling for VS Code', icon: 'TW', color: '#38BDF8', downloads: '12M', rating: 4.5 },
    { id: 'formulahendry.auto-rename-tag', name: 'Auto Rename Tag', publisher: 'Jun Han', description: 'Auto rename paired HTML/XML tag', icon: 'AR', color: '#E44D26', downloads: '18M', rating: 4.1 },
    { id: 'pkief.material-icon-theme', name: 'Material Icon Theme', publisher: 'Philipp Kief', description: 'Material Design Icons for Visual Studio Code', icon: 'MI', color: '#009688', downloads: '21M', rating: 4.7 },
    { id: 'usernamehw.errorlens', name: 'Error Lens', publisher: 'Alexander', description: 'Improve highlighting of errors, warnings and other diagnostics', icon: 'EL', color: '#E45454', downloads: '9M', rating: 4.5 },
    { id: 'streetsidesoftware.code-spell-checker', name: 'Code Spell Checker', publisher: 'Street Side Software', description: 'Spelling checker for source code', icon: 'Sp', color: '#6AAB73', downloads: '14M', rating: 4.3 },
    { id: 'github.copilot', name: 'GitHub Copilot', publisher: 'GitHub', description: 'Your AI pair programmer', icon: 'CP', color: '#000000', downloads: '18M', rating: 4.2 },
    { id: 'ms-vscode.cpptools', name: 'C/C++', publisher: 'Microsoft', description: 'C/C++ IntelliSense, debugging, and code browsing', icon: 'C+', color: '#00599C', downloads: '62M', rating: 4.1 },
    { id: 'golang.go', name: 'Go', publisher: 'Go Team at Google', description: 'Rich Go language support for Visual Studio Code', icon: 'Go', color: '#00ADD8', downloads: '15M', rating: 4.4 },
    { id: 'rust-lang.rust-analyzer', name: 'rust-analyzer', publisher: 'rust-lang', description: 'Rust language support for Visual Studio Code', icon: 'Rs', color: '#DEA584', downloads: '7M', rating: 4.6 },
  ];

  function renderExtensionsPanel() {
    const container = document.getElementById('extensions-installed');
    if (!container) return;
    const query = document.getElementById('extensions-search')?.value?.toLowerCase() || '';
    const countEl = document.getElementById('ext-installed-count');

    const filtered = query
      ? MOCK_EXTENSIONS.filter(e => e.name.toLowerCase().includes(query) || e.description.toLowerCase().includes(query) || e.publisher.toLowerCase().includes(query))
      : MOCK_EXTENSIONS;

    if (countEl) countEl.textContent = filtered.length;
    container.innerHTML = '';
    for (const ext of filtered) {
      const installed = state.installedExtensions.has(ext.id);
      const el = document.createElement('div');
      el.className = 'ext-item' + (installed ? ' installed' : '');
      const stars = '★'.repeat(Math.floor(ext.rating)) + (ext.rating % 1 >= 0.5 ? '½' : '');
      el.innerHTML =
        `<div class="ext-icon" style="background:${ext.color};color:#fff">${ext.icon}</div>` +
        `<div class="ext-info">` +
        `<div class="ext-name">${ext.name}</div>` +
        `<div class="ext-publisher">${ext.publisher}</div>` +
        `<div class="ext-desc">${ext.description}</div>` +
        `<div class="ext-meta"><span class="ext-rating">${stars} ${ext.rating}</span><span class="ext-downloads">${ext.downloads}</span></div>` +
        `</div>` +
        `<button class="ext-action-btn ${installed ? 'uninstall' : 'install'}">${installed ? 'Uninstall' : 'Install'}</button>`;

      el.querySelector('.ext-action-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (installed) {
          state.installedExtensions.delete(ext.id);
          showNotification('info', `${ext.name} uninstalled`);
        } else {
          state.installedExtensions.add(ext.id);
          showNotification('info', `${ext.name} installed — reload to activate`);
        }
        renderExtensionsPanel();
      });

      container.appendChild(el);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  TERMINAL
  // ════════════════════════════════════════════════════════════════
  let xtermCSS = false;

  async function createTerminalInstance() {
    if (!xtermCSS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../../node_modules/@xterm/xterm/css/xterm.css';
      document.head.appendChild(link);
      xtermCSS = true;
    }

    const xt = window._XTerm || {};
    const Terminal = xt.Terminal || window.Terminal;
    const FitAddon = xt.FitAddon || window.FitAddon;
    const WebLinksAddon = xt.WebLinksAddon || window.WebLinksAddon;

    if (!Terminal || !FitAddon) {
      showNotification('error', 'xterm.js not loaded. Check script tags in index.html');
      return;
    }

    const term = new Terminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#aeafad',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        selectionForeground: '#ffffff',
        black: '#000000', red: '#cd3131', green: '#0dbc79', yellow: '#e5e510',
        blue: '#2472c8', magenta: '#bc3fbc', cyan: '#11a8cd', white: '#e5e5e5',
        brightBlack: '#666666', brightRed: '#f14c4c', brightGreen: '#23d18b',
        brightYellow: '#f5f543', brightBlue: '#3b8eea', brightMagenta: '#d670d6',
        brightCyan: '#29b8db', brightWhite: '#e5e5e5',
      },
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Menlo, Monaco, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 10000,
      allowTransparency: false,
      bellStyle: 'none',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    if (WebLinksAddon) term.loadAddon(new WebLinksAddon());

    const container = document.getElementById('terminal-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'terminal-wrapper';
    wrapper.style.display = 'none';
    container.appendChild(wrapper);

    term.open(wrapper);
    setTimeout(() => fitAddon.fit(), 50);

    const cwd = state.rootFolder || undefined;
    const result = await window.terminal.create({ cols: term.cols, rows: term.rows, cwd });

    if (result.error) {
      term.writeln('\x1b[31mFailed to create terminal: ' + result.error + '\x1b[0m');
      term.writeln('\x1b[33mRun: npx electron-rebuild\x1b[0m');
    }

    const instance = {
      id: result.id,
      term, fitAddon, wrapper,
      title: result.cwd ? getFileName(result.cwd) : 'Terminal',
    };
    state.terminalInstances.push(instance);

    term.onData((data) => {
      if (instance.id > 0) window.terminal.input(instance.id, data);
    });

    const ro = new ResizeObserver(() => {
      if (wrapper.style.display !== 'none') {
        fitAddon.fit();
        if (instance.id > 0) window.terminal.resize(instance.id, term.cols, term.rows);
      }
    });
    ro.observe(wrapper);

    switchTerminal(instance.id);
    renderTerminalTabs();
    return instance;
  }

  function switchTerminal(id) {
    state.activeTerminalId = id;
    for (const inst of state.terminalInstances) {
      inst.wrapper.style.display = inst.id === id ? '' : 'none';
      if (inst.id === id) {
        setTimeout(() => {
          inst.fitAddon.fit();
          inst.term.focus();
        }, 50);
      }
    }
    renderTerminalTabs();
  }

  function killTerminal(id) {
    const idx = state.terminalInstances.findIndex(i => i.id === id);
    if (idx === -1) return;
    const inst = state.terminalInstances[idx];
    if (inst.id > 0) window.terminal.kill(inst.id);
    inst.term.dispose();
    inst.wrapper.remove();
    state.terminalInstances.splice(idx, 1);
    if (state.activeTerminalId === id) {
      if (state.terminalInstances.length > 0) {
        switchTerminal(state.terminalInstances[state.terminalInstances.length - 1].id);
      } else {
        state.activeTerminalId = null;
      }
    }
    renderTerminalTabs();
  }

  function renderTerminalTabs() {
    const container = document.getElementById('terminal-tabs-list');
    if (!container) return;
    container.innerHTML = '';
    for (const inst of state.terminalInstances) {
      const tab = document.createElement('div');
      tab.className = 'terminal-tab' + (inst.id === state.activeTerminalId ? ' active' : '');
      tab.innerHTML = `<span>${inst.title}</span><span class="terminal-tab-close">&times;</span>`;
      tab.querySelector('span').addEventListener('click', () => switchTerminal(inst.id));
      tab.querySelector('.terminal-tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        killTerminal(inst.id);
      });
      container.appendChild(tab);
    }
  }

  function setupTerminalDataListener() {
    window.terminal.onData(({ id, data }) => {
      const inst = state.terminalInstances.find(i => i.id === id);
      if (inst) inst.term.write(data);
    });

    window.terminal.onExit(({ id }) => {
      const inst = state.terminalInstances.find(i => i.id === id);
      if (inst) {
        inst.term.writeln('\r\n\x1b[90m[Process exited]\x1b[0m');
        inst.id = -1;
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  BOTTOM PANEL
  // ════════════════════════════════════════════════════════════════
  function showBottomPanel(tab) {
    state.panelVisible = true;
    state.activeBottomTab = tab || state.activeBottomTab;
    const panel = document.getElementById('bottom-panel');
    const resize = document.getElementById('panel-resize');
    if (panel) panel.style.display = '';
    if (resize) resize.style.display = '';

    document.querySelectorAll('.panel-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === state.activeBottomTab);
    });

    document.querySelectorAll('.panel-content').forEach(el => {
      const match = (el.dataset.tab || el.dataset.panel) === state.activeBottomTab;
      el.classList.toggle('active', match);
    });

    if (tab === 'terminal' && state.terminalInstances.length === 0) {
      createTerminalInstance();
    }
  }

  function hideBottomPanel() {
    state.panelVisible = false;
    const panel = document.getElementById('bottom-panel');
    const resize = document.getElementById('panel-resize');
    if (panel) panel.style.display = 'none';
    if (resize) resize.style.display = 'none';
  }

  function togglePanel() {
    if (state.panelVisible) hideBottomPanel();
    else showBottomPanel();
  }

  function toggleTerminal() {
    if (state.panelVisible && state.activeBottomTab === 'terminal') {
      hideBottomPanel();
    } else {
      showBottomPanel('terminal');
    }
  }

  function renderProblems() {
    const container = document.getElementById('problems-list');
    if (!container) return;
    if (state.problems.length === 0) {
      container.innerHTML = '<div class="panel-empty">No problems detected</div>';
      return;
    }
    container.innerHTML = '';
    for (const p of state.problems) {
      const el = document.createElement('div');
      el.className = 'problem-item';
      const icon = p.severity === 'error' ? '⊘' : p.severity === 'warning' ? '⚠' : 'ⓘ';
      el.innerHTML = `<span class="problem-icon ${p.severity}">${icon}</span>` +
        `<span class="problem-text">${escapeHtml(p.message)}</span>` +
        `<span class="problem-source">${p.file ? getFileName(p.file) + ':' + p.line : ''}</span>`;
      container.appendChild(el);
    }
  }

  function addOutput(text, source = 'Log') {
    state.outputLog.push({ text, source, time: new Date() });
    const container = document.getElementById('output-log');
    if (container) {
      const el = document.createElement('div');
      el.className = 'output-line';
      el.textContent = text;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  COMMAND PALETTE
  // ════════════════════════════════════════════════════════════════
  const COMMANDS = [
    { label: 'File: New File', shortcut: '⌘N', action: () => newFile() },
    { label: 'File: Open File...', shortcut: '⌘O', action: () => window.dialogs.openFile() },
    { label: 'File: Open Folder...', shortcut: '⌘⇧O', action: () => window.dialogs.openFolder() },
    { label: 'File: Save', shortcut: '⌘S', action: () => saveCurrentFile() },
    { label: 'File: Save As...', shortcut: '⌘⇧S', action: () => saveCurrentFileAs() },
    { label: 'File: Save All', shortcut: '⌘⌥S', action: () => saveAllFiles() },
    { label: 'File: Close Editor', shortcut: '⌘W', action: () => state.activeTabId && closeTab(state.activeTabId) },
    { label: 'File: Close All Editors', action: () => closeAllTabs() },

    { label: 'Edit: Undo', shortcut: '⌘Z', action: () => state.editor?.trigger('', 'undo') },
    { label: 'Edit: Redo', shortcut: '⌘⇧Z', action: () => state.editor?.trigger('', 'redo') },
    { label: 'Edit: Find', shortcut: '⌘F', action: () => state.editor?.trigger('', 'actions.find') },
    { label: 'Edit: Replace', shortcut: '⌘H', action: () => state.editor?.trigger('', 'editor.action.startFindReplaceAction') },
    { label: 'Edit: Toggle Line Comment', shortcut: '⌘/', action: () => state.editor?.trigger('', 'editor.action.commentLine') },
    { label: 'Edit: Toggle Block Comment', shortcut: '⌘⇧/', action: () => state.editor?.trigger('', 'editor.action.blockComment') },
    { label: 'Edit: Format Document', shortcut: '⌘⇧F', action: () => state.editor?.trigger('', 'editor.action.formatDocument') },
    { label: 'Edit: Indent Line', action: () => state.editor?.trigger('', 'editor.action.indentLines') },
    { label: 'Edit: Outdent Line', action: () => state.editor?.trigger('', 'editor.action.outdentLines') },

    { label: 'View: Command Palette', shortcut: '⌘⇧P', action: () => {} },
    { label: 'View: Explorer', shortcut: '⌘⇧E', action: () => switchSidebarPanel('explorer') },
    { label: 'View: Search', shortcut: '⌘⇧F', action: () => switchSidebarPanel('search') },
    { label: 'View: Source Control', shortcut: '⌘⇧G', action: () => switchSidebarPanel('scm') },
    { label: 'View: Run and Debug', shortcut: '⌘⇧D', action: () => switchSidebarPanel('debug') },
    { label: 'View: Extensions', shortcut: '⌘⇧X', action: () => switchSidebarPanel('extensions') },
    { label: 'View: Toggle Sidebar', shortcut: '⌘B', action: () => toggleSidebar() },
    { label: 'View: Toggle Panel', shortcut: '⌘J', action: () => togglePanel() },
    { label: 'View: Toggle Terminal', shortcut: '⌘`', action: () => toggleTerminal() },
    { label: 'View: Toggle Minimap', action: () => toggleMinimap() },
    { label: 'View: Toggle Breadcrumbs', action: () => toggleBreadcrumbs() },
    { label: 'View: Toggle Word Wrap', shortcut: '⌥Z', action: () => toggleWordWrap() },
    { label: 'View: Split Editor Right', shortcut: '⌘\\', action: () => toggleSplitEditor() },
    { label: 'View: Zen Mode', shortcut: '⌘K Z', action: () => toggleZenMode() },
    { label: 'View: Problems', shortcut: '⌘⇧M', action: () => showBottomPanel('problems') },
    { label: 'View: Output', shortcut: '⌘⇧U', action: () => showBottomPanel('output') },
    { label: 'View: Debug Console', shortcut: '⌘⇧Y', action: () => showBottomPanel('debug-console') },

    { label: 'Go: Go to Line...', shortcut: '⌘G', action: () => goToLine() },
    { label: 'Go: Go to File...', shortcut: '⌘P', action: () => openQuickOpen() },
    { label: 'Go: Go to Symbol...', shortcut: '⌘⇧O', action: () => state.editor?.trigger('', 'editor.action.quickOutline') },
    { label: 'Go: Go to Definition', shortcut: 'F12', action: () => state.editor?.trigger('', 'editor.action.revealDefinition') },
    { label: 'Go: Go to References', shortcut: '⇧F12', action: () => state.editor?.trigger('', 'editor.action.goToReferences') },
    { label: 'Go: Go Back', action: () => state.editor?.trigger('', 'workbench.action.navigateBack') },
    { label: 'Go: Go Forward', action: () => state.editor?.trigger('', 'workbench.action.navigateForward') },

    { label: 'Terminal: New Terminal', shortcut: '⌘⇧`', action: () => { showBottomPanel('terminal'); createTerminalInstance(); } },
    { label: 'Terminal: Clear Terminal', action: () => { const inst = state.terminalInstances.find(i => i.id === state.activeTerminalId); if (inst) inst.term.clear(); } },
    { label: 'Terminal: Kill Terminal', action: () => { if (state.activeTerminalId) killTerminal(state.activeTerminalId); } },

    { label: 'Git: Commit', action: () => gitCommit() },
    { label: 'Git: Pull', action: () => window.git.pull().then(() => refreshGitStatus()) },
    { label: 'Git: Push', action: () => window.git.push().then(() => showNotification('info', 'Pushed successfully')) },
    { label: 'Git: Stash', action: () => window.git.stash().then(() => refreshGitStatus()) },
    { label: 'Git: Stash Pop', action: () => window.git.stashPop().then(() => refreshGitStatus()) },
    { label: 'Git: Checkout Branch...', action: () => gitCheckoutBranch() },

    { label: 'Debug: Add Watch Expression', action: () => addWatchExpression() },
    { label: 'Debug: Toggle Breakpoint', shortcut: 'F9', action: () => showNotification('info', 'Click on gutter to set breakpoints') },

    { label: 'Preferences: Settings', shortcut: '⌘,', action: () => openSettingsTab() },
    { label: 'Preferences: Keyboard Shortcuts', shortcut: '⌘K ⌘S', action: () => showNotification('info', 'Keyboard Shortcuts editor') },
    { label: 'Preferences: Color Theme', action: () => cycleTheme() },

    { label: 'Selection: Select All', shortcut: '⌘A', action: () => state.editor?.trigger('', 'editor.action.selectAll') },
    { label: 'Selection: Expand Selection', shortcut: '⌘⇧→', action: () => state.editor?.trigger('', 'editor.action.smartSelect.expand') },
    { label: 'Selection: Add Cursor Above', shortcut: '⌘⌥↑', action: () => state.editor?.trigger('', 'editor.action.insertCursorAbove') },
    { label: 'Selection: Add Cursor Below', shortcut: '⌘⌥↓', action: () => state.editor?.trigger('', 'editor.action.insertCursorBelow') },
    { label: 'Selection: Copy Line Down', shortcut: '⌘⇧D', action: () => state.editor?.trigger('', 'editor.action.copyLinesDownAction') },
    { label: 'Selection: Move Line Up', shortcut: '⌥↑', action: () => state.editor?.trigger('', 'editor.action.moveLinesUpAction') },
    { label: 'Selection: Move Line Down', shortcut: '⌥↓', action: () => state.editor?.trigger('', 'editor.action.moveLinesDownAction') },

    { label: 'Snippet: Console Log', action: () => insertSnippet("console.log('$1');") },
    { label: 'Snippet: Arrow Function', action: () => insertSnippet('const ${1:name} = ($2) => {\n\t$3\n};') },
    { label: 'Snippet: Try/Catch', action: () => insertSnippet('try {\n\t$1\n} catch (${2:error}) {\n\tconsole.error($2);\n}') },
    { label: 'Snippet: Import', action: () => insertSnippet("import { $2 } from '$1';") },
    { label: 'Snippet: React Component', action: () => insertSnippet("export function ${1:Component}({ $2 }) {\n\treturn (\n\t\t<div>\n\t\t\t$3\n\t\t</div>\n\t);\n}") },
    { label: 'Snippet: useEffect', action: () => insertSnippet("useEffect(() => {\n\t$1\n\treturn () => {\n\t\t$2\n\t};\n}, [$3]);") },
    { label: 'Snippet: useState', action: () => insertSnippet("const [$1, set${1/(.*)/${1:/capitalize}/}] = useState($2);") },
    { label: 'Snippet: For Loop', action: () => insertSnippet('for (let ${1:i} = 0; $1 < ${2:array}.length; $1++) {\n\t$3\n}') },
    { label: 'Snippet: Async Function', action: () => insertSnippet('async function ${1:name}($2) {\n\t$3\n}') },
    { label: 'Snippet: Class', action: () => insertSnippet('class ${1:Name} {\n\tconstructor($2) {\n\t\t$3\n\t}\n}') },

    { label: 'Transform: Upper Case', action: () => state.editor?.trigger('', 'editor.action.transformToUppercase') },
    { label: 'Transform: Lower Case', action: () => state.editor?.trigger('', 'editor.action.transformToLowercase') },
    { label: 'Transform: Sort Lines Ascending', action: () => state.editor?.trigger('', 'editor.action.sortLinesAscending') },
    { label: 'Transform: Sort Lines Descending', action: () => state.editor?.trigger('', 'editor.action.sortLinesDescending') },
    { label: 'Transform: Trim Trailing Whitespace', action: () => state.editor?.trigger('', 'editor.action.trimTrailingWhitespace') },

    { label: 'Developer: Reload Window', action: () => window.appApi.reload() },
    { label: 'Developer: Toggle Developer Tools', action: () => window.appApi.toggleDevTools() },

    { label: 'Help: Welcome', action: () => showWelcome() },
    { label: 'Help: About', action: () => window.appApi.openAbout() },
  ];

  function insertSnippet(template) {
    if (!state.editor) return;
    const selection = state.editor.getSelection();
    const text = template.replace(/\$\{?\d+(?::([^}]*))?\}?/g, (_, def) => def || '');
    state.editor.executeEdits('snippet', [{
      range: selection,
      text: text,
      forceMoveMarkers: true,
    }]);
    state.editor.focus();
  }

  function toggleCommandPalette() {
    const overlay = document.getElementById('command-palette');
    if (!overlay) return;
    state.commandPaletteOpen = !state.commandPaletteOpen;
    state.quickOpenMode = state.commandPaletteOpen ? 'commands' : null;
    overlay.style.display = state.commandPaletteOpen ? '' : 'none';

    if (state.commandPaletteOpen) {
      const input = document.getElementById('palette-input');
      if (input) {
        input.value = '>';
        input.focus();
        input.setSelectionRange(1, 1);
      }
      state.paletteSelectedIndex = 0;
      filterPalette();
    }
  }

  function openQuickOpen() {
    const overlay = document.getElementById('command-palette');
    if (!overlay) return;
    state.commandPaletteOpen = true;
    state.quickOpenMode = 'files';
    overlay.style.display = '';

    const input = document.getElementById('palette-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    state.paletteSelectedIndex = 0;
    filterPalette();
  }

  function closePalette() {
    state.commandPaletteOpen = false;
    state.quickOpenMode = null;
    state._quickPickCallback = null;
    state._quickPickItems = null;
    const overlay = document.getElementById('command-palette');
    if (overlay) overlay.style.display = 'none';
  }

  function openQuickPick(options, placeholder, callback) {
    const overlay = document.getElementById('command-palette');
    if (!overlay) return;
    state.commandPaletteOpen = true;
    state.quickOpenMode = 'quickpick';
    state._quickPickCallback = callback;
    overlay.style.display = '';

    const input = document.getElementById('palette-input');
    if (input) {
      input.value = '';
      input.placeholder = placeholder || 'Select...';
      input.focus();
    }
    state.paletteSelectedIndex = 0;
    const items = options.map(opt => ({
      label: opt,
      detail: '',
      action: () => { callback(opt); input.placeholder = ''; },
    }));
    state._quickPickItems = items;
    state.paletteFilteredCommands = items;
    renderPaletteResults(items);
  }

  function filterPalette() {
    const input = document.getElementById('palette-input');
    const resultsContainer = document.getElementById('palette-results');
    if (!input || !resultsContainer) return;

    const val = input.value;
    let items = [];

    if (state.quickOpenMode === 'quickpick' && state._quickPickItems) {
      const query = val.toLowerCase();
      items = state._quickPickItems
        .filter(c => !query || c.label.toLowerCase().includes(query));
      state.paletteFilteredCommands = items;
      state.paletteSelectedIndex = 0;
      renderPaletteResults(items);
      return;
    }

    if (val.startsWith('>')) {
      state.quickOpenMode = 'commands';
      const query = val.slice(1).trim().toLowerCase();
      items = COMMANDS.filter(c => !query || c.label.toLowerCase().includes(query))
        .map(c => ({ label: c.label, detail: c.shortcut || '', action: c.action }));
    } else if (val.startsWith(':')) {
      state.quickOpenMode = 'goto';
      const line = parseInt(val.slice(1));
      items = [{ label: `Go to Line ${line || '...'}`, detail: '', action: () => { if (line && state.editor) { state.editor.revealLineInCenter(line); state.editor.setPosition({ lineNumber: line, column: 1 }); state.editor.focus(); } } }];
    } else {
      state.quickOpenMode = 'files';
      const query = val.toLowerCase();
      if (state.recentFiles.length && !query) {
        items = state.recentFiles.slice(0, 10).map(f => ({
          label: getFileName(f),
          detail: f,
          action: async () => { const c = await window.fs.readFile(f); createTab(f, c); },
        }));
      } else if (query) {
        window.search.files(query).then(results => {
          const fileItems = results.map(r => ({
            label: r.name,
            detail: r.relativePath,
            action: async () => { const c = await window.fs.readFile(r.path); createTab(r.path, c); },
          }));
          renderPaletteResults(fileItems);
        });
        return;
      }
    }

    state.paletteFilteredCommands = items;
    state.paletteSelectedIndex = 0;
    renderPaletteResults(items);
  }

  function renderPaletteResults(items) {
    const container = document.getElementById('palette-results');
    if (!container) return;
    state.paletteFilteredCommands = items;

    container.innerHTML = '';
    items.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'palette-item' + (i === state.paletteSelectedIndex ? ' selected' : '');
      el.innerHTML = `<span class="palette-item-label">${escapeHtml(item.label)}</span>` +
        (item.detail ? `<span class="palette-item-detail">${escapeHtml(item.detail)}</span>` : '');
      el.addEventListener('click', () => { item.action(); closePalette(); });
      el.addEventListener('mouseenter', () => {
        container.querySelectorAll('.palette-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        state.paletteSelectedIndex = i;
      });
      container.appendChild(el);
    });
  }

  function handlePaletteKeydown(e) {
    const items = state.paletteFilteredCommands;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.paletteSelectedIndex = Math.min(state.paletteSelectedIndex + 1, items.length - 1);
      updatePaletteSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.paletteSelectedIndex = Math.max(state.paletteSelectedIndex - 1, 0);
      updatePaletteSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[state.paletteSelectedIndex];
      if (item) { item.action(); closePalette(); }
    } else if (e.key === 'Escape') {
      closePalette();
    }
  }

  function updatePaletteSelection() {
    const container = document.getElementById('palette-results');
    if (!container) return;
    container.querySelectorAll('.palette-item').forEach((el, i) => {
      el.classList.toggle('selected', i === state.paletteSelectedIndex);
    });
    const selected = container.querySelector('.palette-item.selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  // ════════════════════════════════════════════════════════════════
  //  ACTIONS
  // ════════════════════════════════════════════════════════════════
  function newFile() {
    const id = ++tabIdCounter;
    const tab = {
      id, path: `untitled-${id}`, name: `Untitled-${id}`,
      content: '', language: 'plaintext', modified: false, originalContent: '',
      _settingContent: false,
    };
    state.tabs.push(tab);
    activateTab(id);
  }

  async function saveCurrentFile() {
    const tab = state.tabs.find(t => t.id === state.activeTabId);
    if (!tab) return;

    let savePath = tab.path;
    if (tab.path.startsWith('untitled-')) {
      savePath = await window.dialogs.saveFile(tab.name);
      if (!savePath) return;
      tab.path = savePath;
      tab.name = getFileName(savePath);
      tab.language = getLanguage(savePath);
      const model = state.editor.getModel();
      if (model) monaco.editor.setModelLanguage(model, tab.language);
    }

    const content = state.editor ? state.editor.getValue() : tab.content;
    await window.fs.writeFile(savePath, content);
    tab.modified = false;
    tab.originalContent = content;
    tab.content = content;
    renderTabs();
    updateTitle(tab);
    showNotification('info', `Saved ${tab.name}`);
  }

  async function saveCurrentFileAs() {
    const tab = state.tabs.find(t => t.id === state.activeTabId);
    if (!tab) return;
    const savePath = await window.dialogs.saveFile(tab.name);
    if (!savePath) return;
    tab.path = savePath;
    tab.name = getFileName(savePath);
    tab.language = getLanguage(savePath);
    const content = state.editor ? state.editor.getValue() : tab.content;
    await window.fs.writeFile(savePath, content);
    tab.modified = false;
    tab.originalContent = content;
    renderTabs();
    updateTitle(tab);
  }

  async function saveAllFiles() {
    for (const tab of state.tabs) {
      if (tab.modified && !tab.path.startsWith('untitled-')) {
        await window.fs.writeFile(tab.path, tab.content);
        tab.modified = false;
        tab.originalContent = tab.content;
      }
    }
    renderTabs();
    showNotification('info', 'All files saved');
  }

  function goToLine() {
    const overlay = document.getElementById('command-palette');
    if (!overlay) return;
    state.commandPaletteOpen = true;
    state.quickOpenMode = 'goto';
    overlay.style.display = '';
    const input = document.getElementById('palette-input');
    if (input) {
      input.value = ':';
      input.focus();
      input.setSelectionRange(1, 1);
    }
    filterPalette();
  }

  async function gitCheckoutBranch() {
    const branches = await window.git.branches().catch(() => []);
    if (!branches || branches.length === 0) {
      showNotification('warning', 'No branches found');
      return;
    }
    openQuickPick(branches, 'Select a branch to checkout', async (branch) => {
      await window.git.checkout(branch.trim().replace(/^\*\s*/, ''));
      refreshGitStatus();
      showNotification('info', `Switched to branch: ${branch.trim()}`);
    });
  }

  function openSettingsTab() {
    window.appApi.openSettings();
  }

  function showWelcome() {
    closeAllTabs();
    showElement('welcome-screen');
    hideElement('monaco-editor');
  }

  function addRecentFile(filePath) {
    state.recentFiles = [filePath, ...state.recentFiles.filter(f => f !== filePath)].slice(0, 15);
  }

  // ════════════════════════════════════════════════════════════════
  //  SIDEBAR
  // ════════════════════════════════════════════════════════════════
  function toggleSidebar() {
    state.sidebarVisible = !state.sidebarVisible;
    const sidebar = document.getElementById('sidebar');
    const resize = document.getElementById('sidebar-resize');
    if (sidebar) sidebar.style.display = state.sidebarVisible ? '' : 'none';
    if (resize) resize.style.display = state.sidebarVisible ? '' : 'none';
  }

  function switchSidebarPanel(panel) {
    state.activePanel = panel;
    if (!state.sidebarVisible) {
      state.sidebarVisible = true;
      const sidebar = document.getElementById('sidebar');
      const resize = document.getElementById('sidebar-resize');
      if (sidebar) sidebar.style.display = '';
      if (resize) resize.style.display = '';
    }

    document.querySelectorAll('.activity-item[data-panel]').forEach(el => {
      el.classList.toggle('active', el.dataset.panel === panel);
    });

    document.querySelectorAll('.sidebar-panel').forEach(el => {
      el.classList.toggle('active', el.dataset.panel === panel);
    });

    const titleMap = { explorer: 'EXPLORER', search: 'SEARCH', scm: 'SOURCE CONTROL', debug: 'RUN AND DEBUG', extensions: 'EXTENSIONS' };
    const sidebarTitle = document.getElementById('sidebar-title');
    if (sidebarTitle) sidebarTitle.textContent = titleMap[panel] || panel.toUpperCase();

    if (panel === 'scm') refreshGitStatus();
    if (panel === 'extensions') renderExtensionsPanel();
    if (panel === 'debug') renderDebugPanel();
    if (panel === 'search') {
      const input = document.getElementById('search-input');
      if (input) input.focus();
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  VIEW TOGGLES
  // ════════════════════════════════════════════════════════════════
  function toggleWordWrap() {
    state.wordWrap = !state.wordWrap;
    if (state.editor) state.editor.updateOptions({ wordWrap: state.wordWrap ? 'on' : 'off' });
    const el = document.getElementById('status-indent');
    if (el) el.title = 'Word Wrap: ' + (state.wordWrap ? 'On' : 'Off');
  }

  function toggleMinimap() {
    state.minimapEnabled = !state.minimapEnabled;
    if (state.editor) state.editor.updateOptions({ minimap: { enabled: state.minimapEnabled } });
  }

  function toggleBreadcrumbs() {
    state.breadcrumbsEnabled = !state.breadcrumbsEnabled;
    const bc = document.getElementById('breadcrumbs');
    if (bc) bc.classList.toggle('visible', state.breadcrumbsEnabled);
  }

  function toggleZenMode() {
    state.zenMode = !state.zenMode;
    document.body.classList.toggle('zen-mode', state.zenMode);
    if (state.zenMode) {
      state.sidebarVisible = false;
      const sidebar = document.getElementById('sidebar');
      const activityBar = document.getElementById('activity-bar');
      const statusBar = document.getElementById('status-bar');
      const tabsBar = document.getElementById('tabs-bar');
      if (sidebar) sidebar.style.display = 'none';
      if (activityBar) activityBar.style.display = 'none';
      if (statusBar) statusBar.style.display = 'none';
      if (tabsBar) tabsBar.style.display = 'none';
      const sr = document.getElementById('sidebar-resize');
      if (sr) sr.style.display = 'none';
      hideBottomPanel();
    } else {
      const activityBar = document.getElementById('activity-bar');
      const statusBar = document.getElementById('status-bar');
      const tabsBar = document.getElementById('tabs-bar');
      if (activityBar) activityBar.style.display = '';
      if (statusBar) statusBar.style.display = '';
      if (tabsBar) tabsBar.style.display = '';
      state.sidebarVisible = true;
      toggleSidebar(); toggleSidebar();
    }
    if (state.editor) state.editor.layout();
  }

  function cycleTheme() {
    const themes = ['Dark (Visual Studio)', 'Light (Visual Studio)', 'High Contrast'];
    const themeMap = { 'Dark (Visual Studio)': 'dark', 'Light (Visual Studio)': 'light', 'High Contrast': 'high-contrast' };
    openQuickPick(themes, 'Select Color Theme', (name) => {
      state.theme = themeMap[name];
      document.body.className = 'theme-' + state.theme;
      const monacoThemes = { dark: 'vscode-clone-dark', light: 'vscode-clone-light', 'high-contrast': 'vscode-clone-hc' };
      if (state.editor) monaco.editor.setTheme(monacoThemes[state.theme]);
      if (splitEditor) splitEditor.updateOptions({ theme: monacoThemes[state.theme] });
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  CONTEXT MENU
  // ════════════════════════════════════════════════════════════════
  function showContextMenu(x, y, items) {
    hideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    for (const item of items) {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'context-menu-separator';
        menu.appendChild(sep);
      } else {
        const el = document.createElement('div');
        el.className = 'context-menu-item';
        el.innerHTML = `<span>${item.label}</span>` +
          (item.shortcut ? `<span class="context-menu-shortcut">${item.shortcut}</span>` : '');
        el.addEventListener('click', () => { hideContextMenu(); item.action(); });
        menu.appendChild(el);
      }
    }

    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 5) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 5) + 'px';

    state.contextMenu = menu;
  }

  function hideContextMenu() {
    if (state.contextMenu) {
      state.contextMenu.remove();
      state.contextMenu = null;
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════
  function showNotification(type, message, timeout = 5000, actions = []) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    const icons = { info: 'ⓘ', warning: '⚠', error: '⊘', success: '✓' };

    let actionsHtml = '';
    if (actions.length > 0) {
      actionsHtml = '<div class="notification-actions">' +
        actions.map((a, i) => `<button class="notification-action-btn" data-idx="${i}">${escapeHtml(a.label)}</button>`).join('') +
        '</div>';
    }

    el.innerHTML =
      `<span class="notification-icon">${icons[type] || 'ⓘ'}</span>` +
      `<div class="notification-body">` +
      `<span class="notification-text">${escapeHtml(message)}</span>` +
      actionsHtml +
      `</div>` +
      `<span class="notification-close">&times;</span>`;

    el.querySelector('.notification-close').addEventListener('click', () => el.remove());
    el.querySelectorAll('.notification-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (actions[idx]?.action) actions[idx].action();
        el.remove();
      });
    });
    container.appendChild(el);

    setTimeout(() => el.classList.add('show'), 10);
    if (timeout > 0 && actions.length === 0) {
      setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
      }, timeout);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  RESIZE HANDLERS
  // ════════════════════════════════════════════════════════════════
  function initResizeHandlers() {
    const sidebarResize = document.getElementById('sidebar-resize');
    const sidebar = document.getElementById('sidebar');

    if (sidebarResize && sidebar) {
      sidebarResize.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = sidebar.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMove = (e) => {
          const w = Math.max(170, Math.min(600, startWidth + e.clientX - startX));
          sidebar.style.width = w + 'px';
          state.sidebarWidth = w;
        };
        const onUp = () => {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          if (state.editor) state.editor.layout();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    const panelResize = document.getElementById('panel-resize');
    const bottomPanel = document.getElementById('bottom-panel');

    if (panelResize && bottomPanel) {
      panelResize.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startH = bottomPanel.offsetHeight;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';

        const onMove = (e) => {
          const h = Math.max(100, Math.min(window.innerHeight - 200, startH - (e.clientY - startY)));
          bottomPanel.style.height = h + 'px';
          state.panelHeight = h;
        };
        const onUp = () => {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          if (state.editor) state.editor.layout();
          const inst = state.terminalInstances.find(i => i.id === state.activeTerminalId);
          if (inst) inst.fitAddon.fit();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  KEYBOARD SHORTCUTS
  // ════════════════════════════════════════════════════════════════
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (state.commandPaletteOpen) {
        handlePaletteKeydown(e);
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return;
      }

      const mod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        if (state.commandPaletteOpen) closePalette();
        hideContextMenu();
        return;
      }

      if (mod && e.shiftKey && e.key === 'P') { e.preventDefault(); toggleCommandPalette(); return; }
      if (mod && e.key === 'p' && !e.shiftKey) { e.preventDefault(); openQuickOpen(); return; }
      if (mod && e.key === 'b' && !e.shiftKey) { e.preventDefault(); toggleSidebar(); return; }
      if (mod && e.key === 'j' && !e.shiftKey) { e.preventDefault(); togglePanel(); return; }
      if (mod && e.key === '`' && !e.shiftKey) { e.preventDefault(); toggleTerminal(); return; }
      if (mod && e.shiftKey && e.key === '`') { e.preventDefault(); showBottomPanel('terminal'); createTerminalInstance(); return; }
      if (mod && e.key === 'n' && !e.shiftKey) { e.preventDefault(); newFile(); return; }
      if (mod && e.key === 'o' && !e.shiftKey) { e.preventDefault(); window.dialogs.openFile(); return; }
      if (mod && e.key === 's' && !e.shiftKey) { e.preventDefault(); saveCurrentFile(); return; }
      if (mod && e.shiftKey && e.key === 'S') { e.preventDefault(); saveCurrentFileAs(); return; }
      if (mod && e.key === 'w' && !e.shiftKey) { e.preventDefault(); if (state.activeTabId) closeTab(state.activeTabId); return; }
      if (mod && e.key === 'g' && !e.shiftKey) { e.preventDefault(); goToLine(); return; }
      if (mod && e.key === ',') { e.preventDefault(); openSettingsTab(); return; }

      if (mod && e.shiftKey && e.key === 'E') { e.preventDefault(); switchSidebarPanel('explorer'); return; }
      if (mod && e.shiftKey && e.key === 'F') { e.preventDefault(); switchSidebarPanel('search'); return; }
      if (mod && e.shiftKey && e.key === 'G') { e.preventDefault(); switchSidebarPanel('scm'); return; }
      if (mod && e.shiftKey && e.key === 'D') { e.preventDefault(); switchSidebarPanel('debug'); return; }
      if (mod && e.shiftKey && e.key === 'X') { e.preventDefault(); switchSidebarPanel('extensions'); return; }
      if (mod && e.shiftKey && e.key === 'M') { e.preventDefault(); showBottomPanel('problems'); return; }
      if (mod && e.shiftKey && e.key === 'U') { e.preventDefault(); showBottomPanel('output'); return; }

      if (mod && e.key === '\\') { e.preventDefault(); toggleSplitEditor(); return; }
      if (e.altKey && e.key === 'z') { e.preventDefault(); toggleWordWrap(); return; }
    });

    document.addEventListener('click', (e) => {
      if (state.contextMenu && !state.contextMenu.contains(e.target)) {
        hideContextMenu();
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  GIT GUTTER DECORATIONS
  // ════════════════════════════════════════════════════════════════
  let gutterDecorations = [];

  async function applyGitGutterDecorations(tab) {
    if (!state.editor || !state.isGitRepo || !tab.path) {
      state.editor?.deltaDecorations(gutterDecorations, []);
      gutterDecorations = [];
      return;
    }
    const relativePath = state.rootFolder ? tab.path.replace(state.rootFolder + '/', '') : tab.path;
    const diffText = await window.git.diff(relativePath).catch(() => '');
    if (!diffText) {
      state.editor.deltaDecorations(gutterDecorations, []);
      gutterDecorations = [];
      return;
    }

    const newDecorations = [];
    const hunkRegex = /@@\s*-\d+(?:,\d+)?\s*\+(\d+)(?:,(\d+))?\s*@@/g;
    let match;
    while ((match = hunkRegex.exec(diffText)) !== null) {
      const startLine = parseInt(match[1], 10);
      const count = match[2] !== undefined ? parseInt(match[2], 10) : 1;
      if (count === 0) {
        newDecorations.push({
          range: new monaco.Range(Math.max(1, startLine), 1, Math.max(1, startLine), 1),
          options: { isWholeLine: true, linesDecorationsClassName: 'git-gutter-deleted' },
        });
      } else {
        for (let i = 0; i < count; i++) {
          newDecorations.push({
            range: new monaco.Range(startLine + i, 1, startLine + i, 1),
            options: { isWholeLine: true, linesDecorationsClassName: 'git-gutter-modified' },
          });
        }
      }
    }
    gutterDecorations = state.editor.deltaDecorations(gutterDecorations, newDecorations);
  }

  // ════════════════════════════════════════════════════════════════
  //  SPLIT EDITOR
  // ════════════════════════════════════════════════════════════════
  let splitEditor = null;

  function toggleSplitEditor() {
    const group2 = document.getElementById('editor-group-2');
    const handle = document.getElementById('editor-split-handle');
    const container2 = document.getElementById('editor-container-2');
    if (!group2 || !container2) return;

    if (splitEditor) {
      splitEditor.dispose();
      splitEditor = null;
      group2.style.display = 'none';
      handle.style.display = 'none';
      return;
    }

    group2.style.display = '';
    handle.style.display = '';

    const tab = state.tabs.find(t => t.id === state.activeTabId);
    splitEditor = monaco.editor.create(container2, {
      value: tab ? tab.content : '',
      language: tab ? tab.language : 'plaintext',
      theme: state.theme === 'light' ? 'vscode-clone-light' : state.theme === 'high-contrast' ? 'vscode-clone-hc' : 'vscode-clone-dark',
      automaticLayout: true,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Menlo, Monaco, monospace",
      minimap: { enabled: state.minimapEnabled },
      scrollBeyondLastLine: true,
      wordWrap: state.wordWrap ? 'on' : 'off',
      readOnly: false,
    });

    if (tab) {
      const uri = monaco.Uri.parse('file://' + (tab.path || 'untitled-' + tab.id));
      const model = monaco.editor.getModel(uri);
      if (model) splitEditor.setModel(model);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  OPEN FOLDER PROGRAMMATICALLY
  // ════════════════════════════════════════════════════════════════
  async function openFolderPath(folderPath) {
    const tree = await window.fs.readDir(folderPath, 5).catch(() => []);
    state.rootFolder = folderPath;
    state.rootFolderName = getFileName(folderPath);
    const nameEl = document.getElementById('folder-name');
    if (nameEl) nameEl.textContent = state.rootFolderName.toUpperCase();
    const treeEl = document.getElementById('file-tree');
    if (treeEl) { treeEl.innerHTML = ''; renderFileTree(tree, treeEl, 0, folderPath); }
    const emptyState = document.querySelector('#file-tree .empty-state');
    if (emptyState) emptyState.style.display = 'none';
    window.fs.watch(folderPath);
    refreshGitStatus();
  }

  // ════════════════════════════════════════════════════════════════
  //  MENU EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════
  function setupMenuEvents() {
    const on = (ch, fn) => window.menuEvents.on(ch, fn);

    on('file:opened', (data) => createTab(data.path, data.content));
    on('folder:opened', (data) => {
      state.rootFolder = data.path;
      state.rootFolderName = getFileName(data.path);
      const nameEl = document.getElementById('folder-name');
      if (nameEl) nameEl.textContent = state.rootFolderName.toUpperCase();
      const tree = document.getElementById('file-tree');
      if (tree) { tree.innerHTML = ''; renderFileTree(data.tree, tree, 0, data.path); }

      const emptyState = document.querySelector('#file-tree .empty-state');
      if (emptyState) emptyState.style.display = 'none';

      window.fs.watch(data.path);
      refreshGitStatus();
      showNotification('info', `Opened folder: ${state.rootFolderName}`);
    });

    on('menu:new-file', () => newFile());
    on('menu:save', () => saveCurrentFile());
    on('menu:save-as', () => saveCurrentFileAs());
    on('menu:save-all', () => saveAllFiles());
    on('menu:close-editor', () => state.activeTabId && closeTab(state.activeTabId));
    on('menu:close-folder', () => {
      state.rootFolder = null;
      state.rootFolderName = '';
      const tree = document.getElementById('file-tree');
      if (tree) tree.innerHTML = '';
      const nameEl = document.getElementById('folder-name');
      if (nameEl) nameEl.textContent = 'NO FOLDER OPENED';
    });

    on('menu:find', () => state.editor?.trigger('', 'actions.find'));
    on('menu:replace', () => state.editor?.trigger('', 'editor.action.startFindReplaceAction'));
    on('menu:find-in-files', () => switchSidebarPanel('search'));
    on('menu:replace-in-files', () => switchSidebarPanel('search'));

    on('menu:toggle-comment', () => state.editor?.trigger('', 'editor.action.commentLine'));
    on('menu:toggle-block-comment', () => state.editor?.trigger('', 'editor.action.blockComment'));

    on('menu:command-palette', () => toggleCommandPalette());
    on('menu:quick-open', () => openQuickOpen());
    on('menu:show-explorer', () => switchSidebarPanel('explorer'));
    on('menu:show-search', () => switchSidebarPanel('search'));
    on('menu:show-scm', () => switchSidebarPanel('scm'));
    on('menu:show-debug', () => switchSidebarPanel('debug'));
    on('menu:show-extensions', () => switchSidebarPanel('extensions'));

    on('menu:show-problems', () => showBottomPanel('problems'));
    on('menu:show-output', () => showBottomPanel('output'));
    on('menu:show-debug-console', () => showBottomPanel('debug-console'));
    on('menu:toggle-terminal', () => toggleTerminal());
    on('menu:toggle-sidebar', () => toggleSidebar());
    on('menu:toggle-panel', () => togglePanel());
    on('menu:toggle-minimap', () => toggleMinimap());
    on('menu:toggle-breadcrumbs', () => toggleBreadcrumbs());
    on('menu:toggle-word-wrap', () => toggleWordWrap());
    on('menu:zen-mode', () => toggleZenMode());

    on('menu:go-to-line', () => goToLine());
    on('menu:new-terminal', () => { showBottomPanel('terminal'); createTerminalInstance(); });
    on('menu:split-terminal', () => { showBottomPanel('terminal'); createTerminalInstance(); });
    on('menu:clear-terminal', () => { const inst = state.terminalInstances.find(i => i.id === state.activeTerminalId); if (inst) inst.term.clear(); });
    on('menu:kill-terminal', () => { if (state.activeTerminalId) killTerminal(state.activeTerminalId); });

    on('menu:welcome', () => showWelcome());
    on('menu:settings-tab', () => openSettingsTab());

    on('menu:auto-save', (enabled) => { state.autoSave = enabled; });

    on('menu:start-debugging', () => showNotification('info', 'Debug: Starting...'));
    on('menu:stop-debugging', () => showNotification('info', 'Debug: Stopped'));

    window.fs.onChanged(() => {
      if (state.rootFolder) refreshFileTree();
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  STATUS BAR
  // ════════════════════════════════════════════════════════════════
  function setupStatusBar() {
    const branchEl = document.getElementById('status-branch');
    if (branchEl) {
      branchEl.addEventListener('click', () => gitCheckoutBranch());
    }

    const errEl = document.getElementById('status-errors');
    if (errEl) errEl.addEventListener('click', () => showBottomPanel('problems'));

    const warnEl = document.getElementById('status-warnings');
    if (warnEl) warnEl.addEventListener('click', () => showBottomPanel('problems'));

    const langEl = document.getElementById('status-language');
    if (langEl) langEl.addEventListener('click', () => {
      const languages = monaco.languages.getLanguages().map(l => l.id).sort();
      openQuickPick(languages, 'Select Language Mode', (lang) => {
        const model = state.editor?.getModel();
        if (model) monaco.editor.setModelLanguage(model, lang);
        const tab = state.tabs.find(t => t.id === state.activeTabId);
        if (tab) tab.language = lang;
        updateStatusBarLanguage();
      });
    });

    const encodingEl = document.getElementById('status-encoding');
    if (encodingEl) encodingEl.addEventListener('click', () => {
      const encodings = ['UTF-8', 'UTF-16 LE', 'UTF-16 BE', 'ISO 8859-1', 'Windows 1252', 'Shift JIS'];
      openQuickPick(encodings, 'Select File Encoding', (enc) => {
        encodingEl.textContent = enc;
      });
    });

    const eolEl = document.getElementById('status-eol');
    if (eolEl) eolEl.addEventListener('click', () => {
      const current = eolEl.textContent === 'LF' ? 'CRLF' : 'LF';
      eolEl.textContent = current;
      const model = state.editor?.getModel();
      if (model) model.setEOL(current === 'LF' ? monaco.editor.EndOfLineSequence.LF : monaco.editor.EndOfLineSequence.CRLF);
    });

    const indentEl = document.getElementById('status-indent');
    if (indentEl) indentEl.addEventListener('click', () => {
      const current = state.editor?.getOption(monaco.editor.EditorOption.tabSize) || 2;
      const newSize = current === 2 ? 4 : 2;
      state.editor?.updateOptions({ tabSize: newSize });
      indentEl.textContent = `Spaces: ${newSize}`;
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  ACTIVITY BAR
  // ════════════════════════════════════════════════════════════════
  function setupActivityBar() {
    document.querySelectorAll('.activity-item[data-panel]').forEach(el => {
      el.addEventListener('click', () => {
        const panel = el.dataset.panel;
        if (state.activePanel === panel && state.sidebarVisible) {
          toggleSidebar();
        } else {
          switchSidebarPanel(panel);
        }
      });
    });

    const settingsBtn = document.querySelector('.activity-item[data-action="settings"]');
    if (settingsBtn) settingsBtn.addEventListener('click', () => openSettingsTab());
  }

  // ════════════════════════════════════════════════════════════════
  //  PANEL TAB CLICKS
  // ════════════════════════════════════════════════════════════════
  function setupPanelTabs() {
    document.querySelectorAll('.panel-tab').forEach(el => {
      el.addEventListener('click', () => {
        showBottomPanel(el.dataset.tab);
      });
    });

    const newTermBtn = document.getElementById('panel-new-terminal');
    if (newTermBtn) newTermBtn.addEventListener('click', () => createTerminalInstance());

    const killTermBtn = document.getElementById('panel-kill-terminal');
    if (killTermBtn) killTermBtn.addEventListener('click', () => { if (state.activeTerminalId) killTerminal(state.activeTerminalId); });

    const clearOutputBtn = document.getElementById('output-clear');
    if (clearOutputBtn) clearOutputBtn.addEventListener('click', () => {
      const c = document.getElementById('output-log');
      if (c) c.innerHTML = '';
      state.outputLog = [];
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  GIT PANEL BUTTONS
  // ════════════════════════════════════════════════════════════════
  function setupGitPanel() {
    const commitBtn = document.getElementById('scm-commit-btn');
    if (commitBtn) commitBtn.addEventListener('click', () => gitCommit());

    const commitInput = document.getElementById('scm-commit-input');
    if (commitInput) {
      commitInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) gitCommit();
      });
    }

    const pullBtn = document.getElementById('scm-pull-btn');
    if (pullBtn) pullBtn.addEventListener('click', async () => {
      const r = await window.git.pull();
      showNotification(r.ok ? 'info' : 'error', r.ok ? 'Pull successful' : `Pull failed: ${r.stderr}`);
      refreshGitStatus();
    });

    const pushBtn = document.getElementById('scm-push-btn');
    if (pushBtn) pushBtn.addEventListener('click', async () => {
      const r = await window.git.push();
      showNotification(r.ok ? 'info' : 'error', r.ok ? 'Push successful' : `Push failed: ${r.stderr}`);
    });

    const refreshBtn = document.getElementById('scm-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => refreshGitStatus());

    const stageAllBtn = document.getElementById('scm-stage-all');
    if (stageAllBtn) stageAllBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      for (const c of state.gitChanges.filter(ch => ch.status === '??' || (ch.status[1] && ch.status[1] !== ' '))) {
        await window.git.stage(c.file);
      }
      refreshGitStatus();
    });

    const unstageAllBtn = document.getElementById('scm-unstage-all');
    if (unstageAllBtn) unstageAllBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      for (const c of state.gitChanges.filter(ch => 'MADRC'.includes(ch.status[0]) && ch.status[0] !== '?')) {
        await window.git.unstage(c.file);
      }
      refreshGitStatus();
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  WELCOME SCREEN
  // ════════════════════════════════════════════════════════════════
  function setupWelcome() {
    document.getElementById('welcome-new-file')?.addEventListener('click', () => newFile());
    document.getElementById('welcome-open-file')?.addEventListener('click', async () => {
      const data = await window.dialogs.openFile();
      if (data) createTab(data.path, data.content);
    });
    document.getElementById('welcome-open-folder')?.addEventListener('click', async () => {
      const data = await window.dialogs.openFolder();
      if (data && data.path) openFolderPath(data.path);
    });
    document.getElementById('welcome-open-terminal')?.addEventListener('click', () => toggleTerminal());
    document.getElementById('welcome-clone-repo')?.addEventListener('click', () => showNotification('info', 'Clone Repository'));
  }

  // ════════════════════════════════════════════════════════════════
  //  PALETTE INPUT
  // ════════════════════════════════════════════════════════════════
  function setupPalette() {
    const input = document.getElementById('palette-input');
    if (input) {
      input.addEventListener('input', () => filterPalette());
      input.addEventListener('keydown', (e) => handlePaletteKeydown(e));
    }

    document.querySelectorAll('.overlay-backdrop').forEach(bd => {
      bd.addEventListener('click', () => closePalette());
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  EXTENSIONS SEARCH
  // ════════════════════════════════════════════════════════════════
  function setupExtensions() {
    const searchInput = document.getElementById('extensions-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => renderExtensionsPanel());
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  COLLAPSIBLE SECTIONS
  // ════════════════════════════════════════════════════════════════
  function setupCollapsible() {
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        header.classList.toggle('expanded');
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  DEBUG CONSOLE REPL
  // ════════════════════════════════════════════════════════════════
  function setupDebugConsole() {
    const input = document.getElementById('debug-console-input');
    const log = document.getElementById('debug-console-log');
    if (!input || !log) return;

    const history = [];
    let historyIdx = -1;

    function appendLine(text, type = 'output') {
      const el = document.createElement('div');
      el.className = `debug-line debug-${type}`;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const expr = input.value.trim();
        if (!expr) return;
        history.unshift(expr);
        historyIdx = -1;
        appendLine('> ' + expr, 'input');
        input.value = '';
        const result = await window.proc.exec(`node -e "try { console.log(JSON.stringify(eval(${JSON.stringify(expr)}), null, 2)) } catch(e) { console.error(e.message) }"`, state.rootFolder).catch(err => ({ stderr: err.message || String(err) }));
        if (result.stdout) appendLine(result.stdout.trim(), 'output');
        if (result.stderr) appendLine(result.stderr.trim(), 'error');
      } else if (e.key === 'ArrowUp') {
        if (history.length > 0 && historyIdx < history.length - 1) {
          historyIdx++;
          input.value = history[historyIdx];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIdx > 0) {
          historyIdx--;
          input.value = history[historyIdx];
        } else {
          historyIdx = -1;
          input.value = '';
        }
        e.preventDefault();
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  AUTO-SAVE
  // ════════════════════════════════════════════════════════════════
  function setupAutoSave() {
    setInterval(() => {
      if (state.autoSave) {
        for (const tab of state.tabs) {
          if (tab.modified && !tab.path.startsWith('untitled-')) {
            window.fs.writeFile(tab.path, tab.content);
            tab.modified = false;
            tab.originalContent = tab.content;
          }
        }
        renderTabs();
      }
    }, 2000);
  }

  // ════════════════════════════════════════════════════════════════
  //  WORKSPACE PERSISTENCE
  // ════════════════════════════════════════════════════════════════
  function saveWorkspaceState() {
    try {
      const ws = {
        recentFolders: state.recentFiles.slice(0, 10),
        theme: state.theme,
        sidebarWidth: state.sidebarWidth,
        panelHeight: state.panelHeight,
        sidebarVisible: state.sidebarVisible,
        wordWrap: state.wordWrap,
        minimapEnabled: state.minimapEnabled,
        autoSave: state.autoSave,
        lastFolder: state.rootFolder,
      };
      localStorage.setItem('vscode-clone-workspace', JSON.stringify(ws));
    } catch (_) {}
  }

  function restoreWorkspaceState() {
    try {
      const raw = localStorage.getItem('vscode-clone-workspace');
      if (!raw) return;
      const ws = JSON.parse(raw);
      if (ws.theme && ws.theme !== state.theme) {
        state.theme = ws.theme;
      }
      if (ws.sidebarWidth) state.sidebarWidth = ws.sidebarWidth;
      if (ws.panelHeight) state.panelHeight = ws.panelHeight;
      if (ws.sidebarVisible === false) state.sidebarVisible = false;
      if (ws.wordWrap) state.wordWrap = true;
      if (ws.minimapEnabled === false) state.minimapEnabled = false;
      if (ws.autoSave) state.autoSave = true;
      if (ws.lastFolder) {
        window.fs.exists(ws.lastFolder).then(exists => {
          if (exists) openFolderPath(ws.lastFolder);
        }).catch(() => {});
      }
    } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════
  //  UTILITY
  // ════════════════════════════════════════════════════════════════
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function showElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  // ════════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════════
  async function init() {
    const platformInfo = await window.appApi.getPlatform().catch(() => ({ platform: 'darwin' }));
    const platform = platformInfo.platform || 'darwin';
    document.body.classList.add('platform-' + platform);

    if (!state.rootFolder) {
      document.getElementById('status-bar')?.classList.add('no-folder');
    }

    restoreWorkspaceState();
    await initMonaco();

    setupTerminalDataListener();
    setupActivityBar();
    setupPanelTabs();
    setupGitPanel();
    setupWelcome();
    setupPalette();
    setupExtensions();
    setupCollapsible();
    initResizeHandlers();
    initSearch();
    setupKeyboardShortcuts();
    setupMenuEvents();
    setupStatusBar();
    setupAutoSave();

    switchSidebarPanel('explorer');
    setupDebugConsole();

    document.getElementById('btn-split-editor')?.addEventListener('click', () => toggleSplitEditor());

    window.addEventListener('beforeunload', () => saveWorkspaceState());

    addOutput('Code Clone initialized');
    addOutput('Architecture: 3 browser windows, 7 context bridge APIs, 40+ IPC channels');
    addOutput('Reverse-engineered from VS Code v1.139.1 using REA');
  }

  document.addEventListener('DOMContentLoaded', () => {
    init().catch(err => {
      console.error('Init failed:', err);
      document.body.innerHTML = `<div style="color:#f44;padding:40px;font-family:monospace">
        <h2>Failed to initialize</h2><pre>${err.stack || err}</pre></div>`;
    });
  });
})();
