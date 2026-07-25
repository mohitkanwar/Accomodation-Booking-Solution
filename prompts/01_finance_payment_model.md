# Prompt: Payment and Merchant Model Deep Dive
## Goal
Generate detailed documentation covering all financial processes of the booking platform, specifically addressing merchant-of-record responsibilities, tax calculation rules, multi-currency settlements, and payment failure/retry mechanisms.

## Scope Requirements
1.  **Merchant Identity:** Define which entity acts as the record holder for payments (the Booking Platform, the Accommodation Provider, or a third party). Specify failover logic if multiple entities are involved.
2.  **Taxation & Regulation:** Detail how local and international taxes (VAT/GST) are calculated based on booking parameters and jurisdictional laws. Document required fields for tax exemption certifications.
3.  **Currency Flow:** Map out the entire currency conversion lifecycle, including source exchange rates, settlement dates, and handling of fluctuation risk.
4.  **Dispute Resolution:** Define the process and documentation flow when a payment is disputed (chargebacks) or fails.

## Required Inputs/Reviewees
*   Primary input: Financial Policy Guidelines document.
*   Must be reviewed by: Finance Stakeholders, Legal Counsel.

## Output Format
A formal Architectural Decision Record (ADR) and associated financial flow diagrams (PlantUML/C4).