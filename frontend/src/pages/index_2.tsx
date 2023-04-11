import { GetStaticProps } from 'next'
import { getLatestEIPDiffsWithCommits, getEIPDiffsPerMonth, getEIPByStatus } from '@/utils/api'
import { EIPDiffsWithCommits, EIPDiffsPerMonth } from '../types/eip_diff'
import { EIP } from '../types/eip'
import Layout from '@/components/Layout'
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';


type Props = {
  eipDiffs: EIPDiffsWithCommits[]
  eipDiffsPerMonth: EIPDiffsPerMonth[]
  lastCallEIPs: EIP[]
}

function formatHexsha(hexsha: string): string {
  return hexsha.substring(0, 7)
}

const getGithubCommitUrl = (hexsha: string) => {
  return `https://github.com/ethereum/EIPs/commit/${hexsha}`;
};

const formatDaysAgo = (datetime: string | null | undefined) => {
  if (!datetime) {
    return "Unknown";
  }
  const daysAgo = formatDistance(new Date(datetime), new Date(), { addSuffix: true });
  return daysAgo;
};

const EIPDiffsPerMonthChart = ({ eipDiffs, eipDiffsPerMonth, lastCallEIPs }: Props) => {
  const categories = ['Meta', 'Unknown', 'Core', 'Networking', 'ERC', 'Informational', 'Interface'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const chartData = Object.values(eipDiffsPerMonth);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map((category, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={category}
            stackId="1"
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};




const LatestEIPTable = ({ eipDiffs, eipDiffsPerMonth, lastCallEIPs }: Props) => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Latest EIP Diffs</h1>
      <div className="max-w-[1216px] overflow-x-auto">
        <table className="w-full table-auto mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-center py-2 truncate">Category</th>
              <th className="text-center py-2 truncate">EIP</th>
              <th className="text-center py-2 truncate">Title</th>
              <th className="text-center py-2 truncate">Commit</th>
              <th className="text-center py-2 truncate">Committed</th>
              <th className="text-center py-2 truncate">Message</th>
              <th className="text-center py-2 truncate">Author</th>
            </tr>
          </thead>
          <tbody>
            {eipDiffs.map((eipDiff, index) => (
              <tr key={index}>

                <td className="border px-4 py-2">{eipDiff.category}</td>

                <td className="border px-4 py-2">
                  <Link href={`https://eips.ethereum.org/EIPS/eip-${eipDiff.eip}`} target="_blank">
                    <span className="text-blue-600 hover:text-blue-800">{eipDiff.eip}</span>
                  </Link>

                </td>

                <td className="border px-4 py-2">{eipDiff.title}</td>

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

const EIPsInLastCallTable = ({ eipDiffs, eipDiffsPerMonth, lastCallEIPs }: Props) => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">EIPs in Last Call</h1>
      <div className="max-w-[1216px] overflow-x-auto">
        <table className="w-full table-auto mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-center py-2 truncate">Category</th>
              <th className="text-center py-2 truncate">EIP</th>
              <th className="text-center py-2 truncate">Title</th>
              <th className="text-center py-2 truncate">Author</th>
              <th className="text-center py-2 truncate">Last Call Deadline</th>
            </tr>
          </thead>
          <tbody>
            {lastCallEIPs.map((eip) => (
              <tr key={eip.eip}>
                <td className="border px-4 py-2">{eip.category}</td>
                <td className="border px-4 py-2">
                  <Link href={`https://eips.ethereum.org/EIPS/eip-${eip.eip}`} target="_blank">
                    <span className="text-blue-600 hover:text-blue-800">{eip.eip}</span>
                  </Link>
                </td>
                <td className="border px-4 py-2">{eip.title}</td>
                <td className="border px-4 py-2">{eip.author}</td>
                <td className="border px-4 py-2">{formatDaysAgo(eip.last_call_deadline)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


const Home = ({ eipDiffs, eipDiffsPerMonth, lastCallEIPs }: Props) => {
  return (
    <Layout>
      <div className="mx-auto max-w-[1216px]">
        <h1 className="text-xl font-bold text-gray-900">EIP Commits by Category</h1>
        <EIPDiffsPerMonthChart eipDiffs={eipDiffs} eipDiffsPerMonth={eipDiffsPerMonth} lastCallEIPs={lastCallEIPs} />
      </div>
      <div className="mx-auto max-w-[1216px] mt-4">
        <EIPsInLastCallTable eipDiffs={eipDiffs} eipDiffsPerMonth={eipDiffsPerMonth} lastCallEIPs={lastCallEIPs} />
      </div>
      <div className="mx-auto max-w-[1216px] mt-4">
        <LatestEIPTable eipDiffs={eipDiffs} eipDiffsPerMonth={eipDiffsPerMonth} lastCallEIPs={lastCallEIPs} />
      </div>
    </Layout>
  )
}


export const getStaticProps: GetStaticProps<Props> = async () => {
  const eipDiffs = await getLatestEIPDiffsWithCommits()
  const eipDiffsPerMonth = await getEIPDiffsPerMonth()
  const lastCallEIPs = await getEIPByStatus('Last Call');
  lastCallEIPs.sort((a, b) => {
    const deadlineA = a.last_call_deadline ? new Date(a.last_call_deadline).getTime() : Infinity;
    const deadlineB = b.last_call_deadline ? new Date(b.last_call_deadline).getTime() : Infinity;
    return deadlineB - deadlineA;
  });

  return {
    props: { eipDiffs, eipDiffsPerMonth, lastCallEIPs },
    revalidate: 60
  }
}

export default Home
