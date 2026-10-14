# Code Clone — VS Code Reverse-Engineered

A functional clone of Visual Studio Code, built by reverse-engineering the original VS Code v1.139.1 application using [REA (Reverse Engineer Anything)](https://github.com/morluto/rea).

## REA Analysis Results

| Metric | Value |
|---|---|
| Files analyzed | 5,966 |
| JS files parsed | 4,578 |
| AST nodes visited | 29,095,099 |
| Modules discovered | 2,071 |
| Electron browser windows | 3 |
| Context Bridge APIs | 4 (11 exposed members) |
| IPC operations | 29 (18 literal channels) |
| Evidence file size | 342 MB |

## Architecture

Based on the REA analysis, this clone replicates VS Code's core architecture:

- **Electron** main process with 3 browser windows (editor, settings, about)
- **4 Context Bridge APIs** exposing 11 members for secure IPC
- **Monaco Editor** for code editing (the same editor engine VS Code uses)
- **xterm.js + node-pty** for the integrated terminal
- **29 IPC channels** for file system, dialogs, terminal, and app operations

## Features

- Multi-tab code editor with syntax highlighting
- File explorer with directory tree navigation
- Integrated terminal with full PTY support
- Command palette (Cmd/Ctrl+Shift+P)
- Find and replace
- Minimap, word wrap, bracket pair colorization
- Breadcrumbs navigation
- Settings window
- Resizable panels (sidebar, terminal)
- Keyboard shortcuts matching VS Code

## Quick Start

```bash
npm install
npm start
```

## Build

```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## Tech Stack

- Electron 33
- Monaco Editor
- xterm.js + node-pty
- Pure HTML/CSS/JS (no framework)

## License

MIT
