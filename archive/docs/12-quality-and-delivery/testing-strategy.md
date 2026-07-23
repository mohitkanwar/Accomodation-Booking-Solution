---
title: Testing Strategy
sidebar_position: 4
---

# Testing strategy

- Unit tests for policy precedence, price caps, state transitions, and
  identifier handling.
- Component tests for BFF composition and supplier transformation.
- Contract tests for internal consumers and Booking.com adapter versions.
- Mocked supplier scenarios for deterministic error and resilience coverage.
- Booking.com sandbox end-to-end tests.
- Controlled production smoke tests after onboarding.
- Accessibility, security, performance, tenant isolation, idempotency, and
  reconciliation testing.
- Explicit tests for price change, disappearance, timeout, duplicate action,
  cancellation fee, credential expiry, and policy change after submission.
