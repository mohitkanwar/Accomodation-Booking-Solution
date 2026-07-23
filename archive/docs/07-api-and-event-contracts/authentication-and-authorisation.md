---
title: Authentication and Authorisation
sidebar_position: 4
---

# Authentication and authorisation

Internal APIs use the existing authenticated B2C session and trusted claims.
Every request is tenant-scoped and object-authorised.

Supplier authentication uses a server-held Booking.com bearer token and
affiliate identifier obtained from environment-specific secret management.

The React application never receives supplier credentials and cannot assert its
own tenant, employee level, override authority, or booking permission.
