import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendRequest from "@/components/FriendRequest";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import { useAuth } from "@/Context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function TabTwoScreen() {
  const { user } = useAuth();
  const pending = useSelector((state: any) => state.friendRequests.pending);

  // console.log("currentUserFriendRequest", pending);

  const StaticComponent = () => (
    <View className="flex px-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-worksans-600 text-4xl">Friends</Text>
        <Ionicons name="search" size={32} color="black" />
      </View>
      <Pressable
        className="self-start p-2 bg-gray-200 rounded-full mt-2 mb-5"
        onPress={() => router.push("/(friends)")}
      >
        <Text className="text-base text-black font-worksans-500">
          Your friends
        </Text>
      </Pressable>
      <Text className="text-2xl text-black font-worksans-600">
        Friend requests
      </Text>
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right", "top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={pending}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<StaticComponent />}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <FriendRequest
            userId={user?._id}
            isProfile={false}
            key={`request-${item?._id}-${index}`}
            friendId={item?.friendRequestSenderId}
            friendReceiverId={item?.friendRequestReceiverId}
            friendRequestReceiverDetails={item?.friendRequestReceiverDetails}
            friendRequestSenderDetails={item?.friendRequestSenderDetails}
            isFriend={item?.isFriend}
            id={item?._id}
          />
        )}
      />
    </SafeAreaView>
  );
}
