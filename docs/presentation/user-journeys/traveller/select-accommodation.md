---
title: "Select accommodation"
sidebar_label: "Select accommodation"
description: "Find a policy-eligible stay and submit the selected offer for approval."
---

# Select accommodation

**Primary actor:** Traveller<br />
**Outcome:** Find a policy-eligible stay and submit the selected offer for approval.

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

- Load eligible destinations under the traveller’s effective policy.
- Search Booking.com inventory for the dates and guest requirements.
- Recheck the selected product and preserve the displayed commercial terms.
- Create an accommodation request with policy evidence.

## End-to-end sequence

### 1. Choose destination and search

```plantuml-image
../../diagrams/user-journeys/traveller/select-accommodation/01-choose-destination-and-search.puml | Traveller — Select accommodation — Choose destination and search
```

### 2. Recheck offer and submit request

```plantuml-image
../../diagrams/user-journeys/traveller/select-accommodation/02-recheck-offer-and-submit-request.puml | Traveller — Select accommodation — Recheck offer and submit request
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/destinations?eligibleFor=me` | Return corporate sites and destinations allowed by the effective policy. | Accommodation Service | Not required |
| `POST` | `/api/v1/accommodations/search` | Search policy-aware accommodation inventory for a destination and stay. | Accommodation Service<br/>POST Booking.com /3.2/accommodations/search | Search fingerprint for short-lived deduplication |
| `POST` | `/api/v1/accommodations/availability` | Recheck current products, prices, inventory, and policies. | Accommodation Service<br/>POST Booking.com /3.2/accommodations/availability | Read-only request |
| `POST` | `/api/v1/booking-requests` | Persist the selected offer, policy evidence, and approval request. | Booking Workflow Service | Required: Idempotency-Key |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/booking-requests`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "journey": "select-accommodation",
  "resourceId": "resource-123",
  "action": "Persist the selected offer, policy evidence, and approval request",
  "data": {
    "reason": "Business-authorised request"
  }
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "select-accommodation-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "links": {
    "self": "/api/v1/booking-requests",
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
