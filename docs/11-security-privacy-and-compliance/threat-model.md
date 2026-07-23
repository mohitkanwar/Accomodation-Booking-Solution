---
title: Threat Model
sidebar_position: 2
---

# Threat model

Initial threats derived from the discovery:

| Threat | Primary control |
| --- | --- |
| Cross-tenant data access | Trusted tenant claim, tenant-aware queries, object authorisation |
| Frontend entitlement manipulation | Server-side policy evaluation |
| Credential disclosure | Vault storage, backend-only use, log redaction |
| Insecure direct-object reference | Tenant and ownership checks on every identifier |
| Duplicate reservation | Idempotency, attempt persistence, reconciliation |
| Blind retry after timeout | Uncertain state and supplier reconciliation |
| Unauthorised policy override | Explicit permission and immutable approval record |
| Sensitive support access | Least privilege, masking, and audit |
| Excessive supplier payload retention | Purpose-limited snapshots |
| Configuration tampering | Typed validation, effective dating, approval, and audit |

A formal threat-modelling exercise is still required.
