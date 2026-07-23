---
title: Performance Testing
sidebar_position: 8
---

# Performance testing

Validate configuration and destination p95 below one second, request submission
and operator queue p95 below two seconds, and policy evaluation p95 below
200 ms, excluding supplier latency where stated.

Search tests must include supplier latency, rate limiting, concurrent users,
partial-result behaviour, cache effectiveness, and backpressure. Final workload
volumes remain discovery inputs.
