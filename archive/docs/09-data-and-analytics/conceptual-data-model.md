---
title: Conceptual Data Model
sidebar_position: 2
---

# Conceptual data model

```text
Client
 ├── Role Level
 ├── Destination Site
 ├── Travel Policy
 └── Employee Travel Profile
       └── Booking Request
             ├── Selected Offer Snapshot
             ├── Policy Evaluation Snapshot
             ├── Approval
             ├── Supplier Booking
             └── Audit Events
```

A booking request references one requester, one traveller, one destination
site, one stay, and the selected proposal snapshot. Multiple approvals or
booking attempts may be required as the workflow progresses.
