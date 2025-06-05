import { initializeApp, getApps, getApp } from "@react-native-firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBL5YOX5mqgt8FgDzLW3xV5hJyi4J0ZmME",
  authDomain: "facebook-d998a.firebaseapp.com",
  projectId: "facebook-d998a",
  storageBucket: "facebook-d998a.appspot.com",
  messagingSenderId: "952916286565",
  appId: "1:952916286565:web:71d758b0cb5092c159ba8c",
  measurementId: "G-SHDSR6DEV6",
};

let firebaseApp: any;

export const initializeFirebase = () => {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  return firebaseApp;
};

export default firebaseApp;
