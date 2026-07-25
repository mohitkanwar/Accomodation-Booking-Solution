// @ts-check

const journeySidebarGroups = require('./docs/presentation/user-journeys/_generated-sidebar.json');

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  documentationSidebar: [
    'introduction',
    {
      type: 'category',
      label: '1. Context and Understanding',
      link: {
        type: 'doc',
        id: 'presentation/context-and-understanding',
      },
      items: [
        {
          type: 'category',
          label: 'Entities and Users',
          link: {
            type: 'doc',
            id: 'presentation/users',
          },
          items: journeySidebarGroups.map((group) => ({
            type: 'category',
            label: group.label,
            items: group.items,
            collapsed: true,
          })),
          collapsed: true,
        },
      ],
      collapsed: false,
    },
    'presentation/discovery-questions',
    {
      type: 'category',
      label: '3. Initial Data Model',
      link: {
        type: 'doc',
        id: 'presentation/data-model',
      },
      items: ['presentation/domain-models'],
      collapsed: false,
    },
    {
      type: 'category',
      label: '4. High-Level API Flow',
      link: {
        type: 'doc',
        id: 'presentation/api-flow',
      },
      items: ['presentation/booking-com-integration'],
      collapsed: false,
    },
    {
      type: 'category',
      label: '5. Architecture Principles',
      link: {
        type: 'doc',
        id: 'presentation/architecture-principles',
      },
      items: ['presentation/non-functional-requirements'],
      collapsed: false,
    },
    'presentation/next-steps-and-workshops',
  ],
};

module.exports = sidebars;
