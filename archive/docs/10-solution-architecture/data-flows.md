---
title: Data Flows
sidebar_position: 7
---

# Data flows

1. Identity claims enter through the authenticated B2C boundary.
2. Destination and policy configuration resolve employee entitlement.
3. Search criteria and policy limits are sent to the server-side supplier
   adapter.
4. Supplier property, rate, availability, and terms are normalised.
5. Compliance results are returned to the employee without credentials.
6. Submission stores selected-offer and policy-evaluation snapshots.
7. Operator decisions append approval and audit evidence.
8. Booking commands produce attempt records before external calls.
9. Supplier confirmation is stored with internal and external references.
10. Outbox records drive notifications and future downstream events.

Personal and credential data is redacted from logs.
