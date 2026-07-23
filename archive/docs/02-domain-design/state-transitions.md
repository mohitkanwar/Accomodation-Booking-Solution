---
title: State Transitions
sidebar_position: 5
---

# State transitions

| From | To | Trigger | Evidence |
| --- | --- | --- | --- |
| Draft | Submitted | Employee submits | Offer and policy snapshots, justification |
| Submitted | Needs Information | Operator requests clarification | Reason and operator |
| Submitted | Rejected | Operator rejects | Reason and comments |
| Submitted | Exception Review | Policy exception requires escalation | Variance and alternatives |
| Submitted / Exception Review | Approved | Authorised decision | Policy result, override, approver |
| Approved | Booking In Progress | Operator initiates booking | Idempotency and correlation identifiers |
| Booking In Progress | Booked | Supplier confirms | Supplier reference and confirmation |
| Booking In Progress | Booking Failed | Known unsuccessful result | Failure category and retry eligibility |
| Booked | Cancellation Requested | Authorised cancellation request | Fees, policy, and confirmation |
| Cancellation Requested | Cancelled | Supplier confirms | Cancellation reference and financial effect |

Timeout after order creation must enter an uncertain recovery path rather than
blind retry.
