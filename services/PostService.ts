/* eslint-disable import/no-anonymous-default-export */
// PostService.ts
import BaseApiService from "./BaseApiService";

export interface PaginatedPosts {
  posts: any[];
  nextCursor: string | null;
}

export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

class PostService extends BaseApiService {
  constructor() {
    super();
  }

  /**
   * handlePost creates a new post by sending a FormData payload.
   * After a successful post creation (HTTP 201), it sends a notification.
   *
   * @param userId - The ID of the current user.
   * @param postDescription - The description of the post.
   * @param picturePath - The user's picture path.
   * @param image - (Optional) A File object if an image is attached.
   * @returns The created post and notification data.
   */
  public async handlePost(
    userId: string,
    postDescription: string,
    picturePath: string,
    image?: RNFile
  ): Promise<any> {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", postDescription);
    formData.append("userPicturePath", picturePath);
    if (image) {
      formData.append("picturePath", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    }
    const postResponse = await this.axiosInstance.post("/api/posts", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    return postResponse;
  }

  public async handleLike(
    postId: string,
    loggedInUserId: string
  ): Promise<any> {
    try {
      const likeResponse = await this.axiosInstance.patch(
        `/api/posts/${postId}/like`,
        { userId: loggedInUserId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return likeResponse;
    } catch (error) {
      console.log("handleLike error:", error);
    }
  }

  public async handleComment(
    postId: string,
    loggedInUserId: string,
    comment: string
  ): Promise<any> {
    try {
      const commentResponse = await this.axiosInstance.post(
        `/api/posts/${postId}/comment`,
        { userId: loggedInUserId, comment },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return commentResponse;
    } catch (error) {
      console.log("handleComment error: ", error);
    }
  }

  public async fetchFeedPosts(
    userId: string | undefined,
    after?: any, // pageParam
    limit: number = 5 // page size
  ): Promise<PaginatedPosts> {
    const { data } = await this.axiosInstance.get<PaginatedPosts>(
      `/api/posts/${userId}`,
      {
        params: { after, limit },
      }
    );

    return data;
  }

  /** Cursor‐based profile pagination */
  public async fetchUserPosts(
    userId: string,
    after?: any,
    limit: number = 5
  ): Promise<PaginatedPosts> {
    const { data } = await this.axiosInstance.get<PaginatedPosts>(
      `/api/posts/${userId}/posts`,
      {
        params: { after, limit },
      }
    );
    return data;
  }

  public async fetchUserProfilePost(
    userId: string,
    loggedUserId: string,
    token: string | null
  ): Promise<any> {
    try {
      const profilePostResponse = await this.axiosInstance.get(
        `/api/posts/${userId}/posts`,
        {
          withCredentials: true,
          params: { page: 1, limit: 5, loggedUserId },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return profilePostResponse;
    } catch (error) {
      console.log("fetchUserProfilePost error: ", error);
    }
  }
}

export default new PostService();
