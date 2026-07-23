import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const PLANTUML_VERSION = '1.2026.3';
const PLANTUML_SHA256 =
  '53af6760d96bb2737e5e4386e832b46339fc29dec74f412d7c12db7c30db8ec4';
const PLANTUML_URL =
  `https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/` +
  `plantuml-${PLANTUML_VERSION}.jar`;

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const docsRoot = path.join(projectRoot, 'docs');
const defaultJarPath = path.join(
  projectRoot,
  '.cache',
  'plantuml',
  `plantuml-${PLANTUML_VERSION}.jar`,
);
const placeholderPattern =
  /```plantuml-image[^\S\r\n]*\r?\n[ \t]*([^|\s]+\.puml)(?:[ \t]*\|[ \t]*([^\r\n]*?))?[ \t]*\r?\n```/gi;

const markdownFiles = await findFiles(docsRoot, (name) =>
  /\.(md|mdx)$/i.test(name),
);
const sources = new Map();
const errors = [];

for (const markdownPath of markdownFiles) {
  const markdown = await readFile(markdownPath, 'utf8');
  for (const match of markdown.matchAll(placeholderPattern)) {
    const reference = match[1];

    if (
      path.isAbsolute(reference) ||
      reference.includes('://') ||
      reference.includes('?') ||
      reference.includes('#')
    ) {
      errors.push(
        `${relative(markdownPath)}: PlantUML source must be a local relative ` +
          `path without a query or fragment: ${reference}`,
      );
      continue;
    }

    const sourcePath = path.resolve(path.dirname(markdownPath), reference);
    if (!isInside(docsRoot, sourcePath)) {
      errors.push(
        `${relative(markdownPath)}: PlantUML source must remain under docs/: ` +
          reference,
      );
      continue;
    }

    try {
      await access(sourcePath);
      sources.set(sourcePath, {
        sourcePath,
        outputPath: `${sourcePath}.svg`,
        references: [
          ...(sources.get(sourcePath)?.references ?? []),
          relative(markdownPath),
        ],
      });
    } catch {
      errors.push(
        `${relative(markdownPath)}: PlantUML source does not exist: ${reference}`,
      );
    }
  }
}

if (errors.length > 0) {
  fail(errors.join('\n'));
}

if (sources.size === 0) {
  console.log('PlantUML: no diagram placeholders found.');
  process.exit(0);
}

const jarPath = process.env.PLANTUML_JAR
  ? path.resolve(process.env.PLANTUML_JAR)
  : defaultJarPath;

if (process.env.PLANTUML_JAR) {
  try {
    await access(jarPath);
  } catch {
    fail(`PLANTUML_JAR does not exist: ${jarPath}`);
  }
} else {
  await ensurePinnedJar(jarPath);
}

verifyJava();

for (const {sourcePath, outputPath} of sources.values()) {
  const source = await readFile(sourcePath);
  const result = spawnSync(
    'java',
    [
      '-Djava.awt.headless=true',
      '-jar',
      jarPath,
      '-charset',
      'UTF-8',
      '-tsvg',
      '-pipe',
      '-failfast2',
    ],
    {
      cwd: path.dirname(sourcePath),
      env: {
        ...process.env,
        PLANTUML_SECURITY_PROFILE:
          process.env.PLANTUML_SECURITY_PROFILE || 'INTERNET',
      },
      input: source,
      maxBuffer: 50 * 1024 * 1024,
    },
  );

  if (result.error) {
    fail(`${relative(sourcePath)}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = result.stderr?.toString('utf8').trim();
    fail(
      `${relative(sourcePath)}: PlantUML generation failed` +
        (details ? `\n${details}` : ''),
    );
  }

  const svg = result.stdout?.toString('utf8') ?? '';
  if (!svg.includes('<svg')) {
    fail(`${relative(sourcePath)}: PlantUML did not return an SVG image.`);
  }

  await writeFile(outputPath, svg, 'utf8');
  console.log(
    `PlantUML: ${relative(sourcePath)} → ${relative(outputPath)}`,
  );
}

async function ensurePinnedJar(jarPath) {
  try {
    if ((await sha256(jarPath)) === PLANTUML_SHA256) {
      return;
    }
    await rm(jarPath, {force: true});
  } catch {
    // The cache is empty and will be populated below.
  }

  await mkdir(path.dirname(jarPath), {recursive: true});
  const temporaryPath = `${jarPath}.download`;
  await rm(temporaryPath, {force: true});

  console.log(`PlantUML: downloading pinned version ${PLANTUML_VERSION}...`);
  const response = await fetch(PLANTUML_URL);
  if (!response.ok) {
    fail(
      `Unable to download PlantUML ${PLANTUML_VERSION}: ` +
        `${response.status} ${response.statusText}`,
    );
  }

  await writeFile(temporaryPath, Buffer.from(await response.arrayBuffer()));
  const checksum = await sha256(temporaryPath);
  if (checksum !== PLANTUML_SHA256) {
    await rm(temporaryPath, {force: true});
    fail(
      `PlantUML checksum mismatch. Expected ${PLANTUML_SHA256}, received ` +
        checksum,
    );
  }

  await rename(temporaryPath, jarPath);
}

function verifyJava() {
  const result = spawnSync('java', ['-version'], {encoding: 'utf8'});
  if (result.error || result.status !== 0) {
    fail(
      'Java is required to generate PlantUML diagrams. Install Java 21 or set ' +
        'PLANTUML_JAR to a compatible local PlantUML JAR.',
    );
  }
}

async function sha256(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function findFiles(directory, predicate) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFiles(entryPath, predicate)));
    } else if (entry.isFile() && predicate(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function isInside(parent, child) {
  const relation = path.relative(parent, child);
  return relation !== '' && !relation.startsWith('..') && !path.isAbsolute(relation);
}

function relative(filePath) {
  return path.relative(projectRoot, filePath);
}

function fail(message) {
  console.error(`PlantUML error:\n${message}`);
  process.exit(1);
}
