---
id: domain-models
title: Domain Models
sidebar_label: Domain Models
---

# Domain models

The [Initial Data Model](./data-model.md) page shows the physical tables
needed for the discovery build. This page is the conceptual layer above it: a
catalogue of the named domain models each bounded context owns, grouped by the
part of the ecosystem responsible for them (see
[Entities and Users](./users.mdx) for the roles that create and consume them).

Names use PascalCase to distinguish a conceptual model from its physical table
(for example `CorporateClient` here maps to the `client` table on the
[Initial Data Model](./data-model.md) page). A model is only listed once,
under the context that owns it; other contexts reference it rather than
duplicating it.

## Client and organisation

Owned by the Corporate Administrator; read by every other context to scope
and evaluate a request.

| Domain model | Purpose | Key attributes |
| --- | --- | --- |
| `CorporateClient` | The client tenant (for example Tetrapak). Root of every client-scoped model. | Legal name, region, default currency, timezone, status |
| `CorporateLocations` | Countries, cities, and offices the client has opened for travel, used as the search origin. | Country, city, office name/address, coordinates, radius, active |
| `CorporateUserRoles` | The client's role-level catalogue (General Employee, Director, C-Level, ...) and the assignment of a user to a role. | Role code, name, priority, assigned user, effective dates |
| `CorporateApprovalPolicy` | Versioned, effective-dated travel policy: eligibility, advance-booking and stay-duration limits, exception rules, and the approval chain it triggers. | Role level, destination scope, rule set, effective dates, version |
| `CorporatePriceRange` | Destination- and role-level-specific nightly price ceiling, currency, and warning/hard-stop/exception behaviour. | Role level, destination, currency, min/max nightly rate, effective dates |
| `ApproverAssignment` | Which approver(s) are authorised for which travellers or organisational scope, including delegation. | Approver, organisational scope, delegate, effective dates |

## Traveller, request and approval

Owned jointly by the Traveller and Approver journeys; this is the workflow
core of the platform.

| Domain model | Purpose | Key attributes |
| --- | --- | --- |
| `TravellerDetails` | The corporate employee acting as a traveller. References trusted identity rather than duplicating it. | External identity reference, client, role level, cost centre, manager, status |
| `AccommodationRequest` | The aggregate root for a traveller's request: intent, selected offer, and lifecycle status. | Requester, traveller, destination, dates, occupancy, business purpose, status |
| `OfferSnapshot` | The Booking.com proposal selected at request time, frozen so a later price or availability change cannot silently rewrite it. | Property, room, nightly rate, total price, cancellation terms, captured-at time |
| `PolicySnapshot` | The immutable policy-evaluation result attached to a request at submission and at each decision. | Policy version, evaluated limits, pass/fail/exception result, evaluated-at time |
| `ClarificationThread` | Messages exchanged between traveller, approver, and operator about a specific request. | Request reference, messages, awaiting-response flag, participants |
| `ApprovalDecision` | An approve, reject, or exception decision on a request. | Request, decision, reason, decision-maker, decided-at time, linked policy snapshot |

## Booking and supplier

Owned by the Booking Operator and, on the supplier side, the Accommodation
Provider Agent.

| Domain model | Purpose | Key attributes |
| --- | --- | --- |
| `SupplierBooking` | The confirmed or attempted Booking.com reservation created from an approved request. | Request reference, supplier reference, status, amount, currency, cancellation deadline, confirmation snapshot |
| `BookingChangeRequest` | An amendment or cancellation applied to a confirmed reservation. | Reservation reference, change type, fee/refund impact, approval evidence, status |
| `IdempotencyRecord` | Tracks a booking-command attempt so retries after a timeout or error can never create a duplicate reservation. | Idempotency key, request reference, supplier response, outcome, attempt count |
| `SupplierCorporation` | The accommodation-provider corporation fulfilling reservations (Booking.com today, others later). | Name, channel identity, status |
| `SupplierIntegrationConfig` | Non-secret operational configuration for a supplier integration. Credentials live in the secret store, not here. | Environment, endpoints, feature flags, timeouts, retry limits |

## Financial

Owned by the Corporate Administrator (client-side billing) and the
Accommodation Provider Agent (supplier-side billing); Sodexo Administrator
resolves cross-context exceptions.

| Domain model | Purpose | Key attributes |
| --- | --- | --- |
| `Invoice` | A supplier- or Sodexo-issued billing document tied to one or more stays. | Booking reference, line items, taxes, fees, credits, status |
| `BillValidation` | The corporate administrator's record of matching, accepting, or disputing an invoice line against a booking. | Invoice reference, matched amount, variance, disputed flag, evidence |
| `PaymentInstruction` | The approved payable amount submitted to the client's finance system. | Bill reference, approved amount, payment reference, settlement status |
| `ReconciliationException` | A mismatch between platform, supplier, and financial records under investigation. | Disputed reference, records compared, classification, resolution evidence |

## Platform and administration

Owned by the Sodexo Administrator.

| Domain model | Purpose | Key attributes |
| --- | --- | --- |
| `PlatformAccessGrant` | Privileged access assigned across corporate, operator, and Sodexo responsibilities, enforcing least privilege and segregation of duties. | User or service account, granted scope, role, effective dates |
| `SupportCase` | A controlled support investigation into a user or booking problem. | Request, authorisation, evidence accessed, actions taken, outcome |

## Cross-cutting evidence

Written by every context; owned by none of them individually.

| Domain model | Purpose | Key attributes |
| --- | --- | --- |
| `AuditEvent` | Immutable record of a business or administrative event, required wherever a decision, override, or configuration change occurs. | Entity, event type, actor, timestamp, before/after values, correlation ID |
| `OutboxEvent` | Reliable delivery record for notifications and downstream integration events. | Aggregate reference, event type, payload, delivery status, attempt count |

## Modelling notes

- A `Corporate`-prefixed model is scoped to one `CorporateClient` and must
  never be queried without that scope.
- Snapshot models (`OfferSnapshot`, `PolicySnapshot`, confirmation data on
  `SupplierBooking`) are captured once and never rewritten, so later policy or
  price changes cannot alter historical evidence.
- `CorporateClient` intentionally has no separate "tenant" or "onboarding"
  model; the Sodexo Administrator's onboarding journey changes this model's
  status rather than creating a second one.
- This catalogue is a discovery-stage hypothesis. Ownership, and whether some
  models (for example `CorporatePriceRange` and `CorporateApprovalPolicy`)
  should merge or split further, need validation in the domain-design
  workshop.

## Open questions

- Does `ApproverAssignment` need to express multi-level escalation, or is a
  single authorised approver per request sufficient for the initial scope?
- Is `SupplierCorporation` needed as a first-class model before a second
  supplier is contracted, or can the discovery build assume Booking.com only?
- Should `BillValidation` and `ReconciliationException` merge into one
  dispute-handling model, or do client-side and cross-context disputes need
  to stay separate for reporting?
- Which of these models require field-level encryption or tokenisation under
  the data-classification rules once they leave discovery?
