/* eslint-disable import/no-anonymous-default-export */
import BaseApiService from "./BaseApiService";
import axios, { AxiosResponse } from "axios";
// import { requestFCMToken } from "../notifications/firebase"; // adjust the path as needed

// Define an interface for the file (image) object in React Native.
export interface RegistrationPicture {
  uri: string;
  name: string;
  type: string;
}

// Define interfaces for your request and response shapes.
export interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location: string;
  occupation: string;
  picturePath: RegistrationPicture | null; // Using a mobile-friendly file type.
  [key: string]: any;
}

export interface LoginValues {
  email: string;
  password: string;
  fcmToken: string | null | undefined;
  browser: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  pictureUrl?: string;
  // any other user properties returned by your API
}

export interface ApiResponse<T> {
  user: any;
  status: number;
  message: string;
  token: string;
  data: T;
}

const API_URL = process.env.EXPO_PUBLIC_BASE_API_DEFAULT_PATH;

/**
 * AuthService extends the BaseApiService and provides authentication-related methods.
 */
class AuthService extends BaseApiService {
  constructor() {
    super();
  }

  /**
   * registerUser accepts form values (including a file upload) and posts the data
   * as multipart/form-data to your /api/auth/register endpoint.
   */
  public async registerUser(formData: FormData): Promise<any> {
    try {
      // POST the FormData directly. Axios will set the correct boundary.
      const response: AxiosResponse<ApiResponse<User>> = await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("Error during registration:", error);
      throw error;
    }
  }

  /**
   * loginUser accepts login form values, adds the FCM token and mobile details,
   * then posts the JSON to your /api/auth/login endpoint.
   */
  public async loginUser(
    values: LoginValues
  ): Promise<AxiosResponse<ApiResponse<User>>> {
    try {
      // console.log(
      //   "loginUser",
      //   values,
      //   process.env.EXPO_PUBLIC_BASE_API_DEFAULT_PATH
      // );

      // POST the JSON data to your API endpoint.
      const response: AxiosResponse<ApiResponse<User>> =
        await this.axiosInstance.post("/api/auth/login", values, {
          headers: {
            "Content-Type": "application/json",
          },
        });

      // console.log("response.data", response.data, response.status);
      return response;
    } catch (error: any) {
      console.log("Error during login:", error);
      throw error;
    }
  }

  /**
   * handleLogout sends a logout request to your /api/auth/logout endpoint.
   */
  public async handleLogout(
    userId: string
  ): Promise<AxiosResponse<{ message: string; fcmToken: null }>> {
    try {
      // note: use patch instead of post
      const response = await this.axiosInstance.post<{
        message: string;
        fcmToken: null;
      }>(
        "/api/auth/logout",
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error: any) {
      console.error("handleLogout error:", error);
      throw error;
    }
  }

  public async verifyUser(): Promise<any> {
    try {
      const resp = await this.axiosInstance.get<ApiResponse<User>>(
        "/api/auth/verify"
      );
      // resp.data has shape { message, user, token? } — but your controller returns user directly
      // console.log("verifyUser resp", resp);
      return resp;
    } catch (err) {
      console.error("verifyUser error", err);
      throw err;
    }
  }
}

// Export an instance of AuthService for use throughout your application.
export default new AuthService();
