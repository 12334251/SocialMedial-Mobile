// index.js — this MUST be your app’s true entrypoint
import "expo-dev-client";
import messaging from "@react-native-firebase/messaging";

// 1️⃣ Register background handler first:
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("📩 BG message:", remoteMessage);
});

// 2️⃣ Then register your app root:
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

function App() {
  return <ExpoRoot />;
}

registerRootComponent(App);
