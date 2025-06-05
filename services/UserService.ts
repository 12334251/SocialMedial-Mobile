/* eslint-disable import/no-anonymous-default-export */
import BaseApiService from "./BaseApiService";

class UserService extends BaseApiService {
  constructor() {
    super();
  }

  public async fetchUser(userId: string | string[]): Promise<any> {
    try {
      const userResponse = await this.axiosInstance.get(
        `/api/users/${userId}`,
        {
          withCredentials: true,
        }
      );
      return userResponse;
    } catch (error) {
      return;
      console.log("fetchUser error:", error);
    }
  }

  public async verifyUser(): Promise<any> {
    try {
      return await this.axiosInstance.get("api/auth/verify");
    } catch (error) {
      console.error("verifyUser error", error);
    }
  }
}

export default new UserService();
