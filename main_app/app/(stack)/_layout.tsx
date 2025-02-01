import { Stack } from 'expo-router';
import React from 'react';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="account/[id]" />
      <Stack.Screen name="security/[id]" />
      <Stack.Screen name="story/[id]" />
    </Stack>
  );
}
