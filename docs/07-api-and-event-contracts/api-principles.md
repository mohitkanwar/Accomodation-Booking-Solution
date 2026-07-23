---
title: API Principles
sidebar_position: 1
---

# API principles

- Expose internal business models rather than supplier payloads.
- Derive tenant and employee context from trusted authentication.
- Enforce authorisation and policy server-side.
- Make booking and cancellation commands idempotent.
- Distinguish validation, policy, supplier, transient, uncertain, and internal
  failures.
- Carry correlation identifiers end to end.
- Version breaking contracts and protect the B2C application from supplier
  version changes.
- Never expose supplier credentials or sensitive payment data to the browser.
- Store only the supplier snapshots required for fulfilment, audit, support,
  and reconciliation.
