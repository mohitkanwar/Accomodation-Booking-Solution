// @ts-check

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
      items: ['presentation/users'],
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
    'presentation/architecture-principles',
    'presentation/next-steps-and-workshops',
  ],
};

module.exports = sidebars;
