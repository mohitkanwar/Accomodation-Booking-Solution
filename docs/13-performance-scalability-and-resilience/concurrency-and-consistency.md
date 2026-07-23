---
title: Concurrency and Consistency
sidebar_position: 6
---

# Concurrency and consistency

- Duplicate operator actions must be idempotent.
- Request state transitions must reject stale or invalid versions.
- Policy and offer snapshots preserve the basis of earlier decisions.
- Price and availability are externally volatile and only eventually known
  until booking confirmation.
- Booking timeout creates an uncertain state that is reconciled before retry.
- Notifications are eventually delivered through an outbox.

The exact persistence concurrency mechanism is not selected.
