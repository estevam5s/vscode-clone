const { contextBridge, ipcRenderer } = require('electron');

// API 1: File System
contextBridge.exposeInMainWorld('fs', {
  readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
  readFileBinary: (path) => ipcRenderer.invoke('fs:readFileBinary', path),
  writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
  readDir: (path, depth) => ipcRenderer.invoke('fs:readDir', path, depth),
  stat: (path) => ipcRenderer.invoke('fs:stat', path),
  exists: (path) => ipcRenderer.invoke('fs:exists', path),
  rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
  delete: (path) => ipcRenderer.invoke('fs:delete', path),
  mkdir: (path) => ipcRenderer.invoke('fs:mkdir', path),
  createFile: (path) => ipcRenderer.invoke('fs:createFile', path),
  watch: (path) => ipcRenderer.invoke('fs:watch', path),
  onChanged: (cb) => ipcRenderer.on('fs:changed', (_, data) => cb(data)),
});

// API 2: Dialogs
contextBridge.exposeInMainWorld('dialogs', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (defaultPath) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
  confirm: (options) => ipcRenderer.invoke('dialog:confirm', options),
});

// API 3: App
contextBridge.exposeInMainWorld('appApi', {
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  getTheme: () => ipcRenderer.invoke('app:getTheme'),
  getWorkspace: () => ipcRenderer.invoke('app:getWorkspace'),
  getDefaultShell: () => ipcRenderer.invoke('shell:getDefaultShell'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openPath: (p) => ipcRenderer.invoke('shell:openPath', p),
  showItemInFolder: (p) => ipcRenderer.invoke('shell:showItemInFolder', p),
  reload: () => ipcRenderer.invoke('window:reload'),
  toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),
  openSettings: () => ipcRenderer.invoke('window:settings'),
  openAbout: () => ipcRenderer.invoke('window:about'),
});

// API 4: Terminal
contextBridge.exposeInMainWorld('terminal', {
  create: (options) => ipcRenderer.invoke('terminal:create', options),
  input: (id, data) => ipcRenderer.send('terminal:input', { id, data }),
  resize: (id, cols, rows) => ipcRenderer.send('terminal:resize', { id, cols, rows }),
  kill: (id) => ipcRenderer.invoke('terminal:kill', id),
  getCwd: (id) => ipcRenderer.invoke('terminal:getCwd', id),
  onData: (cb) => ipcRenderer.on('terminal:data', (_, data) => cb(data)),
  onExit: (cb) => ipcRenderer.on('terminal:exit', (_, data) => cb(data)),
});

// API 5: Search
contextBridge.exposeInMainWorld('search', {
  inFiles: (query, options) => ipcRenderer.invoke('search:inFiles', query, options),
  files: (query) => ipcRenderer.invoke('search:files', query),
});

// API 6: Git (Source Control)
contextBridge.exposeInMainWorld('git', {
  isRepo: () => ipcRenderer.invoke('git:isRepo'),
  status: () => ipcRenderer.invoke('git:status'),
  branch: () => ipcRenderer.invoke('git:branch'),
  branches: () => ipcRenderer.invoke('git:branches'),
  log: (count) => ipcRenderer.invoke('git:log', count),
  diff: (filePath) => ipcRenderer.invoke('git:diff', filePath),
  diffStaged: () => ipcRenderer.invoke('git:diffStaged'),
  stage: (filePath) => ipcRenderer.invoke('git:stage', filePath),
  unstage: (filePath) => ipcRenderer.invoke('git:unstage', filePath),
  commit: (message) => ipcRenderer.invoke('git:commit', message),
  stash: () => ipcRenderer.invoke('git:stash'),
  stashPop: () => ipcRenderer.invoke('git:stashPop'),
  pull: () => ipcRenderer.invoke('git:pull'),
  push: () => ipcRenderer.invoke('git:push'),
  checkout: (branch) => ipcRenderer.invoke('git:checkout', branch),
  createBranch: (name) => ipcRenderer.invoke('git:createBranch', name),
  fileHistory: (path) => ipcRenderer.invoke('git:fileHistory', path),
  show: (ref) => ipcRenderer.invoke('git:show', ref),
  blame: (path) => ipcRenderer.invoke('git:blame', path),
});

// API 7: Process execution
contextBridge.exposeInMainWorld('proc', {
  exec: (cmd, cwd) => ipcRenderer.invoke('process:exec', cmd, cwd),
});

// Menu events from main process
contextBridge.exposeInMainWorld('menuEvents', {
  on: (channel, cb) => {
    ipcRenderer.on(channel, (_, ...args) => cb(...args));
  },
});
