---
title: Reconciliation Break
sidebar_position: 4
---

# Reconciliation break

## Trigger

Internal booking state, supplier order state, payment status, or expected
references do not agree.

## Response

1. Prevent duplicate booking or refund action.
2. Correlate request, attempt, supplier, amount, currency, and timestamps.
3. Retrieve current supplier state.
4. Classify confirmed, failed, cancelled, or still uncertain.
5. Correct internal state through an audited recovery action.
6. Escalate financial differences to the accountable finance process.

Detailed finance reconciliation remains to be designed.
