import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, Text, Image } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useOrg } from "../../contexts/org-context";

function HeaderLeft() {
  const { activeOrg } = useOrg();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/select-org")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginLeft: 16,
      }}
    >
      {activeOrg?.avatarUrl ? (
        <Image
          source={{ uri: activeOrg.avatarUrl }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />
      ) : (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#27272a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {activeOrg ? activeOrg.name.charAt(0).toUpperCase() : "?"}
          </Text>
        </View>
      )}
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
        {activeOrg?.name ?? "Select Org"}
      </Text>
    </Pressable>
  );
}

function HeaderRight() {
  const profile = useQuery(api.profiles.get);
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/settings")}
      style={{ marginRight: 16 }}
    >
      {profile?.avatarUrl ? (
        <Image
          source={{ uri: profile.avatarUrl }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />
      ) : (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#3f3f46",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
            {profile ? profile.name.charAt(0).toUpperCase() : ""}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#71717a",
        tabBarStyle: {
          backgroundColor: "#18181b",
          borderTopColor: "#27272a",
        },
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        headerTitle: "",
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal"
              color={color}
              size={size}
            />
          ),
        }}
      />
      {/* Hidden tabs — kept for Expo Router file requirement */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="organizations" options={{ href: null }} />
    </Tabs>
  );
}
