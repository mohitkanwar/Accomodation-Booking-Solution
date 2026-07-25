# Booking.com Demand API Postman workspace

This folder contains an executable Postman collection for the Booking.com
Demand API **v3.2**, arranged in the order in which an accommodation-booking
integration normally uses the APIs.

## Files

- `Booking.com-Demand-API-v3.2.postman_collection.json` — sequenced requests,
  response assertions, and variable-chaining scripts.
- `Booking.com-Sandbox.postman_environment.json` — safe sandbox template.
  Credential values are deliberately empty.

## Import and configure

1. Import both JSON files into Postman.
2. Select the **Booking.com Demand API - Sandbox** environment.
3. Set these environment values:
   - `booking_api_key` — API key token created in Booking.com Partner Centre.
   - `affiliate_id` — the API user's `X-Affiliate-Id`.
4. Keep `base_url` set to
   `https://demandapi-sandbox.booking.com/3.2` until sandbox testing is
   complete.
5. Run folders in numeric order. Requests capture IDs and tokens from
   successful responses for later requests.

The API key is represented as a Postman `secret` variable. Do not export a
populated environment into this repository. Personal exports should be named
`*.local.postman_environment.json` or stored under `postman/local/`; both are
git-ignored.

## Business-function sequence

### 00 — Validate access

Retrieves languages and currencies. Use this folder to confirm the bearer token
and affiliate ID before running a business flow.

### 01 — Build reference-data cache

Retrieves countries, cities, accommodation constants, chains, and property
content. These responses change less frequently and should normally be cached
by the integration.

### 02 — Search and look

1. Search destination inventory.
2. Capture an accommodation and product identifier.
3. Recheck live availability and price.
4. Retrieve full property details and review scores.

Prices and availability must not be treated as static cache data.

### 03 — Preview and book

1. Preview the selected product.
2. Capture the short-lived `order_token`.
3. Create the order.

Order creation is blocked unless `allow_order_create` is explicitly changed to
`true`. It defaults to `false`, even in sandbox.

### 04 — Post-booking operations

Retrieves the created order and its accommodation reservation details, then
provides guarded examples for date modification and cancellation.

Modification and cancellation are blocked unless
`allow_destructive_operations` is explicitly changed to `true`.

### 05 — Reconciliation and reporting

Retrieves orders by update window. The request is suitable for incremental
reporting and reconciliation jobs; advance `reconciliation_from` only after a
page has been processed successfully.

## Authentication

Every request inherits:

```text
Authorization: Bearer {{booking_api_key}}
X-Affiliate-Id: {{affiliate_id}}
Content-Type: application/json
```

Booking.com requires a Managed Affiliate Partner account, an agreed contract,
Partner Centre access, an API key token, and an affiliate ID. A normal
Booking.com traveller account alone cannot issue Demand API credentials.

## Official references

- https://developers.booking.com/demand/docs/getting-started/prerequisites
- https://developers.booking.com/demand/docs/development-guide/authentication
- https://developers.booking.com/demand/docs/development-guide/application-flows
- https://developers.booking.com/demand/docs/open-api/3.2/demand-api
