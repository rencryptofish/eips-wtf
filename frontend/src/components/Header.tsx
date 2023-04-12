import Link from 'next/link';
import { EIP_CATEGORIES, GITHUB_REPO_URL } from '@/utils/constants';

function Header() {
  return (
    <header className='flex items-center justify-between py-4'>
      <div className='mx-auto flex grid-cols-2 flex-col md:grid px-4 md:px-0'>
        <Link href='/' passHref>
          <span className='text-xl font-bold text-gray-900'>EIPs.wtf</span>
        </Link>
        <nav className='flex-grow'>
          <ul className='flex justify-end space-x-4 flex-wrap'>
            {EIP_CATEGORIES.map((category) => (
              <li key={category}>
                <Link href={`/categories/${category.toLowerCase()}`} passHref>
                  <span
                    className='text-xl text-gray-800 hover:text-gray-600'
                    aria-label={`${category} category`}
                  >
                    {category}
                  </span>
                </Link>
              </li>
            ))}
            <a
              className='flex items-center font-bold'
              href={GITHUB_REPO_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              <img
                className='w-5 h-5 rounded-[15%]'
                src='/github.svg'
                alt='Electric Capital logo'
              />
            </a>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
