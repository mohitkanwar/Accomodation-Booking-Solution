---
title: "Amend or cancel a reservation"
sidebar_label: "Amend or cancel a reservation"
description: "Process supported post-booking changes with clear commercial impact."
---

# Amend or cancel a reservation

**Primary actor:** Booking Operator<br />
**Outcome:** Process supported post-booking changes with clear commercial impact.

:::info Contract status

Paths under `/api/v1` and `/provider-api/v1` are proposed solution
contracts for discovery. Booking.com paths are supplier contracts from Demand
API v3.2 and must be validated against the access enabled for the partner
account.

:::

## Preconditions and completion

**Preconditions**

- The actor is authenticated and the API derives tenant, user, and role scope
  from trusted claims.
- The referenced resource belongs to the actor’s authorised organisation and
  has a workflow state compatible with this journey.
- Correlation identifiers are propagated across synchronous calls and events.

**Completed when**

- Review the traveller's request and the supplier's amendment or cancellation rules.
- Preview fees, refunds, availability, and approval implications.
- Obtain any required traveller or approver confirmation.
- Submit the supported change through the supplier workflow.
- Update the booking record and notify all affected parties.

## End-to-end sequence

### 1. Assess current reservation and impact

```plantuml-image
../../diagrams/user-journeys/booking-operator/amend-or-cancel-a-reservation/01-assess-current-reservation-and-impact.puml | Booking Operator — Amend or cancel a reservation — Assess current reservation and impact
```

### 2. Submit the authorised change

```plantuml-image
../../diagrams/user-journeys/booking-operator/amend-or-cancel-a-reservation/02-submit-the-authorised-change.puml | Booking Operator — Amend or cancel a reservation — Submit the authorised change
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/bookings/{bookingId}` | Retrieve a confirmed booking using tenant and user scope. | Booking Workflow Service | Not required |
| `POST` | `/api/v1/supplier-orders/details` | Query supplier state before deciding whether a retry is safe. | Booking.com Integration Service<br/>POST Booking.com /3.2/orders/details | Not required |
| `POST` | `/api/v1/bookings/{bookingId}/modifications` | Submit an authorised accommodation modification. | Booking.com Integration Service<br/>POST Booking.com /3.2/orders/modify | Required: modificationId |
| `POST` | `/api/v1/bookings/{bookingId}/cancellations` | Submit an authorised cancellation with fee acknowledgement. | Booking.com Integration Service<br/>POST Booking.com /3.2/orders/cancel | Required: cancellationId |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/bookings/{bookingId}/cancellations`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "reasonCode": "TRAVEL_PLAN_CHANGED",
  "acknowledgeFees": true
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "amend-or-cancel-a-reservation-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "supplier": {
    "requestId": "booking-request-id",
    "status": "accepted"
  },
  "links": {
    "self": "/api/v1/bookings/resource-123/cancellations",
    "allowedActions": [
      "view"
    ]
  }
}
```

### Common response envelope

| Field | Type | Notes |
|---|---|---|
| `requestId` | UUID | Returned to the caller and logged across every hop. |
| `id` | String | Domain identifier; supplier identifiers remain separate fields. |
| `status` | String | Current domain or workflow state. |
| `version` | Integer | Used for optimistic locking on mutable aggregates. |
| `occurredAt` | ISO-8601 UTC | Server timestamp; UI renders it in the user’s timezone. |
| `links` | Object | Permitted next actions; absence means the action is unavailable. |

## Error scenarios

| Scenario | Expected behaviour | HTTP / outcome |
|---|---|---|
| Unauthenticated or expired session | Reject at the gateway; do not call a domain or supplier service. | `401` |
| Actor is outside tenant, hierarchy, or role scope | Return a generic denial without revealing whether the resource exists. | `403` |
| Invalid fields or business rule violation | Return field-level problem details; preserve the user’s safe draft. | `400 / 422` |
| Resource is absent or hidden by scope | Return the same not-found response for absent and inaccessible identifiers. | `404` |
| Stale version, duplicate command, or invalid workflow transition | Do not overwrite newer state; return the latest version and allowed actions. | `409` |
| Supplier or enterprise dependency is slow, throttled, or unavailable | Apply timeout and circuit-breaker policy; retry only safe operations and retain correlation evidence. | `429 / 502 / 503` |

Errors use a stable problem-details structure:

```json
{
  "type": "https://errors.sodexo.example/accommodation/invalid-transition",
  "title": "The requested action is not valid in the current state",
  "status": 409,
  "code": "BOOKING_REQUEST_STATE_CONFLICT",
  "requestId": "01J...",
  "retryable": false,
  "errors": [
    {
      "field": "expectedVersion",
      "reason": "stale"
    }
  ]
}
```

## Quality and control notes

- Never trust tenant, traveller, approver, or operator identifiers supplied by
  the browser when they can be derived from authenticated context.
- Preserve policy, offer, decision, supplier, and financial evidence as
  versioned snapshots rather than rewriting history.
- Do not log bearer tokens, payment-card data, personal documents, or complete
  supplier payloads.
- Retry only operations explicitly classified as retryable. Reuse the original
  idempotency key for a retry of the same business command.
- Publish domain events only after the authoritative transaction commits,
  using an outbox or equivalent atomic mechanism.

[Back to Entities and Users](../../users)
