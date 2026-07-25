---
title: "Monitor booking and approval operations"
sidebar_label: "Monitor booking and approval operations"
description: "Detect unhealthy queues, failed integrations, and delayed business workflows."
---

# Monitor booking and approval operations

**Primary actor:** Sodexo Administrator<br />
**Outcome:** Detect unhealthy queues, failed integrations, and delayed business workflows.

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

- Review platform health, queue depth, latency, error rate, and supplier availability.
- Drill into failed approval, booking, notification, or callback workflows.
- Correlate events using the request, booking, and supplier identifiers.
- Trigger an approved retry, escalation, or incident process.
- Track recovery and record the operational outcome.

## End-to-end sequence

### 1. Detect and diagnose failure

```plantuml-image
../../diagrams/user-journeys/sodexo-administrator/monitor-booking-and-approval-operations/01-detect-and-diagnose-failure.puml | Sodexo Administrator — Monitor booking and approval operations — Detect and diagnose failure
```

### 2. Retry or escalate safely

```plantuml-image
../../diagrams/user-journeys/sodexo-administrator/monitor-booking-and-approval-operations/02-retry-or-escalate-safely.puml | Sodexo Administrator — Monitor booking and approval operations — Retry or escalate safely
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/platform/operations/health` | Return service health, latency, errors, queues, and supplier indicators. | Operational Monitoring Service | Not required |
| `GET` | `/api/v1/platform/operations/failures/{failureId}` | Return correlated workflow, trace, event, and dependency evidence. | Operational Monitoring Service | Not required |
| `POST` | `/api/v1/platform/operations/failures/{failureId}/actions` | Trigger an authorised retry, escalation, or incident workflow. | Operational Monitoring Service | Required: actionId |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/platform/operations/failures/{failureId}/actions`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "journey": "monitor-booking-and-approval-operations",
  "resourceId": "resource-123",
  "action": "Trigger an authorised retry, escalation, or incident workflow",
  "data": {
    "reason": "Business-authorised request"
  }
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "monitor-booking-and-approval-operations-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "links": {
    "self": "/api/v1/platform/operations/failures/resource-123/actions",
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
