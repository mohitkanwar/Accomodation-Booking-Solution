---
title: Rate Limits
sidebar_position: 8
---

# Rate limits

Booking.com's sandbox documentation identifies 50 requests per minute and HTTP
429 on excess. Production limits require onboarding confirmation.

The adapter should implement tenant-aware and supplier-wide throttling,
backpressure, rate-limit metrics, bounded retry using supplier guidance, and
graceful degradation. Search fan-out must be designed within the contracted
quota.
