---
title: Integration Patterns
sidebar_position: 10
---

# Integration patterns

- Backend-for-Frontend for UI-specific composition.
- Anti-corruption / adapter layer for Booking.com.
- Versioned internal supplier interface.
- Server-side secrets and authentication.
- Timeout, bounded retry, exponential backoff with jitter, circuit breaker, and
  throttling.
- Idempotency for booking and cancellation commands.
- Outbox for notifications and externally published events.
- Cache-aside for stable reference and property content.
- Short-lived or no cache for final price and availability.
- Correlation identifiers across B2C, domain services, supplier, and messaging.
- Reconciliation for uncertain external outcomes.
