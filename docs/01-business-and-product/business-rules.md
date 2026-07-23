---
title: Business Rules
sidebar_position: 8
---

# Business rules

## Entitlement dimensions

Policies may depend on client, employee level, country, site, currency, nightly
and total caps, category, room type, meals, cancellation, advance booking,
stay length, approval, exception threshold, distance, taxes, and weekends.

## Rule precedence

1. Employee-specific exception.
2. Client + employee level + site.
3. Client + employee level + city.
4. Client + employee level + country.
5. Client + employee level global rule.
6. Client default rule.
7. Platform default rule.

## Required evidence

Retain the policy version, calculated limit, offer price, compliance reasons,
operator override, and approver identity.

## Price-cap recommendation

Evaluate both:

- `maximum_average_nightly_total`;
- `maximum_total_booking_value`.

The business must decide whether caps include taxes and fees, apply per room or
traveller, and use average or highest-night values.

## Policy outcomes

- Compliant.
- Compliant with warning.
- Requires exception.
- Not permitted.
- Policy cannot be evaluated.

Policy results must be explainable, including cap, actual value, distance,
cancellation, variance, and cheapest compliant alternative where available.
