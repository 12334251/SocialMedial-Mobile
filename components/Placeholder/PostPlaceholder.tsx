// src/components/PostPlaceholder.tsx
import React from "react";
import { View, Dimensions, Platform } from "react-native";

const screenHeight = Dimensions.get("window").height;

const PostPlaceholder: React.FC = () => {
  return (
    <View
      className="bg-white rounded-lg p-4 animate-pulse"
      style={Platform.select({ android: { elevation: 2 } })}
    >
      {/* Friend Header Placeholder */}
      <View className="flex-row items-center gap-4">
        <View className="w-12 h-12 bg-gray-300 rounded-full" />
        <View className="flex-1">
          <View className="w-32 h-4 bg-gray-300 rounded" />
          <View className="w-20 h-3 bg-gray-300 rounded mt-2" />
        </View>
      </View>

      {/* Post Description Placeholder */}
      <View className="mt-4 space-y-2">
        <View className="h-4 bg-gray-300 rounded w-full" />
        <View className="h-4 bg-gray-300 rounded w-4/6" />
      </View>

      {/* Post Image Placeholder */}
      <View className="mt-4">
        <View
          className="w-full bg-gray-300 rounded-lg"
          style={{ height: screenHeight * 0.3 }}
        />
      </View>

      {/* Actions Row Placeholder */}
      <View className="mt-4 space-y-4">
        {/* Like & Comment Count */}
        <View className="flex-row justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 bg-gray-300 rounded-full" />
            <View className="w-8 h-4 bg-gray-300 rounded" />
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-4 bg-gray-300 rounded" />
            <View className="w-16 h-4 bg-gray-300 rounded" />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-4">
            {/* Like */}
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 bg-gray-300 rounded-full" />
              <View className="w-12 h-4 bg-gray-300 rounded" />
            </View>
            {/* Comment */}
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 bg-gray-300 rounded-full" />
              <View className="w-16 h-4 bg-gray-300 rounded" />
            </View>
          </View>

          {/* Share */}
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 bg-gray-300 rounded-full" />
            <View className="w-12 h-4 bg-gray-300 rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostPlaceholder;
