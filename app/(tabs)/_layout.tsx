import { Tabs } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/Context/AuthContext";
import NotificationService from "@/services/NotificationService";
import { useWebSocket } from "@/Context/WebSocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementNotificationCount,
  prependNotification,
  setNotificationCount,
} from "@/redux/state/notification";
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import NotificationIcon from "@/components/NotificationIcon";
import UserService from "@/services/UserService";
import FriendService from "@/services/FriendService";
import * as SecureStore from "expo-secure-store";
import {
  addPendingRequest,
  removePendingRequest,
  setPendingRequests,
} from "@/redux/state/friendRequests";
import { PaginatedPosts } from "@/services/PostService";
import { setUserFriends } from "@/redux/state";
import {
  addAcceptedRequest,
  removeAcceptedRequest,
  setAcceptedRequests,
} from "@/redux/state/acceptedRequest";

export default function TabLayout() {
  const { socket } = useWebSocket(); // Get isConnected
  const qc = useQueryClient();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const friendRequest = useSelector(
    (state: any) => state.auth?.friendRequestReceiver
  );
  const unreadNotificationCount = useSelector(
    (state: any) => state.notifications.notificationCount
  );
  const shakeOffset = useSharedValue(0);
  const prevCountRef = useRef(unreadNotificationCount);
  const hasRun = useRef(false);

  // --- New state and ref for AppState handling ---
  const appState = useRef(AppState.currentState);
  const [isAppActive, setIsAppActive] = useState(appState.current === "active");
  const [justCameFromBackground, setJustCameFromBackground] = useState(false);
  const isInitialMount = useRef(true); // Flag to track initial mount/load sequence

  // console.log("appState.current", appState.current);

  const friendIdToCheck = "6802bb1892295ddc8ffab08a";
  const friendRequestKey = `friendRequestSent_${user?._id}`;

  const isFriend = Boolean(user?.friends && user?.friends[friendIdToCheck]);

  // console.log("isFriend check :", isFriend, user);

  // Your existing console logs for initial state
  // console.log("Initial appState.current (ref at render):", appState.current);
  // console.log("Initial isAppActive (state at render):", isAppActive);
  // console.log(
  //   "isFriend check :",
  //   Boolean(user?.friends && user?.friends[friendIdToCheck]),
  //   user
  // );

  const refreshEssentialData = useCallback(async () => {
    // The isAppActive check here is using the state variable, which will be true
    // when this is called by the second useEffect.
    // console.log(
    //   "refreshEssentialData called. User ID:",
    //   user?._id,
    //   "isAppActive state:",
    //   isAppActive
    // );
    if (!user?._id) {
      // console.log("🔄 User not available, skipping data refresh.");
      return;
    }
    if (!isAppActive) {
      // Defensive check, should be true if called from the intended effect
      // console.log(
      //   "🔄 App not active according to state, skipping data refresh (unexpected)."
      // );
      return;
    }

    // console.log(
    //   `🔄 Refreshing essential data for user ${user._id} (App Active: ${isAppActive})`
    // );

    // console.log(`🔄 Invalidating posts query: ["posts", "${user._id}"]`);
    await qc.invalidateQueries({ queryKey: ["posts", user._id] });
    await qc.invalidateQueries({ queryKey: ["notifications", user._id] });

    fetchUnreadNotificationCount(); // Ensure this function is defined and stable

    const [pendingRes, acceptedRes] = await Promise.all([
      FriendService.fetchPendingFriendRequest(user._id),
      FriendService.fetchAcceptedFriendRequest(user._id),
    ]);
    // console.log("pendingRes?.data", pendingRes?.data, acceptedRes?.data);
    dispatch(setPendingRequests(pendingRes?.data));
    dispatch(setAcceptedRequests(acceptedRes?.data));

    // console.log("🔄 Essential data refresh triggered.");
  }, [user, isAppActive, qc]); // Added fetchUnreadNotificationCount if it's not stable

  // --- Effect for AppState listener setup ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appState.current; // Get the state before this change
      appState.current = nextAppState; // Update ref to the new current state

      const currentlyActive = nextAppState === "active";
      setIsAppActive(currentlyActive);

      // console.log(
      //   `AppState Changed: Prev: ${previousAppState}, Next: ${nextAppState}, InitialMountRef: ${isInitialMount.current}`
      // );

      if (isInitialMount.current && currentlyActive) {
        // This is the first 'active' state since the component mounted (cold start).
        // We don't treat this as "coming from background".
        // console.log("App became active on initial mount/load sequence.");
        isInitialMount.current = false; // Mark that initial mount 'active' has occurred.
        setJustCameFromBackground(false); // Ensure it's not flagged as from background.
        return; // Important: Don't proceed to the background check for initial active
      }

      // Check if app came from background/inactive to active
      if (previousAppState.match(/inactive|background/) && currentlyActive) {
        // console.log("App transitioned from background/inactive to active.");
        setJustCameFromBackground(true); // Set the flag
      } else if (!currentlyActive) {
        // App is going to background or becoming inactive
        // Reset the flag if it's no longer active, though the effect below handles resetting after use.
        setJustCameFromBackground(false);
      }
    };

    // Initialize appState.current and handle initial active state on mount
    appState.current = AppState.currentState;
    setIsAppActive(AppState.currentState === "active"); // Sync state

    if (AppState.currentState === "active" && isInitialMount.current) {
      // console.log(
      //   "Component mounted and AppState is already active (initial)."
      // );
      isInitialMount.current = false; // It's active now, so not "initial mount pending active" anymore.
    }

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []); // Empty dependency array: This effect sets up the listener once on mount.

  // --- Effect to trigger refresh when app becomes active FROM BACKGROUND ---
  useEffect(() => {
    // console.log(
    //   `Refresh Effect Check: isAppActive: ${isAppActive}, justCameFromBackground: ${justCameFromBackground}, user: ${!!user?._id}`
    // );

    if (isAppActive && justCameFromBackground && user?._id) {
      // console.log(
      //   "🌄 App came to foreground from background. Triggering refresh."
      // );
      refreshEssentialData();
      setJustCameFromBackground(false); // Reset the flag immediately after use
    } else if (justCameFromBackground && !isAppActive) {
      // Edge case: if somehow flagged but app isn't active, reset.
      setJustCameFromBackground(false);
    }
  }, [isAppActive, justCameFromBackground, user, refreshEssentialData]);

  useEffect(() => {
    // If user is not defined, bail out.
    if (!user) {
      return;
    }

    // Define an async worker to check SecureStore + send friend request:
    const checkAndSendFriendRequest = async () => {
      try {
        // See if we already stored a flag that we sent a request for this pair:
        const storedFlag = await SecureStore.getItemAsync(friendRequestKey);
        // storedFlag === "true" means we’ve already sent it once.

        // console.log("storedFlag:", storedFlag);

        if (storedFlag === "true") {
          return; // Already sent → bail out
        }

        // Recompute isFriend in case user.friends changed before this hook fired:
        const stillFriend = Boolean(
          user.friends && user.friends[friendIdToCheck]
        );

        // console.log(
        //   "!storedFlag && !stillFriend && user._id !== friendIdToCheck",
        //   stillFriend,
        //   friendIdToCheck,
        //   user
        // );
        if (
          storedFlag === null &&
          !stillFriend &&
          user._id !== friendIdToCheck
        ) {
          // Wait 10 seconds, then send the request:
          setTimeout(async () => {
            try {
              await sendFriendRequest(friendIdToCheck);
              // Once sent, store “true” in SecureStore so we won’t fire again:
              await SecureStore.setItemAsync(friendRequestKey, "true");
            } catch (reqErr) {
              console.warn("Error sending friend request:", reqErr);
            }
          }, 10_000);
        }
      } catch (err) {
        console.warn("SecureStore error or other:", err);
      }
    };

    checkAndSendFriendRequest();
  }, [user?._id]);

  const sendFriendRequest = async (FirstTimeFriendSenderUserId: string) => {
    if (!user) {
      return;
    }

    // 2.a) Fetch the friend's data (so we can get their name/picture)
    let friendProfile;
    try {
      const response = await UserService.fetchUser(friendIdToCheck);
      friendProfile = response.data;
    } catch (fetchErr) {
      console.warn("Failed to fetch friend’s user data:", fetchErr);
      return;
    }

    // 2.b) Actually send the friend request:
    let sendFriendRequestRes;
    try {
      sendFriendRequestRes = await FriendService.sendFriendRequest(
        FirstTimeFriendSenderUserId,
        user._id
      );
      // console.log("sendFriendRequestRes", sendFriendRequestRes);
    } catch (sendErr) {
      console.warn("Failed to send friend request:", sendErr);
      return;
    }

    // 2.c) If the HTTP status is 201 (Created), notify via socket + update local cache:
    if (sendFriendRequestRes?.status === 201) {
      // console.log(
      //   "New friendRequest socket.io request received:",
      //   sendFriendRequestRes?.data
      // );
      const senderId = sendFriendRequestRes?.data.friendRequestSenderId;

      //  • Dispatch into Redux slice of pending requests:
      // dispatch(addPendingRequest(sendFriendRequestRes?.data));

      //  • Update any cached “posts” for this user:: mark those posts as “pending”
      qc.setQueryData<PaginatedPosts>(["posts", user._id], (old: any) => {
        if (!old) return old;

        // Also dispatch an action to set this friend’s status to “pending”
        dispatch(
          setUserFriends({
            userId: senderId,
            status: "pending",
          })
        );

        // Update each page’s posts array:
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.userId === senderId ? { ...post, isFriend: "pending" } : post
            ),
          })),
        };
      });

      // 2.d) Send a push or in-app notification:
      try {
        await NotificationService.notifySendRequest(
          friendProfile.firstName,
          friendProfile.lastName,
          friendProfile.picturePath,
          user._id
        );
      } catch (notifyErr) {
        console.warn("Failed to send notification:", notifyErr);
      }
    }
  };

  useEffect(() => {
    if (unreadNotificationCount > prevCountRef.current) {
      // cancel any in-flight animation
      cancelAnimation(shakeOffset);
      // do: left, right, left, right, back to 0
      shakeOffset.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withRepeat(
          withSequence(
            withTiming(8, { duration: 50 }),
            withTiming(-8, { duration: 50 })
          ),
          2,
          true
        ),
        withTiming(0, { duration: 50 })
      );
    }
    prevCountRef.current = unreadNotificationCount;
  }, [unreadNotificationCount, shakeOffset]);

  // Subscribe to real-time notifications via WebSocket
  // Whenever a "notification" event arrives, patch React Query’s cache:
  useEffect(() => {
    if (!socket || !user?._id) return;
    const key = ["notifications", user._id];
    const countKey = ["notificationsCount", user._id];

    // 1) A generic notification arrives (could be "postNotification", "friendRequest", etc).
    const handleNotification = ({ data }: { data: any }) => {
      dispatch(incrementNotificationCount());
      // console.log("new socket.io handleNotification", data);
      const newNotif = data; // assume `data` is exactly one notification object

      // 1a) Prepend to the front of page 0 in the infinite query:
      qc.setQueryData(key, (old: any) => {
        if (!old) {
          // If there's no cache yet, create an initial shape with one page.
          return {
            pages: [
              {
                notifications: [newNotif],
                nextCursor: old?.nextCursor ?? null,
              },
            ],
            pageParams: old?.pageParams ?? [null],
          };
        }

        // Otherwise, insert into page 0
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  notifications: [newNotif, ...page.notifications],
                }
              : page
          ),
        };
      });

      // 1b) Also bump unread count in cache (if you have an unread‐count query)
      qc.setQueryData(countKey, (oldCount: number | undefined) => {
        if (typeof oldCount !== "number") return 1;
        return oldCount + 1;
      });
    };

    // 2) You may also have separate event names for likes/comments. Doing the same cache patch:
    const handleLikeNotification = ({ data }: { data: any }) => {
      // console.log("new socket.io handleLikeNotification", data);
      dispatch(incrementNotificationCount());
      const likeNotif = data;
      qc.setQueryData(key, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? { ...page, notifications: [likeNotif, ...page.notifications] }
              : page
          ),
        };
      });
      qc.setQueryData(countKey, (oldCount: number | undefined) =>
        typeof oldCount === "number" ? oldCount + 1 : 1
      );
    };

    // 3) Repeat for comment/friendRequest/accept events:
    const handleCommentNotification = ({ data }: { data: any }) => {
      // console.log("new socket.io handleCommentNotification", data);
      dispatch(incrementNotificationCount());
      const commentNotif = data;
      qc.setQueryData(key, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  notifications: [commentNotif, ...page.notifications],
                }
              : page
          ),
        };
      });
      qc.setQueryData(countKey, (oldCount: number | undefined) =>
        typeof oldCount === "number" ? oldCount + 1 : 1
      );
    };

    const handleFriendRequestNotification = ({ data }: { data: any }) => {
      // console.log("new socket.io handleFriendRequestNotification", data);
      dispatch(incrementNotificationCount());
      const friendReqNotif = data;
      qc.setQueryData(key, (old: any) => {
        if (!old) {
          return {
            pages: [
              {
                notifications: [friendReqNotif],
                nextCursor: null,
              },
            ],
            pageParams: [null],
          };
        }
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  notifications: [friendReqNotif, ...page.notifications],
                }
              : page
          ),
        };
      });
      qc.setQueryData(countKey, (oldCount: number | undefined) =>
        typeof oldCount === "number" ? oldCount + 1 : 1
      );
    };

    // 4) Wire up your socket events:
    socket.on("postNotification", handleNotification);
    socket.on("likeNotification", handleLikeNotification);
    socket.on("commentNotification", handleCommentNotification);
    socket.on("friendRequestNotification", handleFriendRequestNotification);

    return () => {
      socket.off("postNotification", handleNotification);
      socket.off("likeNotification", handleLikeNotification);
      socket.off("commentNotification", handleCommentNotification);
      socket.off("friendRequestNotification", handleFriendRequestNotification);
    };
  }, [socket, user, qc]);

  useEffect(() => {
    if (!socket) return;

    // 1) New post → prepend
    const handleNewPost = ({ data: newPost }: { data: any }) => {
      // console.log("New socket.io post received:", newPost);
      qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
        if (!old) return old;
        // dedupe
        if (
          old.pages.some((p: any) =>
            p.posts.some((x: any) => x._id === newPost._id)
          )
        )
          return old;
        // prepend to first page
        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [{ ...first, posts: [newPost, ...first.posts] }, ...rest],
        };
      });
    };

    // 2) Like update → merge into existing post
    const handleLike = (updatedPost: any) => {
      // console.log("handleLike socket.io:", updatedPost);
      qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post._id === updatedPost._id
                ? { ...post, likes: updatedPost.likes }
                : post
            ),
          })),
        };
      });
    };

    // 3) Comment update → merge into existing post
    const handleComment = ({ data: updatedPost }: { data: any }) => {
      qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post._id === updatedPost._id
                ? { ...post, comments: updatedPost.comments }
                : post
            ),
          })),
        };
      });
    };

    // 4) Friend‐accept & friend‐remove → update isFriend flag
    const handleFriendRequestAccept = ({ status }: any) => {
      const { action, loggedUserId, friendId, friendRequestData } = status;
      qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => {
              // If this post belongs to the affected user
              if (post.userId === loggedUserId || post.userId === friendId) {
                // accepted → set to "accepted", removed → clear
                if (action === "accepted friend request") {
                  return { ...post, isFriend: "accepted" };
                }
                if (action === "removed friend") {
                  return { ...post, isFriend: "" };
                }
              }
              return post;
            }),
          })),
        };
      });

      // console.log("socket.io friendRequestData", friendRequestData);

      //   Friend-accept & -remove → update Redux state
      // Redux updates
      if (action === "accepted friend request") {
        dispatch(addAcceptedRequest(friendRequestData));
        dispatch(setUserFriends({ userId: loggedUserId, status: "accepted" }));
      }

      if (action === "removed friend") {
        if (friendRequestData.isFriend === "pending") {
          dispatch(removePendingRequest({ requestId: friendRequestData._id }));
        } else {
          dispatch(removeAcceptedRequest({ requestId: friendRequestData._id }));
        }
        // filter‐out in O(n)
        const filtered = friendRequest.filter(
          (f: any) => f._id !== friendRequestData._id
        );
        dispatch(setUserFriends({ userId: loggedUserId, status: "removed" }));
      }
    };

    // 5) Friend-request received → mark sender’s posts as pending
    const handleFriendRequest = ({ data }: any) => {
      console.log("New friendRequest socket.io request received:", data);
      const senderId = data.friendRequestSenderId;
      dispatch(addPendingRequest(data));

      qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
        if (!old) return old;

        dispatch(
          setUserFriends({
            userId: data.friendRequestSenderId,
            status: "pending",
          })
        );

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.userId === senderId ? { ...post, isFriend: "pending" } : post
            ),
          })),
        };
      });
    };

    socket.on("postUpload", handleNewPost);
    socket.on("likeUpdate", handleLike);
    socket.on("commentUpdate", handleComment);
    socket.on("friendRequestAccept", handleFriendRequestAccept);
    socket.on("friendRequest", handleFriendRequest);

    return () => {
      socket.off("postUpload", handleNewPost);
      socket.off("likeUpdate", handleLike);
      socket.off("commentUpdate", handleComment);
      socket.off("friendRequestAccept", handleFriendRequestAccept);
      socket.off("friendRequest", handleFriendRequest);
    };
  }, [socket, qc, user, dispatch, friendRequest]);

  const fetchUnreadNotificationCount = async () => {
    const response = await NotificationService.fetchUnreadNotificationCount(
      user?._id
    );
    if (response) {
      dispatch(setNotificationCount({ notificationCount: response.data }));
    }
  };

  console.log("unreadNotificationCount:", unreadNotificationCount);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb", // active color
        tabBarInactiveTintColor: "#6d6d6d", // inactive color
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            // choose filled vs outline
            const iconName = focused ? "home" : "home-outline";
            return <Ionicons name={iconName} size={28} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, focused }) => {
            // choose filled vs outline
            const iconName = focused ? "people" : "people-outline";
            return <Ionicons name={iconName} size={28} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => {
            const isActive = focused || unreadNotificationCount > 0;
            const iconName = isActive
              ? "notifications"
              : "notifications-outline";

            const iconColor = isActive ? "#2563eb" : color;

            return (
              <NotificationIcon
                count={unreadNotificationCount}
                iconName={iconName}
                color={iconColor}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="userProfile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => {
            // choose filled vs outline
            const iconName = focused ? "person" : "person-outline";
            return <Ionicons name={iconName} size={28} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
