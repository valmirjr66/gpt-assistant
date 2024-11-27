import axios from 'axios';

const BASE_URL = process.env.BASE_URL;
const APP_API_URL = process.env.APP_API_URL;

function getAxiosInstance() {
    return {
        async get(method, params) {
            return await axios.get(`/${method}`, {
                baseURL: BASE_URL,
                params,
            });
        },
        async post(method, data) {
            return await axios.post(`/${method}`, {
                baseURL: BASE_URL,
                URL: `/${method}`,
                data,
            });
        },
        async sendChatMessage(method, params) {
            return await axios.post(`${APP_API_URL}/${method}`, params);
        },
    };
}

export default getAxiosInstance();
