/* eslint-disable import/no-anonymous-default-export */
import BaseApiService from "./BaseApiService";

class FriendService extends BaseApiService {
  constructor() {
    super();
  }

  public async fetchFriendRequest(userId: string | undefined): Promise<any> {
    try {
      const friendResponse = await this.axiosInstance.get(
        `/api/friends/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return friendResponse;
    } catch (error) {
      console.log("fetchFriendRequest error:", error);
      throw error;
    }
  }

  public async fetchAcceptedFriendRequest(
    userId: string | undefined
  ): Promise<any> {
    try {
      const acceptedFriendResponse = await this.axiosInstance.get(
        `/api/friends/accept/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return acceptedFriendResponse;
    } catch (error) {
      console.log("fetchFriendRequest error:", error);
      throw error;
    }
  }

  public async fetchPendingFriendRequest(
    userId: string | undefined
  ): Promise<any> {
    try {
      const pendingFriendResponse = await this.axiosInstance.get(
        `/api/friends/pending/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return pendingFriendResponse;
    } catch (error) {
      console.log("fetchFriendRequest error:", error);
      throw error;
    }
  }

  public async fetchProfileFriendRequest(
    userId: string | string[]
  ): Promise<any> {
    try {
      const friendResponse = await this.axiosInstance.get(
        `/api/friends/profile/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return friendResponse;
    } catch (error) {
      console.log("fetchFriendRequest error:", error);
      throw error;
    }
  }

  public async sendFriendRequest(
    userId: string,
    postUserId: string | undefined
  ): Promise<any> {
    try {
      const fetchSendRequestResponse = await this.axiosInstance.post(
        `/api/friends/${userId}/${postUserId}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return fetchSendRequestResponse;
    } catch (error) {
      console.log("sendFriendRequest error:", error);
    }
  }

  public async deleteFriendRequest(
    userId: string,
    postUserId: string,
    status: string
  ): Promise<any> {
    try {
      const deleteFriendRequestResponse = await this.axiosInstance.delete(
        `/api/users/${userId}/${postUserId}/${status}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return deleteFriendRequestResponse;
    } catch (error) {
      console.log("deleteFriendRequest error:", error);
    }
  }

  public async patchFriends(
    userId: string | undefined,
    acceptDeleteFriendId: string,
    id: string | undefined,
    status: string
  ): Promise<any> {
    const t0 = performance.now();
    try {
      const patchFriendsResponse = await this.axiosInstance.patch(
        `/api/users/${userId}/${acceptDeleteFriendId}/${id}/${status}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return patchFriendsResponse;
    } catch (error) {
      console.log("patchFriends error:", error);
    } finally {
      const t1 = performance.now();

      const elapsedMs = t1 - t0;
      const elapsedSec = (elapsedMs / 1000).toFixed(3);

      console.log(`patchFriend API took ${elapsedSec} s`);
    }
  }
}

export default new FriendService();
