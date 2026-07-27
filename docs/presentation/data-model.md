---
id: data-model
title: 3. Initial Data Model
---

# Initial Data Model

This is a conceptual B2C-side model for discovery. It does not prescribe a
database technology or require duplication of authoritative employee data.

## Configuration and identity

| Table | Key fields | Purpose |
| --- | --- | --- |
| `client` | `client_id`, name, currency, timezone, status | Tenant and default context |
| `employee_travel_profile` | `employee_id`, `client_id`, external identity, role level, cost centre, status | Reference to trusted employee context |
| `role_level` | `role_level_id`, `client_id`, code, name, priority, active | General, Director, C-Level and future levels |
| `destination_site` | `site_id`, `client_id`, country, city, address, coordinates, radius, active | Client office and search origin |
| `travel_policy` | `policy_id`, client, role, site/country, currency, caps, restrictions, effective dates, version | Versioned entitlement rules |

## Request and booking

| Table | Key fields | Purpose |
| --- | --- | --- |
| `booking_request` | `request_id`, client, requester, traveller, site, dates, occupancy, status, selected-offer snapshot, policy snapshot, justification | Employee intent and workflow aggregate |
| `approval` | `approval_id`, request, operator, decision, reason, comments, override, decided time | Operator and exception decision |
| `supplier_booking` | `supplier_booking_id`, request, supplier reference, status, amount, currency, payment status, cancellation deadline, confirmation snapshot | Confirmed or attempted external reservation |
| `audit_event` | entity, event, actor, timestamp, before/after, correlation ID | Immutable business and administrative evidence |
| `outbox_event` | event ID, aggregate, type, payload, status, attempts | Reliable notification/integration delivery |

## Slide-ready conceptual model

The visual follows the business lifecycle from corporate policy and employee
context through request, approval, supplier booking, and settlement. Snapshot
and evidence records sit alongside that lifecycle so the slide communicates
both the flow and the controls without exposing implementation-level tables.

```plantuml-image
./diagrams/data-model/data-model.puml | Conceptual B2C-side accommodation data model
```

Read the primary path from left to right. The supporting connections show
which immutable snapshots and audit/integration records preserve the journey
without competing with its main lifecycle.

## Modelling principles

- Scope every business row by `client_id`.
- Reference authoritative employee data; copy only what the booking record must
  retain.
- Store policy and selected-offer snapshots so later changes do not rewrite
  history.
- Keep the internal request ID separate from the Booking.com order reference.
- Represent money with amount and ISO currency; define tax/fee treatment.
- Encrypt or tokenise sensitive payment/traveller fields and minimise supplier
  payload retention.
- Use effective dates and versions for policy, not destructive updates.

## Validation questions

- Are requester and traveller separate entities?
- Must cost centre, manager, legal entity, or project code be captured?
- Which system owns destinations and policy configuration?
- What supplier data may be retained under commercial and privacy terms?
- Which fields are required for finance, tax, audit, and support?
