/* eslint-disable import/no-anonymous-default-export */
import BaseApiService from "./BaseApiService";

export interface PaginatedNotifications {
  notifications: any[];
  nextCursor: string | null;
}

class NotificationService extends BaseApiService {
  constructor() {
    super();
  }

  public async handlePostNotification(posts: any): Promise<any> {
    try {
      // const baseUrl = this.getDefaultApiUrl();
      const notificationPayload = {
        _id: posts._id,
        title: `${posts.firstName} ${posts.lastName}`,
        body: `shared new post: ${posts.description}`,
        // icon: `${baseUrl}/api/assets/${posts.userPicturePath}`,
        icon: `${posts.userPicturePath}`,
        userId: posts.userId,
      };

      const notificationResponse = await this.axiosInstance.post(
        "/api/notifications/send-post-notification",
        notificationPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return notificationResponse;
    } catch (error) {
      console.log("handlePostNotification error: ", error);
    }
  }

  public async handleLikeNotification(
    firstName: string,
    lastName: string,
    picture: string,
    id: string,
    likedUserId: string,
    likedUserName: string,
    desc: string
  ): Promise<any> {
    try {
      // const baseUrl = this.getDefaultApiUrl();
      const notificationPayload = {
        _id: id,
        title: `${firstName} ${lastName}`,
        icon: `${picture}`,
        userId: id,
        likedUserId,
        likedUserName,
        desc,
      };

      const notificationResponse = await this.axiosInstance.post(
        "/api/notifications/send-like-notification",
        notificationPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("handleLikeNotification error: ", error);
    }
  }

  public async handleCommentNotification(
    firstName: string,
    lastName: string,
    picture: string,
    id: string,
    commentUserId: string,
    commentUserName: string,
    desc: string
  ): Promise<any> {
    try {
      // const baseUrl = this.getDefaultApiUrl();
      const notificationPayload = {
        _id: `${id}${new Date().getTime()}-${Math.random()
          .toString(36)
          .slice(2, 11)}`,
        title: `${firstName} ${lastName}`,
        // icon: `${baseUrl}/api/assets/${picture}`,
        icon: `${picture}`,
        userId: id,
        commentUserId,
        commentUserName,
        desc,
      };

      const notificationResponse = await this.axiosInstance.post(
        "/api/notifications/send-comment-notification",
        notificationPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("handleCommentNotification error: ", error);
    }
  }

  public async notifySendRequest(
    firstName: string,
    lastName: string,
    picture: string,
    id: string | undefined
  ): Promise<any> {
    try {
      const notificationPayload = {
        userId: id,
        title: `${firstName} ${lastName}`,
        body: "send you a friend request.",
        icon: `${picture}`,
      };
      const notificationResponse = await this.axiosInstance.post(
        "/api/notifications/send-friendRequest",
        notificationPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("notifySendRequest response", notificationResponse);
      return notificationResponse;
    } catch (error) {
      console.log("notifySendRequest error: ", error);
    }
  }

  public async notifyAcceptFriendRequest(
    firstName: string,
    lastName: string,
    picture: string,
    id: string
  ): Promise<any> {
    try {
      // const baseUrl = this.getDefaultApiUrl();
      const notificationPayload = {
        userId: id,
        title: `${firstName} ${lastName}`,
        body: "accepted your friend request.",
        // icon: `${baseUrl}/api/assets/${picture}`,
        icon: `${picture}`,
      };

      const notificationResponse = await this.axiosInstance.post(
        "/api/notifications/accept-friendRequest",
        notificationPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("notifyAcceptFriendRequest error: ", error);
    }
  }

  public async fetchNotifications(userId: string): Promise<any> {
    try {
      const notificationResponse = await this.axiosInstance.get(
        `/api/notifications/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("fetchNotifications error: ", error);
    }
  }

  public async fetchMoreNotifications(
    page: number,
    userId: string
  ): Promise<any> {
    try {
      const notificationResponse = await this.axiosInstance.get(
        `/api/notifications/${userId}`,
        {
          params: { page, limit: 5 },
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("fetchMoreNotifications error: ", error);
    }
  }

  public async fetchNotificationsPage(
    userId: string | undefined,
    after?: any, // cursor for pagination
    limit = 5 // page size
  ): Promise<PaginatedNotifications> {
    const response = await this.axiosInstance.get<PaginatedNotifications>(
      `/api/notifications/${userId}`,
      {
        params: { ...(after ? { after } : {}), limit },
      }
    );
    return response.data;
  }

  public async fetchUnreadNotificationCount(
    userId: string | undefined
  ): Promise<any> {
    try {
      const notificationResponse = await this.axiosInstance.get(
        `/api/notifications/unreadNotification/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("fetchUnreadNotificationCount error: ", error);
    }
  }

  public async fetchNotificationCount(
    userId: string | undefined
  ): Promise<any> {
    try {
      const notificationResponse = await this.axiosInstance.get(
        `/api/notifications/notificationCount/${userId}`,
        {
          withCredentials: true,
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("fetchNotificationCount error: ", error);
    }
  }

  public async markNotificationUnread(
    userId: string | undefined
  ): Promise<any> {
    try {
      const notificationResponse = await this.axiosInstance.patch(
        `/api/notifications/markRead/${userId}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return notificationResponse;
    } catch (error) {
      console.log("markNotificationUnread error: ", error);
    }
  }

  public async markSingleNotificationUnread(notificationId: any): Promise<any> {
    try {
      const notificationResponse = await this.axiosInstance.patch(
        `/api/notifications/singleMarkRead/${notificationId}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("markSingleNotificationUnread", notificationResponse.data);

      return notificationResponse.data;
    } catch (error) {
      console.log("markNotificationUnread error: ", error);
    }
  }
}

export default new NotificationService();
