import { ArrowUpRightIcon, CalendarIcon } from '@/components/Icons';
import { EIP } from '@/types/eip';
import { formatDate, formatRelativeDate } from '@/utils/formatters';

interface LastCallListProps {
  eips: EIP[];
  generatedAt: string;
}

export default function LastCallList({ eips, generatedAt }: LastCallListProps) {
  return (
    <section className='content-section' aria-labelledby='last-call-heading'>
      <div className='section-heading'>
        <div>
          <p className='eyebrow'>Decision window</p>
          <h2 id='last-call-heading'>Proposals in Last Call</h2>
          <p>Final review periods before a proposal moves forward or returns for revision.</p>
        </div>
        <span className='count-badge'>{eips.length}</span>
      </div>

      {eips.length > 0 ? (
        <ul className='grid gap-3 lg:grid-cols-2' role='list'>
          {eips.map((eip) => (
            <li key={eip.eip}>
              <a
                className='last-call-card group'
                href={`https://eips.ethereum.org/EIPS/eip-${eip.eip}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <div className='flex min-w-0 flex-1 gap-3'>
                  <span className='eip-number'>EIP-{eip.eip}</span>
                  <div className='min-w-0'>
                    <h3>{eip.title}</h3>
                    <p className='mt-1 line-clamp-1 text-sm text-slate-600'>{eip.author}</p>
                    <div className='mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600'>
                      <span className='category-badge'>{eip.category || 'Uncategorized'}</span>
                      {eip.last_call_deadline ? (
                        <span className='inline-flex items-center gap-1.5'>
                          <CalendarIcon className='h-4 w-4 text-slate-400' />
                          <time dateTime={eip.last_call_deadline}>
                            {formatDate(eip.last_call_deadline)} ·{' '}
                            {formatRelativeDate(eip.last_call_deadline, generatedAt)}
                          </time>
                        </span>
                      ) : (
                        <span>Deadline not listed</span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowUpRightIcon className='mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-indigo-600' />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className='empty-state'>
          <CalendarIcon className='h-6 w-6' />
          <div>
            <h3>No proposals are in Last Call</h3>
            <p>This category has no active final-review windows in the latest snapshot.</p>
          </div>
        </div>
      )}
    </section>
  );
}
