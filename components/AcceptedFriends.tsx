import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import FriendService from "../services/FriendService";
import {
  setFriendRequestReceiver,
  setUserFriends,
  setFriendPosts,
} from "../redux/state";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { removeAcceptedRequest } from "../redux/state/acceptedRequest";
import { useQueryClient } from "@tanstack/react-query";
import { PaginatedPosts } from "../services/PostService";

interface FriendDetails {
  firstName: string;
  lastName: string;
  id: string;
  picturePath: string;
}

interface FriendRequestProps {
  userId: string;
  isProfile?: boolean;
  friendId: string;
  isFriend: string;
  friendReceiverId: string;
  friendRequestReceiverDetails: FriendDetails;
  friendRequestSenderDetails: FriendDetails;
  id: string; // friendRequest document ID
}

const AcceptedFriends: React.FC<FriendRequestProps> = ({
  userId,
  isProfile = false,
  friendId,
  isFriend,
  friendReceiverId,
  friendRequestReceiverDetails,
  friendRequestSenderDetails,
  id,
}) => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const authToken = useSelector((state: any) => state.auth.token);
  const friendRequestList = useSelector(
    (state: any) => state.auth.friendRequestReceiver
  );
  const [disableButton, setDisableButton] = useState(false);

  const patchFriend = useCallback(
    async (status: string) => {
      if (!id) return;
      dispatch(removeAcceptedRequest({ requestId: id }));
      setDisableButton(true);
      try {
        const targetId = userId === friendId ? friendReceiverId : friendId;
        const response = await FriendService.patchFriends(
          userId,
          targetId,
          id,
          status
        );
        const statusResp = response?.data?.status;
        if (!statusResp) return;
        const updatedFriendId = statusResp.friendId;

        qc.setQueryData<PaginatedPosts>(["posts", userId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((post: any) => {
                if (post.userId === updatedFriendId) {
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

        dispatch(
          setUserFriends({
            userId: updatedFriendId,
            status: "removed",
          })
        );
      } catch (error) {
        console.error("patchFriend error:", error);
      } finally {
        setDisableButton(false);
      }
    },
    [
      userId,
      friendId,
      friendReceiverId,
      id,
      authToken,
      friendRequestList,
      friendRequestReceiverDetails,
      friendRequestSenderDetails,
      dispatch,
    ]
  );

  // Platform.OS === "android"
  //   ? console.log(
  //       "android FriendRequest",
  //       userId,
  //       (isProfile = false),
  //       friendId,
  //       isFriend,
  //       friendReceiverId,
  //       friendRequestReceiverDetails,
  //       friendRequestSenderDetails,
  //       id
  //     )
  //   : console.log(
  //       "IOS FriendRequest",
  //       userId,
  //       (isProfile = false),
  //       friendId,
  //       isFriend,
  //       friendReceiverId,
  //       friendRequestReceiverDetails,
  //       friendRequestSenderDetails,
  //       id
  //     );

  const showFriendDetails =
    userId === friendReceiverId
      ? friendRequestSenderDetails
      : friendRequestReceiverDetails;

  return (
    <View className="flex bg-white rounded-lg px-4">
      {friendRequestList && (
        <View className="flex-row items-center bg-white rounded-lg my-2">
          {/* 1️⃣ Fixed‑size avatar */}
          <Image
            source={{ uri: showFriendDetails.picturePath }}
            className="w-20 h-20 rounded-full mr-4"
          />

          {/* 2️⃣ Everything else takes up the rest of the row */}
          <View className="flex-row items-center flex-1 justify-between">
            {/* Name */}
            <TouchableOpacity className="flex-none">
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                {showFriendDetails.firstName} {showFriendDetails.lastName}
              </Text>
            </TouchableOpacity>

            {/* Icon button – no flex-1 here! */}
            <TouchableOpacity
              className="flex-none rounded-full p-2"
              disabled={disableButton}
              onPress={() => patchFriend("remove")}
            >
              <Ionicons name="person-remove-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default AcceptedFriends;
