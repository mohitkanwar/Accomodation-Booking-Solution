---
id: booking-lifecycle
title: Booking Lifecycle and Recovery
---

# Booking Lifecycle and Recovery

## Proposed lifecycle

| State | Meaning |
| --- | --- |
| Draft | Employee has not submitted |
| Submitted | Request awaits action |
| Needs information | Operator requires clarification |
| Exception review | Policy exception awaits authorised decision |
| Approved | Request approved; no reservation is implied |
| Booking in progress | Supplier operation has started |
| Booking failed | No confirmed reservation is recorded |
| Booked | Supplier confirmation has been captured |
| Cancellation requested | Cancellation is being processed |
| Cancelled | Supplier cancellation is confirmed |
| Completed | Stay and servicing lifecycle is closed |

## Integrity rules

- Revalidate policy, price, and availability before booking.
- Use an internal idempotency key for every supplier booking attempt.
- Do not blindly retry a timed-out booking call.
- Represent an uncertain external outcome explicitly and reconcile it.
- Keep booking data available when Booking.com is unavailable.
- Capture operator decisions, overrides, attempts, responses, and cancellations
  in the audit trail.

## Operational questions

- Who investigates uncertain reservations?
- How is the supplier searched for an existing order before retry?
- What price movement requires renewed employee or approver consent?
- Who may cancel, and how are fees approved?
- What is the response target for ageing requests?
- How are no-shows and disputes handled?

## Output

Approve the state model and produce an owner/SLA matrix for each exception path.
