---
title: Channel and OTA Mapping
sidebar_position: 9
---

# Channel and OTA mapping

Booking.com is the only supplier identified for the first release. Its API
models are mapped through a versioned adapter into internal property, offer,
availability, preview, booking, cancellation, and error models.

The supplier abstraction is intended to support future providers without
coupling policy, request, or operator workflows to Booking.com contracts.

Negotiated hotel rates and multiple supplier channels are outside the initial
scope.
