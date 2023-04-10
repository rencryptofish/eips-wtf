import Axios from "axios";

import { EIP } from ".././types/eip";

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

export const getEIP = async (eipId: number): Promise<EIP> => {
    const res = await api.get(`/eip/${eipId}`);
    if (res.status !== 200) {
        return Promise.reject(res.data);
    }

    const eip: EIP = res.data.__data__;

    console.log("reached here")
    console.log(eip.created)

    return eip;
};

export const getLatestCommits 