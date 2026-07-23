---
id: introduction
title: Accommodation Booking Solution
slug: /
sidebar_position: 1
---

# Accommodation Booking Solution

This knowledge base describes the discovery, requirements, architecture,
controls, delivery approach, and operating model for an employee accommodation
booking capability embedded in the existing Sodexo B2C application.

## Current position

Tetrapak employees will search Booking.com accommodation inventory and submit a
booking request. A client-side operator will review the request, validate it
against corporate travel policy, and complete the reservation.

The proposed integration is server-side: the React accommodation Lego
communicates with an Accommodation Booking Backend-for-Frontend and domain
service. That service protects supplier credentials, applies policy, manages
workflow state, normalises Booking.com responses, and retains an auditable
record.

:::warning Discovery gates

Full booking scope depends on confirming Booking.com commercial access, the
payment and merchant-of-record model, exact policy calculations, and the
authoritative source of employee levels.

:::

## How to use this documentation

- **Executives and sponsors:** start with Executive Overview, Business and
  Product, Governance and Risk, and Roadmap and Migration.
- **Product and operations:** use User and Organisation Model, Accommodation
  Supply, Booking and Servicing, and Operational Playbooks.
- **Architecture and engineering:** use Domain Design, Integrations, API and
  Event Contracts, Solution Architecture, Security, Quality, and Platform
  Operations.
- **Finance and procurement:** use Payments, Billing and Finance, plus the open
  decisions in Governance and Risk.

Pages without source-backed content have intentionally been left empty.
