// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  documentationSidebar: [
    'introduction',
    {
      type: 'category',
      label: '1. Align',
      collapsed: false,
      items: [
        'workshop/workshop-overview',
        'workshop/executive-alignment',
      ],
    },
    {
      type: 'category',
      label: '2. Business and Product',
      collapsed: false,
      items: [
        'workshop/scope-and-success',
        'workshop/people-and-roles',
        'workshop/end-to-end-journey',
        'workshop/policy-and-business-rules',
        'workshop/mvp-and-capabilities',
      ],
    },
    {
      type: 'category',
      label: '3. Shape the Solution',
      collapsed: false,
      items: [
        'workshop/solution-blueprint',
        'workshop/booking-lifecycle',
        'workshop/booking-com-integration',
      ],
    },
    {
      type: 'category',
      label: '4. Establish Trust',
      collapsed: false,
      items: [
        'workshop/data-security-and-privacy',
        'workshop/quality-resilience-and-operations',
      ],
    },
    {
      type: 'category',
      label: '5. Decide and Deliver',
      collapsed: false,
      items: [
        'workshop/decisions-risks-and-assumptions',
        'workshop/roadmap-and-workshop-outputs',
      ],
    },
  ],
};

module.exports = sidebars;
