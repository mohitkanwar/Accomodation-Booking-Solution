---
title: Supplier Outage
sidebar_position: 5
---

# Supplier outage

## Response

- Trip the circuit breaker after configured failures.
- Preserve employee search input and allow controlled retry.
- Do not retry booking blindly.
- Keep existing booking records and support evidence accessible.
- Surface degraded supplier status to operators.
- Monitor timeout, error, HTTP 429, and credential signals.
- Use manual operator completion only where the operating model permits it.
- Reconcile all in-flight uncertain attempts after recovery.
