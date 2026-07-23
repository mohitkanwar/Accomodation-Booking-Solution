---
title: Sequence Diagrams
sidebar_position: 6
---

# Sequence diagrams

## Search and request

```text
Employee → Lego: enter search
Lego → BFF: authenticated criteria
BFF → Policy Engine: resolve entitlement
BFF → Booking.com Adapter: search
Adapter → Booking.com: search / availability
Booking.com → Adapter: supplier results
Adapter → BFF: normalised offers
BFF → Policy Engine: evaluate offers
BFF → Lego: offers and explanations
Employee → Lego: select and submit
Lego → BFF: selected offer
BFF → Adapter: revalidate
BFF → Request Service: persist request and snapshots
Request Service → Outbox: notify operator and employee
```

## Approval and booking

```text
Operator → Request Service: approve
Request Service → Booking Service: begin booking
Booking Service → Adapter: revalidate and preview
Adapter → Booking.com: preview
Booking Service → Adapter: create order with idempotency
Adapter → Booking.com: create order
Booking.com → Adapter: confirmation
Booking Service → Database: store confirmation
Booking Service → Outbox: publish confirmation notification
```
