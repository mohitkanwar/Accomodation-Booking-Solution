---
title: "Manage corporate roles and assignments"
sidebar_label: "Manage corporate roles and assignments"
description: "Define corporate role levels and control who may travel, approve, or administer."
---

# Manage corporate roles and assignments

**Primary actor:** Corporate Administrator<br />
**Outcome:** Define corporate role levels and control who may travel, approve, or administer.

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

- Review the corporation's role catalogue and user assignments.
- Create or update role levels such as General Employee, Director, and C-Level.
- Assign travellers, approvers, and administrators within the authorised organisation hierarchy.
- Configure approval relationships, delegation, and effective dates.
- Remove or expire access without deleting historical actions.

## End-to-end sequence

### 1. Maintain role catalogue

```plantuml-image
../../diagrams/user-journeys/corporate-administrator/manage-corporate-roles-and-assignments/01-maintain-role-catalogue.puml | Corporate Administrator — Manage corporate roles and assignments — Maintain role catalogue
```

### 2. Change assignments and delegation

```plantuml-image
../../diagrams/user-journeys/corporate-administrator/manage-corporate-roles-and-assignments/02-change-assignments-and-delegation.puml | Corporate Administrator — Manage corporate roles and assignments — Change assignments and delegation
```

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
| `GET` | `/api/v1/admin/roles-and-assignments` | List corporate roles, assignments, scopes, and effective dates. | Access Control Service | Not required |
| `PUT` | `/api/v1/admin/roles/{roleId}` | Create or update a versioned corporate role definition. | Access Control Service | Required: expectedVersion |
| `POST` | `/api/v1/admin/role-assignments` | Grant, delegate, expire, or revoke a scoped assignment. | Access Control Service | Required: assignmentCommandId |

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept `X-Correlation-Id`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
`POST /api/v1/admin/role-assignments`.

### Request

```json
{
  "requestId": "01JEXAMPLE...",
  "expectedVersion": 7,
  "principalId": "user-123",
  "role": "CORPORATE_APPROVER",
  "scope": {
    "tenantId": "tenant-123",
    "organisationUnitIds": [
      "ou-45"
    ]
  },
  "effectiveFrom": "2026-08-01"
}
```

### Success response

```json
{
  "requestId": "01JEXAMPLE...",
  "id": "manage-corporate-roles-and-assignments-123",
  "status": "accepted",
  "version": 8,
  "occurredAt": "2026-07-25T12:00:00Z",
  "links": {
    "self": "/api/v1/admin/role-assignments",
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
