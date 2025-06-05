import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/FontAwesome6";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useProfilePostsInfinite } from "@/Utils/profilePostInfiniteQuery";
import UserPostsWidget from "@/components/Widgets/UserPostsWidget";
import UserService from "@/services/UserService";
import FriendService from "@/services/FriendService";
import { setProfileFriendRequestReceiver } from "@/redux/state";
import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

const AVATAR_SIZE = 112;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const NAV_BAR_CONTENT_HEIGHT = 56; // Height of the nav bar content itself (excluding safe area)

// Thresholds for animation (tune these values based on your visual preference)
// Start fading in/changing background when scrollY reaches this
const ANIMATION_START_THRESHOLD = SCREEN_HEIGHT * 0.08;
// Fully transitioned (name visible, background opaque) when scrollY reaches this
const ANIMATION_END_THRESHOLD = SCREEN_HEIGHT * 0.18;

const StyledExpoImage = cssInterop(ExpoImage, {
  className: "style",
});

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  // const screenHeight = Dimensions.get("window").height; // Already defined globally
  const profileUserFriendRequest = useSelector(
    (state: any) => state.auth?.profileFriendRequestReceiver
  );
  const [showToast, setShowToast] = useState(false);
  const [isUser, setIsUser] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerContentHeight, setHeaderContentHeight] = useState(0); // Still useful to know ProfileHeader's total height
  const [isHeaderOpaque, setIsHeaderOpaque] = useState(false); // To control shadow/elevation based on final state

  const STICKY_HEADER_TOTAL_HEIGHT = insets.top + NAV_BAR_CONTENT_HEIGHT;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProfilePostsInfinite(isUser?._id);

  const profilePost = data?.pages.flatMap((page) => page.posts) ?? [];
  const preview = profileUserFriendRequest.slice(0, 6);

  const cardShadow = {
    // This is for cards within the content, not the sticky header
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  };

  useEffect(() => {
    fetchPostUser();
    fetchFriendRequest();
  }, [id]);

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 1000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const fetchPostUser = async () => {
    try {
      if (id) {
        // console.log("fetchPostUser", id);
        const userRes = await UserService.fetchUser(id);
        // console.log("profile isUser Data", userRes);
        if (userRes.status === 200) {
          setIsUser(userRes.data);
        }
      }
    } catch (error) {
      console.error("fetchPostUser error: ", error);
    }
  };

  const fetchFriendRequest = async () => {
    try {
      const friendRes = await FriendService.fetchProfileFriendRequest(id);

      // console.log("friendRes.data", friendRes.data);

      dispatch(
        setProfileFriendRequestReceiver({
          profileFriendRequestReceiver: friendRes.data,
        })
      );
    } catch (error) {
      console.error("sendFriendRequest error: ", error);
    }
  };

  const friendDetails = (f: any) =>
    isUser?._id === f.friendRequestReceiverId
      ? f.friendRequestSenderDetails
      : f.friendRequestReceiverDetails;

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const ProfileHeader = () => {
    const joinedDate = new Date(isUser?.createdAt!).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const renderFriendCard = ({ item: f }: { item: any }) => {
      const friend = friendDetails(f);
      return (
        <View style={{ flex: 1 / 3, padding: 4 }}>
          <View className="rounded-lg shadow bg-white" style={cardShadow}>
            <StyledExpoImage
              source={{ uri: friend.picturePath }}
              className="w-full h-28 rounded-t-lg"
              contentFit="cover"
              cachePolicy="disk"
            />
            <Text
              className="p-2 text-xs font-semibold text-gray-800"
              numberOfLines={2}
            >
              {friend.firstName} {friend.lastName}
            </Text>
          </View>
        </View>
      );
    };

    return (
      <View
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderContentHeight(height); // Measures the entire ProfileHeader content
        }}
      >
        <StatusBar style="auto" />
        {/* COVER/BANNER SECTION */}
        <View
          className="w-full bg-[#2563eb] rounded-b-3xl" // Or your cover image here
          style={{ height: SCREEN_HEIGHT * 0.22, ...cardShadow }} // Using cardShadow here might be unintentional for a banner
        >
          {/* This view is the blue banner */}
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_SIZE / 2,
              backgroundColor: "white",
              overflow: Platform.OS === "ios" ? "visible" : "hidden",
              ...cardShadow, // Avatar shadow
              position: "absolute",
              bottom: -AVATAR_SIZE / 2,
              left: "50%",
              transform: [{ translateX: -AVATAR_SIZE / 2 }],
            }}
          >
            <Image
              source={{ uri: isUser?.picturePath }}
              className="rounded-full border-4 border-white bg-white"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: AVATAR_SIZE / 2,
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* NAME - Main Profile Name */}
        <View className="items-center mt-16">
          <Text className="text-2xl font-semibold text-black">
            {isUser?.firstName} {isUser?.lastName}
          </Text>
        </View>

        {/* ABOUT & JOINED */}
        <View className="flex gap-4 px-4 mt-6">
          <View className="bg-white rounded-2xl p-4" style={cardShadow}>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              About Me
            </Text>
            {isUser?.location && (
              <Text className="text-gray-700 mb-1">
                <Text className="font-medium">Location: </Text>
                {isUser.location}
              </Text>
            )}
            {isUser?.occupation && (
              <Text className="text-gray-700">
                <Text className="font-medium">Occupation: </Text>
                {isUser.occupation}
              </Text>
            )}
          </View>

          <View className="bg-white rounded-2xl p-4" style={cardShadow}>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Joined
            </Text>
            <Text className="text-gray-700">{joinedDate}</Text>
          </View>
        </View>

        {/* FRIENDS SECTION */}
        <View className="bg-white p-4 mt-4">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-xl font-bold text-black">Friends</Text>
              {profileUserFriendRequest.length > 0 && (
                <Text className="text-base text-gray-500">
                  {profileUserFriendRequest.length} friends
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowToast(true)}>
              <Text className="text-lg text-blue-600">Find friends</Text>
            </TouchableOpacity>
          </View>

          {profileUserFriendRequest.length > 0 ? (
            <FlatList
              data={preview}
              renderItem={renderFriendCard}
              keyExtractor={(item) => item._id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={{ marginHorizontal: -4 }}
            />
          ) : (
            <Text className="text-center font-worksans-400 text-black text-lg">
              This user currently has no friends.
            </Text>
          )}

          {profileUserFriendRequest.length > 0 && (
            <TouchableOpacity
              className="w-full bg-gray-200 p-2.5 rounded-lg mt-4"
              onPress={() => router.push("/(friends)")}
            >
              <Text className="text-center font-semibold text-black text-base">
                See all friends
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Your Posts Section */}
        {profilePost.length > 0 && (
          <View className="bg-white p-4 mt-2">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-black">Your posts</Text>
            </View>
            <View className="border-t border-gray-200" />
          </View>
        )}
      </View>
    );
  };

  // Interpolations for sticky header animations
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [ANIMATION_START_THRESHOLD, ANIMATION_END_THRESHOLD],
    outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"],
    extrapolate: "clamp",
  });

  const headerNameOpacity = scrollY.interpolate({
    inputRange: [ANIMATION_START_THRESHOLD, ANIMATION_END_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [
      ANIMATION_START_THRESHOLD,
      ANIMATION_END_THRESHOLD,
      ANIMATION_END_THRESHOLD + 1,
    ], // Add a step for shadow
    outputRange: [0, 0, 0.15], // Shadow appears as background becomes opaque
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 bg-white">
      {/* Sticky Header */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-20"
        style={{
          backgroundColor: headerBackgroundColor,
          shadowOpacity: headerShadowOpacity,
          // For Android elevation, rely on isHeaderOpaque
          elevation: isHeaderOpaque && Platform.OS === "android" ? 5 : 0,
          shadowColor: "#000", // iOS Shadow
          shadowOffset: { width: 0, height: 2 }, // iOS Shadow
          shadowRadius: 4, // iOS Shadow
        }}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top, height: STICKY_HEADER_TOTAL_HEIGHT }}
        >
          <TouchableOpacity className="p-2.5" onPress={() => router.back()}>
            {/* Change to "search1" or "edit" based on your screenshot/preference */}
            <Ionicons name="angle-left" size={24} color="black" />
          </TouchableOpacity>

          <Animated.View
            className="flex-1 items-center mx-2"
            style={{ opacity: headerNameOpacity }}
          >
            <Text
              className="text-lg font-semibold text-black"
              numberOfLines={1}
            >
              {isUser?.firstName} {isUser?.lastName}
            </Text>
          </Animated.View>

          <Animated.View className="p-2.5" />
        </View>
      </Animated.View>

      <Animated.FlatList
        ref={flatListRef}
        data={profilePost}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={{
          backgroundColor: "white", // Main page background
          paddingTop: 0, // MODIFICATION: Allows content to start from the very top
          paddingBottom: Platform.OS === "ios" ? 60 + insets.bottom : 10,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false, // backgroundColor and opacity often need this to be false
            listener: (event: any) => {
              const y = event.nativeEvent.contentOffset.y;
              if (y > ANIMATION_END_THRESHOLD) {
                if (!isHeaderOpaque) setIsHeaderOpaque(true);
              } else {
                if (isHeaderOpaque) setIsHeaderOpaque(false);
              }
            },
          }
        )}
        ListHeaderComponent={ProfileHeader}
        renderItem={({ item, index }) => (
          <View className="px-2">
            <UserPostsWidget
              userId={isUser?._id}
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
              onCommentPress={
                index === profilePost.length - 1 ? scrollToBottom : undefined
              }
            />
            {index !== profilePost.length - 1 && (
              <View
                style={{
                  height: 6,
                  backgroundColor: "#f0f2f5",
                  marginVertical: 8,
                }}
              />
            )}
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          <View className="p-4 items-center">
            <Text className="text-gray-500">No posts to show yet.</Text>
          </View>
        }
      />
      {showToast && (
        <View className="absolute inset-0 justify-center items-center bg-transparent">
          <View
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            className="bg-white rounded-lg px-4 py-2 shadow-lg"
          >
            <Text className="text-center text-gray-800">
              This feature is not available right now
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
