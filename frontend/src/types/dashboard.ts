import { EIP } from '@/types/eip';
import { EIPDiffsPerMonth, EIPDiffsWithCommits } from '@/types/eip_diff';
import { CategorySlug } from '@/utils/constants';

export interface CategoryPageProps {
  category: CategorySlug;
  eipDiffs: EIPDiffsWithCommits[];
  eipDiffsPerMonth: EIPDiffsPerMonth[];
  generatedAt: string;
  lastCallEIPs: EIP[];
}
