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
    'presentation/data-model',
    'presentation/api-flow',
    'presentation/architecture-principles',
    'presentation/next-steps-and-workshops',
  ],
};

module.exports = sidebars;
