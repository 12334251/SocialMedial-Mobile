import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Friend from "../Friend";
import { useAuth } from "@/Context/AuthContext";
import PostService from "@/services/PostService";
import NotificationService from "@/services/NotificationService";
import { useDispatch } from "react-redux";
import { addCommentOptimistic, toggleLike } from "@/redux/state";
import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

interface PostWidgetProps {
  /* your props definitions */
  profileScreen?: boolean;
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
  onFirstProfileWarning: (type: "like" | "comment") => void;
  // ... other props
}

const StyledExpoImage = cssInterop(ExpoImage, {
  className: "style",
});

const PostWidget: React.FC<PostWidgetProps> = ({
  profileScreen = false,
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
  onFirstProfileWarning,
}) => {
  const { user }: any = useAuth();
  const dispatch = useDispatch();
  const screenHeight = Dimensions.get("window").height;
  const [disableLike, setDisableLike] = useState(false);
  const [disableComment, setDisableComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const isLiked = Boolean(likes[user?._id]);
  const likeCount = Object.keys(likes).length;
  const [firstLikeTapped, setFirstLikeTapped] = useState(false);
  const [firstCommentTapped, setFirstCommentTapped] = useState(false);

  const patchLike = async () => {
    if (!firstLikeTapped && profileScreen) {
      setFirstLikeTapped(true);
      onFirstProfileWarning("like");
      return;
    }
    try {
      setDisableLike(true);
      dispatch(toggleLike({ postId, userId: userId! }));
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
      dispatch(toggleLike({ postId, userId: user?._id! }));
      console.log("patchLike error: ", error);
    } finally {
      setDisableLike(false);
    }
  };

  const submitComment = async () => {
    if (!firstCommentTapped && profileScreen) {
      setFirstCommentTapped(true);
      onFirstProfileWarning("comment");
      return;
    }
    try {
      setDisableComment(true);
      const comment = {
        userId: userId!,
        firstName: user?.firstName,
        lastName: user?.lastName,
        comment: newComment,
        timestamp: new Date().toISOString(),
      };

      dispatch(addCommentOptimistic({ postId, comment }));

      setNewComment("");

      const commentRes = await PostService.handleComment(
        postId,
        user?._id,
        newComment
      );

      if (commentRes.status === 200) {
        if (user?._id !== postUserId) {
          await NotificationService.handleCommentNotification(
            user?.firstName,
            user?.lastName,
            user?.picturePath,
            user?._id,
            postUserId,
            name,
            description
          );
        } // Reset input
      }
    } catch (error) {
      console.log("submitComment error: ", error);
    } finally {
      setDisableComment(false);
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
            disabled={disableLike}
          >
            {isLiked ? (
              <Ionicons name="thumbs-up" size={25} color="blue" />
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
            onPress={() => setShowComments(!showComments)}
            disabled={disableComment}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color="gray"
              className="mr-1"
            />
            <Text className="text-sm text-gray-500">Comment</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity className="flex-row items-center">
            <Ionicons
              name="share-social-outline"
              size={22}
              color="gray"
              className="mr-1"
            />
            <Text className="text-sm text-gray-500">Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View className="mt-4 px-3">
          {comments.map((comment, index) => (
            <View key={index} className="py-2 border-b border-gray-200">
              <Text
                className={`text-base font-worksans-400 text-gray-700 ${
                  comment.userId === user?._id ? "text-right" : "text-left"
                }`}
              >
                <Text className="text-lg text-black font-worksans-600">
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

export default PostWidget;
