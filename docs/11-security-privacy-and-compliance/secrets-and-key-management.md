---
title: Secrets and Key Management
sidebar_position: 4
---

# Secrets and key management

Booking.com API token and affiliate credentials:

- remain server-side;
- are stored in enterprise secret management;
- never appear in frontend JavaScript, admin data, or logs;
- are separated by environment;
- are rotated periodically;
- are accessible only to the supplier adapter identity.

API base URL and version are platform configuration. Secret values are not
editable as ordinary business administration.
