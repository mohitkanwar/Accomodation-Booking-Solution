---
title: Authentication
sidebar_position: 4
---

# Authentication

The Accommodation Lego reuses existing B2C authentication.

The backend expects trusted claims for:

- employee subject identifier;
- client or tenant;
- application role;
- authentication level;
- locale.

The frontend must not calculate entitlement from editable or unverified browser
data. Client context is derived from authenticated identity rather than a
client identifier supplied by the UI.
