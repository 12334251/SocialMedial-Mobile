// PostComposer.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PostComposerProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export default function PostComposer({
  visible,
  onClose,
  userName,
}: PostComposerProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const bottomPanelHeight = 200; // e.g. your snap-point height
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // 1) Track keyboard show/hide
  useEffect(() => {
    const showEvent = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideEvent = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showEvent.remove();
      hideEvent.remove();
    };
  }, []);

  // 2) Auto-focus when opened
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Combined bottom padding so ScrollView content is always above keyboard+panel
  const contentPaddingBottom = keyboardHeight + bottomPanelHeight;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Post</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: contentPaddingBottom },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              multiline
              placeholder={`What's on your mind${
                userName ? ", " + userName : ""
              }?`}
              placeholderTextColor="#ccc"
            />
            {/* ... other content, previews, etc. ... */}
          </ScrollView>

          {/* Bottom panel */}
          <View style={[styles.panel, { height: bottomPanelHeight }]}>
            <TouchableOpacity style={styles.button}>
              <Text>📷 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>🎥 Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>📄 Doc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>🎵 Audio</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  flex: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  close: { fontSize: 22 },
  scrollContent: { flexGrow: 1, padding: 16 },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: { alignItems: "center", padding: 12 },
});
