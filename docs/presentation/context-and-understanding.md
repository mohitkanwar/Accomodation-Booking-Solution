---
id: context-and-understanding
title: 1. Context and Understanding
---

# Context and Understanding

## What we heard

Tetrapak wants eligible employees travelling between offices to request
accommodation inside the existing Sodexo B2C application.

- The employee experience is a React micro frontend, composed as a B2C Lego.
- Existing B2C authentication identifies the employee and client.
- Available accommodation comes from Booking.com.
- Eligibility and price limits vary by client, employee level, and destination.
- A dedicated Tetrapak operator reviews requests and creates the real booking.
- An administration capability manages destinations, role levels, policies, and
  technical configuration.

## System context

```plantuml-image
./diagrams/context-and-understanding/context-diagram.puml | Employee accommodation booking system context
```

The accommodation booking capability is the system in scope. The existing B2C
application hosts its React Lego, while trusted identity context, Booking.com,
and notification services remain external dependencies. Internal containers and
implementation choices are intentionally deferred to lower-level architecture
views.

## B2C frontend container view

```plantuml-image
./diagrams/context-and-understanding/b2c-frontend-container-diagram.puml | Sodexo B2C frontend application container diagram
```

The existing React host continues to own authentication integration, session
management, push notifications and alerts. The new Accommodation Booking Lego
is a separately deployable React micro frontend that receives authenticated
employee context from the host and calls only the server-side Accommodation
Booking BFF.

The blue blocks expand the host's existing shared functionality. The red blocks
show the proposed employee accommodation journey inside the new Lego. These are
logical functional blocks rather than independently deployable containers.

The map provider and its browser-versus-server access model remain an
architecture decision. Booking.com credentials and Demand API calls remain
outside the frontend boundary.

## Interpreted business journey

```text
Employee signs in
→ selects office and dates
→ sees policy-evaluated Booking.com proposals
→ selects an option and submits a request
→ operator reviews and approves/rejects
→ operator rechecks price and availability
→ operator creates the reservation
→ employee receives confirmation
```

## Proposed first-release boundary

**In:** destination/site selection, search, list/filter/map, policy result,
request submission, operator queue and decision, operator-triggered booking,
confirmation, administration, notifications, and audit.

**Not assumed:** employee self-booking, flights or ground transport, expenses,
group/multi-city travel, multiple suppliers, complex modification, or automated
finance reconciliation.

## Important interpretation

An approved request is not a confirmed booking. The product must distinguish
`APPROVED`, `BOOKING_IN_PROGRESS`, `BOOKING_FAILED`, and `BOOKED`.

## Validate in the room

- Is this the intended employee and operator experience?
- Is Tetrapak the initial client of a reusable multi-client capability?
- Is request-first, operator-controlled booking the intended operating model?
- Which elements are mandatory for the first business outcome?
