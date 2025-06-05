import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Alert, PermissionsAndroid, Platform } from "react-native";

// We'll conditionally require Firebase only on Android
let messaging: any;
let registerDeviceForRemoteMessages: any;
let requestPermission: any;
let getToken: any;
let onMessage: any;
let onTokenRefresh: any;
let setBackgroundMessageHandler: any;

type RemoteMessage = any;
enum AuthStatus {
  AUTHORIZED,
  PROVISIONAL,
}

if (Platform.OS === "android") {
  // runtime requires so iOS bundle never includes these imports
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseApp = require("@react-native-firebase/app");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseMsg = require("@react-native-firebase/messaging");

  messaging = firebaseMsg.getMessaging(firebaseApp.getApp());
  registerDeviceForRemoteMessages = firebaseMsg.registerDeviceForRemoteMessages;
  requestPermission = firebaseMsg.requestPermission;
  getToken = firebaseMsg.getToken;
  onMessage = firebaseMsg.onMessage;
  onTokenRefresh = firebaseMsg.onTokenRefresh;
  setBackgroundMessageHandler = firebaseMsg.setBackgroundMessageHandler;

  // Setup background handler
  setBackgroundMessageHandler(
    messaging,
    async (remoteMessage: RemoteMessage) => {
      console.log("Background FCM message:", remoteMessage);
    }
  );
}

interface NotificationContextValue {
  fcmToken: string | null;
  notification: RemoteMessage | null;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [fcmTokenState, setFcmToken] = useState<string | null>(null);
  const [notificationState, setNotification] = useState<RemoteMessage | null>(
    null
  );

  useEffect(() => {
    // Only run messaging logic on Android
    if (Platform.OS !== "android" || !messaging) {
      return;
    }

    let unsubMessage: (() => void) | null = null;
    let unsubToken: (() => void) | null = null;

    (async () => {
      try {
        await registerDeviceForRemoteMessages(messaging);

        // Android 13+ notification permission
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        const status = await requestPermission(messaging);
        if (
          status !== AuthStatus.AUTHORIZED &&
          status !== AuthStatus.PROVISIONAL
        ) {
          Alert.alert("Push permission denied");
          return;
        }

        const token = await getToken(messaging);
        setFcmToken(token);

        unsubMessage = onMessage(messaging, (msg: any) => {
          console.log("Foreground message:", msg);
          setNotification(msg);
        });

        unsubToken = onTokenRefresh(messaging, (newToken: any) => {
          setFcmToken(newToken);
        });
      } catch (err) {
        console.error("FCM setup error:", err);
      }
    })();

    return () => {
      if (unsubMessage) unsubMessage();
      if (unsubToken) unsubToken();
    };
  }, []);

  // console.log(Platform.OS === "android", fcmTokenState);

  return (
    <NotificationContext.Provider
      value={{ fcmToken: fcmTokenState, notification: notificationState }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (ctx === undefined && Platform.OS === "android") {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx; // Returns undefined on iOS
};
