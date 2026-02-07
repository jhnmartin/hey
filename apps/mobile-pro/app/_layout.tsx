import "../global.css";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { OrgProvider } from "../contexts/org-context";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <OrgProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </OrgProvider>
    </ConvexProvider>
  );
}
