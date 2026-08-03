import { CATEGORY_DETAILS, CategorySlug, SITE, SITE_DESCRIPTION } from '@/utils/constants';

export interface AppRoute {
  canonicalPath: string;
  category: CategorySlug | null;
  description: string;
  robots: 'index,follow' | 'noindex,nofollow';
  title: string;
}

export const CATEGORY_ROUTES: CategorySlug[] = [
  'all',
  'core',
  'networking',
  'interface',
  'erc',
  'meta',
  'informational',
];

export const STATIC_PATHS = [
  '/',
  ...CATEGORY_ROUTES.filter((category) => category !== 'all').map(
    (category) => `/categories/${category}/`,
  ),
] as const;

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || '/';
  return withoutQuery === '/' ? '/' : `/${withoutQuery.replace(/^\/+|\/+$/g, '')}/`;
}

export function resolveRoute(pathname: string): AppRoute {
  const normalizedPath = normalizePathname(pathname);
  const categoryMatch = normalizedPath.match(/^\/categories\/([^/]+)\/$/);
  const candidate = categoryMatch?.[1];
  const category =
    normalizedPath === '/' ? 'all' : CATEGORY_ROUTES.find((value) => value === candidate) || null;

  if (!category) {
    return {
      canonicalPath: normalizedPath,
      category: null,
      description: SITE_DESCRIPTION,
      robots: 'noindex,nofollow',
      title: 'Page not found | eips.wtf',
    };
  }

  const details = CATEGORY_DETAILS[category];
  const canonicalPath = category === 'all' ? '/' : `/categories/${category}/`;

  return {
    canonicalPath,
    category,
    description: details.description,
    robots: 'index,follow',
    title:
      category === 'all'
        ? 'Ethereum proposal activity and status | eips.wtf'
        : `${details.label} EIP activity and status | eips.wtf`,
  };
}

export function getCanonicalUrl(route: AppRoute): string {
  return `${SITE}${route.canonicalPath}`;
}
