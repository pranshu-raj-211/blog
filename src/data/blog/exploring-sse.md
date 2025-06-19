---
author: Pranshu Raj
pubDatetime: 2025-03-13T15:22:00.866Z
title: Introducing Server Sent Events
slug: exploring-sse
featured: true
draft: false
tags:
  - SSE
  - Websockets
description: Understanding Server Sent events and it's use cases, advantages over SSE
---

I've been diving into Server-Sent Events (SSE) lately, trying to understand how it works, where it fits, and what its tradeoffs are. It’s an interesting protocol, especially compared to WebSockets and traditional HTTP streaming.

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

Another concern is the six-connection limit in HTTP 1.1—this limit applies per domain in a browser. This means if you have multiple tabs open making SSE connections to the same server, you may run into limits. However, HTTP/2 mitigates this with multiplexing, allowing multiple streams over a single connection.

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


##### Note:
I've been working on a project that uses SSE ([leaderboard](https://github.com/pranshu-raj-211/leaderboard)). I'm going to try and experiment with the performance differences between SSE and websockets in this context, to provide quantitative results in a real world application. It's still a work in progress and has a long way to go, so do check it out.