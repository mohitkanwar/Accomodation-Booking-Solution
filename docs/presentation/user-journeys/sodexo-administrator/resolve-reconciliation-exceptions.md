---
title: "Resolve reconciliation exceptions"
sidebar_label: "Resolve reconciliation exceptions"
description: "Investigate differences between platform bookings, supplier records, invoices, and payments."
---

# Resolve reconciliation exceptions

**Primary actor:** Sodexo Administrator<br />
**Outcome:** Investigate differences between platform bookings, supplier records, invoices, and payments.

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

- Open unmatched, duplicated, or value-mismatched reconciliation items.
- Compare internal events with supplier references and financial records.
- Classify timing differences, data defects, booking failures, or financial disputes.
- Correct authorised reference data or route the exception to the responsible team.
- Close the exception with evidence and without rewriting immutable booking history.

## End-to-end sequence

### 1. Compare internal and external evidence

```plantuml-image
../../diagrams/user-journeys/sodexo-administrator/resolve-reconciliation-exceptions/01-compare-internal-and-external-evidence.puml | Sodexo Administrator — Resolve reconciliation exceptions — Compare internal and external evidence
```

### 2. Resolve or route exception

```plantuml-image
../../diagrams/user-journeys/sodexo-administrator/resolve-reconciliation-exceptions/02-resolve-or-route-exception.puml | Sodexo Administrator — Resolve reconciliation exceptions — Resolve or route exception
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/reconciliation/cases` | List unmatched, duplicate, and value-mismatch cases. | Accommodation Reconciliation Service | Not required |
| `GET` | `/api/v1/reconciliation/cases/{caseId}/evidence` | Compare internal events, supplier orders, invoices, and payments. | Accommodation Reconciliation Service<br/>Booking.com orders/details and existing finance integrations | Not required |
| `POST` | `/api/v1/reconciliation/cases/{caseId}/resolution` | Resolve or route a case without rewriting immutable history. | Accommodation Reconciliation Service | Required: resolutionId |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/reconciliation/cases/{caseId}/resolution`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "reference": "invoice-2026-00192",
  "lineDecisions": [
    {
      "lineId": "line-1",
      "decision": "accepted",
      "validatedAmount": 480,
      "currency": "EUR"
    }
  ],
  "evidenceIds": [
    "booking-snapshot-1",
    "supplier-invoice-1"
  ]
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "resolve-reconciliation-exceptions-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "links": {
    "self": "/api/v1/reconciliation/cases/resource-123/resolution",
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
