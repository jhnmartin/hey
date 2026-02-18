import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useLocation } from "../lib/location-context";
import { Ionicons } from "@expo/vector-icons";

const RADIUS_OPTIONS = [10, 25, 50, 100] as const;

export function LocationBar() {
  const { location, setSource, setSelected, setRadius, requestCurrentLocation, locationLoading } = useLocation();
  const profile = useQuery(api.profiles.get);
  const hasHome = profile?.homeLat != null && profile?.homeLng != null;
  const [modalVisible, setModalVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ placeId: string; mainText: string; secondaryText: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const autocomplete = useAction(api.places.autocomplete);
  const getDetails = useAction(api.places.getDetails);

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await autocomplete({ input: val });
        setSuggestions(result.suggestions);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 300);
  }

  async function handleSearchSelect(placeId: string, mainText: string) {
    setSuggestions([]);
    setSearchQuery("");
    try {
      const details = await getDetails({ placeId });
      const name = [details.city, details.state].filter(Boolean).join(", ") || mainText;
      if (details.lat != null && details.lng != null) {
        setSelected(name, details.lat, details.lng);
        setModalVisible(false);
      }
    } catch { /* ignore */ }
  }

  const displayName = location.name || "Set location";
  const sourceLabel = location.source === "home" ? " (Home)" : "";

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: "#f3f4f6",
        }}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color="#6b7280" />
        ) : (
          <Ionicons name="location" size={16} color="#6b7280" />
        )}
        <Text style={{ marginLeft: 6, fontSize: 14, color: "#374151", flex: 1 }} numberOfLines={1}>
          {displayName}{sourceLabel}
          {location.lat != null && (
            <Text style={{ color: "#9ca3af" }}> · {location.radiusMiles} mi</Text>
          )}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#9ca3af" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: "bold", color: "#000" }}>Location</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
            {/* Home option */}
            <Pressable
              onPress={() => { if (hasHome) { setSource("home"); setModalVisible(false); } }}
              disabled={!hasHome}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                opacity: hasHome ? 1 : 0.5,
              }}
            >
              <Ionicons name="home" size={20} color="#374151" />
              <Text style={{ flex: 1, marginLeft: 12, fontSize: 16, color: "#374151" }}>
                {hasHome ? (profile?.homeLocationName ?? "Home") : "Home (not set)"}
              </Text>
              {location.source === "home" && location.lat != null && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366f1" }} />
              )}
            </Pressable>

            {/* Current location */}
            <Pressable
              onPress={() => { requestCurrentLocation(); setModalVisible(false); }}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}
            >
              <Ionicons name="navigate" size={20} color="#374151" />
              <Text style={{ flex: 1, marginLeft: 12, fontSize: 16, color: "#374151" }}>Current Location</Text>
              {location.source === "current" && location.lat != null && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366f1" }} />
              )}
            </Pressable>

            {/* Search */}
            <View style={{ marginTop: 12 }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                paddingHorizontal: 12,
              }}>
                <Ionicons name="search" size={16} color="#9ca3af" />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder="Search a city..."
                  placeholderTextColor="#9ca3af"
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#000" }}
                />
                {searching && <ActivityIndicator size="small" color="#9ca3af" />}
              </View>
              {suggestions.map((s, i) => (
                <Pressable
                  key={s.placeId}
                  onPress={() => handleSearchSelect(s.placeId, s.mainText)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderTopWidth: i > 0 ? 1 : 0,
                    borderTopColor: "#e5e7eb",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "500", color: "#000" }}>{s.mainText}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{s.secondaryText}</Text>
                </Pressable>
              ))}
            </View>

            {/* Radius presets */}
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Radius
              </Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {RADIUS_OPTIONS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRadius(r)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: "center",
                      backgroundColor: location.radiusMiles === r ? "#6366f1" : "#f3f4f6",
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: location.radiusMiles === r ? "#fff" : "#374151",
                    }}>
                      {r} mi
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
