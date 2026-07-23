---
id: policy-and-business-rules
title: Policy and Business Rules
---

# Policy and Business Rules

## Working entitlement model

```text
Client → Employee level → Destination/site → Permitted accommodation
```

Candidate rule dimensions include nightly and total caps, currency, category,
room type, meals, cancellation terms, booking notice, maximum stay, distance,
weekends, approval, and exception thresholds.

## Recommended precedence

1. Employee-specific exception.
2. Client + employee level + site.
3. Client + employee level + city.
4. Client + employee level + country.
5. Client + employee level global rule.
6. Client default.
7. Platform default.

Every evaluation should retain the policy version, calculated limit, selected
price, result and reason, override, and approving identity.

## Proposed policy outcomes

- Compliant
- Compliant with warning
- Requires exception
- Not permitted
- Cannot be evaluated

## Decisions required

- Does the cap include mandatory taxes and fees?
- Is it per room, per traveller, per night, average night, or total stay?
- Which FX source and refresh frequency apply?
- Are cancellation, category, distance, and meal rules mandatory?
- Can an employee submit an out-of-policy option?
- Who approves exceptions, and may operators override any rule?

## Working recommendation

Evaluate both maximum average nightly total and maximum total booking value.
Re-evaluate whenever the price or selected offer changes.
