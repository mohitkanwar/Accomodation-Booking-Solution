---
title: User Journeys
sidebar_position: 4
---

# User journeys

## Employee search and request

```text
flowchart TD
  A["Employee signs in"] --> B["Trusted identity, client and role are supplied"]
  B --> C["Load travel policy"]
  C --> D["Select destination, office and dates"]
  D --> E["Calculate entitlement"]
  E --> F["Search Booking.com"]
  F --> G["Normalise and evaluate results"]
  G --> H["Filter, sort and use list or map"]
  H --> I["Select property and rate"]
  I --> J["Recheck price, availability and policy"]
  J --> K["Submit booking request"]
  K --> L["Request enters operator queue"]
```

## Operator review and booking

```text
flowchart TD
  A["Open pending request"] --> B["Review employee, entitlement and proposal"]
  B --> C{"Policy result"}
  C -->|Compliant| D["Approve"]
  C -->|Exception| E["Reject, escalate, or approve exception"]
  D --> F["Recheck price and availability"]
  E --> F
  F --> G["Preview supplier order"]
  G --> H["Create supplier order"]
  H --> I["Store confirmation and policies"]
  I --> J["Notify employee and operator"]
```

Price and availability should be checked before submission, during approval,
and immediately before booking.
