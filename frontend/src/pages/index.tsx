// src/pages/index.tsx

import React from 'react';
import { GetStaticProps } from 'next';
import { CategoryPage } from '@/components/CategoryViz';
import { EIPDiffsWithCommits, EIPDiffsPerMonth } from '@/types/eip_diff';
import { EIP } from '@/types/eip';
import {
  getLatestEIPDiffsWithCommitsByCategory,
  getEIPByCategoryByStatus,
  getEIPDiffsPerMonthByCategory,
} from '@/utils/api';

type HomePageProps = {
  eipDiffs: EIPDiffsWithCommits[];
  eipDiffsPerMonth: EIPDiffsPerMonth[];
  lastCallEIPs: EIP[];
};

const HomePage: React.FC<HomePageProps> = (props) => {
  return <CategoryPage category='all' {...props} />;
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const eipDiffs = await getLatestEIPDiffsWithCommitsByCategory('all');
  const eipDiffsPerMonth = await getEIPDiffsPerMonthByCategory('all');
  const lastCallEIPs = await getEIPByCategoryByStatus('all', 'Last Call');

  return {
    props: {
      eipDiffs,
      eipDiffsPerMonth,
      lastCallEIPs,
    },
    revalidate: 900, // Revalidate every minute (optional)
  };
};

export default HomePage;
