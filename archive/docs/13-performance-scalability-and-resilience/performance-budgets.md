---
title: Performance Budgets
sidebar_position: 4
---

# Performance budgets

| Interaction | Proposed p95 |
| --- | --- |
| Load configuration | Below 1 second |
| Load destinations | Below 1 second |
| Submit booking request | Below 2 seconds |
| Load operator queue | Below 2 seconds |
| Policy evaluation | Below 200 ms |

Accommodation search is supplier-dependent and should show progress and support
partial-result or graceful-degradation behaviour.
