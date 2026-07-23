---
title: Integration Landscape
sidebar_position: 1
---

# Integration landscape

| Integration | Purpose |
| --- | --- |
| Existing Sodexo B2C application | Hosts the employee Accommodation Lego |
| B2C authentication / Identity Provider | Supplies trusted employee, client, role, locale, and authentication context |
| API Gateway / B2C backend | Routes authenticated application traffic |
| Booking.com Demand API | Accommodation search, details, availability, order, retrieval, and supported cancellation |
| Email / Push / B2C inbox | Employee and operator notifications |
| Secret-management service | Protects supplier affiliate and bearer credentials |
| Map provider | Displays properties and office-relative location; provider undecided |
| FX source | Converts policy and supplier currencies; source undecided |
| Finance / ERP | Future invoice, settlement, and reconciliation integration; scope undecided |

Browser-to-Booking.com integration is prohibited. Supplier traffic originates
from the server-side adapter.
