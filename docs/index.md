---
id: introduction
title: Accommodation Booking Solution
slug: /
sidebar_position: 1
---

# Accommodation Booking Solution

This site is the shared workspace for discovering an employee accommodation
booking capability for the existing Sodexo B2C application. It is designed for
business owners, product owners, operations, architects, engineers, security,
finance, and delivery teams to make decisions together.

## The proposition

Tetrapak employees will search Booking.com accommodation inventory and submit a
booking request. A client-side operator will review the request, validate it
against corporate travel policy, and complete the reservation.

The working architectural direction is a React accommodation Lego backed by an
Accommodation Booking service. The backend protects supplier credentials,
applies policy, manages workflow state, normalises Booking.com responses, and
retains an auditable record.

:::warning Discovery gates

Do not commit to full in-app booking until Booking.com commercial access, the
payment and merchant-of-record model, policy calculations, and the source of
employee levels have been confirmed.

:::

## Use this site as a workshop

Work from top to bottom in the sidebar. Each page contains:

- **Current understanding** — the proposition or recommendation brought into
  the room.
- **Workshop questions** — points requiring cross-functional agreement.
- **Decisions and outputs** — evidence that must leave the workshop.

Start with [Workshop Overview](./workshop/workshop-overview.md).
