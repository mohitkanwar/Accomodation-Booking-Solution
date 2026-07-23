---
title: Risk Register
sidebar_position: 4
---

# Risk register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Demand API access unavailable | Planned booking flow cannot operate | Validate before build |
| Payment ownership unclear | Booking cannot be operationalised | Define merchant and payment model |
| Role data unreliable | Incorrect employee entitlements | Establish authoritative source |
| Price changes after approval | Policy breach or dissatisfaction | Recheck and reapprove above threshold |
| Supplier API version change | Integration breakage | Versioned adapter and contract tests |
| External rate limiting | Search degradation | Throttling, caching, and backoff |
| Duplicate reservation | Financial and traveller harm | Idempotency and reconciliation |
| Ambiguous tax treatment | Incorrect policy outcome | Define total-price model |
| Map restrictions | UI or compliance risk | Confirm provider and terms |
| Over-flexible admin rules | Unpredictable decisions | Typed, versioned, validated rules |
| Operator bottleneck | Delays and lost inventory | SLA, priority, later auto-approval |
| Tenant data leakage | Severe security incident | Tenant isolation and object authorisation |
