---
id: discovery-questions
title: 2. Discovery Questions
---

# Discovery Questions

Use these questions to identify decisions and owners, not to solve every detail
in this meeting.

## Business and product

1. What business outcome and measurable success justify the feature?
1. Who supports the accomodation queries?
   1. Sodexo, Booking.com or accomodation provider?
3. Is the requester always the traveller?
   1. Someone else may request on behalf of the traveller, e.g. an assistant or travel coordinator.
4. May employees submit out-of-policy options, and who approves exceptions?
   1. Employees should not be allowed to submit out-of-policy options. But a booking operator may do on user's behalf. 
6. Who owns the employee experience, operator service level, and post-booking
   support?
7. Which countries, sites, languages, and currencies are required first?
1. Need price calculation logic, e.g. If the price on booking.com is INR 100, what should be the price shown to the user? 
   1. Should it include taxes and mandatory fees? 
   2. How to handle foreign currencies? Currency conversion charges?
   3. Discounts and offers?

## Policy

1. Does the price cap include taxes and mandatory fees?
3. Is the cap per room, per traveller, average night, highest night, or total
   stay?
4. How are foreign currencies converted and which FX source is approved?
5. Are distance, category, breakfast, cancellation, weekend, and maximum-stay
   rules mandatory?
6. What price change after approval requires renewed consent?
7. How are policies versioned, dated, overridden, and audited?

## Booking, payment, and operations

1. Who is the Booking.com affiliate partner and account owner?
2. Is search-look-book enabled contractually for this application?
3. Who is merchant of record and who pays: Sodexo, Tetrapak, operator, employee,
   virtual card, or hotel payment?
4. Who owns invoices, refunds, chargebacks, reconciliation, no-shows, and
   disputes?
5. What should an operator do when a booking call times out?
6. May employees cancel, or must all servicing go through an operator?

## Platform, data, and security

1. Which trusted claims does existing B2C authentication provide?
2. Which system owns employee role, cost centre, client, and manager?
3. Which operator/admin host applications and platform services can be reused?
4. What travel and traveller data may be stored, for how long, and in which
   region?
5. What volumes, peak searches, booking conversion, and service levels apply?
6. Which notification, map, audit, observability, and secret services are
   standard?

## Decisions that block readiness

| Decision | Owner | Due date | Status |
| --- | --- | --- | --- |
| Booking.com commercial/API eligibility |  |  | Open |
| Payment and merchant-of-record model |  |  | Open |
| Exact policy calculation |  |  | Open |
| Authoritative employee-role source |  |  | Open |
| Operating and support ownership |  |  | Open |
