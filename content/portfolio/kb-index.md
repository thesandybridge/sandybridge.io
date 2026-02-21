---
title: "KB-Index"
date: 2025-05-10
description: "A Rust CLI for indexing and semantically searching local code using OpenAI embeddings and ChromaDB."
tags: ["rust", "cli", "ai", "search"]
github: "https://github.com/thesandybridge/kb_index"
category: "cli"
---

# KB-Index

A command-line tool for indexing and searching local code and documentation using semantic search. It creates OpenAI embeddings of your files and stores them in a ChromaDB vector database for natural language querying.

## Features

- Index code and documentation with semantic understanding
- Search your codebase using natural language queries
- Syntax-highlighted search results
- Multiple output formats: pretty, JSON, markdown
- Simple configuration management

## Usage

```bash
# Index a project
kb index /path/to/your/code

# Search with natural language
kb query "How does the authentication system work?"

# Customize results
kb query "error handling" --top-k 10 --format json
```

## Tech Stack

- **Rust** — core implementation
- **OpenAI API** — text embeddings and completions
- **ChromaDB** — vector database for similarity search
- **syntect** — syntax highlighting in terminal output
