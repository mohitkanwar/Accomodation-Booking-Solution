---
title: Contract Testing
sidebar_position: 7
---

# Contract testing

Contract tests protect:

- Accommodation Lego to BFF contracts;
- BFF to policy, request, booking, destination, and notification services;
- internal supplier interface to Booking.com version-specific adapters;
- event and outbox payloads.

Breaking Booking.com inventory-model changes must be detected without leaking
supplier contract changes into the business domain.
