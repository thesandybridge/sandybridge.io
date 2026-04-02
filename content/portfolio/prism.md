---
title: "Prism"
date: 2026-03-08
description: "A keyboard-driven markdown vault reader built with Tauri 2, React, and Rust, with vim keybindings, fuzzy search, and a Lua plugin system."
tags: ["tauri", "rust", "react", "desktop"]
github: "https://github.com/thesandybridge/prism"
category: "web"
---

# Prism

A fast, minimal desktop app for reading and navigating markdown vaults. Prism runs as an always-on-top sidebar with vim-style keybindings, fuzzy search, wiki-style linking, and a Lua plugin system. It reads existing Obsidian, Logseq, or plain-markdown vaults without modifying them unless explicitly asked.

## Features

- Fuzzy search across file names, paths, and content
- Wiki links with autocomplete — `[[note]]`, `[[note|display]]`, `[[note#heading]]`
- Tag filtering from frontmatter and inline `#tags`
- Quick capture — append timestamped bullets to an inbox file
- Full-text vault search with line-number context
- Interactive text-based link graph explorer
- Daily notes and templates with variable expansion
- Keyboard-driven file browser with vim navigation
- Transclusion — hover wiki links to preview target notes inline
- Editor handoff — press `n` to open in `$EDITOR`, auto-reload on return
- Lua plugin system with React UI extensions and `@prism/plugin-sdk`
- 14 built-in themes with live preview picker and custom TOML themes
- Global hotkey to toggle the window from any app
- Command palette for everything
- Cross-platform — Linux, macOS, Windows

## Tech Stack

- **Tauri 2** — native desktop runtime
- **React** — frontend UI with TypeScript
- **Rust** — backend logic, file watching, IPC, plugin manager
- **Lua** — scripting and plugin system
- **TOML** — configuration format
