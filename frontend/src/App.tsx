import { CategoryPage } from '@/components/CategoryViz';
import NotFound from '@/components/NotFound';
import { CategoryPageProps } from '@/types/dashboard';
import { resolveRoute } from '@/routes';

interface AppProps {
  pageData: CategoryPageProps | null;
  pathname: string;
}

export default function App({ pageData, pathname }: AppProps) {
  const route = resolveRoute(pathname);

  if (!route.category || !pageData) {
    return <NotFound />;
  }

  return <CategoryPage {...pageData} />;
}
