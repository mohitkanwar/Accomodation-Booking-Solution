---
title: Domain Events
sidebar_position: 8
---

# Domain events

Candidate events derived from the required audit and notification behaviour:

- BookingRequestSubmitted.
- BookingRequestNeedsInformation.
- PolicyEvaluated.
- PolicyExceptionRaised.
- BookingRequestApproved.
- BookingRequestRejected.
- BookingAttemptStarted.
- BookingPriceChanged.
- BookingConfirmed.
- BookingFailed.
- BookingOutcomeUncertain.
- CancellationRequested.
- BookingCancelled.
- CancellationFailed.
- TravelPolicyChanged.
- DestinationChanged.
- NotificationRequested.

Events that trigger external delivery should be published through an outbox so
business state and delivery intent are committed atomically.
