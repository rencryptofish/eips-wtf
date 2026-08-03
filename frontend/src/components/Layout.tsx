import { ReactNode } from 'react';

import { CategorySlug } from '@/utils/constants';

import Footer from './Footer';
import Header from './Header';

function Layout({
  children,
  currentCategory,
}: {
  children: ReactNode;
  currentCategory: CategorySlug | null;
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <a href='#main-content' className='skip-link'>
        Skip to content
      </a>
      <Header currentCategory={currentCategory} />
      <main id='main-content' className='flex-1'>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
