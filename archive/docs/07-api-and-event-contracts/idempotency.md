---
title: Idempotency
sidebar_position: 5
---

# Idempotency

Booking and cancellation commands require internal idempotency keys tied to the
business request and intended operation.

Controls:

- reject duplicate operator actions;
- persist attempt state before external invocation;
- return the known result for repeated equivalent commands;
- distinguish known failure from uncertain external outcome;
- reconcile a timeout before retrying;
- retain correlation, supplier reference, request hash, actor, and timestamps.

No retry may create a second reservation for the same intended booking.
