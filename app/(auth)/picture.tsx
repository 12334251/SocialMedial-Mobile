import React from "react";
import { Keyboard, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { setPicture } from "@/redux/state/registration";
import { RootState } from "@/redux/store";

const PictureScreen: React.FC = () => {
  const dispatch = useDispatch();
  // State to hold the selected image URI.

  const savedPicture = useSelector(
    (state: RootState) => state.registration.picture
  );

  // Extract file name from the URI.
  const getFileName = (uri: string): string => {
    return uri.split("/").pop() || "";
  };

  // Get the MIME type from the file extension.
  const getMimeType = (filename: string): string => {
    const extension = filename.split(".").pop() || "";
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      default:
        return "image";
    }
  };

  // Truncate file name if it's too long.
  const truncateFileName = (
    filename: string,
    maxLength: number = 20
  ): string => {
    return filename.length > maxLength
      ? filename.substring(0, maxLength) + "..."
      : filename;
  };

  // 3) Launch the picker, then immediately dispatch into Redux:
  const handlePickImage = async () => {
    // Ask permission if needed
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const name = getFileName(uri);
      const type = getMimeType(name);

      // Immediately store in Redux
      dispatch(setPicture({ uri, name, type }));
    }
  };

  // 4) When “Next” is tapped, just navigate (Redux already has the picture)
  const handleNavigation = () => {
    if (savedPicture) {
      router.push("/(auth)/password");
    }
  };

  return (
    <SafeAreaView
      // style={{
      //   flex: 1,
      //   backgroundColor: "white",
      //   padding: 16,
      //   justifyContent: "space-between",
      // }}
      className="flex-1 bg-white p-4 justify-between"
    >
      <View style={{ marginBottom: 16 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="black" />
        </Pressable>
      </View>
      <View style={{ flex: 1, justifyContent: "flex-start", gap: 16 }}>
        <TextInput
          label="Select Image"
          value={
            savedPicture
              ? truncateFileName(getFileName(savedPicture.name), 20)
              : ""
          }
          placeholder="Tap to select image"
          onTouchStart={() => {
            Keyboard.dismiss();
            handlePickImage();
          }}
          editable={false}
          right={<TextInput.Icon icon="image" onPress={handlePickImage} />}
          mode="outlined"
          keyboardType="default"
          theme={{ colors: { background: "white" } }}
          outlineColor="#3b82f6"
          activeOutlineColor="#2563eb"
        />
        {savedPicture && (
          <View style={{ alignItems: "center" }}>
            <Image
              source={{ uri: savedPicture.uri }}
              style={{ width: 192, height: 192 }}
            />
          </View>
        )}
        <Button
          mode="contained"
          onPress={() => handleNavigation()}
          loading={false}
          style={{ backgroundColor: "#3b82f6" }}
          labelStyle={{ color: "white" }}
          disabled={!savedPicture}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default PictureScreen;
