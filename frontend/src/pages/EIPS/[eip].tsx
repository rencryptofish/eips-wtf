import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { EIP } from '../../types/eip';
import { getEIP } from '../../utils/api';
import remark from 'remark';
import remarkHtml from 'remark-html';

interface EIPPageProps {
  eip: EIP;
}

function normalizeDateString(dateString: string): string {
  return dateString.replace(/\u202F/g, ' ');
}

const EIPPage: React.FC<EIPPageProps> = ({ eip }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const createdDate = new Date(eip.created);
  const createdStr = normalizeDateString(createdDate.toLocaleString());

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{eip.title}</h1>
      <div className="grid grid-cols-2 gap-2">
        <p className="text-gray-700">EIP:</p>
        <p className="text-gray-900 font-semibold">{eip.eip}</p>
        <p className="text-gray-700">Author:</p>
        <p className="text-gray-900 font-semibold">{eip.author}</p>
        <p className="text-gray-700">Status:</p>
        <p className="text-gray-900 font-semibold">{eip.status}</p>
        <p className="text-gray-700">Type:</p>
        <p className="text-gray-900 font-semibold">{eip.type}</p>
        <p className="text-gray-700">Category:</p>
        <p className="text-gray-900 font-semibold">{eip.category}</p>
        <p className="text-gray-700">Created:</p>
        <p className="text-gray-900 font-semibold">{createdStr}</p>
        <p className="text-gray-700">Requires:</p>
        <p className="text-gray-900 font-semibold">
          {eip.requires ? eip.requires.join(', ') : 'N/A'}
        </p>
        <p className="text-gray-700">Last Call Deadline:</p>
        <p className="text-gray-900 font-semibold">
          {eip.last_call_deadline
            ? new Date(eip.last_call_deadline).toLocaleString()
            : 'N/A'}
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Content:</h2>
        <p className="text-gray-700 whitespace-pre-line">{eip.content}</p>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<EIPPageProps> =
  async ({ params }) => {
    try {
      const eipId = Number(params?.eip);
      const eip = await getEIP(eipId);

      return {
        props: {
          eip,
        },
      };
    } catch (error) {
      return {
        notFound: true,
      };
    }
  };

export default EIPPage;
