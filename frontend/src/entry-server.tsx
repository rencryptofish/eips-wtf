import { renderToString } from 'react-dom/server';

import App from '@/App';
import { getCanonicalUrl, resolveRoute, STATIC_PATHS } from '@/routes';
import { getCategoryPageData } from '@/utils/static-data';

export function render(pathname: string) {
  const route = resolveRoute(pathname);
  const pageData = route.category ? getCategoryPageData(route.category) : null;

  return {
    data: pageData,
    html: renderToString(<App pageData={pageData} pathname={pathname} />),
    meta: {
      description: route.description,
      robots: route.robots,
      title: route.title,
      url: getCanonicalUrl(route),
    },
  };
}

export function getStaticPaths(): string[] {
  return [...STATIC_PATHS, '/categories/all/'];
}
