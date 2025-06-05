import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Pressable, Text } from "react-native";
import { Button, TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setEmail } from "@/redux/state/registration";
import { RootState } from "@/redux/store";

export default function EmailScreen() {
  const dispatch = useDispatch();
  const savedEmail = useSelector(
    (state: RootState) => state.registration.email
  );
  const [emailError, setEmailError] = useState<boolean>(false);

  const validateEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  const handleNavigation = () => {
    // 2) Validate using the Redux‐stored email
    if (!validateEmail(savedEmail)) {
      setEmailError(true);
      return;
    }
    router.push("/(auth)/locAndOcc");
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-3 justify-between">
      <View className="w-full mb-2">
        <Pressable className="flex items-start">
          <Ionicons
            name="chevron-back"
            size={32}
            color="black"
            onPress={() => router.back()}
          />
        </Pressable>
      </View>
      {/* Adjust container alignment based on keyboard visibility */}
      <View className="flex-1 gap-3">
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <TextInput
              label="Email"
              value={savedEmail} // Always reflect Redux state
              onChangeText={(text) => {
                const lower = text.toLowerCase();
                dispatch(setEmail(lower)); // Update Redux on every keystroke
                if (emailError) setEmailError(false);
              }}
              onBlur={() => {
                if (!validateEmail(savedEmail)) {
                  setEmailError(true);
                }
              }}
              error={emailError}
              placeholderTextColor="#ccc"
              mode="outlined"
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
            {emailError && (
              <Text style={{ color: "red", marginTop: 4 }}>
                Please enter a valid email address.
              </Text>
            )}
          </View>
        </View>
        <Button
          mode="elevated"
          onPress={() => handleNavigation()}
          loading={false}
          buttonColor="#3b82f6"
          textColor="white"
          disabled={savedEmail.length === 0}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
}
