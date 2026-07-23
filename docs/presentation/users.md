---
id: users
title: Users
---

# Users

The initial discovery identifies three direct user groups. Their access must be
tenant-aware and derived from the existing Sodexo B2C identity context.

## Primary users

### Eligible employee

An authenticated Tetrapak employee travelling between offices.

The employee:

- selects a permitted destination and travel dates;
- searches and compares accommodation proposals;
- sees whether a proposal is within policy and why;
- submits a booking request;
- follows the request and booking status; and
- receives the final confirmation or rejection.

The employee does not create the Booking.com reservation directly in the
proposed first-release model.

### Tetrapak booking operator

A member of the dedicated client team responsible for reviewing employee
requests and creating the real reservation.

The operator:

- sees requests for the clients and destinations they are authorised to serve;
- reviews employee level, applicable policy, price and exceptions;
- approves, rejects, clarifies or escalates a request;
- rechecks current price and availability;
- creates the Booking.com reservation; and
- handles failed or uncertain booking outcomes.

### Client administrator

An authorised administrator responsible for client-specific configuration.

The administrator:

- manages employee role levels and associated booking rights;
- configures destination and nightly price restrictions;
- manages client sites and permitted destinations;
- controls operator and administrative access; and
- maintains Booking.com endpoint and integration configuration where permitted.

Technical credentials must remain in server-side secret management and must
never be exposed to an administrator's browser.

## Employee role levels

The supplied role levels are policy classifications, not necessarily separate
application roles:

| Role level | Purpose |
| --- | --- |
| General Employee | Applies the standard accommodation policy and price range |
| Director | Applies the director-level policy and price range |
| C-Level | Applies the executive policy and price range |

The effective allowance may also vary by client and destination. The product
therefore needs to distinguish:

- **application role** — what a user may do;
- **employee level** — which travel policy applies; and
- **assignment scope** — which client, sites or requests the user may access.

## Initial access matrix

| Capability | Employee | Operator | Client administrator |
| --- | :---: | :---: | :---: |
| Search eligible accommodation | Yes | Optional | No |
| Submit own request | Yes | No | No |
| View own request status | Yes | No | No |
| View assigned request queue | No | Yes | No |
| Decide on a request | No | Yes | No |
| Create the supplier booking | No | Yes | No |
| Manage role levels and policies | No | No | Yes |
| Manage destinations and sites | No | No | Yes |
| Manage access assignments | No | No | Yes |
| View audit evidence | Own activity | Assigned activity | Client scope |

This matrix is an initial discovery view and does not replace a detailed
authorisation model.

## Trusted user context

The accommodation capability will need a trusted context containing, at
minimum:

- immutable user and client identifiers;
- application roles;
- employee role level;
- active or suspended status;
- authorised client and site scope;
- locale and preferred communication channel; and
- delegation or temporary assignment, if supported.

Client, role and scope must be resolved server-side. They must not be accepted
from editable browser fields.

## Questions to validate

- Which system owns the employee's role level?
- Can one employee have different levels or allowances for different clients?
- Can an operator serve more than one client or country?
- Is a client administrator allowed to assign other administrators?
- Are operator decisions subject to a four-eyes approval rule?
- Is delegated booking on behalf of another employee required?
- What happens when a role or policy changes after a request is submitted?
- Which users need read-only audit or support access?
