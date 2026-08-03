import { useMemo, useState } from 'react';

import { ArrowUpRightIcon, SearchIcon } from '@/components/Icons';
import { EIPDiffsWithCommits } from '@/types/eip_diff';
import { formatDate, formatRelativeDate } from '@/utils/formatters';

interface ActivityFeedProps {
  eipDiffs: EIPDiffsWithCommits[];
  generatedAt: string;
}

function getCommitUrl(diff: EIPDiffsWithCommits): string {
  return `https://github.com/ethereum/${diff.repository}/commit/${diff.hexsha}`;
}

export default function ActivityFeed({ eipDiffs, generatedAt }: ActivityFeedProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDiffs = useMemo(() => {
    if (!normalizedQuery) return eipDiffs;

    return eipDiffs.filter((diff) => {
      return [
        String(diff.eip),
        diff.title,
        diff.message,
        diff.author_name,
        diff.category || '',
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [eipDiffs, normalizedQuery]);

  return (
    <section className='content-section' id='activity' aria-labelledby='activity-heading'>
      <div className='section-heading items-end'>
        <div>
          <p className='eyebrow'>Repository pulse</p>
          <h2 id='activity-heading'>Latest proposal activity</h2>
          <p>Recent edits, authors, discussions, and source commits in one readable feed.</p>
        </div>

        <label className='search-field'>
          <SearchIcon className='h-4 w-4' />
          <span className='sr-only'>Filter activity</span>
          <input
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Filter activity…'
          />
        </label>
      </div>

      <div className='activity-feed'>
        <div className='activity-feed-status' aria-live='polite'>
          Showing {filteredDiffs.length} of {eipDiffs.length} recent changes
        </div>

        {filteredDiffs.length > 0 ? (
          <ol className='divide-y divide-slate-200' role='list'>
            {filteredDiffs.map((diff) => (
              <li key={`${diff.hexsha}-${diff.eip}`} className='activity-item'>
                <div className='activity-rail' aria-hidden='true'>
                  <span />
                </div>
                <article className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <a
                      className='eip-number hover:border-indigo-300 hover:text-indigo-700'
                      href={`https://eips.ethereum.org/EIPS/eip-${diff.eip}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      EIP-{diff.eip}
                    </a>
                    <span className='category-badge'>{diff.category || 'Uncategorized'}</span>
                  </div>

                  <h3 className='mt-3 text-base font-semibold leading-6 text-slate-950'>
                    <a
                      className='hover:text-indigo-700'
                      href={`https://eips.ethereum.org/EIPS/eip-${diff.eip}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {diff.title}
                    </a>
                  </h3>
                  <p className='mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600'>
                    {diff.message || 'Proposal metadata updated'}
                  </p>

                  <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600'>
                    <span>{diff.author_name || 'Unknown author'}</span>
                    <time
                      dateTime={diff.committed_datetime}
                      title={formatDate(diff.committed_datetime)}
                    >
                      {formatRelativeDate(diff.committed_datetime, generatedAt)}
                    </time>
                    <a
                      className='inline-link'
                      href={getCommitUrl(diff)}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {diff.hexsha.slice(0, 7)}
                      <ArrowUpRightIcon className='h-3.5 w-3.5' />
                    </a>
                    {diff.discussion ? (
                      <a
                        className='inline-link'
                        href={diff.discussion}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {diff.discussion_count === null
                          ? 'Discussion'
                          : `${diff.discussion_count} discussion ${
                              diff.discussion_count === 1 ? 'reply' : 'replies'
                            }`}
                        <ArrowUpRightIcon className='h-3.5 w-3.5' />
                      </a>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <div className='empty-state m-4'>
            <SearchIcon className='h-6 w-6' />
            <div>
              <h3>No matching activity</h3>
              <p>Try an EIP number, title, category, author, or commit message.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
