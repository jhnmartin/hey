import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useOrg } from "../../contexts/org-context";

export default function EventsScreen() {
  const router = useRouter();
  const { activeOrg } = useOrg();

  const events = useQuery(
    api.events.listByOrg,
    activeOrg ? { orgId: activeOrg._id as any } : "skip",
  );

  if (!activeOrg) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#71717a", fontSize: 16 }}>Select an organization first</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (events === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fff" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {events.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="calendar-outline" size={48} color="#71717a" />
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 16 }}>
            No events yet
          </Text>
          <Text style={{ color: "#71717a", fontSize: 14, textAlign: "center", marginTop: 8 }}>
            Create your first event to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#18181b",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {item.name}
              </Text>
              {item.tagline ? (
                <Text style={{ color: "#a1a1aa", fontSize: 13, marginTop: 4 }}>
                  {item.tagline}
                </Text>
              ) : null}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                <View
                  style={{
                    backgroundColor: item.status === "published" ? "#16a34a" : "#71717a",
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600", textTransform: "capitalize" }}>
                    {item.status}
                  </Text>
                </View>
                {item.startDate ? (
                  <Text style={{ color: "#71717a", fontSize: 12 }}>
                    {new Date(item.startDate).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/create-event")}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#fb5536",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <StatusBar style="light" />
    </View>
  );
}
