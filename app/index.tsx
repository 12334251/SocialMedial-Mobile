// app/index.tsx

import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export default function Index() {
  // useEffect(() => {
  //   const deleteData = async () => {
  //     console.log("deleted", `friendRequestSent_6803ff918d48bc4e13548772`);
  //     Platform.OS === "ios"
  //       ? await SecureStore.deleteItemAsync(
  //           `friendRequestSent_6803ff918d48bc4e13548772`
  //         )
  //       : await SecureStore.deleteItemAsync(
  //           `friendRequestSent_6802bb7292295ddc8ffab08c`
  //         );
  //   };

  //   deleteData();
  // }, []);
  return null;
}
