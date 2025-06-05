import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Button, TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useTailwind } from "tailwind-rn";
import { useDispatch, useSelector } from "react-redux";
import { clearRegistration, setName } from "@/redux/state/registration";
import ReactNativeModal from "react-native-modal";

export default function NameScreen() {
  const tailwind = useTailwind();
  const dispatch = useDispatch();
  const registration = useSelector((state: any) => state.registration);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);

  // handler for the “back” button
  const onBackPress = () => {
    // if *any* field has been filled out, show modal
    const dirty = Boolean(
      registration.firstName ||
        registration.lastName ||
        registration.email ||
        registration.location ||
        registration.occupation ||
        registration.password ||
        registration.picture // pictureFile or null
    );

    if (dirty || firstName || lastName) {
      setShowDiscardPrompt(true);
    } else {
      // nothing to lose
      router.back();
    }
  };

  const handleConfirmDiscard = () => {
    // clear out your draft
    setShowDiscardPrompt(false);
    dispatch(clearRegistration());
    router.back();
  };

  const windowWidth = Dimensions.get("window").width;
  const modalWidth = windowWidth * 0.75; // from w-3/4

  const handleNavigation = () => {
    dispatch(setName({ firstName, lastName }));
    router.push({ pathname: "/(auth)/email", params: { firstName, lastName } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-3 justify-between">
      <ReactNativeModal
        isVisible={showDiscardPrompt}
        backdropOpacity={0.5}
        onBackdropPress={() => setShowDiscardPrompt(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        className="flex-1 justify-center items-center"
      >
        <View className="bg-white items-center justify-center rounded-lg p-4">
          <Text className="text-xl font-worksans-600 text-black text-center mb-1">
            Do you want to stop creating your account?
          </Text>
          <Text className="text-base text-black font-worksans-400 text-center mb-4 px-5">
            If you stop now, you’ll lose any progress you’ve made.
          </Text>
          <View className="w-full border-t-2 border-red-500 h-px" />

          <Button
            mode="text"
            textColor="#3b82f6"
            onPress={handleConfirmDiscard}
            labelStyle={tailwind("text-base font-semibold")}
          >
            Stop creating account
          </Button>

          <View className="w-full border-t-2 border-red-500 h-[2px]" />
          <Button
            mode="text"
            textColor="#3b82f6"
            onPress={() => setShowDiscardPrompt(false)}
            labelStyle={tailwind("text-base font-normal")}
          >
            Continue creating account
          </Button>
        </View>
      </ReactNativeModal>
      <View className="w-full mb-2">
        <Pressable className="flex items-start">
          <Ionicons
            name="chevron-back"
            size={32}
            color="black"
            onPress={onBackPress}
          />
        </Pressable>
      </View>
      <View className="flex-1 gap-3">
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
          </View>
          <View className="flex-1">
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
          </View>
        </View>
        <Button
          mode="elevated"
          onPress={() => handleNavigation()}
          loading={false}
          buttonColor="#3b82f6"
          textColor="white"
          disabled={!firstName || !lastName}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
}
