import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, EthereumMark, GitHubIcon } from '@/components/Icons';
import { CategorySlug, EIP_CATEGORIES, GITHUB_REPO_URL } from '@/utils/constants';

function getCategoryHref(category: (typeof EIP_CATEGORIES)[number]): string {
  return category === 'All' ? '/' : `/categories/${category.toLowerCase()}/`;
}

function CategoryNavigation({ currentCategory }: { currentCategory: CategorySlug | null }) {
  const navRef = useRef<HTMLElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  useEffect(() => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const updateScrollState = () => {
      const nextState = {
        canScrollLeft: nav.scrollLeft > 2,
        canScrollRight: nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2,
      };

      setScrollState((currentState) =>
        currentState.canScrollLeft === nextState.canScrollLeft &&
        currentState.canScrollRight === nextState.canScrollRight
          ? currentState
          : nextState,
      );
    };

    const animationFrame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(nav);
    nav.addEventListener('scroll', updateScrollState, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      nav.removeEventListener('scroll', updateScrollState);
    };
  }, []);

  const scrollCategories = (direction: -1 | 1) => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    nav.scrollBy({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      left: direction * Math.max(nav.clientWidth * 0.7, 180),
    });
  };

  return (
    <div className='category-nav-shell'>
      <nav
        ref={navRef}
        id='category-navigation'
        className='page-shell category-nav'
        aria-label='EIP categories'
      >
        {EIP_CATEGORIES.map((category) => {
          const href = getCategoryHref(category);
          const slug = category.toLowerCase() as CategorySlug;
          const isActive = currentCategory === slug;

          return (
            <a
              key={category}
              href={href}
              className='category-nav-link'
              aria-current={isActive ? 'page' : undefined}
            >
              {category}
            </a>
          );
        })}
      </nav>

      {scrollState.canScrollLeft ? (
        <button
          type='button'
          className='category-nav-scroll category-nav-scroll-left'
          aria-controls='category-navigation'
          aria-label='Scroll categories left'
          onClick={() => scrollCategories(-1)}
        >
          <span className='category-nav-scroll-icon'>
            <ChevronRightIcon className='h-4 w-4 rotate-180' />
          </span>
        </button>
      ) : null}

      {scrollState.canScrollRight ? (
        <button
          type='button'
          className='category-nav-scroll category-nav-scroll-right'
          aria-controls='category-navigation'
          aria-label='Scroll categories right'
          onClick={() => scrollCategories(1)}
        >
          <span className='category-nav-scroll-icon'>
            <ChevronRightIcon className='h-4 w-4' />
          </span>
        </button>
      ) : null}
    </div>
  );
}

function Header({ currentCategory }: { currentCategory: CategorySlug | null }) {
  return (
    <header className='site-header'>
      <div className='page-shell flex h-16 items-center justify-between gap-4'>
        <a href='/' className='brand-link' aria-label='EIPs.wtf home'>
          <span className='brand-mark'>
            <EthereumMark className='h-5 w-5' />
          </span>
          <span className='tracking-[-0.03em]'>eips.wtf</span>
          <span className='hidden rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:inline'>
            Explorer
          </span>
        </a>

        <a
          className='button-secondary h-11 min-h-11 w-11 px-0 text-sm sm:h-10 sm:min-h-10 sm:w-auto sm:px-3'
          href={GITHUB_REPO_URL}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='View eips.wtf source on GitHub'
        >
          <GitHubIcon className='h-4 w-4' />
          <span className='hidden sm:inline'>GitHub</span>
        </a>
      </div>

      <CategoryNavigation currentCategory={currentCategory} />
    </header>
  );
}

export default Header;
