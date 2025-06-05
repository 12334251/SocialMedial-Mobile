// app/_layout.tsx (or App.tsx), *before* any other imports
import { BackHandler } from "react-native";

// Patch the missing method at runtime:
// — cast to `any` so TS won’t complain
const RH = BackHandler as any;
if (typeof RH.removeEventListener !== "function") {
  RH.removeEventListener = (
    _eventName: string,
    _handler: (...args: any[]) => any
  ) => {
    /* no-op */
  };
}

import "../global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import utilities from "../tailwind.json";
import CustomTailwindProvider from "@/CustomTailwindProvider";
import {
  WorkSans_200ExtraLight,
  WorkSans_300Light,
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  WorkSans_800ExtraBold,
  WorkSans_900Black,
} from "@expo-google-fonts/work-sans";
import ClientProvider from "../redux/ClientProvider";
import { WebSocketProvider } from "@/Context/WebSocketProvider";
import { NotificationProvider } from "@/Context/NotificationContext";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, User } from "@/Context/AuthContext";
import * as SecureStore from "expo-secure-store";
import UserService from "@/services/UserService";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
});

require("..//ReactotronConfig");

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, error] = useFonts({
    WorkSans_200ExtraLight,
    WorkSans_300Light,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    WorkSans_800ExtraBold,
    WorkSans_900Black,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (token) {
          const resp = await UserService.verifyUser();
          setUser(resp.data);
          router.replace("/(tabs)"); // only runs after fetch
        } else {
          router.replace("/(auth)");
        } // <-- set React state
      } catch {
        router.replace("/(auth)");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if ((loaded || error) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isLoading]);

  if (!loaded && !error) {
    return null;
  }

  const Inner = (
    <GestureHandlerRootView>
      <ClientProvider>
        <AuthProvider initialUser={user}>
          <WebSocketProvider>
            <QueryClientProvider client={queryClient}>
              <CustomTailwindProvider utilities={utilities}>
                <PaperProvider
                  theme={colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme}
                >
                  <Stack screenOptions={{ animation: "slide_from_right" }}>
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(home)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(profile)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(friends)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="auto" />
                </PaperProvider>
              </CustomTailwindProvider>
            </QueryClientProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ClientProvider>
    </GestureHandlerRootView>
  );

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {Platform.OS === "android" ? (
        <NotificationProvider>{Inner}</NotificationProvider>
      ) : (
        Inner
      )}
    </ThemeProvider>
  );
}
