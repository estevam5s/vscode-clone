const { app, BrowserWindow, ipcMain, dialog, Menu, shell, nativeTheme, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, execSync, spawn } = require('child_process');

let mainWindow;
let settingsWindow;
let aboutWindow;
let workspaceFolder = null;
let recentFiles = [];
let recentFolders = [];
const MAX_RECENT = 15;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Code Clone',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 12, y: 10 },
    backgroundColor: '#1e1e1e',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createSettingsWindow() {
  if (settingsWindow) { settingsWindow.focus(); return; }
  settingsWindow = new BrowserWindow({
    width: 900, height: 650, parent: mainWindow, title: 'Settings', backgroundColor: '#1e1e1e',
    webPreferences: { preload: path.join(__dirname, '..', 'preload', 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function createAboutWindow() {
  if (aboutWindow) { aboutWindow.focus(); return; }
  aboutWindow = new BrowserWindow({
    width: 420, height: 380, parent: mainWindow, modal: true, resizable: false, title: 'About', backgroundColor: '#1e1e1e',
    webPreferences: { preload: path.join(__dirname, '..', 'preload', 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  aboutWindow.loadFile(path.join(__dirname, '..', 'renderer', 'about.html'));
  aboutWindow.on('closed', () => { aboutWindow = null; });
}

// ── Directory tree reader ────────────────────────────────────────
function readDirectoryTree(dirPath, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== '__pycache__'
        && e.name !== '.git' && e.name !== 'dist' && e.name !== '.next' && e.name !== 'build')
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      })
      .map(entry => {
        const fullPath = path.join(dirPath, entry.name);
        const item = { name: entry.name, path: fullPath, isDirectory: entry.isDirectory() };
        if (entry.isDirectory()) {
          item.children = readDirectoryTree(fullPath, maxDepth, currentDepth + 1);
        }
        return item;
      });
  } catch { return []; }
}

// ── Menu ─────────────────────────────────────────────────────────
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const send = (ch) => () => mainWindow?.webContents.send(ch);

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: 'About Code Clone', click: () => createAboutWindow() },
        { type: 'separator' },
        { label: 'Settings...', accelerator: 'Cmd+,', click: () => mainWindow?.webContents.send('menu:settings-tab') },
        { type: 'separator' },
        { role: 'services' }, { type: 'separator' },
        { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
        { type: 'separator' }, { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: send('menu:new-file') },
        { label: 'New Window', accelerator: 'CmdOrCtrl+Shift+N', click: () => createMainWindow() },
        { type: 'separator' },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => handleOpenFile() },
        { label: 'Open Folder...', accelerator: isMac ? 'Cmd+Shift+O' : 'Ctrl+K Ctrl+O', click: () => handleOpenFolder() },
        { label: 'Open Recent', submenu: buildRecentMenu() },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: send('menu:save') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: send('menu:save-as') },
        { label: 'Save All', accelerator: 'CmdOrCtrl+Alt+S', click: send('menu:save-all') },
        { type: 'separator' },
        { label: 'Auto Save', type: 'checkbox', checked: false, click: (mi) => mainWindow?.webContents.send('menu:auto-save', mi.checked) },
        { type: 'separator' },
        { label: 'Close Editor', accelerator: 'CmdOrCtrl+W', click: send('menu:close-editor') },
        { label: 'Close Folder', click: send('menu:close-folder') },
        ...(isMac ? [] : [{ type: 'separator' }, { role: 'quit' }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: send('menu:find') },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: send('menu:replace') },
        { label: 'Find in Files', accelerator: 'CmdOrCtrl+Shift+F', click: send('menu:find-in-files') },
        { label: 'Replace in Files', accelerator: 'CmdOrCtrl+Shift+H', click: send('menu:replace-in-files') },
        { type: 'separator' },
        { label: 'Toggle Line Comment', accelerator: 'CmdOrCtrl+/', click: send('menu:toggle-comment') },
        { label: 'Toggle Block Comment', accelerator: 'CmdOrCtrl+Shift+/', click: send('menu:toggle-block-comment') },
        { type: 'separator' },
        { label: 'Emmet: Expand Abbreviation', accelerator: 'Tab', enabled: false },
      ],
    },
    {
      label: 'Selection',
      submenu: [
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
        { label: 'Expand Selection', accelerator: 'CmdOrCtrl+Shift+Right', click: send('menu:expand-selection') },
        { label: 'Shrink Selection', accelerator: 'CmdOrCtrl+Shift+Left', click: send('menu:shrink-selection') },
        { type: 'separator' },
        { label: 'Copy Line Up', accelerator: 'Alt+Shift+Up', click: send('menu:copy-line-up') },
        { label: 'Copy Line Down', accelerator: 'Alt+Shift+Down', click: send('menu:copy-line-down') },
        { label: 'Move Line Up', accelerator: 'Alt+Up', click: send('menu:move-line-up') },
        { label: 'Move Line Down', accelerator: 'Alt+Down', click: send('menu:move-line-down') },
        { type: 'separator' },
        { label: 'Add Cursor Above', accelerator: 'CmdOrCtrl+Alt+Up', click: send('menu:cursor-above') },
        { label: 'Add Cursor Below', accelerator: 'CmdOrCtrl+Alt+Down', click: send('menu:cursor-below') },
        { label: 'Add Cursors to Line Ends', accelerator: 'CmdOrCtrl+Shift+L', click: send('menu:cursors-line-ends') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette...', accelerator: 'CmdOrCtrl+Shift+P', click: send('menu:command-palette') },
        { label: 'Open View...', click: send('menu:open-view') },
        { type: 'separator' },
        { label: 'Explorer', accelerator: 'CmdOrCtrl+Shift+E', click: send('menu:show-explorer') },
        { label: 'Search', accelerator: 'CmdOrCtrl+Shift+F', click: send('menu:show-search') },
        { label: 'Source Control', accelerator: 'CmdOrCtrl+Shift+G', click: send('menu:show-scm') },
        { label: 'Run and Debug', accelerator: 'CmdOrCtrl+Shift+D', click: send('menu:show-debug') },
        { label: 'Extensions', accelerator: 'CmdOrCtrl+Shift+X', click: send('menu:show-extensions') },
        { type: 'separator' },
        { label: 'Problems', accelerator: 'CmdOrCtrl+Shift+M', click: send('menu:show-problems') },
        { label: 'Output', accelerator: 'CmdOrCtrl+Shift+U', click: send('menu:show-output') },
        { label: 'Debug Console', accelerator: 'CmdOrCtrl+Shift+Y', click: send('menu:show-debug-console') },
        { label: 'Terminal', accelerator: 'CmdOrCtrl+`', click: send('menu:toggle-terminal') },
        { type: 'separator' },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: send('menu:toggle-sidebar') },
        { label: 'Toggle Panel', accelerator: 'CmdOrCtrl+J', click: send('menu:toggle-panel') },
        { label: 'Toggle Minimap', click: send('menu:toggle-minimap') },
        { label: 'Toggle Breadcrumbs', click: send('menu:toggle-breadcrumbs') },
        { label: 'Toggle Word Wrap', accelerator: 'Alt+Z', click: send('menu:toggle-word-wrap') },
        { type: 'separator' },
        { label: 'Zen Mode', click: send('menu:zen-mode') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' },
      ],
    },
    {
      label: 'Go',
      submenu: [
        { label: 'Go to File...', accelerator: 'CmdOrCtrl+P', click: send('menu:quick-open') },
        { label: 'Go to Symbol in Workspace...', accelerator: 'CmdOrCtrl+T', click: send('menu:go-to-symbol') },
        { type: 'separator' },
        { label: 'Go to Definition', accelerator: 'F12', click: send('menu:go-to-definition') },
        { label: 'Go to Type Definition', click: send('menu:go-to-type-definition') },
        { label: 'Go to Implementation', accelerator: 'CmdOrCtrl+F12', click: send('menu:go-to-implementation') },
        { label: 'Go to References', accelerator: 'Shift+F12', click: send('menu:go-to-references') },
        { type: 'separator' },
        { label: 'Go to Line...', accelerator: 'CmdOrCtrl+G', click: send('menu:go-to-line') },
        { label: 'Go Back', accelerator: isMac ? 'Ctrl+-' : 'Alt+Left', click: send('menu:go-back') },
        { label: 'Go Forward', accelerator: isMac ? 'Ctrl+Shift+-' : 'Alt+Right', click: send('menu:go-forward') },
        { type: 'separator' },
        { label: 'Next Problem', accelerator: 'F8', click: send('menu:next-problem') },
        { label: 'Previous Problem', accelerator: 'Shift+F8', click: send('menu:prev-problem') },
      ],
    },
    {
      label: 'Run',
      submenu: [
        { label: 'Start Debugging', accelerator: 'F5', click: send('menu:start-debugging') },
        { label: 'Start Without Debugging', accelerator: 'CmdOrCtrl+F5', click: send('menu:run-without-debug') },
        { label: 'Stop Debugging', accelerator: 'Shift+F5', click: send('menu:stop-debugging') },
        { label: 'Restart Debugging', accelerator: 'CmdOrCtrl+Shift+F5', click: send('menu:restart-debugging') },
        { type: 'separator' },
        { label: 'Step Over', accelerator: 'F10', click: send('menu:step-over') },
        { label: 'Step Into', accelerator: 'F11', click: send('menu:step-into') },
        { label: 'Step Out', accelerator: 'Shift+F11', click: send('menu:step-out') },
        { label: 'Continue', accelerator: 'F5', click: send('menu:continue') },
        { type: 'separator' },
        { label: 'Toggle Breakpoint', accelerator: 'F9', click: send('menu:toggle-breakpoint') },
        { label: 'Run Task...', click: send('menu:run-task') },
      ],
    },
    {
      label: 'Terminal',
      submenu: [
        { label: 'New Terminal', accelerator: 'CmdOrCtrl+Shift+`', click: send('menu:new-terminal') },
        { label: 'Split Terminal', click: send('menu:split-terminal') },
        { type: 'separator' },
        { label: 'Run Active File', click: send('menu:run-active-file') },
        { label: 'Run Selected Text', click: send('menu:run-selected-text') },
        { type: 'separator' },
        { label: 'Clear Terminal', click: send('menu:clear-terminal') },
        { label: 'Kill Terminal', click: send('menu:kill-terminal') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Welcome', click: send('menu:welcome') },
        { label: 'Documentation', click: () => shell.openExternal('https://code.visualstudio.com/docs') },
        { label: 'Keyboard Shortcuts Reference', click: send('menu:keyboard-shortcuts') },
        { type: 'separator' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'About Code Clone', click: () => createAboutWindow() },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function buildRecentMenu() {
  const items = [];
  for (const f of recentFiles.slice(0, 5)) {
    items.push({ label: f, click: () => openFileByPath(f) });
  }
  if (recentFolders.length) {
    items.push({ type: 'separator' });
    for (const f of recentFolders.slice(0, 5)) {
      items.push({ label: f, click: () => openFolderByPath(f) });
    }
  }
  if (items.length === 0) items.push({ label: 'No Recent Items', enabled: false });
  return items;
}

function addRecentFile(filePath) {
  recentFiles = [filePath, ...recentFiles.filter(f => f !== filePath)].slice(0, MAX_RECENT);
}
function addRecentFolder(folderPath) {
  recentFolders = [folderPath, ...recentFolders.filter(f => f !== folderPath)].slice(0, MAX_RECENT);
}

async function openFileByPath(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    addRecentFile(filePath);
    mainWindow?.webContents.send('file:opened', { path: filePath, content });
  } catch {}
}

async function openFolderByPath(folderPath) {
  workspaceFolder = folderPath;
  addRecentFolder(folderPath);
  const tree = readDirectoryTree(folderPath, 5);
  mainWindow?.webContents.send('folder:opened', { path: folderPath, tree });
}

async function handleOpenFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'JavaScript/TypeScript', extensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'] },
      { name: 'Web', extensions: ['html', 'htm', 'css', 'scss', 'less', 'vue', 'svelte'] },
      { name: 'Data', extensions: ['json', 'yaml', 'yml', 'xml', 'csv', 'toml'] },
      { name: 'Script', extensions: ['py', 'rb', 'sh', 'bash', 'zsh', 'ps1'] },
      { name: 'Markup', extensions: ['md', 'mdx', 'rst', 'txt'] },
    ],
  });
  if (!result.canceled) {
    for (const filePath of result.filePaths) {
      openFileByPath(filePath);
    }
  }
}

async function handleOpenFolder() {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (!result.canceled && result.filePaths.length > 0) {
    openFolderByPath(result.filePaths[0]);
  }
}

// ── File system IPC ──────────────────────────────────────────────
ipcMain.handle('fs:readFile', async (_, filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
});

ipcMain.handle('fs:readFileBinary', async (_, filePath) => {
  return fs.readFileSync(filePath);
});

ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
});

ipcMain.handle('fs:readDir', async (_, dirPath, depth = 5) => {
  return readDirectoryTree(dirPath, depth);
});

ipcMain.handle('fs:stat', async (_, filePath) => {
  const stat = fs.statSync(filePath);
  return { size: stat.size, isDirectory: stat.isDirectory(), modified: stat.mtime, created: stat.birthtime };
});

ipcMain.handle('fs:exists', async (_, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('fs:rename', async (_, oldPath, newPath) => {
  fs.renameSync(oldPath, newPath);
  return true;
});

ipcMain.handle('fs:delete', async (_, filePath) => {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) fs.rmSync(filePath, { recursive: true });
  else fs.unlinkSync(filePath);
  return true;
});

ipcMain.handle('fs:mkdir', async (_, dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
  return true;
});

ipcMain.handle('fs:createFile', async (_, filePath) => {
  fs.writeFileSync(filePath, '', 'utf-8');
  return true;
});

ipcMain.handle('fs:watch', async (_, dirPath) => {
  try {
    const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      mainWindow?.webContents.send('fs:changed', { dirPath, eventType, filename });
    });
    return true;
  } catch { return false; }
});

// ── Dialog IPC ───────────────────────────────────────────────────
ipcMain.handle('dialog:openFile', async () => { return handleOpenFile(); });
ipcMain.handle('dialog:openFolder', async () => { return handleOpenFolder(); });

ipcMain.handle('dialog:saveFile', async (_, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, { defaultPath });
  if (!result.canceled) return result.filePath;
  return null;
});

ipcMain.handle('dialog:confirm', async (_, options) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: options.type || 'question',
    buttons: options.buttons || ['OK', 'Cancel'],
    title: options.title || 'Confirm',
    message: options.message || '',
    detail: options.detail || '',
  });
  return result.response;
});

// ── App IPC ──────────────────────────────────────────────────────
ipcMain.handle('app:getPath', async (_, name) => app.getPath(name));
ipcMain.handle('app:getVersion', async () => app.getVersion());
ipcMain.handle('app:getPlatform', async () => ({ platform: process.platform, arch: process.arch, hostname: os.hostname() }));
ipcMain.handle('app:getTheme', async () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
ipcMain.handle('app:getWorkspace', async () => workspaceFolder);

ipcMain.handle('shell:getDefaultShell', async () => {
  if (process.platform === 'win32') return process.env.COMSPEC || 'powershell.exe';
  return process.env.SHELL || '/bin/zsh';
});

ipcMain.handle('shell:openExternal', async (_, url) => { shell.openExternal(url); });
ipcMain.handle('shell:openPath', async (_, p) => { shell.openPath(p); });
ipcMain.handle('shell:showItemInFolder', async (_, p) => { shell.showItemInFolder(p); });

// ── Window IPC ───────────────────────────────────────────────────
ipcMain.handle('window:settings', async () => { createSettingsWindow(); });
ipcMain.handle('window:about', async () => { createAboutWindow(); });
ipcMain.handle('window:reload', async () => { mainWindow?.reload(); });
ipcMain.handle('window:toggleDevTools', async () => { mainWindow?.webContents.toggleDevTools(); });

// ── Search IPC (ripgrep-like file search) ────────────────────────
ipcMain.handle('search:inFiles', async (_, query, options = {}) => {
  if (!workspaceFolder) return [];
  const results = [];
  const regex = options.useRegex ? new RegExp(query, options.caseSensitive ? 'g' : 'gi')
    : new RegExp(escapeRegex(query), options.caseSensitive ? 'g' : 'gi');

  function searchDir(dir, depth = 0) {
    if (depth > 10 || results.length > 500) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          searchDir(fullPath, depth + 1);
        } else {
          try {
            const ext = path.extname(entry.name).toLowerCase();
            const textExts = ['.js','.jsx','.ts','.tsx','.json','.html','.css','.scss','.less','.md','.txt','.py','.rb','.go','.rs','.java','.c','.cpp','.h','.sh','.yml','.yaml','.toml','.xml','.svg','.vue','.svelte','.env','.sql','.php','.lua','.r','.swift','.kt','.dart','.ex','.exs','.zig','.nim','.mjs','.cjs','.jsx','.mdx','.astro'];
            if (!textExts.includes(ext) && ext !== '') continue;
            const stat = fs.statSync(fullPath);
            if (stat.size > 1024 * 512) continue;
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            const matches = [];
            for (let i = 0; i < lines.length; i++) {
              if (regex.test(lines[i])) {
                matches.push({ line: i + 1, text: lines[i].trim().slice(0, 200) });
                regex.lastIndex = 0;
              }
            }
            if (matches.length > 0) {
              results.push({ path: fullPath, relativePath: path.relative(workspaceFolder, fullPath), matches });
            }
          } catch {}
        }
      }
    } catch {}
  }

  searchDir(options.path || workspaceFolder);
  return results;
});

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

ipcMain.handle('search:files', async (_, query) => {
  if (!workspaceFolder) return [];
  const results = [];
  const lowerQuery = query.toLowerCase();

  function findFiles(dir, depth = 0) {
    if (depth > 8 || results.length > 100) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findFiles(fullPath, depth + 1);
        } else if (entry.name.toLowerCase().includes(lowerQuery)) {
          results.push({ path: fullPath, relativePath: path.relative(workspaceFolder, fullPath), name: entry.name });
        }
      }
    } catch {}
  }

  findFiles(workspaceFolder);
  return results;
});

// ── Git IPC ──────────────────────────────────────────────────────
function gitExec(cmd, cwd) {
  return new Promise((resolve) => {
    exec(`git ${cmd}`, { cwd: cwd || workspaceFolder, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout: stdout?.trim() || '', stderr: stderr?.trim() || '' });
    });
  });
}

ipcMain.handle('git:isRepo', async () => {
  if (!workspaceFolder) return false;
  const r = await gitExec('rev-parse --is-inside-work-tree');
  return r.ok && r.stdout === 'true';
});

ipcMain.handle('git:status', async () => {
  const r = await gitExec('status --porcelain -u');
  if (!r.ok) return [];
  return r.stdout.split('\n').filter(Boolean).map(line => {
    const status = line.slice(0, 2);
    const file = line.slice(3);
    return { status: status.trim(), file };
  });
});

ipcMain.handle('git:branch', async () => {
  const r = await gitExec('branch --show-current');
  return r.ok ? r.stdout : 'main';
});

ipcMain.handle('git:branches', async () => {
  const r = await gitExec('branch -a --no-color');
  if (!r.ok) return [];
  return r.stdout.split('\n').map(b => b.trim().replace(/^\* /, '')).filter(Boolean);
});

ipcMain.handle('git:log', async (_, count = 50) => {
  const r = await gitExec(`log --oneline --decorate -n ${count} --format="%H|%h|%s|%an|%ar|%D"`);
  if (!r.ok) return [];
  return r.stdout.split('\n').filter(Boolean).map(line => {
    const [hash, shortHash, message, author, date, refs] = line.split('|');
    return { hash, shortHash, message, author, date, refs };
  });
});

ipcMain.handle('git:diff', async (_, filePath) => {
  const r = await gitExec(`diff -- "${filePath || ''}"`);
  return r.stdout;
});

ipcMain.handle('git:diffStaged', async () => {
  const r = await gitExec('diff --staged');
  return r.stdout;
});

ipcMain.handle('git:stage', async (_, filePath) => {
  return gitExec(`add "${filePath}"`);
});

ipcMain.handle('git:unstage', async (_, filePath) => {
  return gitExec(`restore --staged "${filePath}"`);
});

ipcMain.handle('git:commit', async (_, message) => {
  return gitExec(`commit -m "${message.replace(/"/g, '\\"')}"`);
});

ipcMain.handle('git:stash', async () => gitExec('stash'));
ipcMain.handle('git:stashPop', async () => gitExec('stash pop'));
ipcMain.handle('git:pull', async () => gitExec('pull'));
ipcMain.handle('git:push', async () => gitExec('push'));
ipcMain.handle('git:checkout', async (_, branch) => gitExec(`checkout "${branch}"`));
ipcMain.handle('git:createBranch', async (_, name) => gitExec(`checkout -b "${name}"`));

ipcMain.handle('git:fileHistory', async (_, filePath) => {
  const r = await gitExec(`log --oneline -20 --follow -- "${filePath}"`);
  if (!r.ok) return [];
  return r.stdout.split('\n').filter(Boolean);
});

ipcMain.handle('git:show', async (_, ref) => {
  const r = await gitExec(`show "${ref}"`);
  return r.stdout;
});

ipcMain.handle('git:blame', async (_, filePath) => {
  const r = await gitExec(`blame --porcelain "${filePath}"`);
  return r.stdout;
});

// ── Terminal IPC with node-pty ───────────────────────────────────
let ptyProcesses = new Map();
let nextPtyId = 1;

ipcMain.handle('terminal:create', async (_, options = {}) => {
  try {
    const pty = require('node-pty');
    const shell = options.shell || (process.platform === 'win32' ? process.env.COMSPEC || 'powershell.exe' : process.env.SHELL || '/bin/zsh');
    const cwd = options.cwd || workspaceFolder || os.homedir();
    const id = nextPtyId++;

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: options.cols || 80,
      rows: options.rows || 24,
      cwd,
      env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
    });

    ptyProcesses.set(id, ptyProcess);

    ptyProcess.onData((data) => {
      mainWindow?.webContents.send('terminal:data', { id, data });
    });

    ptyProcess.onExit(({ exitCode }) => {
      ptyProcesses.delete(id);
      mainWindow?.webContents.send('terminal:exit', { id, exitCode });
    });

    return { id, pid: ptyProcess.pid, cwd };
  } catch (err) {
    return { id: -1, error: err.message };
  }
});

ipcMain.on('terminal:input', (_, { id, data }) => {
  ptyProcesses.get(id)?.write(data);
});

ipcMain.on('terminal:resize', (_, { id, cols, rows }) => {
  ptyProcesses.get(id)?.resize(cols, rows);
});

ipcMain.handle('terminal:kill', async (_, id) => {
  const pty = ptyProcesses.get(id);
  if (pty) { pty.kill(); ptyProcesses.delete(id); }
});

ipcMain.handle('terminal:getCwd', async (_, id) => {
  return workspaceFolder || os.homedir();
});

// ── Process execution (for Run) ──────────────────────────────────
ipcMain.handle('process:exec', async (_, cmd, cwd) => {
  return new Promise(resolve => {
    exec(cmd, { cwd: cwd || workspaceFolder || os.homedir(), maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout, stderr, code: err?.code });
    });
  });
});

// ── App lifecycle ────────────────────────────────────────────────
app.whenReady().then(() => {
  buildMenu();
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  for (const [, pty] of ptyProcesses) pty.kill();
  ptyProcesses.clear();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  for (const [, pty] of ptyProcesses) pty.kill();
  ptyProcesses.clear();
});
