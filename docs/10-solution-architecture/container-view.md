---
title: Container View
sidebar_position: 3
---

# Container view

| Container | Responsibility |
| --- | --- |
| React Accommodation Micro Frontend | Employee search, results, map, request, and status |
| Operator UI | Review, approval, exception, and booking operations |
| Client Admin UI | Role policy, destination, and operator configuration |
| API Gateway / B2C Backend | Authenticated routing and platform integration |
| Accommodation BFF | UI-specific APIs and response composition |
| Policy and Entitlement Engine | Rule precedence and compliance evaluation |
| Search Service | Supplier search orchestration and pagination |
| Request Workflow Service | Request state and operator decisions |
| Booking Service | Preview, order, retrieval, cancellation, and recovery |
| Booking.com Adapter | Authentication, mapping, resilience, and supplier version isolation |
| Destination Service | Offices, coordinates, currencies, and search boundaries |
| Notification Adapter | Email, push, or inbox delivery |
| Scheduler / Reconciliation Worker | Stale requests, expiry, and uncertain outcomes |
| Accommodation Database | Configuration, requests, bookings, audit, and outbox |
| Cache | Stable destination, property, and reference data |
| Secret Vault | Supplier credentials |
