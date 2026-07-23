---
title: Notifications
sidebar_position: 9
---

# Notifications

Notifications may use email, push, or the B2C inbox.

Candidate triggers:

- request submitted;
- clarification requested;
- approved, rejected, or escalated;
- price changed;
- booking confirmed or failed;
- cancellation requested, confirmed, or failed;
- stale request or operator escalation.

Delivery should be asynchronous through an outbox. Operators need the ability
to resend confirmation.
