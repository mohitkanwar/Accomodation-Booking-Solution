---
id: architecture-principles
title: 5. Architecture Principles
---

# Architecture Principles

These principles are required by the use case, independent of the final
technology choices.

| Principle | Why it is required |
| --- | --- |
| Server-side supplier integration | Protects credentials and prevents business rules being bypassed |
| Trusted identity and tenant context | Role entitlement and data isolation cannot depend on editable browser data |
| Policy as versioned domain logic | Price caps are multi-dimensional, time-bound, explainable, and auditable |
| Request before reservation | Separates employee intent, operator approval, booking attempt, and confirmation |
| Supplier anti-corruption layer | Isolates B2C concepts from Booking.com schemas, versions, and future suppliers |
| Revalidate volatile data | Availability, price, taxes, and cancellation terms may change before booking |
| Idempotent, recoverable booking | Retries and timeouts must never silently create duplicate reservations |
| Audit by design | Policy results, overrides, price changes, booking attempts, and admin changes need evidence |
| Privacy and least privilege | Travel data, credentials, and payment information require minimisation and controlled access |
| Observable operations | Operators need correlation, queue ageing, failure, rate-limit, and reconciliation visibility |

## Resulting design constraints

- Booking.com credentials live in an enterprise secret store, separated by
  environment and excluded from logs and admin screens.
- All domain queries and identifiers are tenant-scoped.
- Search content may be cached selectively; final price and availability are
  revalidated.
- Supplier throttling, timeout, bounded retry, circuit breaking, and `429`
  handling are built into the adapter.
- Notifications use reliable asynchronous delivery, such as an outbox.
- Policy and booking records remain understandable when external systems are
  unavailable.
- APIs and supplier contracts are versioned and contract-tested.

## Initial quality targets to validate

- Employee and operator journeys: 99.9% monthly availability.
- Policy evaluation: p95 below 200 ms.
- Request submission and operator queue: p95 below 2 seconds, excluding
  supplier latency.
- Booking execution: idempotent and recoverable.
- Audit persistence: no silent loss.
- UI accessibility: existing Sodexo standard, ideally WCAG 2.1 AA or the
  organisation's current standard.
