import { useCallback, useMemo } from 'react';
import axios, {type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type {ServerResponse} from '../types';

// Create a base axios instance with the API base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const noAuthEndpoints = [
  '/v1/member/login', 
  '/v1/member/signup', 
  '/v1/member/email',
  '/v1/comments/memory/public' // public 댓글 API는 인증 불필요
];

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const url = config.url || '';

    const requiresAuth = !noAuthEndpoints.some(endpoint => url.includes(endpoint));

    if (accessToken && requiresAuth) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hook for making API requests
const useApi = () => {
  const get = useCallback(<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ServerResponse<T>>> => {
    return api.get<ServerResponse<T>>(url, config);
  }, []);

  const post = useCallback(<T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<ServerResponse<T>>> => {
    return api.post<ServerResponse<T>>(url, data, config);
  }, []);

  const put = useCallback(<T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<ServerResponse<T>>> => {
    return api.put<ServerResponse<T>>(url, data, config);
  }, []);

  const patch = useCallback(<T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<ServerResponse<T>>> => {
    return api.patch<ServerResponse<T>>(url, data, config);
  }, []);

  const del = useCallback(<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ServerResponse<T>>> => {
    return api.delete<ServerResponse<T>>(url, config);
  }, []);

  return useMemo(() => ({
    get,
    post,
    put,
    patch,
    delete: del,
  }), [get, post, put, patch, del]);
};

// Export the hook and the axios instance for direct use
export { api };
export default useApi;
