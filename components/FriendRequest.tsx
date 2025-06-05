import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import FriendService from "../services/FriendService";
import { setUserFriends } from "../redux/state";
import { useQueryClient } from "@tanstack/react-query";
import { PaginatedPosts } from "../services/PostService";
import NotificationService from "../services/NotificationService";
import { removePendingRequest } from "../redux/state/friendRequests";
import { addAcceptedRequest } from "../redux/state/acceptedRequest";
import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

interface FriendDetails {
  firstName: string;
  lastName: string;
  id: string;
  picturePath: string;
}

interface FriendRequestProps {
  userId: string | undefined;
  isProfile?: boolean;
  friendId: string;
  isFriend: string;
  friendReceiverId: string;
  friendRequestReceiverDetails: FriendDetails;
  friendRequestSenderDetails: FriendDetails;
  id: string; // friendRequest document ID
}

const StyledExpoImage = cssInterop(ExpoImage, {
  className: "style",
});

const FriendRequest: React.FC<FriendRequestProps> = ({
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
  const [disableButton, setDisableButton] = useState(false);

  const patchFriend = useCallback(
    async (status: "accept" | "remove") => {
      if (!id) return;
      setDisableButton(true);

      try {
        // 1) Call backend
        const targetId = userId === friendId ? friendReceiverId : friendId;
        const {
          action,
          friendRequestData,
          friendId: updatedId,
        } = (await FriendService.patchFriends(userId, targetId, id, status))
          .data.status;

        // 2) Update React-Query cache in O(P+Q) instead of O(P×Q)
        qc.setQueryData<PaginatedPosts>(["posts", userId], (old: any) => {
          if (!old) return old;
          const pageIndex = old.pages.findIndex((page: any) =>
            page.posts.some((p: any) => p.userId === updatedId)
          );
          if (pageIndex < 0) return old;

          const page = old.pages[pageIndex];
          const postIndex = page.posts.findIndex(
            (p: any) => p.userId === updatedId
          );
          const updatedPost = {
            ...page.posts[postIndex],
            isFriend: action === "accepted friend request" ? "accepted" : "",
          };

          const newPage = {
            ...page,
            posts: [
              ...page.posts.slice(0, postIndex),
              updatedPost,
              ...page.posts.slice(postIndex + 1),
            ],
          };

          return {
            ...old,
            pages: [
              ...old.pages.slice(0, pageIndex),
              newPage,
              ...old.pages.slice(pageIndex + 1),
            ],
          };
        });

        // 3) Dispatch Redux actions — React will batch them automatically
        dispatch(removePendingRequest({ requestId: id }));
        if (status === "accept") {
          dispatch(addAcceptedRequest(friendRequestData));
        }
        const newStatus = action.includes("accepted") ? "accepted" : "removed";
        dispatch(setUserFriends({ userId: updatedId, status: newStatus }));

        // 4) Send notification if it was an accept
        if (action === "accepted friend request") {
          NotificationService.notifyAcceptFriendRequest(
            friendRequestData.friendRequestReceiverDetails.firstName,
            friendRequestData.friendRequestReceiverDetails.lastName,
            friendRequestData.friendRequestReceiverDetails.picturePath,
            friendRequestData.friendRequestSenderDetails._id
          ).catch(console.error);
        }
      } catch (error) {
        console.error("patchFriend error:", error);
      } finally {
        setDisableButton(false);
      }
    },
    [dispatch, qc, userId, friendId, friendReceiverId, id]
  );

  const isReceiver = isFriend === "pending";

  return (
    <View className="flex bg-white rounded-lg px-4">
      {isReceiver && (
        <View className="flex-row items-center bg-white rounded-lg pb-4 my-2">
          {/* 1️⃣ Fixed‑size avatar */}
          <StyledExpoImage
            source={{ uri: friendRequestSenderDetails.picturePath }}
            className="w-24 h-24 rounded-full mr-4"
            contentFit="cover"
            cachePolicy="disk"
          />

          {/* 2️⃣ Everything else takes up the rest of the row */}
          <View className="flex-1">
            {/* Name */}
            <TouchableOpacity>
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                {friendRequestSenderDetails.firstName}{" "}
                {friendRequestSenderDetails.lastName}
              </Text>
            </TouchableOpacity>

            {/* 3️⃣ Button row spans full remaining width */}
            <View className="flex-row gap-2">
              {/* each button flex‑1 → half of parent */}
              <TouchableOpacity
                className="flex-1 bg-[#0066cc] rounded-full p-2"
                disabled={disableButton}
                onPress={() => patchFriend("accept")}
              >
                <Text className="text-center text-lg text-white font-worksans-500">
                  Confirm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-full p-2"
                disabled={disableButton}
                onPress={() => patchFriend("remove")}
              >
                <Text className="text-center text-lg text-black font-worksans-500">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default FriendRequest;
