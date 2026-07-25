---
title: "Review an accommodation request"
sidebar_label: "Review an accommodation request"
description: "Assess the request, selected offer, policy result, and supporting business context."
---

# Review an accommodation request

**Primary actor:** Approver<br />
**Outcome:** Assess the request, selected offer, policy result, and supporting business context.

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

- Review the traveller, destination, dates, guest count, and business purpose.
- Inspect the selected accommodation, nightly rate, total price, and cancellation conditions.
- Compare the request with the applicable role, destination, and price-range policy.
- Review previous clarification messages, attachments, and exception evidence.
- Confirm that the approver is authorised and is not approving their own request.

## End-to-end sequence

### 1. End-to-end interaction

```plantuml-image
../../diagrams/user-journeys/approver/review-an-accommodation-request/01-end-to-end-interaction.puml | Approver — Review an accommodation request — End-to-end interaction
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/approvals/{approvalId}/context` | Return request, offer, policy, conversation, and authority evidence. | Booking Workflow Service | Not required |
| `POST` | `/api/v1/accommodations/availability` | Recheck current products, prices, inventory, and policies. | Accommodation Service<br/>POST Booking.com /3.2/accommodations/availability | Read-only request |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/accommodations/availability`.

### Request

```json
{
  "destinationId": "site-paris-01",
  "checkin": "2026-09-14",
  "checkout": "2026-09-17",
  "guests": {
    "adults": 1,
    "rooms": 1
  },
  "booker": {
    "country": "fr",
    "platform": "desktop",
    "travelPurpose": "business"
  }
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "review-an-accommodation-request-123",
  "status": "available",
  "version": 7,
  "occurredAt": "2026-07-25T12:00:00Z",
  "supplier": {
    "requestId": "booking-request-id",
    "status": "accepted"
  },
  "links": {
    "self": "/api/v1/accommodations/availability",
    "allowedActions": [
      "continue"
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
