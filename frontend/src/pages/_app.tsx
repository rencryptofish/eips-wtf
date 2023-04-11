import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

const SITE_TITLE = 'eips.wtf';
const SITE_DESCRIPTION = 'Enhanced stats for Ethereum Improvement Proposals (EIPs)';
const SITE_DOMAIN = 'eips.wtf';
const SITE = 'https://' + SITE_DOMAIN;
const SITE_BANNER = '/ogp_banner.png';
const SITE_TWITTER = '@0xren_cf';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name='description' content={SITE_DESCRIPTION} key='DESCRIPTION' />

        {/* Twitter Meta Tags */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:domain' content={SITE_DOMAIN} />
        <meta name='twitter:url' content={SITE} />
        <meta name='twitter:title' content={SITE_TITLE} key='TWITTER_TITLE' />
        <meta name='twitter:site' content={SITE_TWITTER} />
        <meta name='twitter:creator' content={SITE_TWITTER} />
        <meta name='twitter:description' content={SITE_DESCRIPTION} key='TWITTER_DESCRIPTION' />
        <meta name='twitter:image' content={SITE + SITE_BANNER} key='TWITTER_IMAGE' />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
