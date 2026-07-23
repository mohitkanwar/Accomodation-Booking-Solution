---
title: Data Strategy
sidebar_position: 1
---

# Data strategy

The accommodation domain owns workflow, policy, booking-reference, and audit
data while referencing authoritative identity data and consuming supplier
property, offer, and booking information.

Principles:

- minimise duplication of employee master data;
- retain immutable policy, offer, decision, and confirmation snapshots needed
  for audit and support;
- avoid unrestricted storage of supplier payloads;
- scope every record by client;
- classify and protect travel and personal data;
- preserve correlation across request, supplier, payment, notification, and
  audit records;
- define retention and deletion before production.
