---
id: end-to-end-journey
title: End-to-End Journey
---

# End-to-End Journey

## Employee journey

```text
Sign in → Resolve identity and policy → Enter destination and dates
→ Search Booking.com → Evaluate and compare options
→ Recheck selected offer → Submit request → Track outcome
```

## Operator journey

```text
Open request → Review employee, policy, and offer
→ Approve / reject / clarify / escalate
→ Recheck live price and availability → Preview order
→ Create reservation → Store confirmation → Notify employee
```

## Critical state distinction

```text
DRAFT → SUBMITTED → APPROVED → BOOKING_IN_PROGRESS → BOOKED
                     ↘ REJECTED       ↘ BOOKING_FAILED
```

`APPROVED` is not `BOOKED`. Employees must only see a confirmed reservation
after Booking.com returns a successful booking confirmation.

## Exceptions to walk through

- No role or policy can be resolved.
- No compliant result is available.
- Price changes after employee selection or operator approval.
- The property becomes unavailable.
- The booking call times out and the external outcome is uncertain.
- Cancellation attracts a fee.
- Supplier credentials expire.
- The employee leaves after a future booking has been made.

## Workshop output

Agree the happy path, exception ownership, user communications, state names,
and service levels at each hand-off.
