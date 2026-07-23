---
id: mvp-and-capabilities
title: MVP and Capabilities
---

# MVP and Capabilities

## Proposed MVP

| Experience | Capabilities |
| --- | --- |
| Employee | Authenticated access, destinations, policy resolution, search, list/filter/map, compliance explanation, request submission, status |
| Operator | Queue, review, alternatives, approve/reject, live recheck, operator-triggered booking, confirmation, failure visibility |
| Administrator | Client destinations, role-based policy, operator access, effective dates, configuration audit |
| Platform | Notifications, audit, supplier adapter, idempotency, booking recovery |

## Defer unless validation makes it straightforward

- Modification after booking
- Group or complex multi-room travel
- Employee self-booking
- Multiple accommodation suppliers
- Automated expense or finance integration
- Advanced exception workflow
- Traveller-to-property messaging

## Product questions

- Is manual operator completion outside the platform an acceptable first step?
- Which search filters materially affect selection?
- Must the map be present in the first release?
- Which status and notification channels are required?
- What information must an operator compare before approving?
- What is the minimum viable administration experience?

## Prioritisation test

A capability belongs in the MVP only if it is required to validate employee
demand, policy application, operator viability, or safe reservation creation.
