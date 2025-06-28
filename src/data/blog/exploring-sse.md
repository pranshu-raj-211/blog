---
author: Pranshu Raj
pubDatetime: 2025-03-13T15:22:00.866Z
modDatetime: 2025-06-27T07:01:27.097Z
title: Introducing Server Sent Events
slug: exploring-sse
featured: true
draft: false
tags:
  - SSE
  - Websockets
description: Understanding Server Sent events and it's use cases, advantages over other realtime protocols.
---

I've been diving into Server-Sent Events (SSE) lately, trying to understand how it works, where it fits, and what its tradeoffs are. It’s an interesting protocol, especially compared to WebSockets and traditional HTTP streaming.

## Table of Contents
1. [What is SSE?](#what-is-sse)
2. [SSE vs WebSockets vs HTTP Streaming](#sse-vs-websockets-vs-http-streaming)
3. [How SSE Works](#how-sse-works)
4. [Statefulness and Reconnection](#statefulness-and-reconnection)
5. [Scaling SSE](#scaling-sse)
6. [Observability & Performance](#observability--performance)
7. [Benchmarking Leaderboard with SSE](#benchmarking-leaderboard-with-sse)

## What is SSE?

SSE is a mechanism that allows a server to push updates to a client over a persistent, unidirectional HTTP connection. Unlike WebSockets, which require a two-way handshake and constant back-and-forth messages, SSE is simpler and lightweight. You don’t need to send extra headers with every message, making it efficient for real-time updates like live feeds or notifications.

## HTTP 1.1 and 2.0 Compatibility

SSE works with both HTTP 1.1 and HTTP 2.0, but there are some considerations when scaling it (more on that later). Since it’s built on top of HTTP, it behaves like any other HTTP request-response cycle but keeps the connection open, allowing the server to send data whenever it wants.

## How SSE Works

- The client sends a GET request with the header Accept: text/event-stream.
- The server responds with Content-Type: text/event-stream and keeps the connection open.
- The response is sent in chunks (using Transfer-Encoding: chunked), each containing an event.
- The underlying TCP connection ensures reliable delivery, but this also means each packet must be acknowledged, unlike UDP-based solutions where you trade reliability for speed.
- The client can automatically reconnect if the connection is lost by using the retry field sent by the server.

## Stateless or Stateful?

Technically, SSE is mostly stateless, but there’s a catch. The server might need to track client state to some extent, especially when handling reconnections. Ideally, I’d love to make my implementation fully stateless, but then:

## How do you handle reconnections?

Should the client resume from the last event it received?

What if the server doesn’t store any state at all?

One approach is to send an id field with each event, which the client can send back to resume from the last received message after reconnecting. This allows for stateless reconnections while still maintaining continuity.

## Scaling and Proxying SSE

Proxying SSE can be a bit tricky. Since the connection is persistent, Layer 7 proxies (like Nginx) need to be properly configured to support long-lived connections. While it’s simpler than WebSockets, some proxies may still close the connection prematurely.

> Note: Another concern is the six-connection limit in HTTP 1.1—this limit applies per domain in a browser. This means if you have multiple tabs open making SSE connections to the same server, you may run into limits. However, HTTP/2 mitigates this with multiplexing, allowing multiple streams over a single connection.

## Observability & Performance

If I scale SSE servers, I’d want to measure:

- Connection handling (how many concurrent clients?)
- Latency (how fast are events being pushed?)
- Resource usage (CPU, memory overhead per connection)

I plan to use Prometheus for monitoring and observability to track performance at scale.

## Questions I Have:

1. Will the six-connection limit in HTTP 1.1 affect SSE scaling?Yes, but only for browser clients—HTTP/2 helps mitigate this.
2. How is SSE different from HTTP streaming apart from the headers?SSE is a standardized protocol with event formatting, automatic reconnection, and an event ID mechanism.
3. How truly stateless is SSE?Stateless by design, but client state tracking may be needed for reconnections.
4. How do I detect client disconnections and clean up resources efficiently?Use TCP connection close detection or periodic heartbeats.
5. Why is timeout used in SSE?To detect stalled connections and trigger reconnections.

I’ll update this once I experiment with implementation details (scaling, basic done in Go) and get a better grasp of how SSE behaves in a real-world setting.

### Vertical Scaling SSE connections

I tried building a real time leaderboard that streams its state to consumers (broadcasting) through SSE. This is a great example of use cases of SSE, as communication is uni-directional and often requires real-time communication (multiplayer games, chess etc.).

The testing setup does not mimic realistic traffic for now. This is intentional, I wanted to test how many connections can be made in a standalone manner before tackling the issue of realistic load.

The testing manner is detailed at this [repo](https://github.com/pranshu-raj-211/benchmarks/leaderboard).

Find the code for the server at [leaderboard](https://github.com/pranshu-raj-211/leaderboard).

![Real time leaderboard benchmarking (15400 SSE connections)](@assets/images/real_time_lb_init.png)
* Reaches 15400 (or similar number of connections) before unable to connect due to queue getting full or memory issues. I do not know which, so I'm working on understanding more about it.

  _Update_: The 15400 connection limit was hit while testing on Windows. Since memory, CPU and other system metrics seemed to be fine, I dug deeper into the issue to figure out what exactly was the bottleneck.

  Specifically, I was getting this error:
  `conn 15400 failed: Get "http://127.0.0.1:8080/stream": dial tcp 127.0.0.1:8080: bind: An operation on a socket could not be performed because the system lacked sufficient buffer space or because a queue was full.`

  A quick google search revealed that this was a common problem on windows systems, often faced in applications like Docker.

Digging deeper, I found that there was a hard connection limit that Windows puts on socket connections, at approximately 16,000 connections. Since some of these sockets are reserved, it stopped my application from creating any new ones when the limit for non-system usage was reached.

This can be bypassed by forcibly increasing the limit, but I didn't wanna risk messing with the settings of Windows, which has been a pain to fix sometimes.



![Grafana dashboard-28231 conns](@assets/images/fedora_28k_conns.png)
* _Update_: Crossed 28k connections

  The 28k limit this time is probably due to limit on number of file descriptors (ulimit) or some other system issue (ports getting exhausted, NAT table limits). Will check and update, but need to optimize memory usage first (growing too fast and not getting deallocated).
