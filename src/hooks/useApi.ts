import axios, {type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Create a base axios instance with the API base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const noAuthEndpoints = ['/v1/member/login', '/v1/member/signup'];

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
  const get = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, config);
  };

  const post = <T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, data, config);
  };

  const put = <T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.put<T>(url, data, config);
  };

  const del = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.delete<T>(url, config);
  };

  return {
    get,
    post,
    put,
    delete: del,
  };
};

// Export the hook and the axios instance for direct use
export { api };
export default useApi;
