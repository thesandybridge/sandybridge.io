---
title: "dep-analyzer"
date: 2025-10-23
description: "A Rust CLI for analyzing TypeScript/JavaScript import dependencies and finding legacy code usage."
tags: ["rust", "cli", "typescript", "tooling"]
github: "https://github.com/thesandybridge/dep-analyzer"
category: "cli"
---

# dep-analyzer

A command-line tool for analyzing TypeScript/JavaScript import dependencies. Built to help identify external package usage, cross-feature imports, and legacy code that needs cleanup before removal.

## Features

- Analyzes package, cross-feature, and local imports
- Multiple output formats: summary, table, and JSON
- Reverse dependency lookup with `--find-usage` for legacy code removal
- Glob pattern matching for import paths
- Automatic paging for large output
- Configurable alias symbols

## Usage

```bash
# Analyze current directory
dep-analyzer

# Table format with only external deps
dep-analyzer -f table --external-only

# Find what depends on legacy code before removing it
dep-analyzer --find-usage "~Meetings/components/details/*"

# JSON output for scripting
dep-analyzer -f json -o dependencies.json
```

## Tech Stack

- **Rust** — core implementation
- **SWC** — TypeScript/JavaScript AST parsing
- **clap** — CLI framework
