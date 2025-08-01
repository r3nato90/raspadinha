import axios from 'axios';

import Cookies from 'js-cookie';

const session = Cookies.get('session');

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(config => {
  return config;
});

if (session) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${session}`;
}