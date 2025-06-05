import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ModalHeaderProps {
  onClose: () => void;
  onPost: () => void;
  isPostDisabled: boolean;
  isPosting: boolean;
}

const ModalHeader = ({
  onClose,
  onPost,
  isPostDisabled,
  isPosting,
}: ModalHeaderProps) => (
  <View style={styles.headerContainer}>
    <MaterialCommunityIcons name="window-close" size={24} onPress={onClose} />
    <Text style={styles.headerTitle}>Create Post</Text>
    <Button
      mode="contained"
      buttonColor="#3b82f6"
      textColor="white"
      style={{ borderRadius: 8 }}
      disabled={isPostDisabled}
      loading={isPosting}
      onPress={onPost}
    >
      Post
    </Button>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "black",
    fontWeight: "bold",
    fontSize: 24,
  },
});

export default ModalHeader;
