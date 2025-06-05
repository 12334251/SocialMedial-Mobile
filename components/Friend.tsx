import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Context/AuthContext";
import FriendService from "../services/FriendService";
import { setFriendRequestReceiver, setUserFriends } from "../redux/state";
import NotificationService from "../services/NotificationService";
import { PaginatedPosts } from "../services/PostService";
import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

interface FriendProps {
  userId: string | undefined;
  postUserId: string;
  name: string;
  location?: string;
  userPicturePath?: string;
  isFriend: string | null;
}

const StyledExpoImage = cssInterop(ExpoImage, {
  className: "style",
});

const Friend: React.FC<FriendProps> = ({
  postUserId,
  name,
  location,
  userPicturePath,
  isFriend,
}) => {
  const { user }: any = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const friendRequest = useSelector(
    (state: any) => state.auth.friendRequestReceiver
  );
  const [disableButton, setDisableButton] = useState(false);

  const handleProfileNavigation = async () => {
    try {
      // console.log("postUserId", postUserId);
      await SecureStore.setItemAsync("id", postUserId);
      router.push({
        pathname: "/(profile)/[id]",
        params: { id: postUserId },
      });
    } catch (error) {
      console.log("handleProfileNavigation error:", error);
    }
  };

  const sendFriendRequest = async () => {
    setDisableButton(true);
    try {
      // 1) Optimistic update to your posts cache, mirroring handleFriendRequest
      qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.userId === postUserId
                ? { ...post, isFriend: "pending" }
                : post
            ),
          })),
        };
      });
      const res = await FriendService.sendFriendRequest(user._id, postUserId);
      if (res?.status === 201) {
        const receiverId = res.data.friendRequestReceiverId;
        dispatch(setUserFriends({ userId: receiverId, status: "pending" }));
        await NotificationService.notifySendRequest(
          user.firstName,
          user.lastName,
          user.picturePath,
          postUserId
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisableButton(false);
    }
  };

  const deleteFriend = async (status: string) => {
    setDisableButton(true);
    try {
      const res = await FriendService.deleteFriendRequest(
        user._id,
        postUserId,
        status
      );
      const { action, friendId, friendRequestData } = res.data.status;
      if (action === "removed friend") {
        qc.setQueryData<PaginatedPosts>(["posts", user?._id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((post: any) => {
                if (post.userId === friendId) {
                  return {
                    ...post,
                    isFriend: "",
                  };
                }
                return post;
              }),
            })),
          };
        });

        const updated = friendRequest.filter(
          (item: any) => item._id !== friendRequestData._id
        );
        dispatch(setFriendRequestReceiver({ friendRequestReceiver: updated }));
        dispatch(setUserFriends({ userId: friendId, status: "" }));
        // dispatch(setFriendPosts({ postUserId: friendId, isFriend: "" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisableButton(false);
    }
  };

  return (
    <View className="flex-row justify-between items-center bg-white rounded-lg my-2">
      {/* Left Section: User Info */}
      <View className="flex-row items-center">
        {/* <Image
          source={{ uri: userPicturePath }}
          className="w-14 h-14 rounded-full"
          resizeMode="cover"
        /> */}
        <StyledExpoImage
          source={{ uri: userPicturePath }}
          className="w-14 h-14 rounded-full"
          contentFit="cover"
          cachePolicy="disk"
        />
        <View className="ml-4">
          <Pressable onPress={handleProfileNavigation}>
            <Text className="text-lg font-semibold text-gray-800">{name}</Text>
          </Pressable>
          <Text className="text-sm text-gray-500">{location}</Text>
        </View>
      </View>

      {/* Right Section: Action Button */}
      {postUserId !== user?._id &&
        (isFriend !== "" ? (
          <TouchableOpacity
            disabled={disableButton}
            className="w-10 h-10 rounded-full justify-center items-center bg-red-100"
            onPress={() => deleteFriend("remove")}
          >
            <Ionicons name="person-remove-outline" size={20} color="red" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={disableButton}
            className="w-10 h-10 rounded-full justify-center items-center bg-blue-100"
            onPress={() => sendFriendRequest()}
          >
            <Ionicons name="person-add-outline" size={20} color="blue" />
          </TouchableOpacity>
        ))}
    </View>
  );
};

export default Friend;
