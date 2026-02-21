---
title: "wpdev"
date: 2024-06-10
description: "An integrated solution for managing local WordPress development environments with Docker."
tags: ["rust", "docker", "wordpress", "devops"]
github: "https://github.com/thesandybridge/wpdev"
category: "cli"
---

# wpdev

An integrated solution for managing WordPress development environments. Spins up WordPress, Nginx, MySQL, and Adminer containers with a single command. Provides three interfaces: a web dashboard, a REST API, and a CLI.

## Features

- One-command WordPress environment setup via Docker
- Web dashboard built with HTMX and Actix-web
- REST API with Rocket and Bollard for container management
- CLI for terminal-based workflows
- Manages WordPress, Nginx, MySQL, and Adminer containers
- Automatic Docker image detection and pulling

## Architecture

Three binaries from a single Rust workspace:

1. **Frontend** — HTMX dashboard served by Actix-web for browser-based management
2. **API** — Rocket server using Bollard to orchestrate Docker containers
3. **CLI** — Command-line interface for the same operations

## Tech Stack

- **Rust** — all three binaries
- **Bollard** — Docker API client
- **Rocket** — backend API framework
- **Actix-web** — frontend web server
- **HTMX** — dashboard interactivity
