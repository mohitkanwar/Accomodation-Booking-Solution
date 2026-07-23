---
title: Assumptions and Constraints
sidebar_position: 6
---

# Assumptions and constraints

## Assumptions requiring validation

- Existing B2C authentication supplies trusted employee identity.
- Client and employee-role claims are available from a trusted source.
- The capability is multi-tenant, with Tetrapak as the first client.
- Employees submit requests; only operators create supplier bookings.
- Payment uses a client-approved corporate mechanism.
- Booking.com commercial access is not yet confirmed.
- Client or Sodexo administrators maintain destination offices.
- Booking history is retained for support and audit.
- The React Lego follows the existing B2C contract and design system.

## Constraints

- Booking.com credentials remain strictly server-side.
- Supplier price and availability are provisional until confirmed.
- Tenant scope must come from authenticated context, not user input.
- Policies must be versioned and snapshotted at request time.
- Booking attempts must be idempotent and reconcilable.
- Accessibility should meet the current Sodexo standard, ideally WCAG 2.1 AA.
- API version, production rate limits, booking features, and caching permissions
  require supplier confirmation.
