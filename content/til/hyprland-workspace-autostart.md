---
title: "Launch apps into specific Hyprland workspaces on boot"
date: 2026-02-26
description: "Using exec-once with workspace directives to automate your desktop layout."
tags: ["hyprland", "linux", "wayland"]
---

Use `[workspace N silent]` to assign apps to workspaces at boot. `silent` prevents focus from jumping during launch.

```conf
exec-once = [workspace 1 silent] $terminal
exec-once = [workspace 2 silent] $browser
exec-once = [workspace 3 silent] uwsm-app -- alacritty --working-directory ~
exec-once = [workspace 3 silent] sleep 1 && $webapp https://claude.ai
exec-once = [workspace 4 silent] spotify
```

For two apps on the same workspace (tiled split), launch order determines position — first window gets the left side. Use `sleep 1` on the second to avoid a race condition.
