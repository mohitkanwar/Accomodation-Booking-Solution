---
id: api-flow
title: 4. High-Level API Flow
---

# High-Level API Flow

## API landscape by microservice

The API surface is deliberately split by responsibility. Channel-facing
contracts remain stable for the B2C, operator, and administration
experiences; domain services own business capabilities; supplier-specific
contracts remain isolated behind the Booking.com integration service.

```plantuml-image
./diagrams/api-flow/api-landscape.puml | API types developed across the accommodation microservices
```

The gateway, authentication, access control, Kafka platform, ESB, and
notification capabilities are reused. The service APIs shown below the
platform edge are new accommodation capabilities.

## Context

```plantuml-image
./diagrams/api-flow/api-flow.puml | Employee search, request and operator booking sequence
```

The browser must not call Booking.com directly. Demand API requests require an
API bearer token and affiliate ID, which belong in server-side secret
management.

## Flow A — Load and search

```text
1. Lego → BFF: GET destinations and employee booking context
2. BFF → identity/profile source: resolve client and role level
3. Lego → BFF: POST accommodation search
4. Domain → policy service: resolve effective policy
5. Adapter → Booking.com: POST accommodations/search
6. Adapter → Booking.com: POST accommodations/availability when required
7. Domain: normalise results and evaluate each proposal
8. BFF → Lego: proposals + price + policy status + explanation
```

## Flow B — Request and operator decision

```text
1. Lego → BFF: POST booking request with selected offer
2. Domain: recheck offer and policy; snapshot both; persist SUBMITTED
3. Domain → outbox: notify operator
4. Operator UI → Admin API: GET pending request
5. Operator UI → Admin API: approve / reject / clarify / escalate
6. Domain: persist decision and audit event
```

## Flow C — Create the reservation

```text
1. Domain → Booking.com: recheck availability
2. Domain → Booking.com: POST orders/preview
3. Domain: evaluate final price and payment/cancellation conditions
4. If material change: return for renewed approval
5. Domain → Booking.com: POST orders/create using preview order token
6. Domain → Booking.com: retrieve order details where required
7. Domain: persist supplier reference and BOOKED confirmation
8. Domain → outbox: notify employee and operator
```

Booking.com's order token from preview is time-limited, so preview and create
belong in the controlled booking step rather than at initial employee
selection.

## Failure and reconciliation

If create-order times out, record an uncertain state, look up the external
outcome, and reconcile before retrying. A retry must not create a duplicate
reservation.

## Initial internal API surface

| Consumer | Example capability |
| --- | --- |
| Employee Lego | context, destinations, search, request, own status |
| Operator UI | queue, request detail, decision, preview, book, cancel |
| Admin UI | roles, policies, sites, access, effective versions |
| Operations | health, reconciliation, retry, audit lookup |

## Official API references

- [Demand API overview](https://developers.booking.com/demand/docs/getting-started/overview)
- [Authentication](https://developers.booking.com/demand/docs/development-guide/authentication)
- [Order creation](https://developers.booking.com/demand/docs/orders-api/order-preview-create)
- [Order management](https://developers.booking.com/demand/docs/orders-api/overview)
