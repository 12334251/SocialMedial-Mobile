import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

interface DiscardChangesPromptProps {
  onDiscard: () => void;
  onContinue: () => void;
}

const DiscardChangesPrompt = ({
  onDiscard,
  onContinue,
}: DiscardChangesPromptProps) => (
  <View style={styles.overlay}>
    <View style={styles.promptContainer}>
      <Text style={styles.promptText}>
        If you discard now, you’ll lose this post.
      </Text>
      <Button mode="text" textColor="red" onPress={onDiscard}>
        Discard post
      </Button>
      <Button mode="text" onPress={onContinue}>
        Continue editing
      </Button>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  promptContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  promptText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
});

export default DiscardChangesPrompt;
