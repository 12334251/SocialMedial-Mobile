import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Pressable } from "react-native";
import { Button, TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setLocationOccupation } from "@/redux/state/registration";
import { RootState } from "@/redux/store";

export default function LocAndOccScreen() {
  const dispatch = useDispatch();
  const savedLocation = useSelector(
    (state: RootState) => state.registration.location
  );
  const savedOccupation = useSelector(
    (state: RootState) => state.registration.occupation
  );

  const onChangeLocation = (newLocation: string) => {
    dispatch(
      setLocationOccupation({
        location: newLocation,
        occupation: savedOccupation,
      })
    );
  };

  const onChangeOccupation = (newOccupation: string) => {
    dispatch(
      setLocationOccupation({
        location: savedLocation,
        occupation: newOccupation,
      })
    );
  };

  // Disable “Next” if either field is empty:
  const nextDisabled =
    savedLocation.trim().length === 0 || savedOccupation.trim().length === 0;

  const handleNavigation = () => {
    router.push("/(auth)/picture");
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-3 justify-between">
      <View className="w-full mb-2">
        <Pressable className="flex items-start">
          <Ionicons
            name="chevron-back"
            size={32}
            color="black"
            onPress={() => router.back()}
          />
        </Pressable>
      </View>
      {/* Adjust container alignment based on keyboard visibility */}
      <View className="flex-1 gap-3">
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <TextInput
              label="Location"
              value={savedLocation}
              onChangeText={onChangeLocation}
              mode="outlined"
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
          </View>
          <View className="flex-1">
            <TextInput
              label="Occupation"
              value={savedOccupation}
              onChangeText={onChangeOccupation}
              mode="outlined"
              keyboardType="default"
              theme={{ colors: { background: "white" } }}
              outlineColor="#3b82f6"
              activeOutlineColor="#2563eb"
            />
          </View>
        </View>
        <Button
          mode="elevated"
          onPress={() => handleNavigation()}
          loading={false}
          buttonColor="#3b82f6"
          textColor="white"
          disabled={nextDisabled}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
}
