---
title: Fault Tolerance
sidebar_position: 8
---

# Fault tolerance

The supplier adapter uses timeouts, throttling, transient retries, exponential
backoff with jitter, circuit breaking, and correlation.

Booking commands persist internal attempt state and idempotency before external
execution. Known failure, successful confirmation, and uncertain outcome are
handled separately.

Notifications use an outbox, and failed bookings enter a recoverable operator
state.
