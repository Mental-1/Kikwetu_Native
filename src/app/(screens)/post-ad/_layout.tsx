import AuthGuard from "@/components/AuthGuard";
import { Stack } from "expo-router";
import React from "react";

export default function PostAdLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="select-option"
          options={{
            title: "Select Option",
            presentation: "transparentModal",
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="step1"
          options={{
            title: "Details",
            presentation: "transparentModal",
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="step2"
          options={{
            title: "Media",
            presentation: "transparentModal",
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="step3"
          options={{
            title: "Preview",
            presentation: "transparentModal",
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
