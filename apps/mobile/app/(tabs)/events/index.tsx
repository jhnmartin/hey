import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useLocation } from "../../../lib/location-context";
import { LocationBar } from "../../../components/location-bar";

export default function EventsScreen() {
  const { location } = useLocation();
  const hasLocation = location.lat != null && location.lng != null;

  const nearbyEvents = useQuery(
    api.events.listNearby,
    hasLocation
      ? { lat: location.lat!, lng: location.lng!, radiusMiles: location.radiusMiles }
      : "skip",
  );
  const allEvents = useQuery(
    api.events.listPublic,
    hasLocation ? "skip" : {},
  );
  const events = hasLocation ? nearbyEvents : allEvents;

  return (
    <View className="flex-1 bg-background pt-4">
      <Text className="px-6 text-2xl font-bold text-black">
        Discover Events
      </Text>
      <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
        <LocationBar />
      </View>

      {events === undefined ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 32 }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : events.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 32, paddingHorizontal: 24 }}>
          <Text style={{ color: "#9ca3af", fontSize: 16, textAlign: "center" }}>
            {hasLocation
              ? "No events found nearby. Try increasing the radius."
              : "No events to show right now."}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 12 }}>
            {events.map((event) => {
              const distanceMiles = "distanceMiles" in event ? (event as any).distanceMiles as number : null;
              const venueName = event.venues?.[0]?.name;

              return (
                <Pressable
                  key={event._id}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  {event.coverImageUrl ? (
                    <Image
                      source={{ uri: event.coverImageUrl }}
                      style={{ width: "100%", aspectRatio: 16 / 9 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#e5e7eb" }} />
                  )}
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>
                      {event.name}
                    </Text>
                    {(venueName || distanceMiles != null) && (
                      <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                        {venueName}
                        {distanceMiles != null && ` · ${distanceMiles} mi`}
                      </Text>
                    )}
                    {event.startDate && (
                      <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                        {new Date(event.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
