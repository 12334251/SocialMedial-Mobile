import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export interface NotificationProps {
  id: string;
  title: string;
  body: string;
  iconUrl: string;
  singleUnread: boolean;
  unread: boolean;
  timestamp: any;
  index?: number;
  onPress: () => void;
}

export default function Notification({
  id,
  title,
  body,
  iconUrl,
  singleUnread,
  unread,
  timestamp,
  index = 0,
  onPress,
}: NotificationProps) {
  // console.log(unread);
  const onPressSingleUnread = () => {
    if (!singleUnread) {
      onPress();
    }
  };
  return (
    <TouchableOpacity
      key={`${id}-${index}`}
      className={`flex-row items-center justify-start px-4 py-4 gap-3
        ${singleUnread ? "bg-white" : "bg-[#d1e5f5]"}
      `}
      onPress={onPressSingleUnread}
    >
      <Image source={{ uri: iconUrl }} className="w-20 h-20 rounded-full" />

      <View className="flex-1">
        <Text className="font-worksans-600 text-lg">
          {title}{" "}
          <Text className="font-worksans-400 text-lg text-black">{body}</Text>
        </Text>
        <Text className="font-worksans-500 text-base text-[#757575]">
          {timestamp}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
