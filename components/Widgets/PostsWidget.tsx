/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import PostWidget from "./PostWidget";
import { selectAllPosts } from "../../redux/state";

interface PostsWidgetProps {
  userId: string;
  isProfile?: boolean;
}

const PostsWidget: React.FC<PostsWidgetProps> = ({
  userId,
  isProfile = false,
}) => {
  const postsArray = useSelector(selectAllPosts);

  // console.log("PostsWidget userId", userId, postsArray);
  // ];

  return (
    <FlatList
      data={postsArray}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item._id}
      renderItem={({ item }: any) => (
        <PostWidget
          userId={userId}
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
      )}
      ListEmptyComponent={<Text>No posts found</Text>}
    />
  );
};

export default PostsWidget;
