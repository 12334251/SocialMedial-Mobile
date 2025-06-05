import { Post, User, Comment } from "@/types";
import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
  EntityState,
} from "@reduxjs/toolkit";

// Create entity adapters with explicit type parameters
const postsAdapter = createEntityAdapter<Post, string>({
  selectId: (post) => post._id,
  // No sortComparer since backend already sends sorted data
});

const profilePostsAdapter = createEntityAdapter<Post, string>({
  selectId: (post) => post._id,
  // No sortComparer since backend already sends sorted data
});

export interface AuthState {
  mode: "light" | "dark";
  user: User | null;
  token: string | null;
  posts: EntityState<Post, string>;
  profilePosts: EntityState<Post, string>;
  friendRequestReceiver: string[];
  profileFriendRequestReceiver: string[];
  friendRequestSender: string[];
  currentProfileId: string | null;
}

const initialState: AuthState = {
  mode: "light",
  user: null,
  token: null,
  posts: postsAdapter.getInitialState(),
  profilePosts: profilePostsAdapter.getInitialState(),
  friendRequestReceiver: [],
  profileFriendRequestReceiver: [],
  friendRequestSender: [],
  currentProfileId: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setUserFriends: (
      state,
      action: PayloadAction<{ userId: string; status: string }>
    ) => {
      const { userId, status } = action.payload;
      if (state.user) {
        if (!state.user.friends) {
          state.user.friends = {};
        }
        if (status === "removed") {
          delete state.user.friends[userId];
        } else {
          state.user.friends[userId] = status;
        }
      }
    },
    setPosts: (state, action: PayloadAction<{ posts: Post[] }>) => {
      // Replace all posts with new data
      postsAdapter.setAll(state.posts, action.payload.posts);
    },
    setMorePosts: (state, action: PayloadAction<{ posts: Post[] }>) => {
      // Add new posts (duplicates will be ignored due to entity adapter)
      postsAdapter.addMany(state.posts, action.payload.posts);
    },
    setPost: (state, action: PayloadAction<{ post: Post }>) => {
      // Upsert single post (add if new, update if exists)
      postsAdapter.upsertOne(state.posts, action.payload.post);
    },
    addPost: (state, action: PayloadAction<Post>) => {
      // Add new post
      postsAdapter.addOne(state.posts, action.payload);
    },
    updatePost: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Post> }>
    ) => {
      // Update specific post fields
      postsAdapter.updateOne(state.posts, action.payload);
    },
    setFriendPosts: (
      state,
      action: PayloadAction<{ postUserId: string; isFriend: string }>
    ) => {
      const { postUserId, isFriend } = action.payload;
      // Update all posts from a specific user
      const postsToUpdate = Object.values(state.posts.entities)
        .filter((post) => post && post.userId === postUserId)
        .map((post) => ({
          id: post!._id,
          changes: { isFriend },
        }));

      postsAdapter.updateMany(state.posts, postsToUpdate);
    },
    setProfilePosts: (
      state,
      action: PayloadAction<{ profilePosts: Post[] }>
    ) => {
      // Replace all profile posts
      profilePostsAdapter.setAll(
        state.profilePosts,
        action.payload.profilePosts
      );
    },
    setUpdateProfilePosts: (
      state,
      action: PayloadAction<{ profilePosts: Post[] }>
    ) => {
      // Add new profile posts (entity adapter handles duplicates)
      profilePostsAdapter.addMany(
        state.profilePosts,
        action.payload.profilePosts
      );
    },
    toggleLike: (
      state,
      action: PayloadAction<{ postId: string; userId: string }>
    ) => {
      const { postId, userId } = action.payload;
      const post = state.posts.entities[postId];
      if (!post) return;
      // flip it
      if (post.likes[userId]) {
        // un-like
        delete post.likes[userId];
      } else {
        post.likes[userId] = true;
      }
    },

    // 2) Optimistically add a comment
    addCommentOptimistic: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>
    ) => {
      const { postId, comment } = action.payload;
      const post = state.posts.entities[postId];
      if (!post) return;
      post.comments.push(comment);
    },
    setFriendRequestReceiver: (
      state,
      action: PayloadAction<{ friendRequestReceiver: string[] }>
    ) => {
      state.friendRequestReceiver = action.payload.friendRequestReceiver;
    },
    setProfileFriendRequestReceiver: (
      state,
      action: PayloadAction<{ profileFriendRequestReceiver: string[] }>
    ) => {
      state.profileFriendRequestReceiver =
        action.payload.profileFriendRequestReceiver;
    },
    setFriendRequestSender: (
      state,
      action: PayloadAction<{ friendRequestSender: string[] }>
    ) => {
      state.friendRequestSender = action.payload.friendRequestSender;
    },
    setCurrentProfileId: (state, action: PayloadAction<string | null>) => {
      state.currentProfileId = action.payload;
    },
  },
});

// Export actions
export const {
  setMode,
  setLogin,
  setLogout,
  setUserFriends,
  setPosts,
  setMorePosts,
  setPost,
  addPost,
  updatePost,
  toggleLike,
  addCommentOptimistic,
  setFriendPosts,
  setProfilePosts,
  setUpdateProfilePosts,
  setFriendRequestReceiver,
  setProfileFriendRequestReceiver,
  setFriendRequestSender,
  setCurrentProfileId,
} = authSlice.actions;

// Create selectors using the entity adapters
export const postsSelectors = postsAdapter.getSelectors<{ auth: AuthState }>(
  (state) => state.auth.posts
);

export const profilePostsSelectors = profilePostsAdapter.getSelectors<{
  auth: AuthState;
}>((state) => state.auth.profilePosts);

// Convenience selectors
export const selectAllPosts = postsSelectors.selectAll;
export const selectPostById = postsSelectors.selectById;
export const selectPostIds = postsSelectors.selectIds;
export const selectTotalPosts = postsSelectors.selectTotal;

export const selectAllProfilePosts = profilePostsSelectors.selectAll;
export const selectProfilePostById = profilePostsSelectors.selectById;

export default authSlice.reducer;
