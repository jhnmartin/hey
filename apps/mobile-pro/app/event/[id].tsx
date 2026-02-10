import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const event = useQuery(api.events.get, id ? { id: id as any } : "skip");

  if (event === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fff" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (event === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#71717a", fontSize: 16 }}>Event not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#fb5536", fontSize: 14, fontWeight: "600" }}>Go back</Text>
        </Pressable>
        <StatusBar style="light" />
      </View>
    );
  }

  const venue = event.venues?.[0];

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 16,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
          Event Detail
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status badge */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: event.status === "published" ? "#16a34a" : "#71717a",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
              {event.status}
            </Text>
          </View>
          {event.eventType && (
            <View
              style={{
                backgroundColor: "#27272a",
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: "#a1a1aa", fontSize: 12, fontWeight: "500", textTransform: "capitalize" }}>
                {event.eventType}
              </Text>
            </View>
          )}
        </View>

        {/* Event name */}
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
          {event.name}
        </Text>

        {/* Venue */}
        {venue && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <Ionicons name="location-outline" size={16} color="#a1a1aa" />
            <Text style={{ color: "#a1a1aa", fontSize: 14 }}>
              {venue.name}
              {venue.city ? `, ${venue.city}` : ""}
              {venue.state ? `, ${venue.state}` : ""}
            </Text>
          </View>
        )}

        {/* Info cards */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {event.startDate && (
            <View style={{ flex: 1, backgroundColor: "#18181b", borderRadius: 12, padding: 14 }}>
              <Text style={{ color: "#71717a", fontSize: 12, marginBottom: 4 }}>Date</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
          {event.startDate && (
            <View style={{ flex: 1, backgroundColor: "#18181b", borderRadius: 12, padding: 14 }}>
              <Text style={{ color: "#71717a", fontSize: 12, marginBottom: 4 }}>Time</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {new Date(event.startDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
          {event.endDate && (
            <View style={{ flex: 1, backgroundColor: "#18181b", borderRadius: 12, padding: 14 }}>
              <Text style={{ color: "#71717a", fontSize: 12, marginBottom: 4 }}>Ends</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {new Date(event.endDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {event.description && (
          <View style={{ backgroundColor: "#18181b", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <Text style={{ color: "#71717a", fontSize: 12, marginBottom: 8 }}>About</Text>
            <Text style={{ color: "#fff", fontSize: 14, lineHeight: 20 }}>
              {event.description}
            </Text>
          </View>
        )}

        {/* Venue details */}
        {venue && venue.address && (
          <View style={{ backgroundColor: "#18181b", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <Text style={{ color: "#71717a", fontSize: 12, marginBottom: 8 }}>Venue</Text>
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>{venue.name}</Text>
            <Text style={{ color: "#a1a1aa", fontSize: 13, marginTop: 4 }}>
              {[venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}
            </Text>
          </View>
        )}
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}
