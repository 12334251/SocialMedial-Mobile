import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface NotificationIconProps {
  count: number;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  color?: string;
}

export default function NotificationIcon({
  count,
  iconName,
  color,
}: NotificationIconProps) {
  // 1) a sharedValue for horizontal offset
  const shake = useSharedValue(0);
  const prevCount = useRef(count);

  // 2) when count increases, trigger a little left-right shake
  useEffect(() => {
    if (count > prevCount.current) {
      cancelAnimation(shake);
      shake.value = withSequence(
        withTiming(-8, { duration: 100 }),
        withRepeat(
          withSequence(
            withTiming(8, { duration: 100 }),
            withTiming(-8, { duration: 100 })
          ),
          4,
          true
        ),
        withTiming(0, { duration: 100 })
      );
    }
    prevCount.current = count;
  }, [count]);

  // 3) hook it up to a style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View style={styles.iconContainer}>
      {/* 4) Use Reanimated.View not RN.Animated.View */}
      <Animated.View style={animatedStyle}>
        <Ionicons name={iconName} size={28} color={color} />
      </Animated.View>
      {count > 0 && (
        <View
          style={[
            styles.badge,
            { minWidth: count > 9 ? 20 : 16, height: count > 9 ? 20 : 16 },
          ]}
        >
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: Platform.OS === "ios" ? -2 : 0,
    borderRadius: 100,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
});
