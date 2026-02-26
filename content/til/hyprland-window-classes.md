---
title: "Find window classes in Hyprland with hyprctl clients"
date: 2026-02-26
description: "How to get the class, title, and workspace of every open window for writing window rules."
tags: ["hyprland", "linux", "wayland"]
---

Need the class name for a window rule? Dump all open windows:

```bash
hyprctl clients
```

This outputs class, title, workspace, PID, and more for every window. For example, the Claude PWA shows up as:

```
class: chrome-claude.ai__-Default
```

Which you can then target in a window rule:

```conf
windowrule = workspace 3 silent, match:class ^(chrome-claude.ai__-Default)$
```
