import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>EIPs.wtf</title>
        <meta name="description" content="EIPs.wtf provides extra information for Ethereum Improvement Proposals (EIPs), including their status, implementation details, related pull requests, and community feedback. This helps Ethereum developers and community members better understand EIPs and facilitates the implementation of new proposals." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
