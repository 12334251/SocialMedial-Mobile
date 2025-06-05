import { Platform } from "react-native";

let messaging: any;
let getToken: any;

if (Platform.OS === "android") {
  // runtime require so iOS bundle never includes these imports
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseApp = require("@react-native-firebase/app");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseMsg = require("@react-native-firebase/messaging");

  messaging = firebaseMsg.getMessaging(firebaseApp.getApp());
  getToken = firebaseMsg.getToken;
}

// Example: standalone async initializer
export const requestFCMToken = async (): Promise<string | null> => {
  if (Platform.OS !== "android" || !messaging || !getToken) {
    return null;
  }
  try {
    const token: string = await getToken(messaging);
    console.log("FCM token:", token);
    return token;
  } catch (e) {
    console.error("Failed to get FCM token:", e);
    return null;
  }
};
