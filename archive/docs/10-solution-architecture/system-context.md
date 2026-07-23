---
title: System Context
sidebar_position: 2
---

# System context

```text
Employee
  → Existing Sodexo B2C Application
      → Accommodation Lego
          → API Gateway / B2C Backend
              → Accommodation Booking Domain
                  → Booking.com Demand API
                  → Email / Push / B2C Inbox

Operator Portal ─┐
                 ├→ Accommodation Admin API
Client Admin ────┘

Identity Provider → trusted employee, client and role context
Secret Vault → Booking.com credentials
```

The accommodation domain is the policy, workflow, audit, and supplier
integration boundary.
