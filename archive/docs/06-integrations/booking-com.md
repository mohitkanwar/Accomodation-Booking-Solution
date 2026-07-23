---
title: Booking.com
sidebar_position: 3
---

# Booking.com integration

## Discovery gate

Confirm which commercial entity is eligible and contracted to use the Demand
API, owns the affiliate account, receives any commission, and is permitted to
operate the desired employee-only look-and-book flow.

## Expected capabilities

1. Search accommodations.
2. Retrieve property details where needed.
3. Check availability.
4. Preview an order.
5. Create an order.
6. Retrieve order details.
7. Cancel where enabled.

## Authentication

Requests require an affiliate identifier and bearer token. Both remain
server-side, are stored in the enterprise vault, are environment-separated,
rotated, access-controlled, and excluded from logs.

## Versioning

Demand API documentation includes v3.1, v3.2, and beta references with
inventory-model differences. The production version must be agreed during
onboarding and isolated behind a versioned adapter.

## Resilience

The documented sandbox limit is 50 requests per minute; production limits need
confirmation. Apply throttling, backoff with jitter, transient retries, circuit
breaking, timeouts, correlation, stable-content caching, and rate-limit
metrics.

## References

- [Demand API overview](https://developers.booking.com/demand)
- [Accommodation API](https://developers.booking.com/demand/docs/accommodations/about-accommodation)
- [Authentication](https://developers.booking.com/demand/docs/development-guide/authentication)
- [Rate limiting](https://developers.booking.com/demand/docs/development-guide/rate-limiting)
- [Sandbox](https://developers.booking.com/demand/docs/getting-started/sandbox)
