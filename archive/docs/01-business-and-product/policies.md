---
title: Policies
sidebar_position: 9
---

# Policies

A travel policy is effective-dated and versioned. It is scoped by client and
employee level and may be narrowed by country or destination site.

```text
Client
  └── Employee level
       └── Destination
            └── Accommodation entitlement
```

## Candidate policy fields

```text
Policy name
Client
Employee level
Effective from / to
Country
Destination / site
Currency
Minimum price
Maximum average nightly total
Maximum total booking value
Maximum stay
Maximum distance
Allowed property categories
Room and meal rules
Cancellation requirements
Approval workflow
Exception threshold
```

The request retains the policy evaluation snapshot used at submission. If
policy changes later, the submitted snapshot remains authoritative unless an
explicit re-evaluation rule applies.
