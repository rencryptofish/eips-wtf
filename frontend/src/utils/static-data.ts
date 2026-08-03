import snapshotJson from '../../data/eips.json';

import { CategoryPageProps } from '@/types/dashboard';
import { EIP } from '@/types/eip';
import { EIPDiffsPerMonth, EIPDiffsWithCommits } from '@/types/eip_diff';
import { CategorySlug } from '@/utils/constants';

interface StaticSnapshot {
  schemaVersion: number;
  generatedAt: string;
  sources: Record<string, string>;
  eipDiffs: EIPDiffsWithCommits[];
  eipDiffsPerMonth: EIPDiffsPerMonth[];
  lastCallEIPs: EIP[];
}

const snapshot = snapshotJson as StaticSnapshot;

function isInCategory(value: string | null, category: CategorySlug): boolean {
  return category === 'all' || value?.toLowerCase() === category;
}

export function getCategoryPageData(category: CategorySlug): CategoryPageProps {
  return {
    category,
    eipDiffs: snapshot.eipDiffs
      .filter((diff) => isInCategory(diff.category, category))
      .slice(0, 50),
    eipDiffsPerMonth: snapshot.eipDiffsPerMonth,
    generatedAt: snapshot.generatedAt,
    lastCallEIPs: snapshot.lastCallEIPs.filter((eip) => isInCategory(eip.category, category)),
  };
}
