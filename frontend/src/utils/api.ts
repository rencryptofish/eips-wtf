import Axios from 'axios';

import { EIP } from '.././types/eip';
import { EIPDiffsWithCommits, EIPDiffsPerMonth } from '.././types/eip_diff';

const api = Axios.create({
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Referrer-Policy': 'same-origin',
  },
  ...(typeof window === 'undefined' && {
    baseURL: 'https://eips-wtf-server-production.up.railway.app',
  }),
});

export default api;

export const getLatestEIPDiffsWithCommitsByCategory = async (
  category: string,
): Promise<Array<EIPDiffsWithCommits>> => {
  const res = await api.get(`/latest-eip-diffs-by-category/${category}`);
  if (res.status !== 200) {
    return Promise.reject(res.data);
  }

  const eipDiffs: Array<EIPDiffsWithCommits> = res.data.data;
  return eipDiffs;
};

export const getEIPByCategoryByStatus = async (
  category: string,
  status: string,
): Promise<Array<EIP>> => {
  const res = await api.get(`/eip-by-category-status/${category}/${status}`);
  if (res.status !== 200) {
    return Promise.reject(res.data);
  }

  var eips: Array<EIP> = res.data.data;

  // if status is last call, we need to sort by last call date
  if (status === 'Last Call') {
    eips.sort((a, b) => {
      if (a.last_call_deadline && b.last_call_deadline) {
        return new Date(b.last_call_deadline).getTime() - new Date(a.last_call_deadline).getTime();
      } else {
        return 0;
      }
    });    
  }

  return eips;
};

export const getEIPDiffsPerMonthByCategory = async (
  category: string,
): Promise<Array<EIPDiffsPerMonth>> => {
  const res = await api.get(`/eip-diffs-per-month-category/${category}`);
  if (res.status !== 200) {
    return Promise.reject(res.data);
  }

  const eipDiffs: Array<EIPDiffsPerMonth> = res.data.data;
  return eipDiffs;
};
