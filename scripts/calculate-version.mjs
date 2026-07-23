import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const VERSION_CONFIG = JSON.parse(
  readFileSync(new URL('../versioning.json', import.meta.url), 'utf8'),
);
const NAVIGATION_FILE = 'config/navigation.json';
const explain = process.argv.includes('--explain');

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', options.ignoreErrors ? 'ignore' : 'pipe'],
  }).trim();
}

function readFileAtRevision(revision, file) {
  try {
    const contents = git(['show', `${revision}:${file}`], {ignoreErrors: true});
    return contents ? JSON.parse(contents) : null;
  } catch {
    return null;
  }
}

function hasNewNavigationItem(commit) {
  const previousItems = readFileAtRevision(`${commit}^`, NAVIGATION_FILE);
  const currentItems = readFileAtRevision(commit, NAVIGATION_FILE);

  // Introducing the structured navigation file is a migration, not a new link.
  if (!previousItems || !currentItems) {
    return false;
  }

  const previousIds = new Set(previousItems.map((item) => item.id));
  return currentItems.some((item) => !previousIds.has(item.id));
}

function classifyCommit(commit) {
  const message = git(['log', '-1', '--format=%B', commit]);

  if (/\[major\]/i.test(message)) return 'major';
  if (/\[minor\]/i.test(message)) return 'minor';
  if (/\[patch\]/i.test(message)) return 'patch';

  if (hasNewNavigationItem(commit)) {
    return 'major';
  }

  const changes = git([
    'diff-tree',
    '--no-commit-id',
    '--name-status',
    '-r',
    commit,
  ])
    .split('\n')
    .filter(Boolean);

  const addsDocument = changes.some((change) => {
    const [status, ...pathParts] = change.split('\t');
    const path = pathParts.at(-1) || '';
    return status === 'A' && /^docs\/.+\.mdx?$/.test(path);
  });

  return addsDocument ? 'minor' : 'patch';
}

function increment(version, releaseType) {
  const [major, minor, patch] = version;

  if (releaseType === 'major') return [major + 1, 0, 0];
  if (releaseType === 'minor') return [major, minor + 1, 0];
  return [major, minor, patch + 1];
}

const version = VERSION_CONFIG.baseVersion.split('.').map(Number);
if (version.length !== 3 || version.some(Number.isNaN)) {
  throw new Error(`Invalid baseVersion: ${VERSION_CONFIG.baseVersion}`);
}

git(['merge-base', '--is-ancestor', VERSION_CONFIG.baseCommit, 'HEAD']);

const commitsOutput = git([
  'rev-list',
  '--reverse',
  `${VERSION_CONFIG.baseCommit}..HEAD`,
]);
const commits = commitsOutput ? commitsOutput.split('\n') : [];

let calculatedVersion = version;
for (const commit of commits) {
  const releaseType = classifyCommit(commit);
  calculatedVersion = increment(calculatedVersion, releaseType);

  if (explain) {
    const subject = git(['log', '-1', '--format=%s', commit]);
    process.stderr.write(
      `${commit.slice(0, 7)} ${releaseType.padEnd(5)} ${subject}\n`,
    );
  }
}

process.stdout.write(calculatedVersion.join('.'));
