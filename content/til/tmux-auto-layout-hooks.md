---
title: "Auto-apply tmux layouts based on terminal config"
date: 2026-02-26
description: "Use environment variables and tmux hooks to automatically split panes when launching from a specific terminal config."
tags: ["tmux", "alacritty", "cli"]
---

You can trigger a tmux layout automatically based on which terminal config launched the session.

Set an env var in your alacritty config:

```toml
[env]
TMUX_LAYOUT = "dev"
```

Tell tmux to pull it from the shell environment in `tmux.conf`:

```
set-option -g update-environment "TMUX_LAYOUT"
```

Add hooks that source a layout file when the env var matches:

```
set-hook -g after-new-session 'if-shell "[ \"$TMUX_LAYOUT\" = \"dev\" ]" "source-file ~/.config/tmux/dev-layout.conf"'
set-hook -g after-new-window 'if-shell "[ \"$TMUX_LAYOUT\" = \"dev\" ]" "source-file ~/.config/tmux/dev-layout.conf"'
```

The layout file (`dev-layout.conf`) is just raw tmux commands — no session management needed since the hooks fire after the window already exists:

```
split-window -h -p 45 -c "#{pane_current_path}"
split-window -v -p 30 -c "#{pane_current_path}"
split-window -h -p 50 -c "#{pane_current_path}"
select-pane -t 0
```

`-c "#{pane_current_path}"` makes each pane inherit the working directory of the pane it split from. After `tmux kill-server` and a fresh launch, the env var is picked up and the layout applies automatically.
