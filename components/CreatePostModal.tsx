// CreatePostModal.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Image,
  Dimensions,
  Platform,
  PanResponder,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Easing, // Import Easing
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text as TextPaper } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Entypo } from "@expo/vector-icons";

// (Keep your imports for services, context, and other components)
import PostService from "@/services/PostService";
import NotificationService from "@/services/NotificationService";
import { useAuth } from "@/Context/AuthContext";
import ModalHeader from "./modal/ModalHeader";
import DiscardChangesPrompt from "./modal/DiscardChangesPrompt";
import AttachmentPanel from "./modal/AttachmentPanel";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");
const SNAP_POINTS = { SMALL: 0.1, MEDIUM: 0.45, LARGE: 0.8 };

export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

interface CreatePostModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CreatePostModal({
  isVisible,
  onClose,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const description = useRef("");
  const [image, setImage] = useState<RNFile | null>(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [postLoading, setPostLoading] = useState(false);
  const [disablePostButton, setDisablePostButton] = useState(true);
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);

  const SNAP_HEIGHTS = [
    deviceHeight * SNAP_POINTS.SMALL,
    deviceHeight * SNAP_POINTS.MEDIUM,
    deviceHeight * SNAP_POINTS.LARGE,
  ];
  const animatedHeight = useRef(new Animated.Value(SNAP_HEIGHTS[0])).current;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const snapIndexRef = useRef(0);
  const lastOffsetY = useRef(0);
  const isDragging = useRef(false); // Ref to track drag state

  // Animation for user-driven snapping (drag and release)
  const animateWithSpring = useCallback(
    (height: number) => {
      Animated.spring(animatedHeight, {
        toValue: height,
        useNativeDriver: false,
        friction: 9,
        tension: 60,
      }).start();
    },
    [animatedHeight]
  );

  // Animation for keyboard-driven snapping (synchronized)
  const animateWithTiming = useCallback(
    (height: number, duration: number, easing: any) => {
      Animated.timing(animatedHeight, {
        toValue: height,
        duration,
        easing,
        useNativeDriver: false,
      }).start();
    },
    [animatedHeight]
  );

  const snapToHeight = useCallback(
    (snapIndex: number) => {
      const newIndex = Math.max(
        0,
        Math.min(SNAP_HEIGHTS.length - 1, snapIndex)
      );
      setCurrentSnapIndex(newIndex);
      snapIndexRef.current = newIndex;
      animateWithSpring(SNAP_HEIGHTS[newIndex]);
    },
    [animateWithSpring, SNAP_HEIGHTS]
  );

  // --- PERFECTED Keyboard Listener ---
  useEffect(() => {
    const handleKeyboardShow = (e: KeyboardEvent) => {
      // Don't do anything if user is actively dragging the panel
      if (isDragging.current) return;

      const { duration, easing }: any = e;

      // When keyboard shows, smoothly animate panel to smallest height
      if (snapIndexRef.current !== 0) {
        animateWithTiming(SNAP_HEIGHTS[0], duration, Easing.inOut(Easing.ease));
        setCurrentSnapIndex(0);
        snapIndexRef.current = 0;
      }
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    // We only need the show event listener for this logic
    const keyboardShowSub = Keyboard.addListener(
      showEvent,
      handleKeyboardShow as any
    );

    return () => {
      keyboardShowSub.remove();
    };
  }, [animateWithTiming, SNAP_HEIGHTS]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        description.current = "";
        setImage(null);
        setPostLoading(false);
        setDisablePostButton(true);
        setShowDiscardPrompt(false);
        animatedHeight.setValue(SNAP_HEIGHTS[0]);
        setCurrentSnapIndex(0);
        snapIndexRef.current = 0;
      }, 200);
    }
  }, [isVisible, animatedHeight, SNAP_HEIGHTS]);

  useEffect(() => {
    if (image) {
      Image.getSize(image.uri, (w, h) => setImageRatio(w / h));
    }
  }, [image]);

  const pickImage = async () => {
    Keyboard.dismiss();
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("Permission required");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split("/");
      const name = uriParts.pop()!;
      const type = `image/${name.split(".").pop()}`;
      setImage({ uri: asset.uri, name, type });
      setDisablePostButton(false);
    }
  };

  const handlePost = async () => {
    if (!user || (!description.current && !image)) return;
    setPostLoading(true);
    setDisablePostButton(true);
    try {
      const res = await PostService.handlePost(
        user._id!,
        description.current,
        user.picturePath!,
        image ?? undefined
      );
      if (res.status === 201) {
        await NotificationService.handlePostNotification(res.data);
      }
      onClose();
    } catch {
      setDisablePostButton(false);
    } finally {
      setPostLoading(false);
    }
  };

  const handleRequestClose = () => {
    if (description.current || image) {
      setShowDiscardPrompt(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardPrompt(false);
    onClose();
  };

  // --- PERFECTED PanResponder ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 10,
      onPanResponderGrant: () => {
        isDragging.current = true; // Set dragging flag
        Keyboard.dismiss();
        lastOffsetY.current = (animatedHeight as any)._value;
        animatedHeight.stopAnimation();
      },
      onPanResponderMove: (_, gs) => {
        const newH = Math.max(
          SNAP_HEIGHTS[0] * 0.9,
          Math.min(SNAP_HEIGHTS[2] * 1.1, lastOffsetY.current - gs.dy)
        );
        animatedHeight.setValue(newH);
      },
      onPanResponderRelease: (_, gs) => {
        const currentHeight = (animatedHeight as any)._value;
        let newIndex = snapIndexRef.current;

        if (gs.vy < -0.5) {
          newIndex = Math.min(
            snapIndexRef.current + 1,
            SNAP_HEIGHTS.length - 1
          );
        } else if (gs.vy > 0.5) {
          newIndex = Math.max(snapIndexRef.current - 1, 0);
        } else {
          const distances = SNAP_HEIGHTS.map((h) =>
            Math.abs(currentHeight - h)
          );
          newIndex = distances.indexOf(Math.min(...distances));
        }

        snapToHeight(newIndex);
        isDragging.current = false; // Unset dragging flag
      },
    })
  ).current;

  return (
    <ReactNativeModal
      isVisible={isVisible}
      deviceWidth={deviceWidth}
      deviceHeight={deviceHeight}
      style={{
        margin: 0,
        justifyContent: "flex-end",
        flex: 1,
      }} // Stick to bottom
      onBackdropPress={handleRequestClose}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={false} // We are handling it manually
    >
      <View className="flex-1 bg-white overflow-hidden">
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1"
          style={{ paddingTop: Platform.OS === "ios" ? insets.top : 0 }}
        >
          <ModalHeader
            onClose={handleRequestClose}
            onPost={handlePost}
            isPostDisabled={disablePostButton}
            isPosting={postLoading}
          />
          <ScrollView
            // style={styles.scrollView}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row items-center px-4 gap-3 pt-2.5 mb-3">
              <Image
                source={{ uri: user?.picturePath }}
                // style={styles.avatar}
                className="w-14 h-14 rounded-full bg-[#ccc] mr-3"
              />
              <TextPaper variant="titleMedium">
                {user?.firstName} {user?.lastName}
              </TextPaper>
            </View>
            <TextInput
              placeholder="What's on your mind?"
              className="px-4 pt-0 pb-4 text-lg text-black flex-1"
              style={{ textAlignVertical: "top" }}
              placeholderTextColor="#ccc"
              multiline
              onChangeText={(t) => {
                description.current = t;
                setDisablePostButton(!t && !image);
              }}
              defaultValue={description.current}
            />
            {image && (
              <View
                className="w-full px-4 mb-4"
                style={{ aspectRatio: imageRatio }}
              >
                <Image
                  source={{ uri: image.uri }}
                  className="flex-1 rounded-lg"
                  // style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => {
                    setImage(null);
                    if (!description.current) setDisablePostButton(true);
                  }}
                  // className="absolute top-2 right-6 bg-transparent rounded-full p-1"
                  // style={styles.removeImageButton}
                  className="absolute rounded-full p-1"
                  style={{
                    top: 8,
                    right: 24,
                    backgroundColor: "rgba(0,0,0,0.6)",
                  }}
                >
                  <Entypo name="cross" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <AttachmentPanel
            panHandlers={panResponder.panHandlers}
            animatedHeight={animatedHeight}
            currentSnapIndex={currentSnapIndex}
            onPickImage={pickImage}
          />
        </KeyboardAvoidingView>
      </View>

      {showDiscardPrompt && (
        <DiscardChangesPrompt
          onDiscard={handleConfirmDiscard}
          onContinue={() => setShowDiscardPrompt(false)}
        />
      )}
    </ReactNativeModal>
  );
}

// const styles = StyleSheet.create({
// modalContentContainer: {
//   flex: 1,
//   backgroundColor: "white",
//   overflow: "hidden", // Clip content to rounded corners
// },
//   keyboardAvoidingContainer: {
//     flex: 1,
//   },
//   headerContainer: {
//     paddingTop: 10,
//   },
//   scrollView: {
//     flex: 1, // Allow scroll view to take up the available space
//   },
//   userInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingTop: 10, // Add some top padding
//     marginBottom: 12,
//   },
//   avatar: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     marginRight: 12,
//     backgroundColor: "#ccc",
//   },
//   textInput: {
//     paddingHorizontal: 16,
//     paddingTop: 0,
//     paddingBottom: 16,
//     fontSize: 18,
//     textAlignVertical: "top",
//     flex: 1, // Ensure it has a good minimum height
//     borderWidth: 1,
//     borderColor: "#000",
//   },
//   imagePreviewContainer: {
//     width: "100%",
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   imagePreview: { width: "100%", height: "100%", borderRadius: 8 },
//   removeImageButton: {
//     position: "absolute",
//     top: 8,
//     right: 24,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     borderRadius: 50,
//     padding: 4,
//   },
// });
