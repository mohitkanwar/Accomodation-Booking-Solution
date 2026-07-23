---
title: Security Architecture
sidebar_position: 1
---

# Security architecture

- Reuse trusted B2C authentication.
- Derive tenant and user context from signed claims.
- Authorise every action and object within `client_id`.
- Perform entitlement and booking decisions server-side.
- Route supplier traffic through the backend adapter.
- Keep affiliate and bearer credentials in an environment-specific vault.
- Redact credentials, personal data, and sensitive supplier fields from logs.
- Retain immutable audit evidence for decisions and administrative changes.
- Separate business administration from technical integration and secret
  management.
