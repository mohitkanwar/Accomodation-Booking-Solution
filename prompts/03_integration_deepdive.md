# Prompt: Technical Integration Deep Dive Agent
## Goal
Generate exhaustive technical documentation outlining the integration specifications for critical third-party services that interact with the booking platform (e.g., Authentication Providers, Real-time Inventory Feeds, Payment Gateways).

## Scope Requirements
1.  **API Contracts:** For each external service, define required API endpoints, expected request/response schema examples (OpenAPI Spec style), and rate limits to respect.
2.  **Failure Modes & Resilience:** Document mandatory retry logic (exponential backoff recommended) for transient failures. Detail the graceful degradation path if a major external service is unavailable.
3.  **Data Mapping:** Provide detailed mapping specifications showing how specific fields from the external source map accurately into the internal Accommodation Booking Data Model, including handling of missing values.

## Required Inputs/Reviewees
*   Primary input: Technical Requirements Specification (TRSD) for each integration point.
*   Must be reviewed by: Technical Architects, DevOps Engineers.

## Output Format
A structured technical design document containing API specifications and resilience diagrams.