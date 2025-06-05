import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as SecureStore from "expo-secure-store";

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const friendRequestKey = `friendRequestSent_6802bb7292295ddc8ffab08c`;
    const getStoredId = async () => {
      const storedFlag = await SecureStore.getItemAsync(friendRequestKey);
      // storedFlag === "true" means we’ve already sent it once.

      console.log("storedFlag:", storedFlag);
    };
    getStoredId();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="name" options={{ headerShown: false }} />
      <Stack.Screen name="picture" options={{ headerShown: false }} />
      <Stack.Screen name="locAndOcc" options={{ headerShown: false }} />
      <Stack.Screen name="email" options={{ headerShown: false }} />
      <Stack.Screen name="password" options={{ headerShown: false }} />
    </Stack>
  );
}
