---
id: 60-minute-interview-narration
title: 60-Minute Interview Narration
sidebar_label: 60-Minute Interview Narration
---

# 60-minute interview narration

This is a speaker-ready script for the Sodexo Solution Architect interview. It
is designed for approximately **50 minutes of presentation and 10 minutes of
Q&A**. The tone is simple, visual, decisive, and story-led: short sentences,
deliberate pauses, and one clear idea at a time.

Download the accompanying
[Sodexo-themed PowerPoint presentation](./assets/Accommodation-Booking-Discovery-Sodexo.pptx).

## Delivery map

| Time | Section | Message to land |
| --- | --- | --- |
| 00:00–05:00 | Opening and context | We are designing a trusted journey, not a hotel-search widget |
| 05:00–17:00 | Discovery questions | The most important early deliverable is a decision map |
| 17:00–27:00 | Initial data model | Preserve intent, policy, decision, and booking as separate evidence |
| 27:00–37:00 | High-level API flow | The browser never owns secrets or final policy decisions |
| 37:00–45:00 | Architecture principles | Design for change, volatility, failure, and audit from day one |
| 45:00–50:00 | Roadmap and close | Prove the riskiest assumptions before committing to delivery |
| 50:00–60:00 | Q&A | Answer directly, then connect back to business value |

:::tip Speaker posture

Do not rush to fill silence. Pause after the important sentences. Point to a
diagram only after explaining why the audience should care about it. Speak as
the architect facilitating a decision, not as a technologist defending a
design.

:::

## 00:00–05:00 — Opening and context

### 00:00–01:15 — Open with the human problem

> Good morning, and thank you for the opportunity.
>
> I want to begin with a person, not a system.
>
> Imagine Anna. Anna works for Tetrapak in Pune. On Monday afternoon, she is
> asked to travel to Lund for three nights. She opens the Sodexo B2C
> application she already knows. She is already authenticated. She chooses the
> Lund office, selects her dates, and sees accommodation she is actually
> allowed to request.
>
> She does not need to understand Tetrapak's travel-policy spreadsheet. She
> does not need to know which currency rate finance approved this morning. She
> does not need to wonder whether a room is within the limit for her role.
>
> The experience makes the right choice feel simple.
>
> Now imagine Maya, the booking operator. Maya receives Anna's request with
> the employee identity, policy result, selected offer, cancellation terms,
> and every fact needed to make a safe decision. Maya confirms the live price,
> creates the real reservation, and Anna receives a confirmation she can
> trust.
>
> That sounds like a hotel-search feature.
>
> It is not.
>
> It is a **trust journey**. It connects employee intent, corporate policy,
> human accountability, supplier volatility, and a financial commitment.
>
> My job as the B2C Solution Architect is to make that journey simple for Anna,
> controllable for Maya, reusable for Sodexo, and explainable to Tetrapak.

_[Pause. Move to the context diagram.]_

### 01:15–03:15 — State the requirement in one sentence

> My understanding of the requirement is this:
>
> Sodexo will add a separately deployable React micro frontend—a B2C Lego—to
> the existing authenticated application. Eligible Tetrapak employees will use
> it to search Booking.com accommodation around approved corporate sites,
> within destination- and role-specific price rules. They will submit a
> request. A dedicated operator will validate it and create the actual booking.
> Administrative users will manage destinations, role levels, policies, and
> supplier configuration.
>
> Three employee levels are named today: General Employee, Director, and
> C-Level. I treat those as configurable client data, not code. Tetrapak may
> use those three. Another client may use five. The architecture should not
> require a deployment to change a job-level label or a nightly cap.
>
> I also separate three experiences.
>
> First, the employee experience: destination, dates, travellers, search,
> filters, sort, map, selection, request, and status.
>
> Second, the operational experience: queue, policy indicators, clarification,
> approval or rejection, live revalidation, booking, and exception handling.
>
> Third, the administration experience: clients, sites, role levels, effective
> policies, access, and supplier integration configuration.
>
> They share one business journey. They do not need to be one user interface
> or one deployment.

### 03:15–04:15 — Draw the boundary

> For a first release, I would place the boundary deliberately.
>
> In scope: destination and site selection, search, list and map views, policy
> evaluation, request submission, operator decision, operator-triggered
> booking, confirmation, configuration, notification, and audit.
>
> Not assumed yet: employee self-booking, flights, ground transport, group
> travel, multi-city trips, multiple suppliers, complex amendments, or
> automated financial reconciliation.
>
> Those may be valuable. But good architecture begins by protecting the first
> outcome from the weight of every possible future.

### 04:15–05:00 — Reveal the key distinction

> There is one distinction I would put on the wall of every workshop:
>
> **An approved request is not a confirmed booking.**
>
> Between those two moments, availability can disappear. Price can change.
> Taxes can change. Payment conditions can change. A supplier call can time
> out after creating a reservation.
>
> So our lifecycle must say what is true:
>
> `SUBMITTED`. `APPROVED`. `BOOKING_IN_PROGRESS`. `BOOKING_UNCERTAIN`.
> `BOOKING_FAILED`. `BOOKED`.
>
> Honest states create honest operations.
>
> With that shared understanding, I would not begin discovery by drawing more
> boxes. I would begin by finding the decisions hidden inside the requirement.

## 05:00–17:00 — Discovery questions

### 05:00–06:15 — Explain the discovery method

> A discovery meeting can fail in two opposite ways.
>
> We can stay so high-level that everyone agrees, but nobody has agreed on the
> same thing.
>
> Or we can dive so quickly into technology that we make permanent decisions
> around temporary assumptions.
>
> I use questions to find decision boundaries. For every important question I
> want four things: the decision, the owner, the date, and the evidence needed
> to close it.
>
> I would organise the questions into four conversations: business outcome,
> policy, booking and payment, and platform trust.

### 06:15–08:15 — Business outcome and operating model

> First: what outcome makes this worth building?
>
> Is success fewer emails to a travel desk? Faster request-to-confirmation?
> Higher policy compliance? Lower accommodation cost? Better employee
> satisfaction? Better audit evidence?
>
> If we do not choose a measure, every feature becomes equally important.
>
> I would ask which countries, corporate sites, languages, and currencies must
> launch first. Is Tetrapak the first tenant of a reusable Sodexo capability,
> or is this intentionally Tetrapak-specific? I recommend a multi-client domain
> with a Tetrapak-first rollout, but commercial strategy must confirm that.
>
> I would ask whether the requester is always the traveller. An executive
> assistant may book for a C-Level employee. A booking operator may create a
> request on behalf of someone who cannot access the application. When that
> happens, the system must preserve both identities: who acted, and who
> travels.
>
> I would also clarify the approval model. The initial requirement describes a
> dedicated client team or operator. The broader user model may include line
> managers or corporate approvers. We should not silently invent a second
> approval layer. We need to decide whether approval is operator-only,
> manager-then-operator, or configurable by client and policy.
>
> And one control is non-negotiable: nobody approves their own request.

### 08:15–11:15 — Tell the policy story

> Now let us return to Anna.
>
> Suppose her policy says 180 euros per night for Lund. Search returns a room
> at 172 euros. It looks compliant.
>
> Then we learn breakfast is 15 euros, city tax is payable at the property, one
> night costs 205 euros, and the displayed total is in Swedish kronor.
>
> Is Anna compliant?
>
> The requirement says “right range of price per night per destination.” That
> sentence contains an entire policy engine.
>
> Does the cap include taxes and mandatory fees? Is it per room, per
> traveller, average night, highest night, or total stay? Which exchange-rate
> source is authoritative? At what time do we lock the rate? Are conversion
> charges included? Are discounts acceptable? Do refundable and
> non-refundable rooms follow the same rule?
>
> What happens if a hotel is one kilometre outside the office radius? Is
> distance a hard stop or an indicator? Do Directors receive a higher cap, a
> different room category, or both? Can a General Employee request an
> exception? The current discovery answer suggests the employee should not
> submit an out-of-policy option, while an authorised operator may act on the
> employee's behalf. That is a useful starting hypothesis, but policy owners
> must sign it off.
>
> I would model a policy result with more meaning than red or green:
>
> eligible or ineligible; compliant or non-compliant; limit and evaluated
> amount; policy version; reason codes; explanation; and whether an authorised
> override path exists.
>
> The employee should see plain language: “Within your Lund nightly limit,
> including mandatory taxes.” The operator should see the evidence behind that
> sentence.
>
> This is important because policy is not only a filter. It is a business
> decision that must remain explainable months later.

### 11:15–14:15 — Booking, payment, and support

> The next questions decide whether integrated booking is feasible at all.
>
> Who owns the Booking.com partner relationship? Is Sodexo already enabled for
> the required search-look-book capabilities? Which API version and endpoints
> are contractually available? What are the rate limits? Is there a usable
> sandbox?
>
> The current Demand API uses an API bearer token and affiliate ID. Search
> access does not automatically answer whether this application is allowed to
> create orders. Commercial eligibility is an architecture input.
>
> Then we ask the question teams often leave until too late: who pays?
>
> Is the merchant of record Booking.com, Sodexo, Tetrapak, or the property?
> Does the operator use a corporate card, virtual card, employee card, or pay
> at property? Who owns invoices, refunds, chargebacks, cancellations,
> no-shows, and reconciliation?
>
> These are not “finance details after the API is built.” They determine the
> data we collect, the security controls, the order flow, the support model,
> and sometimes the legal design.
>
> Finally: when Anna's plans change at 10 p.m., who helps her? Sodexo,
> Tetrapak, Booking.com, or the property? A beautiful booking journey without a
> service journey is only half a product.

### 14:15–16:00 — Identity, data, security, and scale

> The B2C Lego will leverage existing authentication. Good. But
> authentication answers “Who are you?” It does not automatically answer
> “What are you allowed to book?”
>
> I would ask which trusted claims are already available: employee identity,
> client, role level, cost centre, manager, country, and delegated authority.
> Which system is authoritative for each? How quickly do changes propagate? If
> Anna becomes a Director today, when does her new policy apply?
>
> None of those entitlements should arrive as editable fields from the browser.
> The server resolves them from trusted identity and profile sources.
>
> We also need data-classification decisions. What traveller data may Sodexo
> store? In which region? For how long? What must be deleted, masked, encrypted,
> or tokenised? Which supplier payload fields are permitted to remain for
> support and audit?
>
> And I would ask for volume, not because I want to over-engineer, but because
> “global employee application” is not a capacity number. We need employee
> population, concurrent searches, seasonal peaks, conversion rate, countries,
> and operator service-level expectations.

### 16:00–17:00 — Put five blockers on one slide

> At the end of this section, I would place five decisions on the screen:
>
> One: Booking.com commercial and API eligibility.
>
> Two: payment and merchant-of-record model.
>
> Three: exact policy calculation.
>
> Four: authoritative employee-role source.
>
> Five: operating and support ownership.
>
> I would not hide those unknowns. I would make them visible, assign an owner
> and date, and use them as readiness gates.
>
> Architecture is not the art of pretending uncertainty has disappeared.
> It is the discipline of making uncertainty manageable.

## 17:00–27:00 — Initial high-level data model

### 17:00–18:00 — Introduce the model as evidence

> Let me now show the first data model.
>
> It is conceptual. It does not select a database. It does not duplicate the
> HR system. Its purpose is to reveal what the B2C accommodation domain must
> know, own, and remember.
>
> I divide it into two areas: configuration and identity; then request and
> booking.

### 18:00–21:00 — Configuration and identity tables

> At the root is `client`.
>
> It represents Tetrapak today and another corporate client tomorrow. It
> carries the tenant identity, default currency, timezone, status, and other
> client-level context.
>
> Every business row is scoped by `client_id`. Not only the user interface.
> Not only the API route. The query, identifier, cache key, audit event, and
> authorization decision are all tenant-scoped.
>
> Next is `employee_travel_profile`. This is a reference to trusted employee
> context: external identity, client, role level, cost centre, and status. I
> would copy only the attributes the booking record must preserve. The source
> of truth remains the enterprise identity or employee system.
>
> `role_level` stores General Employee, Director, C-Level, and future
> client-specific levels. Codes and effective assignments matter more than
> labels.
>
> `destination_site` stores the client's approved countries and offices:
> country, city, address, coordinates, search radius, and active status. This
> drives the destination list and gives the map and supplier search a governed
> origin.
>
> Then `travel_policy`: client, role level, destination scope, currency, price
> bounds, restrictions, effective dates, and version.
>
> The effective date and version are essential. Administrators do not edit
> history. They publish a new future-effective policy. A request created
> yesterday must still explain yesterday's decision.
>
> I may later separate a complex approval policy from a price-range model. At
> discovery stage, I care first that ownership and versioning are explicit.

### 21:00–24:30 — Request, approval, and supplier booking

> The workflow core is `booking_request`.
>
> It contains requester and traveller separately, client, site, dates,
> occupancy, business purpose, status, selected-offer snapshot, policy
> snapshot, and any authorised justification.
>
> Why snapshots?
>
> Imagine Anna selects a refundable room at 172 euros. Tomorrow the supplier
> returns 189 euros and non-refundable. If we store only a supplier product ID,
> we lose the truth Anna and Maya saw.
>
> So `OfferSnapshot` freezes the relevant property, room, displayed and total
> price, currency, charges, meal terms, cancellation conditions, and capture
> time.
>
> `PolicySnapshot` freezes the policy version, evaluated limits, result,
> reasons, and evaluation time.
>
> `approval` records the decision-maker, decision, reason, comments, override
> authority, and time. A later policy change cannot rewrite that decision.
>
> `supplier_booking` is deliberately separate from the request. It records the
> booking attempt or confirmed reservation, Booking.com reference, status,
> amount, currency, payment status, cancellation deadline, and confirmation
> snapshot.
>
> The internal request ID and the supplier order reference are different
> identities. That separation lets operations trace retries, supplier changes,
> and future integrations without corrupting the employee workflow.

### 24:30–26:00 — Reliability and audit records

> Two supporting records make the journey dependable.
>
> `audit_event` is immutable evidence: entity, event, actor, timestamp,
> before-and-after values, and correlation ID. It captures policy decisions,
> approvals, overrides, booking attempts, and configuration changes.
>
> `outbox_event` makes notifications reliable. We persist “Anna must be
> notified” in the same transaction as the state change. A worker can deliver
> it asynchronously. If the notification service is unavailable, the business
> event is not lost.
>
> For booking execution I would also introduce an `IdempotencyRecord`.
> It connects a booking command to its attempts and observed supplier outcome.
> It is the difference between “retry the call” and “recover the business
> truth.”

### 26:00–27:00 — Summarise the model

> The model follows five rules:
>
> Scope every business row by client.
>
> Reference authoritative employee data; copy only necessary evidence.
>
> Version policy and preserve snapshots.
>
> Separate request, decision, booking attempt, and confirmation.
>
> Represent money as amount plus ISO currency, with explicit tax and fee
> treatment.
>
> This is not a data model designed around screens.
>
> It is a data model designed around truth.

## 27:00–37:00 — High-level API flow

### 27:00–28:30 — Establish the boundary

> The most important integration decision is simple:
>
> **The React micro frontend does not call Booking.com directly.**
>
> Booking.com requests require partner credentials. Those credentials belong
> in enterprise secret management, never JavaScript, browser storage, logs, or
> an admin screen.
>
> The Lego calls a server-side accommodation BFF. The BFF validates the
> authenticated session, resolves client and employee context, exposes
> experience-oriented APIs, and delegates domain work. Behind it, a supplier
> adapter translates between Sodexo concepts and Booking.com contracts.
>
> The existing B2C host continues to own sign-in, session integration, and
> common shell capabilities. The Lego owns the accommodation experience. The
> server owns trust.

### 28:30–31:00 — Flow A: load and search

> Flow A begins when Anna opens the Lego.
>
> The Lego asks the BFF for booking context and available destinations.
>
> The server resolves Tetrapak and Anna's role from trusted sources. It returns
> only active sites and the context Anna is allowed to see.
>
> Anna selects Lund, dates, and occupancy. The Lego submits a search command
> with business inputs—not a raw supplier request.
>
> The domain resolves the effective policy for Tetrapak, Anna's role, Lund,
> and the travel date. The supplier adapter calls the Booking.com accommodation
> search and, where necessary, availability and property-content operations.
>
> The adapter normalises supplier data into our model. The policy component
> evaluates each proposal. The BFF returns a consumer-ready response:
> property, room, location, map coordinates, displayed and total price,
> currency, charges, cancellation conditions, policy status, and a human
> explanation.
>
> The same response can drive list, filter, sort, and map views. The map is a
> presentation of the same authorised result set, not a separate search path.
> And accessibility requires a complete non-map alternative.
>
> Search data may be selectively cached. But a cached offer is never treated
> as a confirmed price.

### 31:00–33:00 — Flow B: request and decision

> Anna selects a room and submits a request.
>
> The server does not blindly trust the card displayed in her browser. It
> rechecks the relevant offer and policy, captures the offer and policy
> snapshots, and persists `SUBMITTED`.
>
> An outbox event notifies the operator team.
>
> Maya opens her queue. She sees the request age, traveller and requester,
> destination, dates, selected offer, price breakdown, policy result, and
> reason codes. The UI provides indicators to help her decide; it does not
> replace accountable human judgment where the operating model requires it.
>
> Maya can approve, reject, request clarification, or escalate an authorised
> exception. The system records the decision and audit evidence.
>
> Notice the discipline: approval does not call the supplier and then hope the
> database catches up. It changes the request to an approved business state.
> Booking is the next controlled command.

### 33:00–35:30 — Flow C: create the reservation

> Now Maya chooses “Book.”
>
> At this moment, the system revalidates availability. It calls
> `orders/preview` to obtain final price, charges, payment options,
> cancellation conditions, and the order token needed for creation.
>
> That preview token is time-limited—Booking.com currently documents a
> 15-minute lifetime. That is why preview belongs close to the controlled
> booking action, not hours earlier when Anna first selects a room.
>
> The domain compares the live preview with the approved snapshots.
>
> If nothing material changed, it calls `orders/create` using the preview
> token and the approved booking and payment details.
>
> If price, availability, payment timing, or cancellation conditions changed
> beyond the agreed tolerance, the system does not quietly accept the change.
> It moves to a clearly named state and requests renewed approval or a new
> selection.
>
> On success, we persist the supplier reference and confirmation before
> notifying Anna and Maya.
>
> The employee sees `BOOKED` only when we have evidence of a booking.

### 35:30–37:00 — Tell the timeout story

> Now the difficult story.
>
> Maya clicks “Book.” The request reaches Booking.com. The reservation is
> created. But the network connection breaks before our system receives the
> response.
>
> What should the retry button do?
>
> If the answer is “send the same request again,” we may book two rooms.
>
> Instead, we record an uncertain outcome with the idempotency key, internal
> correlation ID, and supplier request ID. We query the external order outcome
> or reconcile through the supported order-detail path. Only when we know no
> booking exists may the workflow retry.
>
> This is why resilience is not merely three automatic retries.
>
> Resilience means recovering truth without creating harm.

## 37:00–45:00 — Architecture principles

### 37:00–38:00 — Introduce principles as promises

> Technology choices will evolve. Principles should survive them.
>
> I would use ten principles as the design test for every option. I will group
> them into four promises.

### 38:00–40:00 — Promise one: trust and isolation

> The first promise is that business rules cannot be bypassed.
>
> Supplier integration is server-side. Identity, client, and role context are
> trusted and resolved server-side. Every query is tenant-scoped. Privileged
> roles use least privilege and segregation of duties. Secrets are separated
> by environment and excluded from logs and administrative screens.
>
> “Manage API endpoint” should therefore mean managing a validated supplier
> integration profile: environment, approved base endpoint, version, timeouts,
> feature flags, and connectivity status. It should not mean that an
> administrator can paste an arbitrary URL or read a production credential.
>
> Security is not a gate added after the design. It is the shape of the
> boundary.

### 40:00–41:45 — Promise two: explainability

> The second promise is that every important decision can be explained.
>
> Policy is versioned domain logic, not scattered `if` statements in React.
> Policy results are explicit and readable. Offers and policies are
> snapshotted. Approvals, overrides, booking attempts, and configuration
> changes are audited.
>
> Six months after Anna's trip, finance should be able to ask, “Why was this
> room allowed?” And we should answer without reconstructing history from
> application logs.
>
> Audit is a product capability.

### 41:45–43:15 — Promise three: change and volatility

> The third promise is that change remains local.
>
> A supplier anti-corruption layer keeps Booking.com schemas outside the core
> B2C domain. That protects us from API-version changes and makes a future
> supplier additive rather than a rewrite.
>
> We revalidate volatile facts—availability, price, charges, payment, and
> cancellation terms—at the moment they matter.
>
> We cache only what may safely be stale. We version internal APIs and event
> contracts. We contract-test the supplier adapter.
>
> Booking.com Demand API 3.2, for example, strengthens multi-currency price and
> charge structures and changes parts of the inventory model. The domain should
> benefit from those capabilities without exposing every upstream change to
> Anna's Lego.

### 43:15–45:00 — Promise four: operational recovery

> The fourth promise is that failure is visible and recoverable.
>
> Booking commands are idempotent. Supplier calls have bounded timeouts,
> backoff with jitter, rate-limit handling, and circuit breaking. Notifications
> use an outbox. Operators see queue ageing, supplier failures, uncertain
> bookings, and reconciliation exceptions in a product view—not by searching
> logs.
>
> Initial targets might be 99.9 percent monthly availability for employee and
> operator journeys, policy evaluation below 200 milliseconds at p95, and
> request submission and queue loading below two seconds excluding supplier
> latency. Those are discovery hypotheses, not promises, until workload and
> commercial SLAs are known.
>
> Accessibility should meet the current Sodexo standard—ideally WCAG 2.1 AA or
> higher. Policy and booking status cannot rely on colour alone. The map must
> have a fully usable list alternative.
>
> Privacy, observability, accessibility, and support are not supporting
> chapters.
>
> Together, they are the customer experience.

## 45:00–50:00 — Next steps, roadmap, and close

### 45:00–47:00 — Sequence the workshops

> I would move from discovery to readiness through focused workshops, each with
> a named output.
>
> First, business outcome and scope: sponsor, product, and operations agree
> success measures, users, launch countries, and MVP boundary.
>
> Second, employee and operator journey: product, UX, operators, and support
> walk the happy path and the difficult paths—changed price, unavailable room,
> clarification, cancellation, and uncertain booking.
>
> Third, policy and entitlement: travel-policy owners, finance, product, and
> architecture define the exact rule vocabulary, precedence, FX treatment,
> exceptions, and effective dating.
>
> Fourth, payment and operating model: finance, procurement, legal, and
> operations decide payer, merchant of record, cards, invoices, refunds,
> disputes, and support ownership.
>
> Fifth, Booking.com capability validation: the account owner, Booking.com,
> procurement, architecture, and engineering confirm contractual eligibility,
> API version, endpoints, limits, sandbox, payment capabilities, and
> reconciliation support.
>
> Sixth, identity, data, security, and privacy: confirm authoritative sources,
> role mapping, data classification, residency, retention, encryption, access,
> and audit controls.
>
> Seventh, a technical spike: prove the authenticated Lego-to-BFF path and the
> critical sandbox search-preview-create sequence without committing to the
> production design.
>
> Then an NFR and operational-readiness workshop converts real volumes and
> service expectations into SLOs, monitoring, reconciliation, runbooks, and
> support readiness.

### 47:00–48:30 — Offer a risk-reducing delivery path

> I would propose three increments.
>
> Increment one: search and request. Validate destinations, policy, the
> employee experience, operator queue, and manual booking completion. This can
> create value while proving the operating model and avoiding premature
> payment integration.
>
> Increment two: integrated operator booking. Add live preview, create,
> confirmation, idempotency, uncertain-outcome recovery, and reconciliation.
>
> Increment three: post-booking and optimisation. Add the supported
> modification and cancellation journeys, reporting, automation, and—when
> there is a real commercial need—additional suppliers.
>
> This is not architecture by postponement. It is architecture by evidence.
> Each increment retires a different class of risk.

### 48:30–50:00 — Final close

> Let me close where we began.
>
> Anna does not want a micro frontend.
>
> She wants to arrive in Lund and know there is a room waiting for her.
>
> Tetrapak does not want another collection of APIs.
>
> It wants travel policy applied consistently, spend controlled, and every
> decision explainable.
>
> Maya does not want another queue.
>
> She wants the right information, the right controls, and a safe way to
> recover when the real world does not behave like a happy-path diagram.
>
> And Sodexo should not build a Tetrapak exception.
>
> It should build a reusable accommodation capability that begins with
> Tetrapak, fits naturally inside B2C, and earns the right to grow.
>
> The architecture I have outlined does that by separating intent from
> reservation, policy from presentation, supplier contracts from the domain,
> and retries from recovery.
>
> The next decision is not “Which framework do we code first?”
>
> The next decision is whether we agree on the five readiness gates, their
> owners, and the evidence required to close them.
>
> If we agree on that, we can move quickly.
>
> More importantly, we can move with confidence.
>
> Thank you. I welcome your questions.

## 50:00–60:00 — Q&A playbook

Use the answer pattern **headline → reason → trade-off → decision needed**.
Keep the first answer under 60 seconds; expand only if invited.

### “Why do we need a BFF? Why not call Booking.com from React?”

> Because the browser is not a trusted boundary. The supplier token and
> affiliate identity must remain server-side, and the employee must not be able
> to bypass policy by changing a request in developer tools. The BFF also gives
> the Lego an experience-oriented contract and isolates it from supplier API
> changes. The trade-off is another deployable component, but it centralises
> security, policy, audit, and resilience where they can be governed.

### “Are you proposing too many microservices for an MVP?”

> I am proposing domain boundaries, not insisting each boundary becomes an
> independent service on day one. We can begin with a modular deployment if
> team topology, scale, and change rate do not justify separate services. The
> non-negotiable part is ownership: policy, request workflow, and supplier
> integration should not become one undifferentiated codebase. We split
> deployment when there is evidence to do so.

### “Why not allow employees to book directly?”

> The stated operating model requires operator validation, and the payment,
> policy-exception, and merchant-of-record decisions are still open.
> Request-first gives Tetrapak control and gives Sodexo a safe initial release.
> If a later policy permits straight-through booking for compliant offers, the
> same state machine can automate the approval step. I would earn automation
> from operational evidence rather than assume it.

### “How will role-based price limits work?”

> As effective-dated, client-scoped policy data. The server resolves the
> employee's trusted role, destination, travel date, and currency context, then
> evaluates the applicable rule. The response includes both the result and its
> explanation. Before implementation, policy owners must decide whether limits
> use average night, highest night, or total stay; whether taxes and fees are
> included; and which FX source and timestamp apply.

### “What if the price changes after approval?”

> We preview immediately before booking and compare the final supplier terms
> with the approved offer and policy snapshots. A change within an explicitly
> authorised tolerance may continue. A material change moves the request to a
> named state and asks for renewed approval or selection. We never silently
> replace the employee's choice.

### “How do you prevent duplicate bookings?”

> With business idempotency and reconciliation, not only HTTP retries. Before
> the external create call, we persist an idempotency record linked to the
> request. If the outcome is uncertain, we query the supplier outcome using
> the available order and request identifiers before retrying. The operator
> sees the uncertain state and the recovery action is audited.

### “Would you store employee and payment data?”

> Only the minimum needed for booking, support, legal evidence, and
> reconciliation. Authoritative employee data remains referenced. Required
> snapshots preserve only the decision context. Sensitive traveller and
> payment identifiers are encrypted or tokenised, access is role-controlled,
> and supplier payload retention is minimised. Exact fields, residency, and
> retention require privacy, security, legal, and finance decisions before
> build.

### “How does the map view affect architecture?”

> It is another presentation of the same policy-evaluated result set. It must
> not become a separate route around entitlement. We need to choose the
> approved map provider, credential model, browser-versus-server access,
> licensing, data residency, and cost controls. Accessibility requires an
> equivalent sortable and filterable list.

### “How would you scale this to other Sodexo clients?”

> Client scope is part of every domain model and authorization decision.
> Roles, destinations, policies, currencies, and effective dates are
> configuration, not Tetrapak branches in code. The supplier adapter is
> independent of the client. We would first validate that product and
> commercial teams truly want a shared capability, then use Tetrapak as the
> proving tenant.

### “What is the biggest risk?”

> The largest risk is not React or the search endpoint. It is committing to
> integrated booking before commercial eligibility, payment ownership, exact
> policy logic, employee-role authority, and operational support are agreed.
> Those five decisions change the architecture. That is why I make them
> readiness gates and run a sandbox spike before estimation.

### “What would you do in your first two weeks?”

> I would nominate decision owners, run the business-scope and policy
> workshops, validate the Booking.com partner capabilities, map the
> authoritative identity claims, and prepare the authenticated sandbox spike.
> In parallel, I would baseline the employee and operator journeys including
> changed-price and uncertain-booking scenarios. At the end of two weeks I
> would play back decisions, blockers, a refined MVP boundary, and the evidence
> still required for estimation.

## Final 30-second fallback close

Use this if Q&A consumes the ending:

> The central idea is simple: we are not adding hotel search to B2C; we are
> creating a governed path from employee intent to a trustworthy reservation.
> If we preserve trusted identity, versioned policy, explicit workflow states,
> server-side supplier integration, and recoverable booking, we can give
> Tetrapak control without making the employee experience complicated. The
> immediate next step is to close the five readiness decisions and prove the
> critical path in the Booking.com sandbox.

## Current official API checkpoints

Before presenting, recheck the partner contract and current Booking.com
documentation. At the time this narration was prepared:

- Demand API v3 or above requires an API bearer token and affiliate ID on
  requests. See [Authentication and authorisation](https://developers.booking.com/demand/docs/development-guide/authentication).
- Demand API v3.2 documents multi-currency price structures and a unified
  accommodation availability model. See the
  [v3.2 migration overview](https://developers.booking.com/demand/docs/migration-guide/v3.2/changes).
- The controlled booking path uses `orders/preview` followed by
  `orders/create`; the preview response provides the order token. See
  [Create your orders](https://developers.booking.com/demand/docs/orders-api/order-preview-create).
- Search, look, and book capability depends on the partner's enabled
  integration and commercial permissions. See the
  [Demand API overview](https://developers.booking.com/demand/docs/getting-started/overview).
