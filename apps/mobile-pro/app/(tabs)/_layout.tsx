import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#71717a",
        tabBarStyle: { backgroundColor: "#18181b", borderTopColor: "#27272a" },
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        headerTitleAlign: "left",
        headerTitle: "hey thursday pro",
        headerTitleStyle: { fontWeight: "700", fontSize: 20 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
