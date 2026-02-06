import "../global.css";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: "hey thursday pro",
          headerTitleStyle: { fontWeight: "700", fontSize: 20 },
        }}
      />
    </ConvexProvider>
  );
}
