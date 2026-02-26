---
title: "Hyprland exec-once runs before the session is ready"
date: 2026-02-26
description: "Why exec-once commands silently fail when they depend on runtime environment resolution."
tags: ["hyprland", "linux", "wayland"]
---

`exec-once` fires during Hyprland init, before the full session environment is up. Commands that rely on runtime resolution — like `xdg-terminal-exec` or unexported env vars — may silently fail even though the same command works fine as a keybind.

Keybinds run later when the session is fully initialized. If a keybind works but `exec-once` doesn't, hardcode the binary:

```conf
# May fail — $TERMINAL might not resolve yet
exec-once = [workspace 1 silent] uwsm-app -- xdg-terminal-exec

# Works reliably
exec-once = [workspace 1 silent] uwsm-app -- alacritty --config-file ~/.config/alacritty/alacritty-tmux.toml
```
