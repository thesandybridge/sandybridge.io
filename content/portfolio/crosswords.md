---
title: "Crosswords"
date: 2025-10-15
description: "An AI-powered crossword puzzle generator and player that creates NYT-style puzzles on any topic using Claude."
tags: ["typescript", "nextjs", "ai", "prisma"]
github: "https://github.com/thesandybridge/crosswords"
url: "https://crosswords-eight.vercel.app"
---

# Crosswords

A full-stack crossword puzzle app where users pick any topic and difficulty level (Monday through Sunday, NYT-style), and Claude generates a complete 15x15 crossword puzzle in real time. Users solve puzzles in an interactive grid with full keyboard navigation, request AI-generated hints per clue, and track stats over time.

## How Generation Works

The generation pipeline has multiple stages:

1. **Prompt construction** — requests a 15x15 grid with rotational symmetry, minimum 3-letter words, and difficulty-calibrated clues
2. **Claude API call** — `claude-3-7-sonnet` with structured JSON output
3. **Post-processing** — extracts all actual words from the grid, re-numbers cells in reading order, and matches clues back to positions
4. **Missing clue backfill** — a second Claude call generates clues for any grid words the first pass missed

## Features

- **Interactive grid** — full keyboard navigation, click-to-toggle direction, auto-advance through words, error highlighting
- **AI hints** — per-clue contextual hints that consider your current progress without revealing the answer
- **Auto-save** — debounced at 1.5s with optimistic cache updates
- **Server-side validation** — cell-by-cell answer checking
- **Stats dashboard** — completion rate, streaks, average time, hints used, breakdown by difficulty and day of week
- **Google OAuth** — authentication via Auth.js with JWT sessions
- **Theming** — six color themes persisted to the database

## Tech Stack

- **Next.js 15** — App Router with 12 API routes
- **TypeScript** — end-to-end type safety with Zod validation
- **Anthropic Claude** — puzzle generation and contextual hints
- **Prisma + PostgreSQL** — game state, user preferences, stats
- **Auth.js** — Google OAuth with Prisma adapter
- **TanStack Query** — data fetching with optimistic updates
