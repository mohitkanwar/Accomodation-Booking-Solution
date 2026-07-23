---
title: Error Model
sidebar_position: 6
---

# Error model

Errors should identify:

- validation failure;
- missing identity, role, or policy mapping;
- policy not evaluable or exception required;
- no compliant result;
- property unavailable;
- price changed;
- supplier authentication or rate-limit failure;
- transient supplier or network failure;
- booking failed with known outcome;
- booking outcome uncertain;
- cancellation fee or cancellation failure;
- tenant or object authorisation failure;
- internal processing failure.

User responses remain controlled and do not expose credentials or supplier
internals. Operator responses provide correlation and recovery guidance.
