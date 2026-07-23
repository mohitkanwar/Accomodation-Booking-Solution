---
id: quality-resilience-and-operations
title: Quality, Resilience and Operations
---

# Quality, Resilience and Operations

## Starting service targets

| Capability | Proposed target |
| --- | --- |
| Employee search and request | 99.9% monthly |
| Operator booking | 99.9% monthly |
| Administration | 99.5% monthly |
| Policy evaluation | p95 below 200 ms |
| Request submission | p95 below 2 seconds |
| Audit persistence | No silent loss |
| Booking execution | Idempotent and recoverable |

Supplier latency must be measured separately from internal processing.

## Quality strategy

- Unit-test rules and lifecycle transitions.
- Contract-test the internal supplier interface.
- Use mocked supplier responses for deterministic failures and edge cases.
- Use Booking.com sandbox for integrated search, booking, payment, and
  cancellation scenarios that are enabled.
- Test accessibility to the organisation's standard, ideally WCAG 2.1 AA or
  later adopted standard.
- Validate tenant isolation, permission boundaries, secrets, and log redaction.
- Exercise timeout, duplicate action, rate-limit, price-change, and uncertain
  booking recovery.

## Operations to design

- Correlation IDs across B2C, domain, and supplier interactions.
- Metrics for latency, errors, rate limits, policy outcomes, queue ageing,
  booking failures, and uncertain transactions.
- Alerts and runbooks with named business and technical owners.
- Reconciliation for supplier outcomes that cannot be established synchronously.
- Capacity inputs: employees, travellers, peak searches, conversion, operators,
  bookings by country, and seasonal peaks.

## Workshop output

Confirm service levels, volumes, critical alerts, support ownership, and the
minimum operational-readiness gate for launch.
