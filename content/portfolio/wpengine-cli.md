---
title: "WP Engine CLI"
date: 2024-01-15
description: "A Rust CLI for managing WP Engine sites, installs, and deployments from the terminal."
tags: ["rust", "cli", "wordpress", "devops"]
github: "https://github.com/thesandybridge/wpengine-cli"
url: "https://crates.io/crates/wpe"
---

# WP Engine CLI

A command-line tool for managing WP Engine hosting accounts via their API. Built in Rust and published on crates.io as `wpe`. I built this because I was tired of writing the same API calls over and over and wanted something concrete for WordPress deployment pipelines.

## Features

- Manage sites, installs, accounts, and users from the terminal
- Headless mode (`-H`) for CI/CD pipelines and scripting
- Credential management with secure local storage
- Paginated listing with single-resource lookup
- Cross-platform support (Linux, macOS, WSL)

## Usage

```bash
# Install from crates.io
cargo install wpe

# List all sites
wpe -H sites list

# Add a new site
wpe -H sites add <NAME> <ACCOUNT_ID>

# Manage installs
wpe -H installs list <INSTALL_ID>
```

## Tech Stack

- **Rust** — core implementation, no async runtime
- **clap** — CLI argument parsing
- **reqwest** — HTTP client for WP Engine API
- **serde** — JSON serialization
