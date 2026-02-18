import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";

type Suggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
};

export type VenueResult = {
  venueName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  placeId: string;
  lat: number | null;
  lng: number | null;
};

type VenueAutocompleteProps = {
  onSelect: (result: VenueResult) => void;
};

export function VenueAutocomplete({ onSelect }: VenueAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const autocomplete = useAction(api.places.autocomplete);
  const getDetails = useAction(api.places.getDetails);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const result = await autocomplete({ input });
        setSuggestions(result.suggestions);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [autocomplete],
  );

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  async function handleSelect(suggestion: Suggestion) {
    setQuery("");
    setSuggestions([]);
    setSelecting(true);
    try {
      const details = await getDetails({ placeId: suggestion.placeId });
      onSelect({
        venueName: details.name || suggestion.mainText,
        address: details.address ?? "",
        city: details.city ?? "",
        state: details.state ?? "",
        zip: details.zip ?? "",
        placeId: suggestion.placeId,
        lat: details.lat ?? null,
        lng: details.lng ?? null,
      });
    } catch {
      onSelect({
        venueName: suggestion.mainText,
        address: "",
        city: "",
        state: "",
        zip: "",
        placeId: suggestion.placeId,
        lat: null,
        lng: null,
      });
    } finally {
      setSelecting(false);
    }
  }

  return (
    <View>
      <View
        style={{
          backgroundColor: "#18181b",
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <Ionicons name="search" size={16} color="#71717a" />
        <TextInput
          value={query}
          onChangeText={handleChange}
          placeholder="Search for a venue..."
          placeholderTextColor="#71717a"
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 10,
            color: "#fff",
            fontSize: 15,
          }}
          editable={!selecting}
        />
        {(loading || selecting) && (
          <ActivityIndicator size="small" color="#71717a" />
        )}
      </View>

      {suggestions.length > 0 && (
        <View
          style={{
            backgroundColor: "#18181b",
            borderRadius: 12,
            marginTop: 6,
            overflow: "hidden",
          }}
        >
          {suggestions.map((s, i) => (
            <Pressable
              key={s.placeId}
              onPress={() => handleSelect(s)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopWidth: i > 0 ? 1 : 0,
                borderTopColor: "#27272a",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>
                {s.mainText}
              </Text>
              <Text style={{ color: "#71717a", fontSize: 12, marginTop: 2 }}>
                {s.secondaryText}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
