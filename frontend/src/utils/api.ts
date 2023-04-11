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

  const eips: Array<EIP> = res.data.data;
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
