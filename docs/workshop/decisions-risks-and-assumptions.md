---
id: decisions-risks-and-assumptions
title: Decisions, Risks and Assumptions
---

# Decisions, Risks and Assumptions

## Blocking decisions

| Decision | Why it matters | Owner | Due |
| --- | --- | --- | --- |
| Booking.com commercial eligibility and API capability | Determines whether integrated booking is feasible |  |  |
| Payment method and merchant of record | Determines viable order and operating flow |  |  |
| Exact price-cap calculation | Determines policy correctness |  |  |
| Authoritative employee-level source | Determines entitlement correctness |  |  |
| Requester, traveller, approver, and operator model | Determines journey and access design |  |  |
| Support and reconciliation ownership | Determines operational viability |  |  |

## Major risks

| Risk | Response |
| --- | --- |
| Supplier access is unavailable | Validate before build commitment |
| Payment ownership is unclear | Agree merchant and payment operating model |
| Role data is unreliable | Establish an authoritative source and failure path |
| Price changes after approval | Revalidate and define reapproval thresholds |
| Duplicate or uncertain reservation | Idempotency plus reconciliation |
| Tax treatment is ambiguous | Agree a total-price policy model |
| Operator queue becomes a bottleneck | Define SLAs, prioritisation, and later automation |
| Tenant data leaks | Tenant-scoped queries and object authorisation |

## Assumptions to challenge

- Existing B2C authentication supplies trusted employee and client identity.
- Employees request; only operators create reservations.
- The first solution is multi-tenant, with Tetrapak as the initial client.
- A client-approved corporate payment mechanism will be available.
- Destination sites are administratively maintained.
- Booking history is retained for support and audit.
- The Lego conforms to the existing B2C composition and design standards.

## Workshop discipline

Convert every validated assumption into a fact, every rejected assumption into
a change, and every unresolved blocker into an owned action with a due date.
