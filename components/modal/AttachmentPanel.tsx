import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AttachmentPanelProps {
  panHandlers: any;
  animatedHeight: Animated.Value;
  currentSnapIndex: number;
  onPickImage: () => void;
  // onOpenVideoCapture: () => void;
  // onOpenDocumentPicker: () => void;
}

const AttachmentPanel = ({
  panHandlers,
  animatedHeight,
  currentSnapIndex,
  onPickImage,
}: AttachmentPanelProps) => {
  const insets = useSafeAreaInsets();

  const renderIcon = (
    name: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity onPress={onPress} className="items-center mx-4">
      <Ionicons name={name} size={35} color="black" />
      {currentSnapIndex > 0 && (
        <Text className="mt-2 text-[#888888] text-base font-worksans-500">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    // This View applies the panHandlers and overall panel styling
    <View
      {...panHandlers}
      // style={styles.panelOuterContainer}
      className="bg-white border-t border-[#dddddd] items-stretch"
      // Android needs explicit elevation; iOS will use shadow-md from Tailwind
      style={
        Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: -3 },
          },
          android: { elevation: 5 },
        }) as any
      }
    >
      <View className="w-full h-5 flex-row justify-center items-center">
        <View className="w-10 h-1.5 rounded-full bg-[#888888]" />
      </View>
      {/* This Animated.View is what changes height and contains the icons */}
      <Animated.View
        className="items-center justify-around overflow-hidden"
        style={{
          height: animatedHeight,
          flexDirection: currentSnapIndex === 0 ? "row" : "column",
        }}
      >
        {renderIcon("images", "Open Gallery", onPickImage)}
        {renderIcon("videocam", "Open Video", () => console.log("Open Video"))}
        {renderIcon("document-text", "Open Document", () =>
          console.log("Open Document")
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  panelOuterContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#dddddd",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5, // For Android shadow
      },
    }),
  },
  dragHandleContainer: {
    width: "100%",
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#888888",
  },
  animatedContentContainer: {
    // This is the view that animates its height
    alignItems: "center",
    justifyContent: "space-around", // Distributes icons nicely
    overflow: "hidden", // Clip content if it overflows animated height
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 15, // Spacing between icons when in a row
    // marginBottom: 20, // Spacing below icons/labels when in a column, or for single row
  },
  iconLabel: {
    marginTop: 8,
    color: "#888888", // Original color
    fontSize: 12, // Added for clarity
  },
});

export default AttachmentPanel;
