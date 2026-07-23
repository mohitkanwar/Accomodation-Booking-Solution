---
id: people-and-roles
title: People and Roles
---

# People and Roles

## Actors

| Actor | Intended responsibility |
| --- | --- |
| Employee/requester | Searches and submits a request |
| Traveller | Stays at the property; may differ from requester |
| Operator | Reviews, approves/rejects, and books |
| Operator supervisor | Handles exceptions, escalation, and high-value cases |
| Client administrator | Configures client policy, levels, and destinations |
| Platform administrator | Manages technical and tenant configuration |
| Finance/procurement | Owns payment, budget, supplier, and reconciliation rules |
| Security/privacy | Governs credentials and personal-data handling |
| Identity provider | Supplies trusted identity, client, and role context |
| Booking.com | Supplies inventory and enabled booking capabilities |

Employee levels currently envisaged are General Employee, Director, and
C-Level, with different travel entitlements.

## Role model to validate

- The backend must derive tenant and entitlement from trusted identity claims.
- Permissions should distinguish own requests, all requests, review, override,
  booking, cancellation, and policy administration.
- Support impersonation or delegated booking requires explicit controls and
  audit; it is not assumed.

## Workshop questions

- Is the requester always the traveller?
- May assistants request on behalf of executives?
- Are contractors and guests eligible?
- Who may override policy, and within what threshold?
- Is operator approval mandatory for every request?
- Who owns support before, during, and after the stay?
- Which system is authoritative for employee level and cost centre?

## Output

Produce a role-to-capability matrix and name the authoritative identity and
employee-profile sources.
