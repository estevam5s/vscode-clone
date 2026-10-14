# Code Clone — VS Code Reverse-Engineered

A comprehensive, functional clone of Visual Studio Code, built by reverse-engineering the original VS Code v1.139.1 application using [REA (Reverse Engineer Anything)](https://github.com/morluto/rea).

Every major subsystem was reconstructed based on REA's analysis of VS Code's 342MB evidence file, mapping 21,097 application graph nodes, 89,731 semantic relations, and 27,985 dependency edges.

**5,800+ lines** of hand-written code across 8 source files.

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
├── Monaco Editor (syntax highlighting, minimap, diff, multi-cursor, gutter decorations)
├── Split Editor (side-by-side editing with shared model)
├── Diff Editor (side-by-side diff view for git changes)
├── Tab Management (open, close, reorder via drag-and-drop, modified indicator)
├── File Explorer (tree view, context menu, inline rename, new file/folder)
├── Search Panel (content search, file search, regex, replace all in files)
├── Source Control (Git status, stage/unstage per-file, commit, diff, branch, commit log)
├── Debug Panel (breakpoints, variables, watch, call stack, toolbar)
├── Extensions Panel (16 marketplace entries, install/uninstall, ratings, downloads)
├── Terminal Panel (multiple instances, tabs, split, resize)
├── Bottom Panel (Problems, Output, Debug Console REPL, Terminal, Ports)
├── Command Palette (70+ commands, fuzzy search, snippets, transforms)
├── Quick Open (file search, Cmd+P)
├── Quick Pick (reusable selector for languages, branches, themes, encodings)
├── Status Bar (branch, errors, cursor, indentation, encoding, EOL, language)
├── Notifications (toast system with action buttons)
├── Context Menus (editor, files, tabs, terminal)
├── Breadcrumbs (workspace > folder > file)
├── Theme Engine (dark, light, high contrast — with picker)
├── Workspace Persistence (saves/restores settings via localStorage)
├── Git Gutter Decorations (colored margin for modified/added/deleted lines)
└── Keyboard Shortcuts (full VS Code mapping, 30+ bindings)
```

## Features

### Editor
- Multi-tab code editor with Monaco (same engine as VS Code)
- Syntax highlighting for 90+ file types
- Minimap, word wrap, bracket pair colorization
- Multi-cursor editing (Cmd+Alt+Up/Down)
- Find and replace (in-editor and across files)
- Diff editor (side-by-side for git changes)
- Split editor (Cmd+\\)
- Git gutter decorations (colored margin bars)
- Go to line, go to definition, go to references
- Format, toggle line/block comment
- Dirty state tracking with save confirmation dialog
- 10 built-in code snippets (console.log, arrow function, try/catch, React component, etc.)
- Text transforms (upper/lower case, sort lines, trim whitespace)

### File Explorer
- Directory tree with expand/collapse
- 90 file type icons with distinct colors
- Context menu (new file, new folder, rename, delete, copy path, reveal)
- Inline rename and create
- Open Editors section
- Drag-and-drop tab reorder

### Search
- Search across all files in workspace
- Case sensitive, whole word, regex toggles
- Include/exclude file patterns
- Results grouped by file with line preview
- Replace all in files
- Click result to navigate to line

### Source Control (Git)
- Changed files list with status indicators (M, A, D, U, R)
- Stage/unstage individual files (per-file buttons)
- Stage All / Unstage All section buttons
- Commit with message (Enter or Ctrl+Enter)
- Diff view on click (modified files open side-by-side diff)
- Commit log section (last 15 commits)
- Branch display, checkout via quick pick
- Push, pull, stash, stash pop
- Git blame, file history

### Debug
- Breakpoints management
- Variables, watch expressions, call stack views
- Debug toolbar (continue, step over/into/out, restart, stop)
- Debug console with JavaScript REPL (eval via node, history navigation)

### Extensions
- 16 mock marketplace extensions with rich cards
- Icon, publisher, description, star rating, download count
- Install/uninstall with notification feedback
- Search/filter extensions

### Terminal
- Multiple terminal instances with tabs
- Full PTY support via node-pty
- xterm.js with fit, web-links, and search addons
- Split terminal
- Resize, clear, kill

### Bottom Panel
- Problems (errors/warnings with severity icons)
- Output (log output with source channel selector)
- Debug Console (JavaScript REPL with history)
- Terminal (integrated terminals)
- Ports (forwarded ports table)

### Command Palette
- 70+ commands across 12 categories
- Fuzzy search
- Keyboard navigation (arrow keys, Enter, Escape)
- Category prefixes: `>` commands, `:` goto line, default files
- Quick pick mode for language, branch, theme, encoding selection

### Status Bar
- Git branch + click to checkout
- Error/warning count (click to show Problems)
- Cursor position (Ln/Col)
- Indentation mode (click to toggle Spaces: 2/4)
- Encoding (click to select UTF-8, UTF-16, ISO 8859-1, etc.)
- Line ending (click to toggle LF/CRLF)
- Language mode (click to select from all Monaco languages)

### Other
- Notification toasts with action buttons (Save/Don't Save/Cancel)
- Context menus everywhere (editor, files, tabs, terminal)
- Breadcrumbs navigation
- Resizable sidebar and panel
- Zen mode (Cmd+K Z)
- Auto-save (configurable)
- Dark, Light, and High Contrast themes with quick pick
- Settings editor (GUI with 38 configurable options)
- Workspace persistence (theme, sidebar, panel, word wrap, minimap, last folder)

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
7. Iteratively built and tested each feature against the REA data

## License

MIT
