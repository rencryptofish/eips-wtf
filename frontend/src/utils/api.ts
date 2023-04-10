import Axios from "axios";

import { EIP } from ".././types/eip";
import { EIPDiffsWithCommits } from ".././types/eip_diff"

const api = Axios.create({
    withCredentials: false,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Referrer-Policy": "same-origin",
    },
    ...(typeof window === "undefined" && { baseURL: "https://eips-wtf-server-production.up.railway.app" }),
});

export default api;

export const getEIP = async (eipId: number): Promise<EIP | null> => {
    const res = await api.get(`/eip/${eipId}`);
    if (res.status !== 200) {
        return Promise.reject(res.data);
    }

    const eip: EIP = res.data.data;
    if (eip === null) {
        return null;
    }
    return eip;
};

export const getLatestEIPDiffsWithCommits = async (): Promise<Array<EIPDiffsWithCommits>> => {
    const res = await api.get(`/latest-eip-diffs`);
    if (res.status !== 200) {
        return Promise.reject(res.data);
    }

    const eipDiffs: Array<EIPDiffsWithCommits> = res.data.data;
    return eipDiffs;
};