---
title: "Receive and fulfil a reservation"
sidebar_label: "Receive and fulfil a reservation"
description: "Confirm that a supplier-side booking is valid and operationally ready for the guest."
---

# Receive and fulfil a reservation

**Primary actor:** Accommodation Provider Agent<br />
**Outcome:** Confirm that a supplier-side booking is valid and operationally ready for the guest.

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

- Receive the reservation through the Booking.com distribution channel.
- Validate the stay, guest, room, commercial, and payment details.
- Retain the provider and distribution-channel references.
- Confirm fulfilment or raise an exception when the reservation cannot be honoured.
- Make the confirmed status available to the connected booking workflow.

## End-to-end sequence

### 1. End-to-end interaction

```plantuml-image
../../diagrams/user-journeys/provider-agent/receive-and-fulfil-a-reservation/01-end-to-end-interaction.puml | Accommodation Provider Agent — Receive and fulfil a reservation — End-to-end interaction
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `EVENT` | `booking.reservation.created.v1` | Deliver a confirmed supplier reservation into the provider channel. | Booking.com Distribution Channel | Deduplicate supplier reservation reference |
| `POST` | `/provider-api/v1/reservations/{reservationId}/fulfilment` | Confirm fulfilment or raise a provider exception. | Provider PMS / Channel Manager<br/>Booking.com distribution status update | Required: fulfilmentCommandId |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /provider-api/v1/reservations/{reservationId}/fulfilment`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "supplierReservationId": "supplier-res-123",
  "propertyId": "property-10004",
  "stay": {
    "checkin": "2026-09-14",
    "checkout": "2026-09-17"
  },
  "status": "confirmed"
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "receive-and-fulfil-a-reservation-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "supplier": {
    "requestId": "booking-request-id",
    "status": "accepted"
  },
  "links": {
    "self": "/provider-api/v1/reservations/resource-123/fulfilment",
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
