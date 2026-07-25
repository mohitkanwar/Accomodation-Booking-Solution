---
title: "Validate and create a booking"
sidebar_label: "Validate and create a booking"
description: "Turn an approved request into a confirmed Booking.com reservation."
---

# Validate and create a booking

**Primary actor:** Booking Operator<br />
**Outcome:** Turn an approved request into a confirmed Booking.com reservation.

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

- Validate the traveller details, approval evidence, policy result, and selected offer.
- Recheck live price, availability, room conditions, taxes, and cancellation terms.
- Preview the final order and verify that no material condition has changed.
- Create the Booking.com order through the controlled server-side workflow.
- Record the supplier reference and immutable booking response.
- Confirm the reservation to the traveller and close the work item.

## End-to-end sequence

### 1. Validate approval and live offer

```plantuml-image
../../diagrams/user-journeys/booking-operator/validate-and-create-a-booking/01-validate-approval-and-live-offer.puml | Booking Operator — Validate and create a booking — Validate approval and live offer
```

### 2. Preview and create supplier order

```plantuml-image
../../diagrams/user-journeys/booking-operator/validate-and-create-a-booking/02-preview-and-create-supplier-order.puml | Booking Operator — Validate and create a booking — Preview and create supplier order
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/booking-work-items/{workItemId}/context` | Return request, approval, selected offer, policy, and communication history. | Booking Workflow Service | Not required |
| `POST` | `/api/v1/accommodations/availability` | Recheck current products, prices, inventory, and policies. | Accommodation Service<br/>POST Booking.com /3.2/accommodations/availability | Read-only request |
| `POST` | `/api/v1/booking-work-items/{workItemId}/order-preview` | Preview final price, policies, and payment requirements. | Booking.com Integration Service<br/>POST Booking.com /3.2/orders/preview | Preview fingerprint |
| `POST` | `/api/v1/booking-work-items/{workItemId}/orders` | Create the supplier order using the short-lived preview token. | Booking.com Integration Service<br/>POST Booking.com /3.2/orders/create | Required: Idempotency-Key and order token |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/booking-work-items/{workItemId}/orders`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "workItemId": "work-123",
  "bookingId": "booking-123",
  "supplierOrderToken": "short-lived-secret-reference",
  "idempotencyKey": "order-command-123"
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "validate-and-create-a-booking-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "supplier": {
    "requestId": "booking-request-id",
    "status": "accepted"
  },
  "links": {
    "self": "/api/v1/booking-work-items/resource-123/orders",
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
