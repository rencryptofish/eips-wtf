import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout currentCategory={null}>
      <div className='page-shell flex min-h-[55vh] items-center justify-center py-20'>
        <div className='max-w-xl text-center'>
          <p className='eyebrow'>404 · Missing proposal</p>
          <h1 className='mt-3 text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl'>
            This page is not in the index.
          </h1>
          <p className='mx-auto mt-5 max-w-md text-base leading-7 text-slate-600'>
            The route may have moved, or the proposal view you followed no longer exists here.
          </p>
          <a href='/' className='button-primary mt-7'>
            Back to proposal activity
          </a>
        </div>
      </div>
    </Layout>
  );
}
