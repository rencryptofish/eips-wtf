import { NextPage } from 'next';
import Layout from '../components/Layout';

const Custom404: NextPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-8">The page you are looking for does not exist.</p>
      </div>
    </Layout>
  );
};

export default Custom404;
