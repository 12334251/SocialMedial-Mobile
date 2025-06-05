import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const DEFAULT_API_PATH = process.env.EXPO_PUBLIC_BASE_API_DEFAULT_PATH;

class BaseApiService {
  protected axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: DEFAULT_API_PATH,
    });

    // Use the internal config type here
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await SecureStore.getItemAsync("authToken");
          if (token) {
            // Ensure headers object always exists
            config.headers = config.headers ?? {};
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        } catch (err) {
          console.warn("SecureStore read failed:", err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  getDefaultApiUrl(): string | undefined {
    return DEFAULT_API_PATH;
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default BaseApiService;
