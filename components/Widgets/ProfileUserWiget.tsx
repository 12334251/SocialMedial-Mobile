import { View, Text, Pressable, Image } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

const StyledExpoImage = cssInterop(ExpoImage, {
  className: "style",
});

const ProfileUserWiget = ({ user, picturePath }: any) => {
  const router = useRouter();

  const friendsCount = Object.entries(user?.friends || {}).filter(
    ([, status]) => status === "accepted"
  ).length;
  return (
    <View style={{ overflow: "visible" }}>
      <Pressable
        className="absolute top-0 left-3"
        onPress={() => router.back()}
      >
        <Ionicons name="angle-left" size={30} color="#000" />
      </Pressable>
      {/* the solid header */}
      {/* the absolutely-positioned avatar */}
      <View className="flex mt-3 justify-center items-center">
        <StyledExpoImage
          source={{ uri: picturePath }}
          className="w-40 h-40 rounded-full border-4 border-slate-200"
          contentFit="cover"
          cachePolicy="disk"
        />
      </View>
      <Text className="text-2xl text-red-500 font-worksans-500 text-center">
        {`${user?.firstName} ${user?.lastName}`}
      </Text>
      <View className="flex flex-row justify-center gap-1">
        <Text className="text-base text-black font-worksans-600 text-center">
          {friendsCount}
        </Text>
        <Text className="text-base text-black font-worksans-500 text-center">
          friends
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: "#cccccc" }} />
      <View className="px-3">
        <Text className="text-lg text-black font-worksans-500">Details</Text>
        <Pressable>
          <Text className="text-base text-black font-worksans-400">
            ... See Mukesh's About Info
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileUserWiget;
