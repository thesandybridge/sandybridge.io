---
title: "claude-code-summary"
date: 2026-02-20
description: "A Rust CLI that summarizes Claude Code sessions over a date range and generates an HTML report with charts."
tags: ["rust", "cli", "anthropic", "tooling"]
github: "https://github.com/thesandybridge/claude-code-summary"
category: "cli"
---

# claude-code-summary

A command-line tool that scans your local Claude Code session history, summarizes each session using the Anthropic API, and produces a self-contained HTML report with interactive charts.

## Features

- Discovers all Claude Code session files in `~/.claude/projects`
- Summarizes each session concurrently via the Anthropic API
- Generates a self-contained HTML report with:
  - Activity over time and sessions-by-project charts (Chart.js)
  - Paginated session list with summary excerpts
  - Per-session detail pages with prev/next navigation
- Saves a `.json` data file for instant HTML regeneration without re-summarizing
- Opens the report in your browser automatically when done

## Usage

```bash
# Summarize the last week
claude-code-summary --from 2026-02-13 --to 2026-02-20

# Filter to one project
claude-code-summary --from 2026-02-01 --to 2026-02-20 --project-filter my-app

# Regenerate HTML from a saved report (no API calls)
claude-code-summary --from-json report.json
```

## Tech Stack

- **Rust** — core implementation
- **tokio** — async runtime
- **reqwest** — HTTP client for Anthropic API
- **futures** — concurrent stream processing
- **clap** — CLI framework
- **Chart.js** — charts in the generated HTML report
