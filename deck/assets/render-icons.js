const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Fi = require('react-icons/fi');

const outDir = path.join(__dirname, 'icons');
fs.mkdirSync(outDir, { recursive: true });

// name -> react-icons/fi component
const icons = {
  target: 'FiTarget',
  users: 'FiUsers',
  user: 'FiUser',
  userCheck: 'FiUserCheck',
  settings: 'FiSettings',
  briefcase: 'FiBriefcase',
  shield: 'FiShield',
  home: 'FiHome',
  helpCircle: 'FiHelpCircle',
  layers: 'FiLayers',
  mapPin: 'FiMapPin',
  clock: 'FiClock',
  checkCircle: 'FiCheckCircle',
  alertTriangle: 'FiAlertTriangle',
  database: 'FiDatabase',
  gitBranch: 'FiGitBranch',
  server: 'FiServer',
  link: 'FiLink',
  messageSquare: 'FiMessageSquare',
  eye: 'FiEye',
  lock: 'FiLock',
  barChart: 'FiBarChart2',
  trendingUp: 'FiTrendingUp',
  compass: 'FiCompass',
  fileText: 'FiFileText',
  dollarSign: 'FiDollarSign',
  refreshCw: 'FiRefreshCw',
  search: 'FiSearch',
  calendar: 'FiCalendar',
  arrowRight: 'FiArrowRight',
  flag: 'FiFlag',
  globe: 'FiGlobe',
  clipboard: 'FiClipboard',
  cpu: 'FiCpu',
  zap: 'FiZap',
  xCircle: 'FiXCircle',
  download: 'FiDownload',
  phone: 'FiPhone',
  logIn: 'FiLogIn',
};

async function run() {
  for (const [name, componentName] of Object.entries(icons)) {
    const Component = Fi[componentName];
    if (!Component) {
      console.error(`Missing icon: ${componentName}`);
      continue;
    }
    const svgString = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Component, { color: '#FFFFFF', size: 256 })
    );
    const buf = await sharp(Buffer.from(svgString)).png().toBuffer();
    fs.writeFileSync(path.join(outDir, `${name}.png`), buf);
    console.log(`Wrote ${name}.png`);
  }
}

run();
