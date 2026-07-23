---
title: Core Entities
sidebar_position: 3
---

# Core entities

## Client

`client_id`, name, status, default currency, and timezone.

## Employee travel profile

Employee and external identity identifiers, client, role level, department,
cost centre, manager, and status. Authoritative data should be referenced
rather than duplicated where possible.

## Role level

Client-scoped code, name, priority, and active status.

## Destination site

Client, country, city, office name, address, coordinates, timezone, default
radius, and status.

## Travel policy

Client, role level, geography, currency, price limits, nights, distance,
cancellation, meals, effective dates, version, and status.

## Booking request

Client, employee, traveller, site, stay, occupancy, selected offer snapshot,
policy snapshot, justification, status, and submission time.

## Approval

Request, operator, decision, reason, comments, override amount, and decision
time.

## Supplier booking

Request, supplier, reference, status, currency, total, payment status,
cancellation deadline, confirmation snapshot, and creation time.

## Audit event

Entity, event, actor, timestamp, old and new values, and correlation identifier.
