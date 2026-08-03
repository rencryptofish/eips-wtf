import ActivityChart from '@/components/ActivityChart';
import ActivityFeed from '@/components/ActivityFeed';
import Layout from '@/components/Layout';
import LastCallList from '@/components/LastCallList';
import { CategoryPageProps } from '@/types/dashboard';
import { CATEGORY_DETAILS } from '@/utils/constants';
import { MonthlyActivity, getMonthlyActivity } from '@/utils/dashboard';
import { formatNumber } from '@/utils/formatters';

const yearOverYearFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
  style: 'percent',
});

function getPreviousYearMonth(month: string): string {
  return `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
}

function getYearOverYearValue(current: number, previous: number): string {
  if (previous === 0) {
    return current === 0 ? '0% (0 vs 0)' : `${formatNumber(current)} (up from 0)`;
  }

  const change = (current - previous) / previous;
  return `${yearOverYearFormatter.format(change)} (${formatNumber(
    current,
  )} vs ${formatNumber(previous)})`;
}

function YearOverYearValue({ current, previous }: { current: number; previous: number }) {
  const direction = current === previous ? 'flat' : current > previous ? 'up' : 'down';
  const directionSymbol = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const directionLabel = direction === 'up' ? 'up' : direction === 'down' ? 'down' : 'unchanged';
  const colorClass =
    direction === 'up'
      ? 'text-emerald-700'
      : direction === 'down'
        ? 'text-red-700'
        : 'text-slate-700';
  const value = getYearOverYearValue(current, previous);

  return (
    <span className={`font-semibold ${colorClass}`} aria-label={`${directionLabel} ${value}`}>
      <span aria-hidden='true'>{directionSymbol}</span> {value}
    </span>
  );
}

function getYearOverYearComparison(
  data: MonthlyActivity[],
): { current: MonthlyActivity; previous: MonthlyActivity } | null {
  const current = data.at(-1);
  if (!current) return null;

  const previous = data.find((row) => row.month === getPreviousYearMonth(current.month));
  if (!previous) return null;

  return { current, previous };
}

export function CategoryPage({
  category,
  eipDiffs,
  eipDiffsPerMonth,
  generatedAt,
  lastCallEIPs,
}: CategoryPageProps) {
  const categoryLabel = CATEGORY_DETAILS[category].label;
  const yearOverYearComparison = getYearOverYearComparison(
    getMonthlyActivity(eipDiffsPerMonth, category),
  );

  return (
    <Layout currentCategory={category}>
      <div className='page-shell pb-4'>
        <section
          className='content-section'
          aria-labelledby='trend-heading'
          aria-describedby='trend-footnote'
        >
          <div className='section-heading'>
            <div>
              <p className='eyebrow'>Long-term signal</p>
              <h2 id='trend-heading'>{categoryLabel} proposal changes and contributors by month</h2>
              {yearOverYearComparison ? (
                <p>
                  YoY: proposal changes{' '}
                  <YearOverYearValue
                    current={yearOverYearComparison.current.changes}
                    previous={yearOverYearComparison.previous.changes}
                  />
                  ; unique contributors{' '}
                  <YearOverYearValue
                    current={yearOverYearComparison.current.contributors}
                    previous={yearOverYearComparison.previous.contributors}
                  />
                  .
                </p>
              ) : null}
            </div>
          </div>
          <ActivityChart category={category} rows={eipDiffsPerMonth} />
          <p id='trend-footnote' role='note' className='mt-3 text-xs leading-5 text-slate-600'>
            <sup aria-hidden='true'>*</sup> Complete months only, so a partial current month never
            looks like a false decline. Contributors are distinct Git authors within each month.
            {category === 'erc'
              ? ' ERC history before the October 2023 repository split is sourced from the EIPs repository.'
              : null}
          </p>
        </section>

        <LastCallList eips={lastCallEIPs} generatedAt={generatedAt} />
        <ActivityFeed eipDiffs={eipDiffs} generatedAt={generatedAt} />

        <p className='mt-6 text-center text-xs text-slate-600'>
          Snapshot generated {new Date(generatedAt).toLocaleString('en-US', { timeZone: 'UTC' })}{' '}
          UTC
        </p>
      </div>
    </Layout>
  );
}
