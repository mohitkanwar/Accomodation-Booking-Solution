---
title: Bounded Contexts
sidebar_position: 2
---

# Bounded contexts

| Context | Responsibility |
| --- | --- |
| Identity and Eligibility | Trusted employee, tenant, role, and eligibility context |
| Destination | Client countries, cities, offices, coordinates, radius, and currency |
| Policy and Entitlement | Policy precedence, limits, compliance, exceptions, and snapshots |
| Accommodation Search | Supplier search orchestration, normalisation, enrichment, filtering, and caching |
| Request Workflow | Draft, submission, clarification, approval, rejection, escalation, and ageing |
| Booking | Availability recheck, preview, order creation, retrieval, cancellation, and uncertainty |
| Notification | Email, push, or B2C inbox delivery through an outbox |
| Audit | Immutable business, operational, and administrative evidence |
| Administration | Client, role, destination, policy, operator, and safe integration configuration |

Cross-context communication should use explicit APIs and domain events.
