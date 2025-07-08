---
author: Pranshu Raj
pubDatetime: 2025-06-19T15:22:00.866Z
title: Building a highly concurrent leaderboard using Go and Redis
slug: real-time-leaderboard
featured: false
draft: true
tags:
  - Go
  - Redis
  - Observability
  - Optimization
description: I built a real-time tournament leaderboard system using Go, Redis Sorted Sets, and Server-Sent Events. It streams live updates to clients and can handle hundreds of concurrent connections and game submissions per second.
---

**TL;DR**

I built a real-time tournament leaderboard system using Go, Redis Sorted Sets, and Server-Sent Events. It streams live updates to clients and can handle hundreds of concurrent connections and game submissions per second. This project helped me learn Go, experiment with observability using Prometheus + Grafana, and optimize a system for high concurrency. [Repo](https://github.com/pranshu-raj-211/leaderboard)

## Why did I build it?

The primary motivation for this project was to learn Go by working on it, and try out the high concurrency capabilities it's known for. Since I've primarily worked with Python in the past, it was an unusual but incredibly interesting experience.

It also allowed me to try out observability beyond basic logging for the first time, which I've been dying to try out for months. I instrumented Prometheus and Grafana to monitor metrics and show results in a visual format (dashboard). For structured logging I used `zap`(Uber), but I can change this to Loki if needed.

Another major reason for doing this project - building Lichess all at once is a huge task, and I'd like to be somewhat comfortable building a part of it (leaderboard for tournaments) before I went ahead to replicate a bigger part of the system (Refer to my [Tinychess](https://blog.pranshu-raj.me/posts/designing-tinychess) blog).

## So, what did I end up building?

A real-time game leaderboard, that uses `Gin` and `Redis Sorted Sets` along with `Server Sent Events` to send live updates of a tournament to users.

## Why this tech stack?

Since one of the primary motivations for this project was to learn concurrency and observability, I decided to go with a tech stack I'm not familiar with.

- Go - It's fast, great support for concurrency, has strong tooling, and is well-suited for systems programming (plus good benchmarking tools).
- Sorted Sets - Natural data structure for this use case. Adding, updating and deleting entries all cost O(log(N)) time, also supports range queries (needed to get top k players quickly).
- Redis - Has a great sorted set implementation already. Is also incredibly fast, although I'd love to see how it compares to a sorted set implementation in native Go.
- Gin - Lightweight web framework that keeps things simple while giving useful abstractions like middleware and routing.
- Server-Sent-Events - Needed a way to stream updates unidirectionally. Polling and websockets were my other options but these are said to be more resource intensive for this use case.
- Prometheus + Grafana - To monitor system behavior and visualize metrics like request rates, Redis latency, memory usage, etc.
- Zap (Uber) - For structured logging, to make logs easier to search and filter later.

## Design Decisions

## Optimizations and improvements

- Added a change detection part in the SSE implementation, so that data is only sent if there is a change. (Faulty - fixed with a separate goroutine for polling, buffered channel to push updates to clients.)

## Bottlenecks and fixes

This is the most interesting part of this project, as it takes things a step further and improves it from a simple application to start optimizing things.

Some of these suggested improvements are things I thought of while conducting performance tests, while others are found using [Deepwiki](https://deepwiki.com) (it found some great ones I overlooked).

- JSON serialization (high CPU util) - reduce number of serializations, reduce per serialization cost
- Change detection - only publish event to SSE when leaderboard changes (reduces messages sent - less IO overhead), has huge perf gains at scale
- Improve change detection - use checksums and hashes to compare, shared version across all SSE conns (reduces mem usage)
- Adaptive polling interval to force refresh leaderboard cache
- Redis connection pooling (how would multiplexing would fare against this)
- Redis pipelining to batch requests close in time
- Remove unused and redundant metrics collection
- Retry and reconnect logic (JSON marshaling and Redis)
- Add metrics for resource utilization data (total and per connection)

Since I've just used a basic Postgres integration for persistence, and due to my inexperience with Postgres (which is quite vast), I'm not focusing on improving that currently. It's not the most important thing for the app right now, and I don't have a great access pattern to get the data from there, so I'll leave it be until the other parts are done sufficiently.

## Performance metrics

## Future work

I could extend this project by:
  Building a Sorted Set implementation in Go, removing the dependency on Redis. I know I won't be making anything as good as it but reducing IO ops to and from Redis might improve performance.

## Resources to learn more

1. [Gin SSE implementation]()
2. [Gin HTTP/2 examples]()
3. [Redis sorted sets docs]()
4. [`go-redis` docs]()
5. [Sorted set implementation in Go]()
6. [Connection pooling Redis]()
7. [Actor pattern]()
8. [Prometheus Go library]()
9. [Redis pipelining]()
10. 