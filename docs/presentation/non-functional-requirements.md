---
id: non-functional-requirements
title: Non-Functional Requirements
sidebar_label: Non-Functional Requirements
---

# Non-functional requirements

The [Architecture Principles](./architecture-principles.md) page states why
each principle is required. This page turns those principles into the
non-functional requirements (NFRs) the architecture must satisfy, and the
solution each one drives. Solutions reference the domain models on the
[Domain Models](./domain-models.md) page and the operational journeys on the
[Entities and Users](./users.mdx) page where one already exists.

These are discovery-stage hypotheses. Numeric targets need validation against
real workload, supplier SLAs, and Tetrapak's own expectations before they
become commitments.

## Availability and reliability

| Requirement | Target | Solution |
| --- | --- | --- |
| Employee and operator journeys stay up | 99.9% monthly | BFF, supplier adapter, policy engine, operator queue, and notification workers scale and fail independently, so one weak dependency does not take down the rest |
| Administrative journeys stay up | 99.5% monthly | Lower target reflects lower concurrency and business urgency than the traveller/operator path |
| Booking data survives a supplier outage | No loss of readability | `SupplierBooking` and `AuditEvent` remain readable from platform-owned storage; only new bookings are blocked when Booking.com is down |
| Search degrades independently of booking | Search may degrade without blocking in-flight requests | Search results are cached selectively; a supplier search failure does not fail requests already submitted |

## Performance

| Requirement | Target | Solution |
| --- | --- | --- |
| Policy evaluation | p95 below 200 ms | Policy is versioned domain logic evaluated in-process against a loaded `CorporateApprovalPolicy`/`CorporatePriceRange`, not a remote call |
| Request submission and operator queue load | p95 below 2 seconds, excluding supplier latency | `AccommodationRequest` and its `OfferSnapshot`/`PolicySnapshot` are read from platform storage; Booking.com is only revalidated, not re-searched, at this step |
| Configuration and destination loading | p95 below 1 second | `CorporateLocations` and `CorporateUserRoles` are small, client-scoped, cacheable reads |
| Search latency variability | Search must expose progress rather than block | Search results are streamed or paged as Booking.com responds, instead of waiting for a single synchronous round trip |

## Scalability

| Requirement | Solution |
| --- | --- |
| Independent load profiles across capabilities | The BFF, supplier adapter, policy engine, operator queue, and notification workers are separately deployable and horizontally scalable components |
| Multi-tenant growth | Every domain model is `CorporateClient`-scoped, so onboarding a new tenant adds rows, not new infrastructure |
| Seasonal and regional peaks | Caching of destination and search content absorbs read load; write load (requests, approvals, bookings) is the true scaling driver and needs workload inputs from Tetrapak to size |
| Unknown-yet inputs | Employee population, concurrent searches, conversion rate, and bookings per country are still needed to turn this into a capacity plan |

## Resilience and fault tolerance

| Requirement | Solution |
| --- | --- |
| Supplier timeouts and rate limits | The supplier adapter applies timeouts, throttling, bounded retry with backoff and jitter, circuit breaking, and `429` handling, per the anti-corruption-layer principle |
| No duplicate bookings on retry | `IdempotencyRecord` persists the attempt and outcome before the external call, so a retried or timed-out command can detect an existing success instead of double-booking |
| Uncertain booking outcomes | A `SupplierBooking` in an uncertain state is queried for its real status before any retry, per the Booking Operator's "Resolve a failed or uncertain booking" journey |
| Reliable notification delivery | `OutboxEvent` persists delivery intent with the business transaction, so a crash between commit and send cannot silently drop a notification |

## Security

| Requirement | Solution |
| --- | --- |
| Supplier credentials never reach the browser | All Booking.com calls are server-side; credentials live in an enterprise secret store, separated by environment and excluded from logs and admin screens |
| Entitlement cannot be forged client-side | Trusted identity and tenant context come from the existing B2C authentication, not editable browser fields |
| Cross-tenant data leakage | Every domain query and identifier is scoped by `CorporateClient`; there is no cross-tenant query path |
| Privileged access sprawl | `PlatformAccessGrant` enforces least privilege and segregation of duties across corporate, operator, and Sodexo roles, per the Sodexo Administrator's "Manage platform roles and access" journey |
| Approver self-approval | An approver can never decide their own request, per the cross-role controls on the Users page |

## Privacy and data protection

| Requirement | Solution |
| --- | --- |
| Minimise retained traveller and payment data | Only the fields a booking record must retain are copied from authoritative employee data; the rest is referenced, not duplicated |
| Sensitive fields at rest | Payment and traveller identifiers are encrypted or tokenised; supplier payload retention is minimised to what settlement and support require |
| Support access to personal data | `SupportCase` investigations use masked business records and controlled tooling rather than direct access to user-owned data, per the "Support a controlled investigation" journey |
| Lawful basis, retention, and residency | Still open — purpose, retention period, deletion, residency, and cross-border transfer need a legal and privacy review before build |

## Auditability and compliance

| Requirement | Target | Solution |
| --- | --- | --- |
| No silent loss of business evidence | Zero tolerance | Every policy result, approval decision, price override, booking attempt, and admin change writes an `AuditEvent` at the point of the transaction, not after the fact |
| Decisions stay explainable after policy changes | Historical decisions are immutable | `PolicySnapshot` and `OfferSnapshot` freeze the evaluated policy and offer at decision time, so a later policy version can never rewrite history |
| API and supplier contract stability | Breaking changes are caught before release | APIs and the Booking.com supplier contract are versioned and contract-tested |

## Observability

| Requirement | Solution |
| --- | --- |
| Operators can see what needs attention | Queue ageing, failure, rate-limit, and reconciliation visibility are first-class operator views, not log-diving, per the "Monitor booking and approval operations" journey |
| Cross-system correlation | Every `AuditEvent` and supplier call carries a correlation identifier so a request can be traced across the BFF, adapter, and supplier |
| Reconciliation drift is visible, not silent | `ReconciliationException` surfaces mismatches between platform, supplier, and financial records for investigation rather than letting them accumulate unnoticed |

## Accessibility and usability

| Requirement | Solution |
| --- | --- |
| Meets the existing Sodexo standard | Target WCAG 2.1 AA or the organisation's current standard, whichever is higher |
| Non-visual and non-colour operation | Keyboard and screen-reader operation, a non-map alternative to the map view, and non-colour status cues (not colour alone) for policy and booking status |
| Consistent host and Lego experience | The accommodation micro frontend inherits the B2C host's existing accessibility baseline rather than defining a separate one |

## Maintainability and extensibility

| Requirement | Solution |
| --- | --- |
| Booking.com is not baked into the domain | A supplier anti-corruption layer isolates B2C domain concepts from Booking.com's schemas and versions, so a second supplier is additive, not a rewrite |
| Policy changes do not require a deployment | Policy is versioned domain data (`CorporateApprovalPolicy`, `CorporatePriceRange`), not hard-coded logic |
| Bounded contexts evolve independently | The six domain-model groupings on the Domain Models page (client/organisation, traveller/request/approval, booking/supplier, financial, platform/administration, cross-cutting evidence) are owned separately so one area's change does not ripple through the others |

## Interoperability and portability

| Requirement | Solution |
| --- | --- |
| Future suppliers beyond Booking.com | `SupplierCorporation` and `SupplierIntegrationConfig` model the supplier relationship generically; whether this is needed before a second supplier is contracted is an open question on the Domain Models page |
| API evolution without breaking consumers | Versioning and compatibility policy apply to every public API and event contract |
| Configuration promotion across environments | `SupplierIntegrationConfig` changes are tested for connectivity and promoted with rollback information, per the "Configure supplier integrations" journey |

## Cost efficiency

| Requirement | Solution |
| --- | --- |
| Shared platform cost across clients | A single multi-tenant platform, scoped by `CorporateClient`, avoids per-client infrastructure |
| Supplier API cost and rate limits | Selective caching of destination and search content reduces redundant Booking.com calls; only price/availability is revalidated at submission |
| Idle capacity | Independently scalable components let low-traffic capabilities (for example administration) run at a smaller scale than high-traffic ones (search, request submission) |

## Disaster recovery and business continuity

| Requirement | Solution |
| --- | --- |
| Recovery time and recovery point objectives | Not yet defined — depend on the hosting platform decision and Tetrapak's own continuity expectations |
| Operating without the platform | An initial release may allow manual operator completion outside the platform, reducing dependency on integrated booking while the operating model is proven |
| Supplier-side disaster recovery | Booking.com's own availability and DR posture are outside this architecture's control and need a commercial/legal confirmation, not an engineering solution |

## Still open

- What are Tetrapak's actual availability and recovery expectations, and do
  they match the 99.9%/99.5% targets above?
- What employee population, concurrent-search, and seasonal-peak numbers turn
  the scalability requirements into a real capacity plan?
- What is the lawful basis, retention period, and residency requirement for
  traveller and payment data?
- Which non-functional targets, if any, are contractual commitments to
  Tetrapak rather than internal engineering goals?
