---
title: "sandybridge.io"
date: 2024-04-08
description: "A self-hosted personal site built with Go, running on Proxmox with nginx and Cloudflare Tunnel."
tags: ["go", "self-hosted", "infrastructure"]
image: "sandybridge-io.png"
github: "https://github.com/thesandybridge/sandybridge.io"
url: "https://sandybridge.io"
---

# sandybridge.io

This site is a personal blog and portfolio built from scratch in Go. It serves markdown content with syntax-highlighted code blocks, has a built-in terminal emulator for navigation, and runs on self-hosted infrastructure.

## Architecture

- **Go backend** — serves HTML templates populated with parsed markdown content using Goldmark
- **Markdown content** — blog posts and portfolio items are plain `.md` files with YAML frontmatter
- **Terminal emulator** — a browser-based terminal that accepts commands like `cd`, `ls`, and `help` for navigating the site

## Infrastructure

- **Proxmox** — hypervisor running on bare metal, hosting the VM that runs this site
- **nginx** — reverse proxy handling TLS termination and routing
- **Cloudflare Tunnel** — exposes the site to the public internet without opening ports on the home network
- **systemd** — manages the Go binary as a service with automatic restarts

## Why Self-Host?

I wanted full control over the stack and the ability to experiment with infrastructure without cloud provider abstractions. Running on Proxmox means I can snapshot, clone, and migrate VMs freely. Cloudflare Tunnel keeps things secure without needing a static IP or exposing ports.
