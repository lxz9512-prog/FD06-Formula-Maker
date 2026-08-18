import { rm, mkdir, readFile, writeFile, copyFile, rename } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');
const distDir = path.join(projectDir, 'dist');
const clientDir = path.join(distDir, 'client');
const serverDir = path.join(distDir, 'server');

await Promise.all([
  rm(clientDir, { recursive: true, force: true }),
  rm(serverDir, { recursive: true, force: true }),
  rm(path.join(distDir, 'shared'), { recursive: true, force: true }),
  rm(path.join(distDir, 'sourcemaps'), { recursive: true, force: true }),
]);

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawnSync(npmCommand, ['run', 'build:client'], {
  cwd: projectDir,
  encoding: 'utf8',
  stdio: 'inherit',
});

if (build.status !== 0) {
  process.exit(build.status || 1);
}

await Promise.all([
  rm(path.join(distDir, 'sourcemaps'), { recursive: true, force: true }),
  rm(path.join(distDir, 'tsconfig.node.tsbuildinfo'), { force: true }),
]);

const indexPath = path.join(clientDir, 'index.html');
let html = await readFile(indexPath, 'utf8');
const replacements = new Map([
  ['{{csrfToken}}', ''],
  ['{{userId}}', ''],
  ['{{tenantId}}', ''],
  ['{{appId}}', ''],
  ['{{environment}}', 'production'],
  ['{{appName}}', 'FD06 智能调奶器'],
  ['{{appDescription}}', 'FD06 智能调奶器交互演示'],
  ['{{{appAvatar}}}', '/favicon.svg'],
  ['{{appAvatar}}', '/favicon.svg'],
  ['{{basename}}', '/client/index.html'],
  ['{{{__platform__}}}', '{}'],
  ['{{currentUrl}}', '/client/index.html/device'],
]);

for (const [placeholder, value] of replacements) {
  html = html.replaceAll(placeholder, value);
}

const unresolved = html.match(/\{\{\{?[^{}]+\}\}\}?/g);
if (unresolved) {
  throw new Error(`Unresolved HTML placeholders: ${unresolved.join(', ')}`);
}

await writeFile(indexPath, html);
await rename(indexPath, path.join(clientDir, 'app.html'));
await mkdir(serverDir, { recursive: true });
await copyFile(
  path.join(projectDir, 'sites', 'worker.mjs'),
  path.join(serverDir, 'index.js'),
);

console.log('Sites build prepared.');
