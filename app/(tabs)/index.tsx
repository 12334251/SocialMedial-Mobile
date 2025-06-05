import React, { useState, useRef, useEffect } from "react";
import { FlatList, View, Platform, Animated, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { selectAllPosts, setPosts } from "@/redux/state";
import PostWidget from "@/components/Widgets/PostWidget";
import { usePostsInfinite } from "@/Utils/InfiniteScroll";
import FriendService from "@/services/FriendService";
import { useAuth } from "@/Context/AuthContext";
import { setPendingRequests } from "@/redux/state/friendRequests";
import { setAcceptedRequests } from "@/redux/state/acceptedRequest";
import PostPlaceholder from "@/components/Placeholder/PostPlaceholder";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNotifications } from "@/Utils/notificationInfiniteQuery";
import {
  setNotification,
  setNotificationCount,
} from "@/redux/state/notification";
import { useScrollToTop } from "@react-navigation/native";
import CreatePostModal from "@/components/CreatePostModal";
import CratePostHeader from "@/components/CratePostHeader";
import { AntDesign } from "@expo/vector-icons";
import NotificationService from "@/services/NotificationService";

export default function HomeScreen() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);

  // ─── 1) HEIGHT CONSTANTS ───────────────────────────────────────────────────────
  // Height of just the "logo + search" row (excluding safe‐area):
  const NAV_BAR_CONTENT_HEIGHT = 56;
  // Safe‐area top inset (status bar / notch) + nav‐bar row:
  const TOP_BAR_HEIGHT = insets.top + NAV_BAR_CONTENT_HEIGHT;

  // ─── 2) ANIMATED VALUE FOR TRANSLATE Y (TOP BAR) ───────────────────────────────
  const headerTranslateY = useRef<any>(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // ─── 3) STATE TO TRACK IF TOP BAR IS HIDDEN ─────────────────────────────────────
  const [headerHidden, setHeaderHidden] = useState(false);

  // ─── 4) KEEP LAST SCROLL OFFSET FOR DIRECTION CHECK ─────────────────────────────
  const lastScrollY = useRef(0);
  const HIDE_THRESHOLD = 10; // scroll down by ≥10 → hide top bar
  const SHOW_THRESHOLD = 10; // scroll up by ≥10 → show top bar

  // ─── 5) POSTS & NOTIFICATIONS INFINITE QUERIES ─────────────────────────────────
  const {
    data: postPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: isFetchingPosts,
  } = usePostsInfinite(user?._id);
  const allPosts = useSelector(selectAllPosts);

  const {
    data: notificationPages,
    fetchNextPage: notificationFetchNextPage,
    hasNextPage: notificationHasNextPage,
    isFetchingNextPage: notificationIsFetchingNextPage,
    isFetching: notificationIsFetching,
  } = useNotifications(user?._id);

  // fetch total count once
  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      const response = await NotificationService.fetchUnreadNotificationCount(
        user?._id
      );

      // console.log("fetchUnreadNotificationCount:", response);
      if (response) {
        dispatch(setNotificationCount({ notificationCount: response.data }));
      }
    };

    fetchUnreadNotificationCount();
  }, [user?._id]);

  // Populate Redux with all posts
  useEffect(() => {
    if (!user?._id) return;
    const allPostsArray = postPages?.pages.flatMap((p) => p.posts) ?? [];
    dispatch(setPosts({ posts: allPostsArray }));
  }, [user?._id, dispatch, postPages]);

  // Populate Redux with all notifications
  useEffect(() => {
    if (!user?._id) return;
    notificationPages?.pages.flatMap((p: any) => p.notifications) ?? [];
  }, [user?._id, dispatch, notificationPages]);

  // Load friend requests once
  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const [pendingRes, acceptedRes] = await Promise.all([
          FriendService.fetchPendingFriendRequest(user._id),
          FriendService.fetchAcceptedFriendRequest(user._id),
        ]);
        // console.log("pendingRes?.data", pendingRes?.data, acceptedRes?.data);
        dispatch(setPendingRequests(pendingRes?.data));
        dispatch(setAcceptedRequests(acceptedRes?.data));
      } catch (err) {
        console.error("Error loading friends:", err);
      }
    })();
  }, [user?._id, dispatch]);

  // Scroll-to-top when tab reselected
  useScrollToTop(flatListRef);

  // ─── 6) HIDE / SHOW ANIMATION FOR TOP BAR ────────────────────────────────────────
  const hideHeader = () => {
    Animated.timing(headerTranslateY, {
      toValue: -TOP_BAR_HEIGHT, // slide up so the entire top bar (incl. safe area) is offscreen
      duration: 200,
      useNativeDriver: true,
    }).start(() => setHeaderHidden(true));
  };

  const showHeader = () => {
    Animated.timing(headerTranslateY, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setHeaderHidden(false));
  };

  // ─── 7) SCROLL HANDLER (ONLY HIDE IF WE’VE MOVED PAST TOP_BAR_HEIGHT) ───────────
  const handleOnScroll = (event: any) => {
    const currentRawY = event.nativeEvent.contentOffset.y;
    const currentY = Math.max(0, currentRawY); // Ensure currentY is not negative

    const delta = currentY - lastScrollY.current;
    const currentHeaderTranslateValue = headerTranslateY.__getValue();

    // --- Prevent header from showing due to loader appearance ---
    // If the loader is active (isFetchingNextPage is true),
    // and the header is currently hidden (headerHidden is true),
    // and we are not scrolling into the top "sync" region,
    // then we should prevent the sticky logic from accidentally showing the header.
    if (isFetchingNextPage && headerHidden && currentY > TOP_BAR_HEIGHT) {
      lastScrollY.current = currentY; // Update lastScrollY
      return; // Exit early, preventing sticky logic that might show the header
    }

    // --- Proceed with normal scroll logic ---
    if (currentY <= TOP_BAR_HEIGHT) {
      // --- Phase 1: Synchronized Scroll Region ---
      if (
        !headerHidden &&
        Math.abs(currentHeaderTranslateValue) < 0.1 &&
        currentY > 0 &&
        delta <= 0
      ) {
        // Header is fully visible (translateY is ~0) and we are scrolling UP towards currentY = 0.
        // KEEP headerTranslateY at its current ~0 value to prevent the "vanish" jump.
        if (headerHidden) {
          setHeaderHidden(false);
        }
      } else {
        // Normal sync behavior
        headerTranslateY.setValue(-currentY);
        const isNowHiddenBySync = -currentY <= -TOP_BAR_HEIGHT + 0.1;
        if (headerHidden !== isNowHiddenBySync) {
          setHeaderHidden(isNowHiddenBySync);
        }
      }
    } else {
      // --- Phase 2: Sticky Behavior Region (currentY > TOP_BAR_HEIGHT) ---
      // The `if (isFetchingNextPage && ...)` block above has already handled
      // the problematic case for this region when the loader is active.
      if (delta > HIDE_THRESHOLD && !headerHidden) {
        hideHeader();
      } else if (delta < -SHOW_THRESHOLD && headerHidden) {
        // If isFetchingNextPage was true, we would have returned early if currentY > TOP_BAR_HEIGHT.
        // So, this showHeader() call is generally safe from loader-induced triggers if far from top.
        showHeader();
      }
    }
    lastScrollY.current = currentY;
  };

  // ─── 8) BOTTOM TAB BAR SPACING ─────────────────────────────────────────────────
  const tabBarHeight = useBottomTabBarHeight();
  const footerSpacing = tabBarHeight;

  return (
    <>
      <CreatePostModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      <View className="flex-1 bg-white">
        {/* ─── Animated Top Bar (Logo + Search) ─────────────────────────────────── */}
        <Animated.View
          className="absolute top-0 right-0 left-0 z-10 bg-white overflow-hidden"
          style={{
            height: TOP_BAR_HEIGHT,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          {/* Safe-area padding so that logo+search sits below notch/status bar */}
          <View style={{ paddingTop: insets.top, backgroundColor: "white" }}>
            <View
              style={{
                height: NAV_BAR_CONTENT_HEIGHT,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 12,
              }}
            >
              <Image
                source={require("../../assets/images/SMLogoImg.png")}
                resizeMode="contain"
                style={{ width: 56, height: 56 }}
              />
              <AntDesign name="search1" size={24} color="black" />
            </View>
          </View>
        </Animated.View>

        {/* ─── FlatList w/ CratePostHeader as the first visible row ────────────────── */}
        <Animated.FlatList
          ref={flatListRef}
          data={allPosts}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id.toString()}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: false,
              listener: handleOnScroll,
            }
          )}
          // Only pad by TOP_BAR_HEIGHT (logo+search). CratePostHeader will render immediately below.
          contentContainerStyle={{
            paddingTop: TOP_BAR_HEIGHT,
            paddingBottom: Platform.OS === "ios" ? footerSpacing + 20 : 20,
            backgroundColor: "white",
          }}
          ListHeaderComponent={
            <CratePostHeader onPressCreatePost={() => setModalVisible(true)} />
          }
          renderItem={({ item, index }) => (
            <View>
              <PostWidget
                userId={user?._id}
                postId={item._id}
                postUserId={item.userId}
                name={`${item.firstName} ${item.lastName}`}
                description={item.description}
                location={item.location}
                picturePath={item.picturePath}
                userPicturePath={item.userPicturePath}
                likes={item.likes}
                comments={item.comments}
                isFriend={item.isFriend}
                onFirstProfileWarning={() => null}
              />
              {index !== allPosts.length - 1 && (
                <View
                  style={{
                    height: 4,
                    backgroundColor: "#cccccc",
                    marginVertical: 8,
                  }}
                />
              )}
            </View>
          )}
          ListFooterComponent={() =>
            isFetchingNextPage ? <PostPlaceholder /> : null
          }
          ListEmptyComponent={<PostPlaceholder />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </>
  );
}
