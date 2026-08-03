import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = resolve(frontendRoot, 'dist');
const ssrDirectory = resolve(frontendRoot, '.ssr');
const template = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const { getStaticPaths, render } = await import(resolve(ssrDirectory, 'entry-server.js'));
const routes = getStaticPaths();

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function serializeData(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function createDocument(pathname) {
  const { data, html, meta } = render(pathname);
  const dataScript = `<script id="__EIPS_DATA__" type="application/json">${serializeData(
    data,
  )}</script>`;

  const document = template
    .replace('<!--app-html-->', html)
    .replace('<!--app-data-->', dataScript)
    .replaceAll('__PAGE_TITLE__', escapeAttribute(meta.title))
    .replaceAll('__PAGE_DESCRIPTION__', escapeAttribute(meta.description))
    .replaceAll('__PAGE_ROBOTS__', escapeAttribute(meta.robots))
    .replaceAll('__PAGE_URL__', escapeAttribute(meta.url));

  if (/<!--app-(?:html|data)-->|__PAGE_[A-Z_]+__/.test(document)) {
    throw new Error(`Unresolved prerender placeholder for ${pathname}`);
  }

  return document;
}

for (const pathname of routes) {
  const outputPath =
    pathname === '/'
      ? resolve(distDirectory, 'index.html')
      : resolve(distDirectory, pathname.slice(1), 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createDocument(pathname));
}

await writeFile(resolve(distDirectory, '404.html'), createDocument('/not-found/'));
await rm(ssrDirectory, { recursive: true, force: true });

console.log(`Prerendered ${routes.length} routes and 404.html.`);
