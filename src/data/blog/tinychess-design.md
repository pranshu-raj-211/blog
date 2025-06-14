---
author: Pranshu Raj
pubDatetime: 2025-05-10T15:22:00.866Z
title: Designing a minimal, local-first version of lichess.
slug: designing-tinychess
featured: false
draft: false
tags:
  - Go
description: How I'm planning to build tinychess, and what I've learnt so far while preparing to build it.
---

I'm building a smaller, local version of [Lichess](https://lichess.org) to learn more about how it works, improve my knowledge of real time protocols and local first web.

I'm learning Go as I go about building this project, and I'm stoked about the delicate balance between simplicity and low level control provided by the language.

## Functional Requirements

A wishlist of what stuff users and the system should be able to do.

1. Anonymous game playing (play with friend in lichess)
2. Real time gameplay (moves of opponent relayed to player in real time)
3. Game logic validation
4. Game state persistence (server side)
5. Client interface
6. View ongoing game (spectate)
7. Leaderboard (for tournaments)
8. Rate Limiting
9. Matchmaking
10. Scoring (Elo/Glicko/any other system)

## Non Functional Requirements

1. High concurrency support
2. Low latency move relaying
3. Extensible (plan to build an online version and scale later)

## Suggested Tech stack

- Go (server side logic)
- Websockets (real time communication)
- Javascript (client interface)

Since it's a local system, I'm trying to keep it as lean as possible, therefore I'll be using SQLite or even a flat file as a database.

![init data model]
