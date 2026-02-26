---
title: "Check current tmux pane sizes"
date: 2026-02-26
description: "A one-liner to see the dimensions of every pane in the current tmux window."
tags: ["tmux", "cli"]
---

When dialing in split percentages for a layout config, check what you're currently working with:

```bash
tmux list-panes -F '#{pane_index}: #{pane_width}x#{pane_height}'
```

Output looks like:

```
0: 211x72
1: 170x50
2: 85x21
3: 84x21
```

Use these to reverse-engineer the `-p` percentage values for your `split-window` commands.
