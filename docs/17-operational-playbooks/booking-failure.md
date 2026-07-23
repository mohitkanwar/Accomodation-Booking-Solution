---
title: Booking Failure
sidebar_position: 1
---

# Booking failure

## Trigger

Order creation returns a known failure or times out with an unknown external
outcome.

## Immediate controls

1. Stop automatic retries using the same business intent.
2. Preserve request, preview, attempt, correlation, and supplier response.
3. If the outcome is known unsuccessful, set `BOOKING_FAILED`.
4. If the outcome may have succeeded, mark it uncertain and reconcile with the
   supplier before retry.
5. Show the operator where failure occurred and whether a reservation may
   exist.
6. Notify the appropriate operational team and employee only with confirmed
   facts.

## Recovery

Retrieve supplier order state, attach any supplier reference, complete or fail
the internal state, then allow an authorised retry or alternative selection.
