import { CategoryPage, CategoryProps } from '../../components/CategoryViz';
import { GetStaticPaths, GetStaticProps } from 'next';
import {
  getLatestEIPDiffsWithCommitsByCategory,
  getEIPByCategoryByStatus,
  getEIPDiffsPerMonthByCategory,
} from '@/utils/api';
import { EIP_CATEGORIES } from '@/utils/constants';

export const getStaticProps: GetStaticProps<CategoryProps> = async (context) => {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const { category } = context.params;

  const eipDiffs = await getLatestEIPDiffsWithCommitsByCategory(category as string);
  const eipDiffsPerMonth = await getEIPDiffsPerMonthByCategory(category as string);
  const lastCallEIPs = await getEIPByCategoryByStatus(category as string, 'Last Call');

  // sort last call EIPs by last call date
  lastCallEIPs.sort((a, b) => {
    if (a.last_call_deadline && b.last_call_deadline) {
      return new Date(b.last_call_deadline).getTime() - new Date(a.last_call_deadline).getTime();
    } else {
      return 0;
    }
  });

  return {
    props: {
      category: category as string,
      eipDiffs,
      eipDiffsPerMonth,
      lastCallEIPs,
    },
    revalidate: 900, // Revalidate every minute (optional)
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = EIP_CATEGORIES.map((category) => ({
    params: { category: category.toLowerCase() },
  }));

  return {
    paths,
    fallback: false,
  };
};

export default CategoryPage;
