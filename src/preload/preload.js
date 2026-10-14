const { contextBridge, ipcRenderer } = require('electron');

// Context Bridge API — replicating the 4 APIs / 11 members REA detected
contextBridge.exposeInMainWorld('api', {
  // File system
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  stat: (filePath) => ipcRenderer.invoke('fs:stat', filePath),
  exists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),

  // Dialogs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (defaultPath) => ipcRenderer.invoke('dialog:saveFile', defaultPath),

  // App info
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),

  // Windows
  openSettings: () => ipcRenderer.invoke('window:settings'),
  openAbout: () => ipcRenderer.invoke('window:about'),

  // Terminal
  createTerminal: (options) => ipcRenderer.invoke('terminal:create', options),
  writeTerminal: (id, data) => ipcRenderer.send('terminal:input', { id, data }),
  resizeTerminal: (id, cols, rows) => ipcRenderer.send('terminal:resize', { id, cols, rows }),
  killTerminal: (id) => ipcRenderer.invoke('terminal:kill', id),
  onTerminalData: (callback) => {
    ipcRenderer.on('terminal:data', (_, payload) => callback(payload));
  },
  onTerminalExit: (callback) => {
    ipcRenderer.on('terminal:exit', (_, payload) => callback(payload));
  },

  // Menu events
  onMenuEvent: (channel, callback) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

  // Shell
  getDefaultShell: () => ipcRenderer.invoke('shell:getDefaultShell'),
});
