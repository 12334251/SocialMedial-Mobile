import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useAuth } from "@/Context/AuthContext"; // Assuming path

interface CratePostHeaderProps {
  onPressCreatePost: () => void;
}

const CratePostHeader = ({ onPressCreatePost }: CratePostHeaderProps) => {
  const { user } = useAuth();

  return (
    <View className="bg-white">
      {/* Create Post Bar */}
      <View className="flex flex-row items-center px-3 py-2">
        <Image
          source={{ uri: user?.picturePath }}
          className="w-14 h-14 rounded-full bg-gray-200"
        />
        <TouchableOpacity
          // style={styles.inputButton}
          className="flex-1 flex-row items-center justify-between bg-[#f0f2f5] rounded-full py-3 px-4 ml-3"
          onPress={onPressCreatePost}
        >
          <Text className="text-lg font-worksans-500 text-[#65676b]">
            What's on your mind?
          </Text>
          <Entypo name="images" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View className="h-1.5 bg-[#ccc]" />
    </View>
  );
};

export default CratePostHeader;
