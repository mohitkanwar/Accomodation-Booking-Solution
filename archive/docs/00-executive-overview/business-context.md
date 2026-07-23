---
title: Business Context
sidebar_position: 2
---

# Business context

Tetrapak requires an accommodation-request and booking capability embedded in
the existing Sodexo B2C application. The initial model is employee self-service
search followed by operator-controlled booking.

The business complexity is concentrated in:

- Booking.com affiliate eligibility and commercial permissions;
- payment ownership and merchant-of-record responsibilities;
- client-specific travel policy;
- price and availability volatility;
- exception approval;
- uncertain or failed external booking attempts;
- reconciliation and support ownership;
- multi-tenant data isolation.

The React micro frontend is only one part of the capability. A server-side
domain boundary is required to enforce policy, manage workflow, protect
credentials, and preserve financial and operational correctness.
