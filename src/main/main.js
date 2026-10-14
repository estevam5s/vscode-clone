const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;
let settingsWindow;
let aboutWindow;

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
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

function createSettingsWindow() {
  if (settingsWindow) { settingsWindow.focus(); return; }
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: false,
    title: 'Settings',
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function createAboutWindow() {
  if (aboutWindow) { aboutWindow.focus(); return; }
  aboutWindow = new BrowserWindow({
    width: 420,
    height: 340,
    parent: mainWindow,
    modal: true,
    resizable: false,
    title: 'About',
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  aboutWindow.loadFile(path.join(__dirname, '..', 'renderer', 'about.html'));
  aboutWindow.on('closed', () => { aboutWindow = null; });
}

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new-file') },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => handleOpenFile() },
        { label: 'Open Folder...', accelerator: 'CmdOrCtrl+Shift+O', click: () => handleOpenFolder() },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:save-as') },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => createSettingsWindow() },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => mainWindow?.webContents.send('menu:find') },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.webContents.send('menu:replace') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette...', accelerator: 'CmdOrCtrl+Shift+P', click: () => mainWindow?.webContents.send('menu:command-palette') },
        { type: 'separator' },
        { label: 'Explorer', accelerator: 'CmdOrCtrl+Shift+E', click: () => mainWindow?.webContents.send('menu:toggle-sidebar') },
        { label: 'Terminal', accelerator: 'CmdOrCtrl+`', click: () => mainWindow?.webContents.send('menu:toggle-terminal') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' },
      ],
    },
    {
      label: 'Terminal',
      submenu: [
        { label: 'New Terminal', accelerator: 'CmdOrCtrl+Shift+`', click: () => mainWindow?.webContents.send('menu:new-terminal') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About Code Clone', click: () => createAboutWindow() },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { label: 'About Code Clone', click: () => createAboutWindow() },
        { type: 'separator' },
        { label: 'Settings...', accelerator: 'Cmd+,', click: () => createSettingsWindow() },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function handleOpenFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'JavaScript', extensions: ['js', 'jsx', 'ts', 'tsx'] },
      { name: 'Python', extensions: ['py'] },
      { name: 'HTML', extensions: ['html', 'htm'] },
      { name: 'CSS', extensions: ['css', 'scss', 'less'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'Markdown', extensions: ['md'] },
    ],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('file:opened', { path: filePath, content });
  }
}

async function handleOpenFolder() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    const tree = readDirectoryTree(folderPath, 3);
    mainWindow.webContents.send('folder:opened', { path: folderPath, tree });
  }
}

function readDirectoryTree(dirPath, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== '__pycache__')
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

// IPC Handlers — replicating the 18 literal channels REA detected
ipcMain.handle('fs:readFile', async (_, filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
});

ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
});

ipcMain.handle('fs:readDir', async (_, dirPath) => {
  return readDirectoryTree(dirPath, 4);
});

ipcMain.handle('fs:stat', async (_, filePath) => {
  const stat = fs.statSync(filePath);
  return { size: stat.size, isDirectory: stat.isDirectory(), modified: stat.mtime };
});

ipcMain.handle('fs:exists', async (_, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('dialog:openFile', async () => {
  return handleOpenFile();
});

ipcMain.handle('dialog:openFolder', async () => {
  return handleOpenFolder();
});

ipcMain.handle('dialog:saveFile', async (_, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, { defaultPath });
  if (!result.canceled) return result.filePath;
  return null;
});

ipcMain.handle('app:getPath', async (_, name) => {
  return app.getPath(name);
});

ipcMain.handle('app:getVersion', async () => {
  return app.getVersion();
});

ipcMain.handle('app:getPlatform', async () => {
  return { platform: process.platform, arch: process.arch, hostname: os.hostname() };
});

ipcMain.handle('shell:getDefaultShell', async () => {
  if (process.platform === 'win32') return 'powershell.exe';
  return process.env.SHELL || '/bin/zsh';
});

ipcMain.handle('window:settings', async () => {
  createSettingsWindow();
});

ipcMain.handle('window:about', async () => {
  createAboutWindow();
});

// Terminal IPC with node-pty
let ptyProcesses = new Map();
let nextPtyId = 1;

ipcMain.handle('terminal:create', async (_, options = {}) => {
  try {
    const pty = require('node-pty');
    const shell = options.shell || (process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh');
    const cwd = options.cwd || os.homedir();
    const id = nextPtyId++;

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: options.cols || 80,
      rows: options.rows || 24,
      cwd,
      env: { ...process.env, TERM: 'xterm-256color' },
    });

    ptyProcesses.set(id, ptyProcess);

    ptyProcess.onData((data) => {
      mainWindow?.webContents.send('terminal:data', { id, data });
    });

    ptyProcess.onExit(({ exitCode }) => {
      ptyProcesses.delete(id);
      mainWindow?.webContents.send('terminal:exit', { id, exitCode });
    });

    return { id, pid: ptyProcess.pid };
  } catch (err) {
    return { id: -1, error: err.message };
  }
});

ipcMain.on('terminal:input', (_, { id, data }) => {
  const pty = ptyProcesses.get(id);
  if (pty) pty.write(data);
});

ipcMain.on('terminal:resize', (_, { id, cols, rows }) => {
  const pty = ptyProcesses.get(id);
  if (pty) pty.resize(cols, rows);
});

ipcMain.handle('terminal:kill', async (_, id) => {
  const pty = ptyProcesses.get(id);
  if (pty) { pty.kill(); ptyProcesses.delete(id); }
});

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
