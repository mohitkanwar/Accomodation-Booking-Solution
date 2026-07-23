// @ts-check

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;
const packageJson = require('./package.json');
const navigationItems = require('./config/navigation.json');

const docsVersion = process.env.DOCS_VERSION || packageJson.version;
const buildTimestamp = process.env.BUILD_TIMESTAMP || new Date().toISOString();
const baseUrl = '/Accomodation-Booking-Solution/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Accommodation Booking Solution',
  tagline: 'Architecture and solution documentation',
  favicon: 'img/favicon.svg',
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#2B3797',
      },
    },
  ],

  url: 'https://mohitkanwar.github.io',
  baseUrl,

  organizationName: 'mohitkanwar',
  projectName: 'Accomodation-Booking-Solution',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  customFields: {
    docsVersion,
    buildTimestamp,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          remarkPlugins: [
            [require('./plugins/plantuml-images.js'), {baseUrl}],
          ],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Accommodation Booking Solution',
        logo: {
          alt: 'Accommodation Booking Solution',
          src: 'img/favicon.svg',
        },
        items: navigationItems.map(({id: _id, ...item}) => item),
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Accommodation Booking Solution.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
