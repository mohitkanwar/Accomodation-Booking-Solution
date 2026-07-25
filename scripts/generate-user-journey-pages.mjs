import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const usersPath = path.join(projectRoot, 'docs', 'presentation', 'users.mdx');
const pagesRoot = path.join(
  projectRoot,
  'docs',
  'presentation',
  'user-journeys',
);
const diagramsRoot = path.join(
  projectRoot,
  'docs',
  'presentation',
  'diagrams',
  'user-journeys',
);

const roleDefinitions = {
  traveller: {
    label: 'Traveller',
    folder: 'traveller',
    sourceFolder: 'traveller-journeys',
    surface: 'Sodexo B2C Accommodation Lego',
    edge: 'Accommodation Experience API',
  },
  approver: {
    label: 'Approver',
    folder: 'approver',
    sourceFolder: 'approver-journeys',
    surface: 'Approval Workspace',
    edge: 'Accommodation Experience API',
  },
  'corporate-admin': {
    label: 'Corporate Administrator',
    folder: 'corporate-administrator',
    sourceFolder: 'corporate-admin-journeys',
    surface: 'Corporate Administration Workspace',
    edge: 'Accommodation Experience API',
  },
  'booking-operator': {
    label: 'Booking Operator',
    folder: 'booking-operator',
    sourceFolder: 'booking-operator-journeys',
    surface: 'Booking Operations Workspace',
    edge: 'Accommodation Experience API',
  },
  'sodexo-admin': {
    label: 'Sodexo Administrator',
    folder: 'sodexo-administrator',
    sourceFolder: 'sodexo-admin-journeys',
    surface: 'Sodexo Employee Webapp',
    edge: 'Administration API',
  },
  'provider-agent': {
    label: 'Accommodation Provider Agent',
    folder: 'provider-agent',
    sourceFolder: 'provider-agent-journeys',
    surface: 'Provider Portal / PMS',
    edge: 'Provider Integration Adapter',
  },
};

const contract = (
  method,
  signature,
  purpose,
  service,
  {
    downstream = '',
    idempotency = 'Not required',
    mutation = false,
    store = `${service} data`,
  } = {},
) => ({
  method,
  signature,
  purpose,
  service,
  downstream,
  idempotency,
  mutation,
  store,
});

const api = {
  destinations: contract(
    'GET',
    '/api/v1/destinations?eligibleFor=me',
    'Return corporate sites and destinations allowed by the effective policy.',
    'Accommodation Service',
  ),
  search: contract(
    'POST',
    '/api/v1/accommodations/search',
    'Search policy-aware accommodation inventory for a destination and stay.',
    'Accommodation Service',
    {
      downstream: 'POST Booking.com /3.2/accommodations/search',
      idempotency: 'Search fingerprint for short-lived deduplication',
    },
  ),
  availability: contract(
    'POST',
    '/api/v1/accommodations/availability',
    'Recheck current products, prices, inventory, and policies.',
    'Accommodation Service',
    {
      downstream: 'POST Booking.com /3.2/accommodations/availability',
      idempotency: 'Read-only request',
    },
  ),
  createRequest: contract(
    'POST',
    '/api/v1/booking-requests',
    'Persist the selected offer, policy evidence, and approval request.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: Idempotency-Key',
      mutation: true,
    },
  ),
  getRequest: contract(
    'GET',
    '/api/v1/booking-requests/{requestId}',
    'Retrieve a scoped request with status and immutable history.',
    'Booking Workflow Service',
  ),
  listMyRequests: contract(
    'GET',
    '/api/v1/booking-requests?traveller=me',
    'List the authenticated traveller’s requests with filters and pagination.',
    'Booking Workflow Service',
  ),
  cancelRequest: contract(
    'POST',
    '/api/v1/booking-requests/{requestId}/cancel',
    'Cancel a request when its current workflow state permits cancellation.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: commandId',
      mutation: true,
    },
  ),
  updateRequest: contract(
    'PATCH',
    '/api/v1/booking-requests/{requestId}',
    'Update editable trip or accommodation requirements using optimistic locking.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: expectedVersion',
      mutation: true,
    },
  ),
  submitRequest: contract(
    'POST',
    '/api/v1/booking-requests/{requestId}/submit',
    'Re-evaluate policy and return the edited request to approval.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: commandId',
      mutation: true,
    },
  ),
  sendReminder: contract(
    'POST',
    '/api/v1/booking-requests/{requestId}/reminders',
    'Create a throttled approval reminder and notification event.',
    'Booking Workflow Service',
    {
      idempotency: 'One active reminder per configured interval',
      mutation: true,
    },
  ),
  getBooking: contract(
    'GET',
    '/api/v1/bookings/{bookingId}',
    'Retrieve a confirmed booking using tenant and user scope.',
    'Booking Workflow Service',
  ),
  confirmation: contract(
    'GET',
    '/api/v1/bookings/{bookingId}/confirmation',
    'Generate or retrieve the authorised confirmation document.',
    'Booking Workflow Service',
  ),
  emailConfirmation: contract(
    'POST',
    '/api/v1/bookings/{bookingId}/confirmation/email',
    'Queue a confirmation email to an authorised recipient.',
    'Booking Workflow Service',
    {
      idempotency: 'Deduplicate booking, recipient, and document version',
      mutation: true,
    },
  ),
  providerContact: contract(
    'GET',
    '/api/v1/bookings/{bookingId}/provider-contact',
    'Return the minimum provider contact details permitted for the booking.',
    'Booking Workflow Service',
  ),
  createIssue: contract(
    'POST',
    '/api/v1/bookings/{bookingId}/issues',
    'Open a support case linked to the booking and evidence.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: Idempotency-Key',
      mutation: true,
    },
  ),
  approvalQueue: contract(
    'GET',
    '/api/v1/approvals?status=pending',
    'List actionable requests within the approver’s organisational scope.',
    'Booking Workflow Service',
  ),
  approvalContext: contract(
    'GET',
    '/api/v1/approvals/{approvalId}/context',
    'Return request, offer, policy, conversation, and authority evidence.',
    'Booking Workflow Service',
  ),
  approvalDecision: contract(
    'POST',
    '/api/v1/approvals/{approvalId}/decisions',
    'Record approve or reject as an immutable, versioned decision.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: decisionId and expectedVersion',
      mutation: true,
    },
  ),
  clarification: contract(
    'POST',
    '/api/v1/approvals/{approvalId}/clarifications',
    'Pause the decision and send a scoped question to the traveller.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: messageId',
      mutation: true,
    },
  ),
  clarificationResponse: contract(
    'POST',
    '/api/v1/booking-requests/{requestId}/clarifications/{threadId}/responses',
    'Append the traveller response and resume approval evaluation.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: messageId',
      mutation: true,
    },
  ),
  changedOffer: contract(
    'GET',
    '/api/v1/approvals/{approvalId}/changed-offer',
    'Return original and replacement offer versions with material differences.',
    'Booking Workflow Service',
  ),
  policies: contract(
    'GET',
    '/api/v1/admin/policies',
    'List effective, draft, scheduled, and retired corporate policy versions.',
    'Accommodation Service',
  ),
  policyDraft: contract(
    'POST',
    '/api/v1/admin/policies',
    'Create a new immutable draft derived from an effective version.',
    'Accommodation Service',
    {
      idempotency: 'Required: Idempotency-Key',
      mutation: true,
    },
  ),
  policyPreview: contract(
    'POST',
    '/api/v1/admin/policies/{policyId}/preview',
    'Evaluate representative scenarios without publishing the draft.',
    'Accommodation Service',
  ),
  policyPublish: contract(
    'POST',
    '/api/v1/admin/policies/{policyId}/publish',
    'Schedule a validated policy version for activation.',
    'Accommodation Service',
    {
      idempotency: 'Required: expectedVersion',
      mutation: true,
    },
  ),
  roles: contract(
    'GET',
    '/api/v1/admin/roles-and-assignments',
    'List corporate roles, assignments, scopes, and effective dates.',
    'Access Control Service',
  ),
  roleChange: contract(
    'PUT',
    '/api/v1/admin/roles/{roleId}',
    'Create or update a versioned corporate role definition.',
    'Access Control Service',
    {
      idempotency: 'Required: expectedVersion',
      mutation: true,
    },
  ),
  assignmentChange: contract(
    'POST',
    '/api/v1/admin/role-assignments',
    'Grant, delegate, expire, or revoke a scoped assignment.',
    'Access Control Service',
    {
      idempotency: 'Required: assignmentCommandId',
      mutation: true,
    },
  ),
  adminDestinations: contract(
    'GET',
    '/api/v1/admin/destinations',
    'List destination and site configuration with effective status.',
    'Accommodation Service',
  ),
  destinationChange: contract(
    'PUT',
    '/api/v1/admin/destinations/{destinationId}',
    'Create or update a corporate destination and site mapping.',
    'Accommodation Service',
    {
      idempotency: 'Required: expectedVersion',
      mutation: true,
    },
  ),
  destinationPublish: contract(
    'POST',
    '/api/v1/admin/destinations/{destinationId}/publish',
    'Activate, suspend, or retire a destination version.',
    'Accommodation Service',
    {
      idempotency: 'Required: commandId',
      mutation: true,
    },
  ),
  priceRules: contract(
    'GET',
    '/api/v1/admin/price-rules',
    'List price limits by role, destination, currency, and effective period.',
    'Accommodation Service',
  ),
  priceRuleChange: contract(
    'PUT',
    '/api/v1/admin/price-rules/{ruleId}',
    'Save a versioned nightly range and exception behaviour.',
    'Accommodation Service',
    {
      idempotency: 'Required: expectedVersion',
      mutation: true,
    },
  ),
  priceRulePublish: contract(
    'POST',
    '/api/v1/admin/price-rules/{ruleId}/publish',
    'Publish a non-overlapping effective price-rule version.',
    'Accommodation Service',
    {
      idempotency: 'Required: commandId',
      mutation: true,
    },
  ),
  bills: contract(
    'GET',
    '/api/v1/billing/bills?status=awaiting-validation',
    'List bills and charge lines awaiting corporate validation.',
    'Accommodation Reconciliation Service',
  ),
  billEvidence: contract(
    'GET',
    '/api/v1/billing/bills/{billId}/evidence',
    'Return booking, invoice, tax, credit, and settlement evidence.',
    'Accommodation Reconciliation Service',
  ),
  validateBill: contract(
    'POST',
    '/api/v1/billing/bills/{billId}/validation',
    'Accept or dispute lines and record the validated payable amount.',
    'Accommodation Reconciliation Service',
    {
      idempotency: 'Required: validationId and expectedVersion',
      mutation: true,
    },
  ),
  payable: contract(
    'GET',
    '/api/v1/payments/payables/{payableId}',
    'Return validated amount, authority checks, disputes, and payment terms.',
    'Payment Orchestration Service',
  ),
  approvePayment: contract(
    'POST',
    '/api/v1/payments/payables/{payableId}/approval',
    'Record financial approval within the actor’s authority.',
    'Payment Orchestration Service',
    {
      idempotency: 'Required: approvalId',
      mutation: true,
    },
  ),
  submitPayment: contract(
    'POST',
    '/api/v1/payments/payables/{payableId}/instructions',
    'Submit or export a payment instruction to the enterprise finance system.',
    'Payment Orchestration Service',
    {
      downstream: 'Existing ESB / finance system',
      idempotency: 'Required: paymentInstructionId',
      mutation: true,
    },
  ),
  paymentStatus: contract(
    'GET',
    '/api/v1/payments/instructions/{instructionId}',
    'Return pending, settled, failed, partially paid, or reversed status.',
    'Payment Orchestration Service',
  ),
  corporateReport: contract(
    'POST',
    '/api/v1/reports/corporate',
    'Query authorised spend, policy, approval, cancellation, and audit measures.',
    'Accommodation Reporting Service',
  ),
  exportReport: contract(
    'POST',
    '/api/v1/reports/{reportId}/exports',
    'Create a masked, auditable export for an authorised recipient.',
    'Accommodation Reporting Service',
    {
      idempotency: 'Required: exportId',
      mutation: true,
    },
  ),
  bookingQueue: contract(
    'GET',
    '/api/v1/booking-work-items',
    'List booking, clarification, and exception work assigned to an operator scope.',
    'Booking Workflow Service',
  ),
  claimWork: contract(
    'POST',
    '/api/v1/booking-work-items/{workItemId}/claim',
    'Atomically claim or assign a work item and prevent duplicate handling.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: operatorId and expectedVersion',
      mutation: true,
    },
  ),
  workContext: contract(
    'GET',
    '/api/v1/booking-work-items/{workItemId}/context',
    'Return request, approval, selected offer, policy, and communication history.',
    'Booking Workflow Service',
  ),
  previewOrder: contract(
    'POST',
    '/api/v1/booking-work-items/{workItemId}/order-preview',
    'Preview final price, policies, and payment requirements.',
    'Booking.com Integration Service',
    {
      downstream: 'POST Booking.com /3.2/orders/preview',
      idempotency: 'Preview fingerprint',
    },
  ),
  createOrder: contract(
    'POST',
    '/api/v1/booking-work-items/{workItemId}/orders',
    'Create the supplier order using the short-lived preview token.',
    'Booking.com Integration Service',
    {
      downstream: 'POST Booking.com /3.2/orders/create',
      idempotency: 'Required: Idempotency-Key and order token',
      mutation: true,
    },
  ),
  searchReplacement: contract(
    'POST',
    '/api/v1/booking-work-items/{workItemId}/replacement-search',
    'Search equivalent policy-compliant offers after a material change.',
    'Accommodation Service',
    {
      downstream: 'POST Booking.com /3.2/accommodations/search',
    },
  ),
  submitChangedOffer: contract(
    'POST',
    '/api/v1/booking-work-items/{workItemId}/changed-offer',
    'Persist the replacement offer and request renewed approval.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: offerVersion',
      mutation: true,
    },
  ),
  supplierOrderDetails: contract(
    'POST',
    '/api/v1/supplier-orders/details',
    'Query supplier state before deciding whether a retry is safe.',
    'Booking.com Integration Service',
    {
      downstream: 'POST Booking.com /3.2/orders/details',
    },
  ),
  retryBooking: contract(
    'POST',
    '/api/v1/booking-work-items/{workItemId}/retry',
    'Retry only after a conclusive absent result or an idempotent outcome.',
    'Booking Workflow Service',
    {
      idempotency: 'Reuse original Idempotency-Key',
      mutation: true,
    },
  ),
  modifyOrder: contract(
    'POST',
    '/api/v1/bookings/{bookingId}/modifications',
    'Submit an authorised accommodation modification.',
    'Booking.com Integration Service',
    {
      downstream: 'POST Booking.com /3.2/orders/modify',
      idempotency: 'Required: modificationId',
      mutation: true,
    },
  ),
  cancelOrder: contract(
    'POST',
    '/api/v1/bookings/{bookingId}/cancellations',
    'Submit an authorised cancellation with fee acknowledgement.',
    'Booking.com Integration Service',
    {
      downstream: 'POST Booking.com /3.2/orders/cancel',
      idempotency: 'Required: cancellationId',
      mutation: true,
    },
  ),
  createOnBehalf: contract(
    'POST',
    '/api/v1/booking-requests/on-behalf-of/{travellerId}',
    'Create a request while preserving actor and represented traveller identities.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: Idempotency-Key',
      mutation: true,
    },
  ),
  getIssue: contract(
    'GET',
    '/api/v1/booking-issues/{issueId}',
    'Return booking, communication, evidence, and ownership context.',
    'Booking Workflow Service',
  ),
  updateIssue: contract(
    'POST',
    '/api/v1/booking-issues/{issueId}/updates',
    'Append investigation progress, actions, and resolution evidence.',
    'Booking Workflow Service',
    {
      idempotency: 'Required: updateId',
      mutation: true,
    },
  ),
  tenantCreate: contract(
    'POST',
    '/api/v1/platform/tenants',
    'Create an inactive corporate tenant and regional configuration.',
    'Tenant Administration Service',
    {
      idempotency: 'Required: tenantExternalId',
      mutation: true,
    },
  ),
  tenantValidate: contract(
    'POST',
    '/api/v1/platform/tenants/{tenantId}/validation',
    'Validate identity mappings, localisation, users, and configuration.',
    'Tenant Administration Service',
  ),
  tenantActivate: contract(
    'POST',
    '/api/v1/platform/tenants/{tenantId}/activate',
    'Activate a fully validated tenant.',
    'Tenant Administration Service',
    {
      idempotency: 'Required: expectedVersion',
      mutation: true,
    },
  ),
  platformAccess: contract(
    'GET',
    '/api/v1/platform/access-assignments',
    'List privileged users, service accounts, roles, and scopes.',
    'Access Control Service',
  ),
  platformAccessChange: contract(
    'POST',
    '/api/v1/platform/access-assignments/commands',
    'Grant, modify, expire, or revoke privileged access.',
    'Access Control Service',
    {
      idempotency: 'Required: commandId',
      mutation: true,
    },
  ),
  integrationProfile: contract(
    'GET',
    '/api/v1/platform/integrations/{integrationId}',
    'Return endpoint, feature, resilience, and secret-reference configuration.',
    'Integration Configuration Service',
  ),
  integrationTest: contract(
    'POST',
    '/api/v1/platform/integrations/{integrationId}/tests',
    'Run a non-destructive connectivity and capability test.',
    'Integration Configuration Service',
    {
      downstream: 'Booking.com sandbox health/reference request',
      idempotency: 'Required: testRunId',
    },
  ),
  integrationPromote: contract(
    'POST',
    '/api/v1/platform/integrations/{integrationId}/promotions',
    'Promote a validated version with rollback metadata.',
    'Integration Configuration Service',
    {
      idempotency: 'Required: configurationVersion',
      mutation: true,
    },
  ),
  operations: contract(
    'GET',
    '/api/v1/platform/operations/health',
    'Return service health, latency, errors, queues, and supplier indicators.',
    'Operational Monitoring Service',
  ),
  operationFailure: contract(
    'GET',
    '/api/v1/platform/operations/failures/{failureId}',
    'Return correlated workflow, trace, event, and dependency evidence.',
    'Operational Monitoring Service',
  ),
  operationAction: contract(
    'POST',
    '/api/v1/platform/operations/failures/{failureId}/actions',
    'Trigger an authorised retry, escalation, or incident workflow.',
    'Operational Monitoring Service',
    {
      idempotency: 'Required: actionId',
      mutation: true,
    },
  ),
  reconciliationQueue: contract(
    'GET',
    '/api/v1/reconciliation/cases',
    'List unmatched, duplicate, and value-mismatch cases.',
    'Accommodation Reconciliation Service',
  ),
  reconciliationEvidence: contract(
    'GET',
    '/api/v1/reconciliation/cases/{caseId}/evidence',
    'Compare internal events, supplier orders, invoices, and payments.',
    'Accommodation Reconciliation Service',
    {
      downstream: 'Booking.com orders/details and existing finance integrations',
    },
  ),
  reconciliationResolve: contract(
    'POST',
    '/api/v1/reconciliation/cases/{caseId}/resolution',
    'Resolve or route a case without rewriting immutable history.',
    'Accommodation Reconciliation Service',
    {
      idempotency: 'Required: resolutionId',
      mutation: true,
    },
  ),
  operationalReport: contract(
    'POST',
    '/api/v1/platform/reports',
    'Generate scoped operational, failure, reconciliation, or audit data.',
    'Accommodation Reporting Service',
  ),
  scheduleReport: contract(
    'POST',
    '/api/v1/platform/reports/{reportId}/deliveries',
    'Export or schedule a masked report for authorised recipients.',
    'Accommodation Reporting Service',
    {
      idempotency: 'Required: deliveryId',
      mutation: true,
    },
  ),
  supportCase: contract(
    'GET',
    '/api/v1/platform/support-cases/{caseId}',
    'Return authorised, masked business and technical context.',
    'Support Investigation Service',
  ),
  supportEvidence: contract(
    'POST',
    '/api/v1/platform/support-cases/{caseId}/evidence-query',
    'Query logs, events, and configuration with purpose-based controls.',
    'Support Investigation Service',
  ),
  supportAction: contract(
    'POST',
    '/api/v1/platform/support-cases/{caseId}/actions',
    'Record an approved correction or coordinated remediation.',
    'Support Investigation Service',
    {
      idempotency: 'Required: actionId',
      mutation: true,
    },
  ),
  providerConfiguration: contract(
    'PUT',
    '/provider-api/v1/properties/{propertyId}',
    'Publish property, room, rate, policy, and availability configuration.',
    'Provider PMS / Channel Manager',
    {
      downstream: 'Booking.com provider distribution channel',
      idempotency: 'Required: configurationVersion',
      mutation: true,
    },
  ),
  reservationEvent: contract(
    'EVENT',
    'booking.reservation.created.v1',
    'Deliver a confirmed supplier reservation into the provider channel.',
    'Booking.com Distribution Channel',
    {
      idempotency: 'Deduplicate supplier reservation reference',
      mutation: true,
    },
  ),
  fulfilReservation: contract(
    'POST',
    '/provider-api/v1/reservations/{reservationId}/fulfilment',
    'Confirm fulfilment or raise a provider exception.',
    'Provider PMS / Channel Manager',
    {
      downstream: 'Booking.com distribution status update',
      idempotency: 'Required: fulfilmentCommandId',
      mutation: true,
    },
  ),
  providerChange: contract(
    'POST',
    '/provider-api/v1/reservations/{reservationId}/changes',
    'Apply or reject an amendment/cancellation and return commercial impact.',
    'Provider PMS / Channel Manager',
    {
      downstream: 'Booking.com distribution channel',
      idempotency: 'Required: changeId',
      mutation: true,
    },
  ),
  providerSupport: contract(
    'POST',
    '/provider-api/v1/reservations/{reservationId}/support-updates',
    'Return evidence, resolution, or escalation through the support channel.',
    'Provider Support Service',
    {
      downstream: 'Booking.com / Sodexo support channel',
      idempotency: 'Required: updateId',
      mutation: true,
    },
  ),
  providerInvoice: contract(
    'POST',
    '/provider-api/v1/invoices',
    'Submit invoice, tax, fee, credit, and settlement information.',
    'Provider Billing Service',
    {
      downstream: 'Existing commercial integration / ESB',
      idempotency: 'Required: providerInvoiceNumber',
      mutation: true,
    },
  ),
  providerDispute: contract(
    'POST',
    '/provider-api/v1/reconciliation/{caseId}/responses',
    'Supply correction or evidence for a reconciliation discrepancy.',
    'Provider Billing Service',
    {
      downstream: 'Accommodation Reconciliation Service',
      idempotency: 'Required: responseId',
      mutation: true,
    },
  ),
};

const designs = {
  'traveller-journey-1-select-accommodation': {
    apis: ['destinations', 'search', 'availability', 'createRequest'],
    chunks: [
      ['Choose destination and search', ['destinations', 'search']],
      ['Recheck offer and submit request', ['availability', 'createRequest']],
    ],
  },
  'traveller-journey-2-cancel-request': {
    apis: ['getRequest', 'cancelRequest'],
  },
  'traveller-journey-3-edit-request': {
    apis: ['getRequest', 'updateRequest', 'submitRequest'],
    chunks: [
      ['Load and edit the request', ['getRequest', 'updateRequest']],
      ['Re-evaluate and resubmit', ['submitRequest']],
    ],
  },
  'traveller-journey-4-view-requests': {
    apis: ['listMyRequests', 'getRequest'],
  },
  'traveller-journey-5-follow-up': {
    apis: ['getRequest', 'sendReminder'],
  },
  'traveller-journey-6-download-confirmation': {
    apis: ['getBooking', 'confirmation', 'emailConfirmation'],
    chunks: [
      ['Authorise and generate confirmation', ['getBooking', 'confirmation']],
      ['Deliver confirmation by email', ['emailConfirmation']],
    ],
  },
  'traveller-journey-7-view-contact-details': {
    apis: ['getBooking', 'providerContact'],
  },
  'traveller-journey-8-raise-issue': {
    apis: ['getBooking', 'createIssue'],
  },
  'approver-journey-1-manage-queue': {
    apis: ['approvalQueue', 'approvalContext'],
  },
  'approver-journey-2-review-request': {
    apis: ['approvalContext', 'availability'],
  },
  'approver-journey-3-approve-request': {
    apis: ['approvalContext', 'approvalDecision'],
  },
  'approver-journey-4-reject-request': {
    apis: ['approvalContext', 'approvalDecision'],
  },
  'approver-journey-5-seek-clarification': {
    apis: ['approvalContext', 'clarification', 'clarificationResponse'],
    chunks: [
      ['Request clarification', ['approvalContext', 'clarification']],
      ['Receive response and resume decision', ['clarificationResponse']],
    ],
  },
  'approver-journey-6-reassess-offer': {
    apis: ['changedOffer', 'approvalDecision'],
  },
  'corporate-admin-journey-1-manage-policies': {
    apis: ['policies', 'policyDraft', 'policyPreview', 'policyPublish'],
    chunks: [
      ['Draft and simulate policy', ['policies', 'policyDraft', 'policyPreview']],
      ['Publish effective version', ['policyPublish']],
    ],
  },
  'corporate-admin-journey-2-manage-roles': {
    apis: ['roles', 'roleChange', 'assignmentChange'],
    chunks: [
      ['Maintain role catalogue', ['roles', 'roleChange']],
      ['Change assignments and delegation', ['assignmentChange']],
    ],
  },
  'corporate-admin-journey-3-manage-destinations': {
    apis: ['adminDestinations', 'destinationChange', 'destinationPublish'],
    chunks: [
      ['Maintain destination configuration', ['adminDestinations', 'destinationChange']],
      ['Publish traveller-visible destination', ['destinationPublish']],
    ],
  },
  'corporate-admin-journey-4-manage-price-ranges': {
    apis: ['priceRules', 'priceRuleChange', 'priceRulePublish'],
    chunks: [
      ['Create or revise price rule', ['priceRules', 'priceRuleChange']],
      ['Publish effective rule', ['priceRulePublish']],
    ],
  },
  'corporate-admin-journey-5-validate-bills': {
    apis: ['bills', 'billEvidence', 'validateBill'],
    chunks: [
      ['Match bill and booking evidence', ['bills', 'billEvidence']],
      ['Accept or dispute charges', ['validateBill']],
    ],
  },
  'corporate-admin-journey-6-approve-payments': {
    apis: ['payable', 'approvePayment', 'submitPayment', 'paymentStatus'],
    chunks: [
      ['Approve validated payable', ['payable', 'approvePayment']],
      ['Submit and track payment', ['submitPayment', 'paymentStatus']],
    ],
  },
  'corporate-admin-journey-7-review-reports': {
    apis: ['corporateReport', 'exportReport'],
  },
  'booking-operator-journey-1-manage-queue': {
    apis: ['bookingQueue', 'claimWork', 'workContext'],
    chunks: [
      ['Prioritise and claim work', ['bookingQueue', 'claimWork']],
      ['Load complete booking context', ['workContext']],
    ],
  },
  'booking-operator-journey-2-create-booking': {
    apis: ['workContext', 'availability', 'previewOrder', 'createOrder'],
    chunks: [
      ['Validate approval and live offer', ['workContext', 'availability']],
      ['Preview and create supplier order', ['previewOrder', 'createOrder']],
    ],
  },
  'booking-operator-journey-3-handle-changed-offer': {
    apis: ['availability', 'searchReplacement', 'submitChangedOffer'],
    chunks: [
      ['Detect and replace changed offer', ['availability', 'searchReplacement']],
      ['Request renewed approval', ['submitChangedOffer']],
    ],
  },
  'booking-operator-journey-4-resolve-failed-booking': {
    apis: ['supplierOrderDetails', 'retryBooking'],
  },
  'booking-operator-journey-5-amend-cancel-reservation': {
    apis: ['getBooking', 'supplierOrderDetails', 'modifyOrder', 'cancelOrder'],
    chunks: [
      ['Assess current reservation and impact', ['getBooking', 'supplierOrderDetails']],
      ['Submit the authorised change', ['modifyOrder', 'cancelOrder']],
    ],
  },
  'booking-operator-journey-6-create-on-behalf': {
    apis: ['destinations', 'search', 'availability', 'createOnBehalf'],
    chunks: [
      ['Search under traveller policy', ['destinations', 'search']],
      ['Recheck and submit delegated request', ['availability', 'createOnBehalf']],
    ],
  },
  'booking-operator-journey-7-investigate-issue': {
    apis: ['getIssue', 'supplierOrderDetails', 'updateIssue'],
    chunks: [
      ['Gather internal and supplier evidence', ['getIssue', 'supplierOrderDetails']],
      ['Record and communicate resolution', ['updateIssue']],
    ],
  },
  'sodexo-admin-journey-1-onboard-tenant': {
    apis: ['tenantCreate', 'tenantValidate', 'tenantActivate'],
    chunks: [
      ['Create and configure tenant', ['tenantCreate', 'tenantValidate']],
      ['Activate validated tenant', ['tenantActivate']],
    ],
  },
  'sodexo-admin-journey-2-manage-access': {
    apis: ['platformAccess', 'platformAccessChange'],
  },
  'sodexo-admin-journey-3-configure-integrations': {
    apis: ['integrationProfile', 'integrationTest', 'integrationPromote'],
    chunks: [
      ['Configure and test supplier profile', ['integrationProfile', 'integrationTest']],
      ['Promote validated configuration', ['integrationPromote']],
    ],
  },
  'sodexo-admin-journey-4-monitor-operations': {
    apis: ['operations', 'operationFailure', 'operationAction'],
    chunks: [
      ['Detect and diagnose failure', ['operations', 'operationFailure']],
      ['Retry or escalate safely', ['operationAction']],
    ],
  },
  'sodexo-admin-journey-5-resolve-reconciliation': {
    apis: ['reconciliationQueue', 'reconciliationEvidence', 'reconciliationResolve'],
    chunks: [
      ['Compare internal and external evidence', ['reconciliationQueue', 'reconciliationEvidence']],
      ['Resolve or route exception', ['reconciliationResolve']],
    ],
  },
  'sodexo-admin-journey-6-generate-reports': {
    apis: ['operationalReport', 'scheduleReport'],
  },
  'sodexo-admin-journey-7-support-investigation': {
    apis: ['supportCase', 'supportEvidence', 'supportAction'],
    chunks: [
      ['Authorise and gather masked evidence', ['supportCase', 'supportEvidence']],
      ['Apply and record approved action', ['supportAction']],
    ],
  },
  'provider-agent-journey-1-manage-configuration': {
    apis: ['providerConfiguration'],
  },
  'provider-agent-journey-2-fulfil-reservation': {
    apis: ['reservationEvent', 'fulfilReservation'],
  },
  'provider-agent-journey-3-process-amendment': {
    apis: ['reservationEvent', 'providerChange'],
  },
  'provider-agent-journey-4-provide-support': {
    apis: ['reservationEvent', 'providerSupport'],
  },
  'provider-agent-journey-5-provide-invoices': {
    apis: ['providerInvoice'],
  },
  'provider-agent-journey-6-resolve-discrepancy': {
    apis: ['reconciliationEvidence', 'providerDispute'],
  },
};

const travellerDefinitions = [
  [
    'traveller-journey-1-select-accommodation',
    'Select accommodation',
    'Find a policy-eligible stay and submit the selected offer for approval.',
    [
      'Load eligible destinations under the traveller’s effective policy.',
      'Search Booking.com inventory for the dates and guest requirements.',
      'Recheck the selected product and preserve the displayed commercial terms.',
      'Create an accommodation request with policy evidence.',
    ],
  ],
  [
    'traveller-journey-2-cancel-request',
    'Cancel a submitted request',
    'Withdraw an unfulfilled request without corrupting approval or audit history.',
    [
      'Open the current request and verify that cancellation is allowed.',
      'Confirm the reason and expected request version.',
      'Cancel the workflow and notify affected approvers or operators.',
    ],
  ],
  [
    'traveller-journey-3-edit-request',
    'Edit a submitted request',
    'Change an editable request and return it through policy evaluation and approval.',
    [
      'Load the latest editable request version.',
      'Change destination, dates, guests, or requirements.',
      'Re-evaluate policy and invalidate stale approval where required.',
      'Resubmit the request with complete version history.',
    ],
  ],
  [
    'traveller-journey-4-view-requests',
    'View submitted requests',
    'See the traveller’s scoped request list and inspect one request’s current status.',
    [
      'List requests using status, date, and destination filters.',
      'Open one request with its approval, booking, and communication timeline.',
    ],
  ],
  [
    'traveller-journey-5-follow-up',
    'Follow up on a request awaiting approval',
    'Send a controlled reminder without creating notification spam.',
    [
      'Verify that the request still awaits an approver decision.',
      'Check reminder throttling and service-level rules.',
      'Create the reminder and notify the current approver.',
    ],
  ],
  [
    'traveller-journey-6-download-confirmation',
    'Download or email the confirmation letter',
    'Obtain an authorised confirmation document and optionally send it by email.',
    [
      'Open the confirmed booking and verify traveller ownership.',
      'Generate or retrieve the current confirmation version.',
      'Download it or queue delivery to an authorised email address.',
    ],
  ],
  [
    'traveller-journey-7-view-contact-details',
    'View accommodation contact details',
    'Reveal the minimum supplier contact information needed for a confirmed stay.',
    [
      'Open the confirmed booking.',
      'Verify tenant, traveller, and booking scope.',
      'Return the permitted property contact details.',
    ],
  ],
  [
    'traveller-journey-8-raise-issue',
    'Raise a booking issue',
    'Create a traceable support case for a confirmed or attempted booking.',
    [
      'Open the booking and select an issue category.',
      'Capture a safe description and supporting evidence.',
      'Create and route the issue while notifying the traveller.',
    ],
  ],
].map(([key, title, description, steps]) => ({
  key,
  title,
  description,
  steps,
  roleKey: 'traveller',
}));

const source = await readFile(usersPath, 'utf8');
const scenarioPattern =
  /<JourneyScenario\s+title="([^"]+)"\s+description="([^"]+)"\s*>\s*([\s\S]*?)<\/JourneyScenario>/g;
const parsedJourneys = [];

for (const match of source.matchAll(scenarioPattern)) {
  const [, title, description, body] = match;
  const diagram = body.match(
    /\.\/diagrams\/users\/([^/]+)\/([^/]+)\.puml/,
  );
  if (!diagram) {
    throw new Error(`No journey diagram found for: ${title}`);
  }
  const [, sourceFolder, key] = diagram;
  const roleEntry = Object.entries(roleDefinitions).find(
    ([, role]) => role.sourceFolder === sourceFolder,
  );
  if (!roleEntry) {
    throw new Error(`Unknown role folder: ${sourceFolder}`);
  }
  const steps = [...body.matchAll(/^\d+\.\s+(.+)$/gm)].map((item) =>
    item[1].trim(),
  );
  parsedJourneys.push({
    key,
    title,
    description,
    steps,
    roleKey: roleEntry[0],
  });
}

const journeys = [...travellerDefinitions, ...parsedJourneys];
if (journeys.length !== 41) {
  throw new Error(`Expected 41 journeys, found ${journeys.length}.`);
}

const missingDesigns = journeys
  .map((journey) => journey.key)
  .filter((key) => !designs[key]);
if (missingDesigns.length) {
  throw new Error(`Missing journey designs: ${missingDesigns.join(', ')}`);
}

await rm(pagesRoot, {recursive: true, force: true});
await rm(diagramsRoot, {recursive: true, force: true});

const sidebarGroups = [];
const userLinks = new Map();

for (const [roleKey, role] of Object.entries(roleDefinitions)) {
  const roleJourneys = journeys.filter((journey) => journey.roleKey === roleKey);
  const sidebarItems = [];

  for (const journey of roleJourneys) {
    const design = designs[journey.key];
    const slug = slugify(journey.title);
    const pageDir = path.join(pagesRoot, role.folder);
    const diagramDir = path.join(diagramsRoot, role.folder, slug);
    await mkdir(pageDir, {recursive: true});
    await mkdir(diagramDir, {recursive: true});

    const chunks =
      design.chunks ??
      [[
        'End-to-end interaction',
        design.apis,
      ]];
    const diagrams = [];
    for (const [index, [chunkTitle, operationKeys]] of chunks.entries()) {
      const fileName = `${String(index + 1).padStart(2, '0')}-${slugify(chunkTitle)}.puml`;
      const diagramPath = path.join(diagramDir, fileName);
      await writeFile(
        diagramPath,
        renderSequenceDiagram(
          journey,
          role,
          chunkTitle,
          operationKeys.map((key) => api[key]),
        ),
        'utf8',
      );
      diagrams.push({
        title: chunkTitle,
        reference: `../../diagrams/user-journeys/${role.folder}/${slug}/${fileName}`,
      });
    }

    const pagePath = path.join(pageDir, `${slug}.md`);
    await writeFile(
      pagePath,
      renderJourneyPage(journey, role, design, diagrams),
      'utf8',
    );

    const docId = `presentation/user-journeys/${role.folder}/${slug}`;
    sidebarItems.push(docId);
    userLinks.set(journey.key, `./user-journeys/${role.folder}/${slug}`);
  }

  sidebarGroups.push({
    label: role.label,
    items: sidebarItems,
  });
}

await writeFile(
  path.join(pagesRoot, '_generated-sidebar.json'),
  `${JSON.stringify(sidebarGroups, null, 2)}\n`,
  'utf8',
);

const updatedUsers = addJourneyLinks(source, userLinks);
await writeFile(usersPath, updatedUsers, 'utf8');

console.log(
  `Generated ${journeys.length} journey pages and ` +
    `${journeys.reduce((total, journey) => {
      const design = designs[journey.key];
      return total + (design.chunks?.length ?? 1);
    }, 0)} sequence diagrams.`,
);

function renderJourneyPage(journey, role, design, diagrams) {
  const contracts = design.apis.map((key) => api[key]);
  const primary = [...contracts].reverse().find((item) => item.mutation) ??
    contracts.at(-1);
  const errors = buildErrors(contracts);
  const request = representativeRequest(primary, journey);
  const response = representativeResponse(primary, journey);

  return `---
title: "${escapeYaml(journey.title)}"
sidebar_label: "${escapeYaml(journey.title)}"
description: "${escapeYaml(journey.description)}"
---

# ${journey.title}

**Primary actor:** ${role.label}<br />
**Outcome:** ${journey.description}

:::info Contract status

Paths under \`/api/v1\` and \`/provider-api/v1\` are proposed solution
contracts for discovery. Booking.com paths are supplier contracts from Demand
API v3.2 and must be validated against the access enabled for the partner
account.

:::

## Preconditions and completion

**Preconditions**

- The actor is authenticated and the API derives tenant, user, and role scope
  from trusted claims.
- The referenced resource belongs to the actor’s authorised organisation and
  has a workflow state compatible with this journey.
- Correlation identifiers are propagated across synchronous calls and events.

**Completed when**

${journey.steps.map((step) => `- ${step}`).join('\n')}

## End-to-end sequence

${diagrams
  .map(
    (diagram, index) => `### ${index + 1}. ${diagram.title}

\`\`\`plantuml-image
${diagram.reference} | ${role.label} — ${journey.title} — ${diagram.title}
\`\`\``,
  )
  .join('\n\n')}

## API signatures

| Method | Signature | Responsibility | Owner / downstream | Idempotency |
|---|---|---|---|---|
${contracts
  .map(
    (item) =>
      `| \`${item.method}\` | \`${item.signature}\` | ${item.purpose} | ` +
      `${item.service}${item.downstream ? `<br/>${item.downstream}` : ''} | ` +
      `${item.idempotency} |`,
  )
  .join('\n')}

All internal endpoints require a bearer token and enforce tenant and role scope
server-side. Mutating endpoints also accept \`X-Correlation-Id\`; operations
marked idempotent require the stated command or idempotency key.

## Representative structures

The examples below show the primary contract for this journey:
\`${primary.method} ${primary.signature}\`.

### Request

\`\`\`json
${JSON.stringify(request, null, 2)}
\`\`\`

### Success response

\`\`\`json
${JSON.stringify(response, null, 2)}
\`\`\`

### Common response envelope

| Field | Type | Notes |
|---|---|---|
| \`requestId\` | UUID | Returned to the caller and logged across every hop. |
| \`id\` | String | Domain identifier; supplier identifiers remain separate fields. |
| \`status\` | String | Current domain or workflow state. |
| \`version\` | Integer | Used for optimistic locking on mutable aggregates. |
| \`occurredAt\` | ISO-8601 UTC | Server timestamp; UI renders it in the user’s timezone. |
| \`links\` | Object | Permitted next actions; absence means the action is unavailable. |

## Error scenarios

| Scenario | Expected behaviour | HTTP / outcome |
|---|---|---|
${errors
  .map(
    (error) =>
      `| ${error.scenario} | ${error.behaviour} | \`${error.outcome}\` |`,
  )
  .join('\n')}

Errors use a stable problem-details structure:

\`\`\`json
{
  "type": "https://errors.sodexo.example/accommodation/invalid-transition",
  "title": "The requested action is not valid in the current state",
  "status": 409,
  "code": "BOOKING_REQUEST_STATE_CONFLICT",
  "requestId": "01J...",
  "retryable": false,
  "errors": [
    {
      "field": "expectedVersion",
      "reason": "stale"
    }
  ]
}
\`\`\`

## Quality and control notes

- Never trust tenant, traveller, approver, or operator identifiers supplied by
  the browser when they can be derived from authenticated context.
- Preserve policy, offer, decision, supplier, and financial evidence as
  versioned snapshots rather than rewriting history.
- Do not log bearer tokens, payment-card data, personal documents, or complete
  supplier payloads.
- Retry only operations explicitly classified as retryable. Reuse the original
  idempotency key for a retry of the same business command.
- Publish domain events only after the authoritative transaction commits,
  using an outbox or equivalent atomic mechanism.

[Back to Entities and Users](../../users)
`;
}

function renderSequenceDiagram(journey, role, chunkTitle, operations) {
  const services = [...new Set(operations.map((item) => item.service))];
  const aliases = new Map(
    services.map((service, index) => [service, `Service${index + 1}`]),
  );
  const hasSupplier = operations.some((item) =>
    /Booking\.com/.test(item.downstream),
  );
  const hasEnterprise = operations.some((item) =>
    /ESB|finance/.test(item.downstream),
  );

  const participants = services
    .map(
      (service) =>
        `participant "${escapePlantUml(service)}" as ${aliases.get(service)}`,
    )
    .join('\n');

  const interactions = operations
    .map((item, index) => {
      const alias = aliases.get(item.service);
      const writeAction = item.mutation ? 'Validate transition and persist' : 'Authorise and query';
      const result = item.mutation ? 'Accepted state and next actions' : 'Scoped result';
      const lines = [
        `group ${index + 1}. ${escapePlantUml(item.purpose)}`,
        `  Actor -> Surface: ${escapePlantUml(actionLabel(item))}`,
        `  Surface -> Gateway: ${item.method} ${escapePlantUml(item.signature)}`,
        '  Gateway -> Edge: JWT, tenant scope, correlation ID',
        `  Edge -> ${alias}: ${escapePlantUml(item.purpose)}`,
        '  alt authorised and valid',
        `  ${alias} -> ${alias}: ${writeAction}`,
      ];
      if (/Booking\.com/.test(item.downstream)) {
        lines.push(
          `  ${alias} -> BookingCom: ${escapePlantUml(item.downstream.replace('Booking.com ', ''))}`,
          '  BookingCom --> ' + alias + ': Supplier response + request_id',
        );
      } else if (hasEnterprise && /ESB|finance/.test(item.downstream)) {
        lines.push(
          `  ${alias} -> Enterprise: ${escapePlantUml(item.downstream)}`,
          '  Enterprise --> ' + alias + ': Accepted / rejected',
        );
      } else {
        lines.push(`  ${alias} -> Data: Read or commit ${escapePlantUml(item.store)}`);
      }
      if (item.mutation) {
        lines.push(`  ${alias} -> Events: Publish committed domain event`);
      }
      lines.push(
        `  ${alias} --> Edge: ${result}`,
        '  Edge --> Surface: Response envelope',
        '  Surface --> Actor: Updated journey state',
        'else validation, state, or dependency failure',
        `  ${alias} --> Edge: Problem details + retryability`,
        '  Edge --> Surface: Safe error and next action',
        '  Surface --> Actor: Correct, retry later, or escalate',
        'end',
        'end',
      );
      return lines.join('\n');
    })
    .join('\n\n');

  return `@startuml
!include ../../../../../../plantuml/sodexo-theme.puml

title ${escapePlantUml(journey.title)} — ${escapePlantUml(chunkTitle)}
header Sat, 25 Jul 2026 · End-to-end discovery sequence
footer (c) Developed by <b>Mohit Kanwar</b>

hide footbox
autonumber
skinparam sequenceMessageAlign center
skinparam maxMessageSize 90

actor "${escapePlantUml(role.label)}" as Actor
participant "${escapePlantUml(role.surface)}" as Surface
participant "API Gateway" as Gateway
participant "${escapePlantUml(role.edge)}" as Edge
${participants}
database "Service-owned data" as Data
queue "Kafka event platform" as Events
${hasSupplier ? 'participant "Booking.com Demand API" as BookingCom #FBDADD' : ''}
${hasEnterprise ? 'participant "Existing ESB / enterprise system" as Enterprise #DDE1F6' : ''}

${interactions}

@enduml
`;
}

function buildErrors(contracts) {
  const errors = [
    {
      scenario: 'Unauthenticated or expired session',
      behaviour: 'Reject at the gateway; do not call a domain or supplier service.',
      outcome: '401',
    },
    {
      scenario: 'Actor is outside tenant, hierarchy, or role scope',
      behaviour: 'Return a generic denial without revealing whether the resource exists.',
      outcome: '403',
    },
    {
      scenario: 'Invalid fields or business rule violation',
      behaviour: 'Return field-level problem details; preserve the user’s safe draft.',
      outcome: '400 / 422',
    },
  ];
  if (contracts.some((item) => item.signature.includes('{'))) {
    errors.push({
      scenario: 'Resource is absent or hidden by scope',
      behaviour: 'Return the same not-found response for absent and inaccessible identifiers.',
      outcome: '404',
    });
  }
  if (contracts.some((item) => item.mutation)) {
    errors.push({
      scenario: 'Stale version, duplicate command, or invalid workflow transition',
      behaviour: 'Do not overwrite newer state; return the latest version and allowed actions.',
      outcome: '409',
    });
  }
  if (contracts.some((item) => item.downstream)) {
    errors.push({
      scenario: 'Supplier or enterprise dependency is slow, throttled, or unavailable',
      behaviour: 'Apply timeout and circuit-breaker policy; retry only safe operations and retain correlation evidence.',
      outcome: '429 / 502 / 503',
    });
  }
  return errors;
}

function representativeRequest(primary, journey) {
  const base = {
    requestId: '01JEXAMPLE...',
    expectedVersion: 7,
  };
  const signature = primary.signature;

  if (/search|availability/.test(signature)) {
    return {
      destinationId: 'site-paris-01',
      checkin: '2026-09-14',
      checkout: '2026-09-17',
      guests: {adults: 1, rooms: 1},
      booker: {country: 'fr', platform: 'desktop', travelPurpose: 'business'},
    };
  }
  if (/decisions/.test(signature)) {
    return {...base, decision: 'approved', reasonCode: 'WITHIN_POLICY', note: 'Business need confirmed'};
  }
  if (/cancel|cancellation/.test(signature)) {
    return {...base, reasonCode: 'TRAVEL_PLAN_CHANGED', acknowledgeFees: true};
  }
  if (/polic/.test(signature)) {
    return {
      ...base,
      effectiveFrom: '2026-10-01',
      rules: {
        eligibleRoleLevels: ['GENERAL_EMPLOYEE', 'DIRECTOR', 'C_LEVEL'],
        approvalRequired: true,
        maximumStayNights: 14,
      },
    };
  }
  if (/role|assignment|access/.test(signature)) {
    return {
      ...base,
      principalId: 'user-123',
      role: 'CORPORATE_APPROVER',
      scope: {tenantId: 'tenant-123', organisationUnitIds: ['ou-45']},
      effectiveFrom: '2026-08-01',
    };
  }
  if (/destination/.test(signature)) {
    return {
      ...base,
      country: 'FR',
      city: 'Paris',
      corporateSiteIds: ['site-paris-01'],
      status: 'active',
    };
  }
  if (/price-rule/.test(signature)) {
    return {
      ...base,
      roleLevel: 'DIRECTOR',
      destinationId: 'site-paris-01',
      currency: 'EUR',
      nightlyLimit: 240,
      enforcement: 'exception_approval',
    };
  }
  if (/bill|reconciliation/.test(signature)) {
    return {
      ...base,
      reference: 'invoice-2026-00192',
      lineDecisions: [{lineId: 'line-1', decision: 'accepted', validatedAmount: 480, currency: 'EUR'}],
      evidenceIds: ['booking-snapshot-1', 'supplier-invoice-1'],
    };
  }
  if (/payment|payable|instruction/.test(signature)) {
    return {
      ...base,
      payableId: 'payable-123',
      amount: 480,
      currency: 'EUR',
      costCentre: 'CC-TRAVEL-100',
      decision: 'approved',
    };
  }
  if (/report|export|deliver/.test(signature)) {
    return {
      period: {from: '2026-07-01', to: '2026-07-31'},
      scope: {tenantId: 'tenant-123', regions: ['EU']},
      measures: ['spend', 'policyExceptions', 'approvalLatency'],
      format: 'xlsx',
    };
  }
  if (/integration/.test(signature)) {
    return {
      ...base,
      environment: 'sandbox',
      baseUrl: 'https://demandapi-sandbox.booking.com/3.2',
      secretReference: 'vault://booking-com/sandbox/api-key',
      timeoutMs: 3000,
      retryLimit: 2,
    };
  }
  if (/tenant/.test(signature)) {
    return {
      ...base,
      externalId: 'tetrapak-global',
      legalName: 'Tetra Pak',
      defaultCurrency: 'EUR',
      locales: ['en-GB'],
      identityMapping: {issuer: 'existing-b2c-idp', organisationClaim: 'client_id'},
    };
  }
  if (/issue|support/.test(signature)) {
    return {
      ...base,
      category: 'RESERVATION_REFERENCE',
      description: 'Confirmation reference is not recognised by the property.',
      evidenceIds: ['attachment-123'],
      severity: 'normal',
    };
  }
  if (/order|booking-work-item/.test(signature)) {
    return {
      ...base,
      workItemId: 'work-123',
      bookingId: 'booking-123',
      supplierOrderToken: 'short-lived-secret-reference',
      idempotencyKey: 'order-command-123',
    };
  }
  if (/provider-api|reservation/.test(signature) || primary.method === 'EVENT') {
    return {
      ...base,
      supplierReservationId: 'supplier-res-123',
      propertyId: 'property-10004',
      stay: {checkin: '2026-09-14', checkout: '2026-09-17'},
      status: 'confirmed',
    };
  }
  return {
    ...base,
    journey: slugify(journey.title),
    resourceId: 'resource-123',
    action: actionLabel(primary),
    data: {reason: 'Business-authorised request'},
  };
}

function representativeResponse(primary, journey) {
  return {
    requestId: '01JEXAMPLE...',
    id: `${slugify(journey.title)}-123`,
    status: primary.mutation ? 'accepted' : 'available',
    version: primary.mutation ? 8 : 7,
    occurredAt: '2026-07-25T12:00:00Z',
    supplier: primary.downstream
      ? {requestId: 'booking-request-id', status: 'accepted'}
      : undefined,
    links: {
      self: primary.signature.replace(/\{[^}]+\}/g, 'resource-123'),
      allowedActions: primary.mutation ? ['view'] : ['continue'],
    },
  };
}

function addJourneyLinks(markdown, links) {
  let updated = markdown.replace(
    /\n{2,}\[Open detailed end-to-end journey →\]\([^)]+\)\n{2,}/g,
    '\n\n',
  );

  for (const [key, link] of links.entries()) {
    const diagramNeedle = `./diagrams/users/${sourceFolderForKey(key)}/${key}.puml`;
    const blockStart = updated.indexOf(diagramNeedle);
    if (blockStart < 0) {
      throw new Error(`Unable to add user-page link for ${key}`);
    }
    const fenceEnd = updated.indexOf('```', blockStart);
    const insertAt = updated.indexOf('\n', fenceEnd) + 1;
    updated =
      updated.slice(0, insertAt) +
      `\n[Open detailed end-to-end journey →](${link})\n` +
      updated.slice(insertAt);
  }
  return updated;
}

function sourceFolderForKey(key) {
  const role = Object.values(roleDefinitions).find((item) =>
    key.startsWith(item.sourceFolder.replace('-journeys', '-journey')),
  );
  if (role) return role.sourceFolder;
  if (key.startsWith('corporate-admin-journey')) return 'corporate-admin-journeys';
  if (key.startsWith('booking-operator-journey')) return 'booking-operator-journeys';
  if (key.startsWith('sodexo-admin-journey')) return 'sodexo-admin-journeys';
  if (key.startsWith('provider-agent-journey')) return 'provider-agent-journeys';
  throw new Error(`Cannot determine source folder for ${key}`);
}

function actionLabel(item) {
  return item.purpose.replace(/\.$/, '');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeYaml(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapePlantUml(value) {
  return value.replace(/"/g, "'").replace(/\n/g, ' ');
}
