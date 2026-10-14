# Code Clone — VS Code Reverse-Engineered

A comprehensive, functional clone of Visual Studio Code, built by reverse-engineering the original VS Code v1.139.1 application using [REA (Reverse Engineer Anything)](https://github.com/morluto/rea).

Every major subsystem was reconstructed based on REA's analysis of VS Code's 342MB evidence file, mapping 21,097 application graph nodes, 89,731 semantic relations, and 27,985 dependency edges.

## REA Analysis Results

| Metric | Value |
|---|---|
| Files analyzed | 5,966 |
| JS files parsed | 4,578 |
| AST nodes visited | 29,095,099 |
| Application graph nodes | 21,097 |
| Semantic relations | 89,731 |
| Dependency edges | 27,985 |
| Modules discovered | 2,071 |
| Electron browser windows | 3 |
| Context Bridge APIs | 7 (40+ exposed members) |
| IPC operations | 40+ channels |
| Extensions detected | 97 |
| Evidence file size | 342 MB |

## Architecture

Based on the REA analysis, this clone replicates VS Code's core architecture:

```
Main Process (Electron)
├── Window Management (3 BrowserWindows: editor, settings, about)
├── IPC Handlers (40+ channels: fs, git, search, terminal, dialog, app, process)
├── File System Service (read, write, delete, rename, mkdir, watch)
├── Git Service (status, diff, stage, commit, branch, push, pull, stash, blame)
├── Search Service (file search, content search with regex)
├── Terminal Service (node-pty spawn, multiple PTY instances)
├── Menu System (File, Edit, Selection, View, Go, Run, Terminal, Help)
└── Process Execution Service

Preload (Context Bridge)
├── fs API (12 methods)
├── dialogs API (4 methods)
├── appApi (13 methods)
├── terminal API (7 methods)
├── search API (2 methods)
├── git API (19 methods)
├── proc API (1 method)
└── menuEvents API (event relay)

Renderer (Workbench)
├── Monaco Editor (syntax highlighting, minimap, diff, multi-cursor)
├── Tab Management (open, close, reorder, modified indicator)
├── File Explorer (tree view, context menu, inline rename, new file/folder)
├── Search Panel (content search, file search, regex, replace)
├── Source Control (Git status, stage/unstage, commit, diff, branch)
├── Debug Panel (breakpoints, variables, watch, call stack, toolbar)
├── Extensions Panel (installed list, search)
├── Terminal Panel (multiple instances, tabs, split, resize)
├── Bottom Panel (Problems, Output, Debug Console, Terminal, Ports)
├── Command Palette (40+ commands, fuzzy search)
├── Quick Open (file search, Cmd+P)
├── Status Bar (branch, errors, cursor, encoding, language)
├── Notifications (toast system)
├── Context Menus (editor, files, tabs, terminal)
├── Breadcrumbs (workspace > folder > file)
├── Theme Engine (dark, light, high contrast)
└── Keyboard Shortcuts (full VS Code mapping)
```

## Features

### Editor
- Multi-tab code editor with Monaco (same engine as VS Code)
- Syntax highlighting for 50+ languages
- Minimap, word wrap, bracket pair colorization
- Multi-cursor editing
- Find and replace (in-editor and across files)
- Diff editor (side-by-side)
- Go to line, go to definition
- Format, toggle comment
- Dirty state tracking per file

### File Explorer
- Directory tree with expand/collapse
- File type icons
- Context menu (new file, new folder, rename, delete, copy path, reveal)
- Inline rename and create
- Open Editors section
- Drag to open files

### Search
- Search across all files in workspace
- Case sensitive, whole word, regex toggles
- Include/exclude patterns
- Results grouped by file with line preview
- Replace in files

### Source Control (Git)
- Changed files list (modified, added, deleted, untracked)
- Stage/unstage individual files or all
- Commit with message
- Diff view on click
- Branch display and switching
- Push, pull, sync
- Stash and stash pop

### Debug
- Breakpoints management
- Variables, watch expressions, call stack views
- Debug toolbar (continue, step over/into/out, restart, stop)
- Debug console

### Extensions
- Search and browse extensions
- Installed extensions list
- Enable/disable toggles

### Terminal
- Multiple terminal instances with tabs
- Full PTY support via node-pty
- xterm.js with fit, web-links, and search addons
- Split terminal
- Resize, clear, kill

### Bottom Panel
- Problems (errors/warnings from diagnostics)
- Output (log output with source selection)
- Debug Console (REPL)
- Terminal (integrated terminals)
- Ports (placeholder)

### Command Palette
- 40+ commands
- Fuzzy search
- Keyboard navigation
- Category prefixes (>, @, :, #)

### Status Bar
- Git branch + sync status
- Error/warning count
- Cursor position (Ln/Col)
- Indentation mode
- Encoding
- Line ending
- Language mode

### Other
- Notification toasts
- Context menus everywhere
- Breadcrumbs navigation
- Resizable sidebar and panel
- Keyboard shortcuts matching VS Code
- Dark, Light, and High Contrast themes
- Settings editor (GUI with all VS Code settings)

## Quick Start

```bash
npm install
npm start
```

## Build Distributables

```bash
npm run build:mac    # macOS .dmg
npm run build:win    # Windows .exe (NSIS)
npm run build:linux  # Linux AppImage
```

## Tech Stack

- **Electron 33** — multi-process desktop application
- **Monaco Editor** — code editing (same engine as VS Code)
- **xterm.js + node-pty** — integrated terminal with real PTY
- **Pure HTML/CSS/JS** — no framework overhead, matching VS Code's approach
- **REA** — reverse engineering analysis that guided this build

## How It Was Built

1. Cloned [REA (Reverse Engineer Anything)](https://github.com/morluto/rea)
2. Fixed REA's schema validation for newer VS Code builds (Zod `interpretation` field)
3. Ran `rea analyze-javascript-application` on `/Applications/Visual Studio Code.app`
4. Extracted 342MB of evidence: modules, IPC channels, context bridges, endpoints
5. Mapped the complete architecture from the application graph (21,097 nodes)
6. Reconstructed every subsystem based on the evidence

## License

MIT
