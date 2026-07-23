---
title: Event Catalogue
sidebar_position: 3
---

# Event catalogue

Candidate business events:

| Event | Primary consumers |
| --- | --- |
| BookingRequestSubmitted | Operator queue, notification, audit |
| BookingRequestNeedsInformation | Notification, audit |
| PolicyEvaluated | Audit, analytics |
| PolicyExceptionRaised | Supervisor queue, notification, audit |
| BookingRequestApproved / Rejected | Notification, audit |
| BookingAttemptStarted | Audit, reconciliation |
| BookingConfirmed | Notification, audit, future finance |
| BookingFailed / BookingOutcomeUncertain | Operator queue, reconciliation, alerting |
| CancellationRequested / BookingCancelled / CancellationFailed | Notification, audit, future finance |
| TravelPolicyChanged | Audit and cache invalidation |

Formal payload schemas and compatibility rules are not yet defined.
