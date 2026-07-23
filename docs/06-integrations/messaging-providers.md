---
title: Messaging Providers
sidebar_position: 9
---

# Messaging providers

Notifications may use email, push, or the existing B2C inbox. No provider has
been selected.

The Notification Adapter consumes outbox-backed delivery requests and records
delivery outcome, retry, and correlation data. Booking state changes must not
depend transactionally on synchronous notification success.
