import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Add web-specific styles
        ...(Platform.OS === 'web' ? {
          headerMode: 'screen',
          headerShown: true,
        } : {
          headerShown: false
        })
      }}
    >
      <Stack.Screen 
        name="(tabs)"
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}
