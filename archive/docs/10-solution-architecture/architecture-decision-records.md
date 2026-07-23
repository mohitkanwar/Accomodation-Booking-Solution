---
title: Architecture Decision Records
sidebar_position: 10
---

# Architecture decision records

| Decision | Initial position |
| --- | --- |
| UI composition | React micro frontend integrated as a B2C Lego |
| External API access | Backend only |
| Booking integration | Supplier adapter behind an internal domain interface |
| Policy enforcement | Server-side policy engine |
| Employee booking | Request-first, operator-controlled |
| Secrets | Enterprise secret vault |
| Transaction handling | Idempotent booking workflow with reconciliation |
| Policy history | Versioned configuration and request-time snapshot |
| Multi-tenancy | Tenant isolation across all domain entities |
| Availability | Recheck before submission, approval, and booking |
| Supplier response storage | Required snapshots only |
| Notifications | Asynchronous outbox-based delivery |
| API change management | Versioned Booking.com adapter and contract tests |

These positions should be promoted into individually numbered ADRs with
context, options, consequences, owners, and approval status.
