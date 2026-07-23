---
id: data-security-and-privacy
title: Data, Security and Privacy
---

# Data, Security and Privacy

## Core information

| Data | Likely owner or source to confirm |
| --- | --- |
| Employee identity, client, and role | Existing B2C identity / employee system |
| Destination and site | Client or Sodexo administration |
| Travel policy and version | Accommodation policy administration |
| Request, approval, and booking | Accommodation Booking domain |
| Property, rate, and order details | Booking.com, with controlled local snapshots |
| Audit events | Accommodation audit capability |

## Security position

- Reuse existing authentication, but validate trusted claims at the backend.
- Scope every entity and query by authenticated `client_id`.
- Apply object-level authorisation; never trust a tenant identifier supplied
  only by the UI.
- Keep supplier credentials server-side, environment-separated, rotated, and
  out of logs.
- Separate search, request, review, override, booking, cancellation, and policy
  administration permissions.
- Redact sensitive values from audit and operational logs.

## Personal data questions

Travel dates, hotel location, traveller details, special requests, and payment
information may reveal sensitive patterns. Discovery must establish lawful
purpose, minimum data, access, retention, deletion, residency, international
transfer, data-subject rights, and support access.

Accessibility and dietary requirements need additional scrutiny before being
collected.

## Workshop output

Agree the source-of-truth matrix, data classification, retention requirements,
role model, tenant-isolation approach, and privacy/security review owners.
