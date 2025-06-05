import { getToken } from "firebase/messaging";
import { messaging } from "./firebase-config";

const vapidKey = process.env.EXPO_VAPID_KEY;

export const requestFCMToken = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !messaging) {
    console.warn("FCM is not supported in this environment.");
    return null;
  }

  if (!("Notification" in window)) {
    throw new Error("Browser does not support notifications.");
  }

  return await getToken(messaging, { vapidKey });
};
