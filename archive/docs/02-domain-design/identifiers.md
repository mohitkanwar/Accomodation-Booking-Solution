---
title: Identifiers
sidebar_position: 6
---

# Identifiers

Core records use internal identifiers such as `client_id`, `employee_id`,
`site_id`, `policy_id`, `request_id`, `approval_id`,
`supplier_booking_id`, and `audit_event_id`.

External identity and supplier references must be stored separately from
internal identifiers. Booking attempts also require correlation and idempotency
identifiers.

Every lookup and externally supplied object reference must be authorised within
the authenticated `client_id` boundary.
