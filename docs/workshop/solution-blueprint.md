---
id: solution-blueprint
title: Solution Blueprint
---

# Solution Blueprint

## Working architecture

```text
Employee                    Operator / Administrator
   │                                  │
   ▼                                  ▼
Sodexo B2C + React Lego        Operator / Admin UI
   └───────────────┬──────────────────┘
                   ▼
          API Gateway / B2C Backend
                   ▼
      Accommodation Booking Domain
      ├─ UI-facing API / BFF
      ├─ Policy and entitlement
      ├─ Request and booking workflow
      ├─ Destination configuration
      ├─ Booking.com adapter
      ├─ Notifications and audit
      └─ Domain data and outbox
                   │
          ┌────────┴────────┐
          ▼                 ▼
 Booking.com Demand API   Messaging channels
```

## Architectural position

- Browser code never accesses Booking.com directly.
- Policy and authorisation are enforced server-side.
- A supplier adapter isolates the domain from Booking.com contracts and
  versions.
- Workflow state distinguishes request, approval, booking attempt, and supplier
  confirmation.
- Policies and offers are snapshotted where needed for audit.
- Notifications are asynchronous; booking execution is idempotent and
  recoverable.

## Boundaries to validate

- Existing B2C Lego contract, gateway, identity claims, and design system.
- Whether operator and admin experiences already have suitable host platforms.
- Ownership of destination, employee, policy, booking, and audit data.
- Reuse of platform notification, secret, observability, and audit services.
- Deployment, regional, and multi-tenant constraints.

## Workshop output

Accept, amend, or reject the component boundaries and assign an owner to every
external dependency.
