import { GetStaticProps } from 'next'
import { getLatestEIPDiffsWithCommits } from '@/utils/api'
import { EIPDiffsWithCommits } from '../types/eip_diff'
import Layout from '@/components/Layout'
import Link from 'next/link';
import { formatDistance } from 'date-fns';


type Props = {
  eipDiffs: EIPDiffsWithCommits[]
}

function formatHexsha(hexsha: string): string {
  return hexsha.substring(0, 7)
}

const getGithubCommitUrl = (hexsha: string) => {
  return `https://github.com/ethereum/EIPs/commit/${hexsha}`;
};

const formatDaysAgo = (datetime: string) => {
  const daysAgo = formatDistance(new Date(datetime), new Date(), { addSuffix: true });
  return daysAgo;
};


const LatestEIPTable = ({ eipDiffs }: Props) => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Latest EIP Diffs</h1>
      <div className="max-w-[1216px] overflow-x-auto">
        <table className="w-full table-auto mt-4">
          <thead>
            <tr>
              <th className="text-center py-2 truncate">EIP</th>
              <th className="text-center py-2 truncate">Commit</th>
              <th className="text-center py-2 truncate">Committed</th>
              <th className="text-center py-2 truncate">Authored</th>
              <th className="text-center py-2 truncate">Message</th>
              <th className="text-center py-2 truncate">Author</th>
            </tr>
          </thead>
          <tbody>
            {eipDiffs.map((eipDiff) => (
              <tr key={eipDiff.hexsha}>
                <td className="border px-4 py-2">
                  <Link href={`https://eips.ethereum.org/EIPS/eip-${eipDiff.eip}`} target="_blank">
                    <span className="text-blue-600 hover:text-blue-800">{eipDiff.eip}</span>
                  </Link>

                </td>

                <td className="border px-4 py-2">
                  <Link href={getGithubCommitUrl(eipDiff.hexsha)} passHref target="_blank">
                    <span
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {formatHexsha(eipDiff.hexsha)}
                    </span>
                  </Link>
                </td>
                <td className="border px-4 py-2" style={{ minWidth: "100px" }}>{formatDaysAgo(eipDiff.committed_datetime)}</td>
                <td className="border px-4 py-2" style={{ minWidth: "100px" }}>{formatDaysAgo(eipDiff.authored_datetime)}</td>
                <td className="border px-4 py-2">{eipDiff.message}</td>
                <td className="border px-4 py-2">{eipDiff.author_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


const Home = ({ eipDiffs }: Props) => {
  return (
    <Layout>
      <div className="mx-auto max-w-[1216px]">
        <LatestEIPTable eipDiffs={eipDiffs} />
      </div>
    </Layout>
  )
}


export const getStaticProps: GetStaticProps<Props> = async () => {
  const eipDiffs = await getLatestEIPDiffsWithCommits()
  return {
    props: { eipDiffs },
    revalidate: 60 
  }
}

export default Home
