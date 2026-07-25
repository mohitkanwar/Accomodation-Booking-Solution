---
title: "Handle a changed price or unavailable offer"
sidebar_label: "Handle a changed price or unavailable offer"
description: "Resolve material differences discovered between approval and booking."
---

# Handle a changed price or unavailable offer

**Primary actor:** Booking Operator<br />
**Outcome:** Resolve material differences discovered between approval and booking.

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

- Compare the live offer with the approved offer snapshot.
- Search for an equivalent policy-compliant replacement where permitted.
- Return the revised offer for renewed approval when price or conditions materially change.
- Preserve the original offer, replacement offer, and reason for the change.
- Resume booking only after the required traveller or approver decision.

## End-to-end sequence

### 1. Detect and replace changed offer

```plantuml-image
../../diagrams/user-journeys/booking-operator/handle-a-changed-price-or-unavailable-offer/01-detect-and-replace-changed-offer.puml | Booking Operator — Handle a changed price or unavailable offer — Detect and replace changed offer
```

### 2. Request renewed approval

```plantuml-image
../../diagrams/user-journeys/booking-operator/handle-a-changed-price-or-unavailable-offer/02-request-renewed-approval.puml | Booking Operator — Handle a changed price or unavailable offer — Request renewed approval
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `POST` | `/api/v1/accommodations/availability` | Recheck current products, prices, inventory, and policies. | Accommodation Service<br/>POST Booking.com /3.2/accommodations/availability | Read-only request |
| `POST` | `/api/v1/booking-work-items/{workItemId}/replacement-search` | Search equivalent policy-compliant offers after a material change. | Accommodation Service<br/>POST Booking.com /3.2/accommodations/search | Not required |
| `POST` | `/api/v1/booking-work-items/{workItemId}/changed-offer` | Persist the replacement offer and request renewed approval. | Booking Workflow Service | Required: offerVersion |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/booking-work-items/{workItemId}/changed-offer`.

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
  "id": "handle-a-changed-price-or-unavailable-offer-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "links": {
    "self": "/api/v1/booking-work-items/resource-123/changed-offer",
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
