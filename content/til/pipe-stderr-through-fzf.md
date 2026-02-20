---
title: "Pipe stderr through fzf"
date: 2026-02-19
description: "A one-liner for interactive stderr filtering in bash."
tags: ["bash", "fzf", "cli"]
---

Sometimes you need to filter stderr output interactively. Here's a quick one-liner:

```bash
command 2>&1 >/dev/null | fzf
```

This redirects stderr to stdout, then stdout to `/dev/null`, leaving only stderr for fzf to process.

For a more practical example, filtering through build errors:

```bash
cargo build 2>&1 >/dev/null | fzf --height 40%
```
