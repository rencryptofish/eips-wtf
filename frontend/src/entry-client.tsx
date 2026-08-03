import { createRoot, hydrateRoot } from 'react-dom/client';

import App from '@/App';
import { AppRoute, getCanonicalUrl, resolveRoute } from '@/routes';
import { CategoryPageProps } from '@/types/dashboard';

import '@/styles/globals.css';

function readEmbeddedData(): CategoryPageProps | null | undefined {
  const element = document.querySelector<HTMLScriptElement>('#__EIPS_DATA__');
  if (!element) return undefined;
  return JSON.parse(element.textContent || 'null') as CategoryPageProps | null;
}

function syncDocumentMeta(route: AppRoute) {
  const canonicalUrl = getCanonicalUrl(route);
  document.title = route.title;

  const attributes: Array<[string, string]> = [
    ['meta[name="description"]', route.description],
    ['meta[name="robots"]', route.robots],
    ['meta[property="og:url"]', canonicalUrl],
    ['meta[property="og:title"]', route.title],
    ['meta[property="og:description"]', route.description],
    ['meta[name="twitter:title"]', route.title],
    ['meta[name="twitter:description"]', route.description],
  ];

  for (const [selector, value] of attributes) {
    document.querySelector(selector)?.setAttribute('content', value);
  }
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
}

async function start() {
  const rootElement = document.querySelector<HTMLDivElement>('#root');
  if (!rootElement) throw new Error('Missing #root element');

  const pathname = window.location.pathname;
  const route = resolveRoute(pathname);
  syncDocumentMeta(route);
  let pageData = readEmbeddedData();

  if (pageData === undefined) {
    if (!import.meta.env.DEV) {
      throw new Error('Production page is missing its prerendered data');
    }

    pageData = route.category
      ? (await import('@/utils/static-data')).getCategoryPageData(route.category)
      : null;
  }

  const app = <App pageData={pageData} pathname={pathname} />;
  const prerenderMatchesRoute = route.category
    ? pageData?.category === route.category
    : pageData === null;

  if (rootElement.children.length > 0 && prerenderMatchesRoute) {
    hydrateRoot(rootElement, app);
  } else {
    rootElement.replaceChildren();
    createRoot(rootElement).render(app);
  }
}

void start();
