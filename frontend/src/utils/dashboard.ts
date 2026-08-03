import { EIPDiffsPerMonth } from '@/types/eip_diff';
import { CategorySlug } from '@/utils/constants';

export interface MonthlyActivity {
  changes: number;
  contributors: number;
  month: string;
}

const CHANGE_CATEGORIES = [
  'core',
  'networking',
  'interface',
  'erc',
  'meta',
  'informational',
  'unknown',
] as const;

export function getMonthlyChangeCount(row: EIPDiffsPerMonth, category: CategorySlug): number {
  if (category !== 'all') {
    const categoryValue = row[category];
    return typeof categoryValue === 'number' ? categoryValue : 0;
  }

  return CHANGE_CATEGORIES.reduce((total, key) => {
    const value = row[key];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

export function getMonthlyContributorCount(row: EIPDiffsPerMonth, category: CategorySlug): number {
  const key = category === 'all' ? 'contributors' : `${category}_contributors`;
  const value = row[key];
  return typeof value === 'number' ? value : 0;
}

export function getMonthlyActivity(
  rows: EIPDiffsPerMonth[],
  category: CategorySlug,
): MonthlyActivity[] {
  return rows
    .map((row) => ({
      changes: getMonthlyChangeCount(row, category),
      contributors: getMonthlyContributorCount(row, category),
      month: row.month,
    }))
    .sort((first, second) => first.month.localeCompare(second.month));
}
