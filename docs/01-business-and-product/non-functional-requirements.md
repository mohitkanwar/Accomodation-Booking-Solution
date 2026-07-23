---
title: Non-Functional Requirements
sidebar_position: 7
---

# Non-functional requirements

## Availability and correctness

- Employee and operator capabilities: 99.9% monthly.
- Administrative capabilities: 99.5% monthly.
- No silent audit loss.
- Booking execution must be idempotent and recoverable.
- Notifications should use an outbox.
- Booking records remain accessible when the supplier is unavailable.

## Performance

- Configuration and destinations: p95 below 1 second.
- Request submission and operator queue: p95 below 2 seconds.
- Policy evaluation: p95 below 200 ms.
- Search must expose progress and handle supplier-dependent latency.

## Security and privacy

- Server-side credentials, tenant isolation, object-level authorisation, secret
  rotation, redacted logs, and environment separation.
- Define lawful purpose, retention, deletion, residency, transfer, support
  access, and handling of sensitive special requests.

## Accessibility

Meet the existing Sodexo standard, ideally WCAG 2.1 AA, including keyboard and
screen-reader operation, map alternatives, non-colour status cues, and
accessible filters and dates.

## Scalability inputs still required

Employee population, active travellers, concurrent searches, conversion,
operators, bookings by country, and seasonal peaks.
