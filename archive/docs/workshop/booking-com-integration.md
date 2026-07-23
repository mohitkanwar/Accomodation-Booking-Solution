---
id: booking-com-integration
title: Booking.com Integration
---

# Booking.com Integration

## Discovery gate

Production feasibility depends on confirming that the responsible commercial
entity is eligible and contracted for the required Booking.com Demand API
capabilities. Affiliate ownership, commissions, booking rights, merchant
responsibility, and traveller support must be settled before full booking scope
is committed.

## Likely interaction

```text
Resolve entitlement → Search → Property details/availability
→ Select rate → Preview order → Approve → Revalidate
→ Preview again → Create order → Retrieve confirmation
→ Persist and notify
```

## Technical posture

- Keep affiliate ID and bearer token in a server-side secret store.
- Use a versioned supplier adapter rather than Booking.com models in the domain.
- Confirm the production API version during onboarding.
- Throttle requests and handle `429`, timeouts, transient errors, and circuit
  breaking.
- Cache stable property content; do not rely on cached bookable price or final
  availability.
- Use mocks for unit/contract testing and the supplier sandbox for end-to-end
  validation.

## Questions requiring answers

- Who owns and operates the affiliate account?
- Is in-app order creation enabled for this use case?
- Who is merchant of record, and which payment flows are permitted?
- What production rate limits and support arrangements apply?
- Which content may be stored, cached, and displayed?
- Are webhooks available, or is polling/reconciliation required?
- Is redirect to Booking.com an acceptable fallback?

## Output

Produce a signed commercial and technical capability assessment before Phase 1
commits to integrated booking.
