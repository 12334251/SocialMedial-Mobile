import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform, // Import Platform for setTimeout workaround
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Friend from "../Friend";
import { useAuth } from "@/Context/AuthContext";
import PostService from "@/services/PostService";
import NotificationService from "@/services/NotificationService";
import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

interface UserPostsWidgetProps {
  /* your props definitions */
  userId: string | undefined;
  postId: any;
  postUserId: any;
  name: string;
  location: any;
  userPicturePath: any;
  isFriend: any;
  description: string;
  picturePath?: string;
  likes: Record<string, boolean>;
  comments: {
    userId: string;
    firstName: string;
    lastName: string;
    comment: string;
  }[];
  onCommentPress?: () => void; // Add this new prop
  // ... other props
}

const StyledExpoImage = cssInterop(ExpoImage, {
  className: "style",
});

const UserPostsWidget: React.FC<UserPostsWidgetProps> = ({
  userId,
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  isFriend,
  onCommentPress, // Destructure the new prop
}) => {
  const { user }: any = useAuth();
  const screenHeight = Dimensions.get("window").height;
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const isLiked = Boolean(likes[user?._id]);
  const likeCount = Object.keys(likes).length;

  const patchLike = async () => {
    try {
      const result = await PostService.handleLike(postId, user?._id);
      if (result.status === 200 && user?._id !== postUserId && !isLiked) {
        await NotificationService.handleLikeNotification(
          user?.firstName,
          user?.lastName,
          user?.picturePath,
          user?._id,
          postUserId,
          name,
          description
        );
      }
    } catch (error) {
      console.log("patchLike error: ", error);
    }
  };

  const submitComment = async () => {
    try {
      const commentRes = await PostService.handleComment(
        postId,
        user?._id,
        newComment
      );

      if (commentRes.status === 200) {
        // You might want to refresh comments here if your backend returns updated data
        // For now, assuming you handle it via re-fetching or Redux update
        if (user?._id !== postUserId) {
          setNewComment("");
          await NotificationService.handleCommentNotification(
            user?.firstName,
            user?.lastName,
            user?.picturePath,
            user?._id,
            postUserId,
            name,
            description
          );
        }
      }
    } catch (error) {
      console.log("submitComment error: ", error);
    }
  };

  const handleCommentButtonClick = () => {
    // We want to scroll only if comments are about to be shown AND this is the last post
    const willShowComments = !showComments;
    setShowComments(willShowComments);

    if (willShowComments && onCommentPress) {
      // Use setTimeout to ensure the UI has time to re-render with comments shown
      // A small delay (e.g., 100ms) is usually sufficient.
      // Adjust if needed, but avoid making it too long for responsiveness.
      setTimeout(() => {
        onCommentPress();
      }, 100); // Give the UI a moment to update layout
    }
  };

  return (
    <View className="bg-white rounded-lg">
      {/* Post Description */}
      <View className="px-3">
        <Friend
          userId={userId}
          postUserId={postUserId}
          name={name}
          location={location}
          userPicturePath={userPicturePath}
          isFriend={isFriend}
        />

        {description && (
          <Text className="text-gray-700 py-2 text-base">{description}</Text>
        )}
      </View>

      {picturePath && (
        <StyledExpoImage
          source={{ uri: picturePath }}
          className="w-full"
          style={{ height: screenHeight / 2 }}
          contentFit="cover"
          cachePolicy="disk"
        />
      )}

      {/* Actions Row */}
      <View className="mt-4 px-3">
        {(likeCount > 0 || comments.length > 0) && (
          <View className="flex-row justify-between">
            {likeCount > 0 && (
              <View className="flex-row items-center">
                <Image
                  source={require("../../assets/images/like.png")}
                  className="w-5 h-5 rounded-full"
                  resizeMode="stretch"
                />
                <Text className="ml-1 text-sm text-gray-700">{likeCount}</Text>
              </View>
            )}
            {comments.length > 0 && (
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-700">
                  {comments.length} comments
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-4">
          {/* Like Button */}
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-full"
            onPress={patchLike}
          >
            {isLiked ? (
              <Ionicons name="thumbs-up" size={20} color="blue" />
            ) : (
              <Ionicons name="thumbs-up-outline" size={20} color="gray" />
            )}
            <Text
              className={`text-sm ${
                isLiked ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Like
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleCommentButtonClick} // Call the new handler
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="gray"
              className="mr-1"
            />
            <Text className="text-sm text-gray-500">Comment</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity className="flex-row items-center">
            <Ionicons
              name="share-social-outline"
              size={18}
              color="gray"
              className="mr-1"
            />
            <Text className="text-sm text-gray-500">Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View className="mt-4">
          {comments.map((comment, index) => (
            <View key={index} className="py-2 border-b border-gray-200">
              <Text
                className={`text-sm text-gray-700 ${
                  comment.userId === "loggedInUserId"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <Text className="font-bold">
                  {comment.firstName} {comment.lastName}:
                </Text>{" "}
                {comment.comment}
              </Text>
            </View>
          ))}

          {/* Comment Input */}
          <View className="mt-4 flex-row items-center gap-2">
            <TextInput
              placeholder="Add a comment..."
              className="flex-1 bg-gray-100 rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChangeText={setNewComment}
              value={newComment}
            />
            <TouchableOpacity onPress={submitComment}>
              <Ionicons name="send" size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default UserPostsWidget;
