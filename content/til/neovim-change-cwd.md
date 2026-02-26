---
title: "Change working directory in Neovim without leaving it"
date: 2026-02-26
description: "Scoped directory changes in Neovim — global, per-window, and per-tab."
tags: ["neovim", "cli"]
---

Three levels of working directory in Neovim:

```
:cd /path/to/dir    " entire neovim instance
:lcd /path/to/dir   " current window only
:tcd /path/to/dir   " current tab only
```

To set the working directory to wherever the current file lives:

```
:lcd %:p:h
```

Useful when you've navigated into a file in another directory via a file explorer and want your shell commands to match.
