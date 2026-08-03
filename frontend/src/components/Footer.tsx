import { ArrowUpRightIcon, EthereumMark, GitHubIcon } from '@/components/Icons';
import { GITHUB_REPO_URL } from '@/utils/constants';

function Footer() {
  return (
    <footer className='mt-20 border-t border-slate-200 bg-white/70'>
      <div className='page-shell flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 font-semibold text-slate-950'>
            <EthereumMark className='h-5 w-5 text-indigo-600' />
            eips.wtf
          </div>
          <p className='mt-3 max-w-md text-sm leading-6 text-slate-600'>
            An independent view of how Ethereum standards evolve, built from public proposal and
            repository data.
          </p>
        </div>

        <div className='flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-slate-700'>
          <a
            className='footer-link'
            href={GITHUB_REPO_URL}
            target='_blank'
            rel='noopener noreferrer'
          >
            <GitHubIcon className='h-4 w-4' />
            Source
          </a>
          <a
            className='footer-link'
            href='https://eips.ethereum.org/'
            target='_blank'
            rel='noopener noreferrer'
          >
            EIP specification
            <ArrowUpRightIcon className='h-4 w-4' />
          </a>
          <a
            className='footer-link'
            href='https://x.com/0xren_cf'
            target='_blank'
            rel='noopener noreferrer'
          >
            Maintained by @0xren_cf
            <ArrowUpRightIcon className='h-4 w-4' />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
