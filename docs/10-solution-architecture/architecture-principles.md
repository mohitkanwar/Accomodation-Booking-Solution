---
title: Architecture Principles
sidebar_position: 1
---

# Architecture principles

- Integrate the UI as a React micro frontend within the existing B2C platform.
- Access external suppliers only from the backend.
- Enforce entitlement and authorisation server-side.
- Isolate supplier models behind a versioned adapter.
- Use request-first, operator-controlled booking.
- Store credentials in the enterprise secret vault.
- Make external booking operations idempotent and reconcilable.
- Version policies and snapshot request-time evaluation.
- Enforce tenant isolation across every entity and query.
- Revalidate availability and price before submission, approval, and booking.
- Retain only required supplier snapshots.
- Deliver notifications asynchronously through an outbox.
- Use contract tests to manage API change.
