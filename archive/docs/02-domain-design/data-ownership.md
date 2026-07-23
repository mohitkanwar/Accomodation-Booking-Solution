---
title: Data Ownership
sidebar_position: 7
---

# Data ownership

| Data | Expected authority |
| --- | --- |
| Employee identity and active status | Existing identity or employee system |
| Client and role claims | Trusted B2C or identity integration |
| Travel role mapping | Accommodation administration |
| Destination offices | Client or Sodexo administration |
| Travel policies | Client administration with versioned audit |
| Property, room, rate, and availability | Booking.com |
| Request, approval, and policy snapshots | Accommodation domain |
| Supplier confirmation | Booking.com, snapshotted by accommodation domain |
| Notifications and audit evidence | Accommodation domain |
| FX source | To be decided |
| Invoices and financial ledger | To be decided |

Supplier payloads should not be stored without limit; retain the minimum
snapshots needed for booking, support, financial correctness, and audit.
