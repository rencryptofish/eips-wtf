import Link from 'next/link';
import { EIP_CATEGORIES } from '@/utils/constants';

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
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
