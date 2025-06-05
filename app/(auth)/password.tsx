import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Pressable, Platform } from "react-native";
import { Button, HelperText, TextInput, Text } from "react-native-paper";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setPassword } from "@/redux/state/registration";
// Use default import for the auth service and update the interface name.
import authService, { RegisterValues } from "@/services/AuthServices";
import axios from "axios";

export default function PasswordScreen() {
  const dispatch = useDispatch();
  const { back, push } = useRouter();
  const registration = useSelector((state: RootState) => state.registration);
  const [isPassword, setIsPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isConfirmPassword, setIsConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const handleNavigation = async () => {
    // reset error
    setError("");

    // simple client‑side match check
    if (isPassword !== isConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      dispatch(setPassword(isPassword));

      const formData = new FormData();

      formData.append("firstName", registration.firstName);
      formData.append("lastName", registration.lastName);
      formData.append("email", registration.email);
      formData.append("location", registration.location);
      formData.append("occupation", registration.occupation);

      formData.append("password", isPassword);

      const regPic = registration.picture;
      formData.append("picturePath", {
        uri: regPic?.uri,
        name: regPic?.name,
        type: regPic?.type,
      } as any);

      const response = await authService.registerUser(formData);

      if (response.status === 200 || response.status === 201) {
        push("/(auth)");
      } else {
        setError(response.message || "Registration failed");
        // console.log("unexpected status:", response);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const onChangeConfirmPassword = (text: string) => {
    setIsConfirmPassword(text);
    const isMatch = isPassword.startsWith(text);
    if (!isMatch) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  // if (Platform.OS === "android") {
  //   console.log("registration.picture android", registration.picture);
  // } else if (Platform.OS === "ios") {
  //   console.log("registration.picture ios", registration.picture);
  // }

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
      <View className="flex-1 gap-3">
        <View className="flex flex-col gap-2">
          <View className="flex">
            <TextInput
              label="Password"
              value={isPassword}
              onChangeText={setIsPassword}
              mode="outlined"
              secureTextEntry={!passwordVisible}
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
          </View>
          <View className="flex">
            <TextInput
              label="Confirm Password"
              value={isConfirmPassword}
              onChangeText={onChangeConfirmPassword}
              mode="outlined"
              secureTextEntry={!confirmPasswordVisible}
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
              error={isError}
              onFocus={() => setIsError(false)}
              onBlur={() => setIsError(false)}
              right={
                <TextInput.Icon
                  icon={confirmPasswordVisible ? "eye-off" : "eye"}
                  onPress={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                />
              }
            />
            {isError && (
              <HelperText type="error" visible={isError}>
                Passwords do not match
              </HelperText>
            )}
          </View>
        </View>
        <Button
          mode="elevated"
          onPress={handleNavigation}
          loading={loading}
          buttonColor="#3b82f6"
          textColor="white"
          disabled={!isPassword || !isConfirmPassword}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
}
