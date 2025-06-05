import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  Text as RNText,
} from "react-native";
import { ActivityIndicator as PaperSpinner } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput } from "react-native-paper";
import { router } from "expo-router";
import { useNotification } from "@/Context/NotificationContext";
import AuthServices from "@/services/AuthServices";
import { useDispatch } from "react-redux";
import { setLogin } from "@/redux/state";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/Context/AuthContext";

export default function LoginScreen() {
  const { user, setUser } = useAuth();
  const notificationContext = useNotification();
  const fcmToken = notificationContext?.fcmToken;
  const dispatch = useDispatch();
  const email = useRef("");
  const password = useRef("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  // console.log("notificationContext fcmToken", fcmToken);
  // Keyboard show/hide listeners
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // console.log("user", user);

  // Email validation
  const validateEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  // console.log("fcmToken", fcmToken);

  const handleLogIn = async () => {
    setDisableButton(true);
    try {
      Keyboard.dismiss();
      const loggedInResponse = await AuthServices.loginUser({
        email: email.current,
        password: password.current,
        fcmToken: fcmToken, // ensure it is string | null
        browser: "mobile",
      });
      const userResponse = loggedInResponse?.data;
      // console.log("handleLogIn", userResponse);
      if (userResponse) {
        // console.log("browserToken", userResponse?.user?.fcmToken);
        // console.log(
        //   "userResponse",
        //   userResponse.user?._id,
        //   userResponse.user?.token
        // );
        await SecureStore.setItemAsync("userId", userResponse.user?._id);
        await SecureStore.setItemAsync("authToken", userResponse?.token);
        console.log("login", userResponse);
        setUser(userResponse.user);
        dispatch(setLogin(userResponse.user));
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log("handleLogIn error:", error);
    } finally {
      // setDisableButton(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-3">
      <View className="absolute top-24 left-0 right-0 items-center">
        <Image
          source={require("../../assets/images/SMLogoImg.png")}
          className="w-28 h-28 rounded-full"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isKeyboardVisible ? "flex-end" : "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full mt-4">
            <TextInput
              label="Email"
              onChangeText={(text) => {
                email.current = text;
                if (emailError) setEmailError("");
              }}
              onBlur={() => {
                if (!validateEmail(email.current)) {
                  setEmailError("Please enter a valid email address.");
                }
              }}
              autoCapitalize="none"
              mode="outlined"
              error={!!emailError}
              keyboardType="email-address"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
            {emailError && (
              <Text style={{ color: "red", marginTop: 4 }}>{emailError}</Text>
            )}
          </View>

          <View className="w-full mt-4">
            <TextInput
              label="Password"
              secureTextEntry={!passwordVisible}
              onChangeText={(text) => {
                password.current = text;
              }}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible((v) => !v)}
                />
              }
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
          </View>

          <View className="mt-12 w-full">
            <TouchableOpacity
              onPress={handleLogIn}
              disabled={disableButton}
              activeOpacity={0.8} // Optional: controls feedback opacity on press
              className={`h-13 px-4 items-center justify-center rounded-lg ${
                disableButton
                  ? "bg-gray-400" // Tailwind class for disabled background (e.g., lighter blue)
                  : "bg-[#2563eb]" // Tailwind class for normal background (matches your #3b82f6)
              } shadow-sm`} // Added a light shadow for an "elevated" feel
            >
              {disableButton ? (
                <PaperSpinner size="small" color="white" />
              ) : (
                <RNText className="text-white text-lg font-semibold">
                  Log In
                </RNText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!isKeyboardVisible && (
        <Pressable
          onPress={() => router.push("/(auth)/name")}
          className="items-center mt-4"
        >
          <Text variant="titleSmall">Don't have an account? Sign up here.</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
