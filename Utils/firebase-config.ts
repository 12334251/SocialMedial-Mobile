import { initializeApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging and export with the correct type
export const messaging: Messaging | null =
  typeof window !== "undefined" ? getMessaging(app) : null;

// VAPID key
export const vapidKey =
  "BBUigJxtez2w-xymDaCw0bsNjA-UtKWUz6t87ncPxYu4kZoOF0WuqQyYIPjYR1PsGIQ9BMzY9uSoCXTUBGYu624";
