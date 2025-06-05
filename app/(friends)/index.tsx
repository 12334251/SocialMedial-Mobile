import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import FontAwesomeIcons from "@expo/vector-icons/FontAwesome6";
import AcceptedFriends from "@/components/AcceptedFriends";

export default function FriendsScreen() {
  const user = useSelector((state: any) => state.auth?.user);
  const accepted = useSelector((state: any) => state.acceptedRequest.accepted);
  const StaticComponent = () => (
    <View className="flex px-3 gap-3 justify-center">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <FontAwesomeIcons name="angle-left" size={24} color="#000" />
        </Pressable>
        <Text className="font-worksans-500 text-2xl">Your friends</Text>
        <Ionicons name="search" size={24} color="black" />
      </View>
      <Text className="text-2xl text-black font-worksans-600">Friends</Text>
    </View>
  );

  // console.log("accepted FriendsScreen", accepted);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={accepted}
        ListHeaderComponent={<StaticComponent />}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <AcceptedFriends
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
