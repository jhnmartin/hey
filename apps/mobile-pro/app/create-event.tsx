import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useOrg } from "../contexts/org-context";
import { VenueAutocomplete, type VenueResult } from "../components/venue-autocomplete";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

// ─── Shared styles ──────────────────────────────────────────────────────────

const inputStyle = {
  backgroundColor: "#18181b",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: "#fff",
  fontSize: 15,
} as const;

const labelStyle = {
  color: "#a1a1aa",
  fontSize: 13,
  marginBottom: 6,
} as const;

const cardStyle = {
  backgroundColor: "#111113",
  borderRadius: 16,
  padding: 20,
  marginBottom: 12,
} as const;

const pickerBtnStyle = {
  backgroundColor: "#18181b",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
};

// ─── Picker targets ─────────────────────────────────────────────────────────

type PickerTarget = "startDate" | "startTime" | "endDate" | "endTime";

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CreateEventScreen() {
  const router = useRouter();
  const { activeOrg } = useOrg();
  const createEvent = useMutation(api.events.create);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [showEndDate, setShowEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();
  const [recurring, setRecurring] = useState(false);
  const [venue, setVenue] = useState<VenueResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("startDate");

  const canSave = name.trim() !== "" && activeOrg !== null;

  function openPicker(target: PickerTarget, mode: "date" | "time") {
    setPickerTarget(target);
    setPickerMode(mode);
    setPickerVisible(true);
  }

  function handlePickerConfirm(date: Date) {
    setPickerVisible(false);
    switch (pickerTarget) {
      case "startDate":
        setStartDate(date);
        break;
      case "startTime":
        setStartTime(date);
        break;
      case "endDate":
        setEndDate(date);
        break;
      case "endTime":
        setEndTime(date);
        break;
    }
  }

  function getPickerDate(): Date {
    switch (pickerTarget) {
      case "startDate":
        return startDate ?? new Date();
      case "startTime":
        return startTime ?? new Date();
      case "endDate":
        return endDate ?? startDate ?? new Date();
      case "endTime":
        return endTime ?? startTime ?? new Date();
    }
  }

  function buildTimestamp(date?: Date, time?: Date): number | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    if (time) {
      d.setHours(time.getHours(), time.getMinutes(), 0, 0);
    }
    return d.getTime();
  }

  async function handleSave() {
    if (!canSave || !activeOrg) return;

    setSubmitting(true);
    try {
      const eventId = await createEvent({
        name: name.trim(),
        status: "draft",
        visibility: "public",
        ageRestriction: "all_ages",
        eventType: recurring ? "recurring" : "single",
        ownerOrgId: activeOrg._id as any,
        startDate: buildTimestamp(startDate, startTime),
        ...(showEndDate && endDate && { endDate: buildTimestamp(endDate, endTime) }),
        ...(venue && {
          venues: [{
            name: venue.venueName,
            address: venue.address || undefined,
            city: venue.city || undefined,
            state: venue.state || undefined,
            zip: venue.zip || undefined,
          }],
        }),
      });
      router.replace(`/event/${eventId}`);
    } catch (error) {
      console.error("Failed to create event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
      setSubmitting(false);
    }
  }

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
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 24 }}>
          get started
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={!canSave || submitting}
          style={{ opacity: !canSave || submitting ? 0.4 : 1 }}
        >
          {submitting ? (
            <ActivityIndicator color="#fb5536" size="small" />
          ) : (
            <Text style={{ color: "#fb5536", fontWeight: "600", fontSize: 16 }}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Name */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Event Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What's your event called?"
            placeholderTextColor="#71717a"
            style={inputStyle}
          />
        </View>

        {/* Start Date & Time */}
        <View style={cardStyle}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ ...labelStyle, marginBottom: 0 }}>Start Date</Text>
            {!showEndDate && (
              <Pressable onPress={() => setShowEndDate(true)}>
                <Text style={{ color: "#fb5536", fontSize: 12, fontWeight: "500" }}>
                  + Add end date and time
                </Text>
              </Pressable>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
            <Pressable style={{ ...pickerBtnStyle, flex: 1 }} onPress={() => openPicker("startDate", "date")}>
              <Ionicons name="calendar-outline" size={16} color={startDate ? "#fff" : "#71717a"} />
              <Text style={{ color: startDate ? "#fff" : "#71717a", fontSize: 15 }}>
                {startDate ? formatDate(startDate) : "Pick a date"}
              </Text>
            </Pressable>
            <Pressable style={{ ...pickerBtnStyle, width: 110 }} onPress={() => openPicker("startTime", "time")}>
              <Ionicons name="time-outline" size={16} color={startTime ? "#fff" : "#71717a"} />
              <Text style={{ color: startTime ? "#fff" : "#71717a", fontSize: 15 }}>
                {startTime ? formatTime(startTime) : "Time"}
              </Text>
            </Pressable>
          </View>

          {/* End Date & Time */}
          {showEndDate && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <Text style={labelStyle}>End Date</Text>
                <Pressable onPress={() => { setShowEndDate(false); setEndDate(undefined); setEndTime(undefined); }}>
                  <Ionicons name="close-circle" size={20} color="#71717a" />
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable style={{ ...pickerBtnStyle, flex: 1 }} onPress={() => openPicker("endDate", "date")}>
                  <Ionicons name="calendar-outline" size={16} color={endDate ? "#fff" : "#71717a"} />
                  <Text style={{ color: endDate ? "#fff" : "#71717a", fontSize: 15 }}>
                    {endDate ? formatDate(endDate) : "Pick a date"}
                  </Text>
                </Pressable>
                <Pressable style={{ ...pickerBtnStyle, width: 110 }} onPress={() => openPicker("endTime", "time")}>
                  <Ionicons name="time-outline" size={16} color={endTime ? "#fff" : "#71717a"} />
                  <Text style={{ color: endTime ? "#fff" : "#71717a", fontSize: 15 }}>
                    {endTime ? formatTime(endTime) : "Time"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Recurring toggle */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <Text style={{ color: "#71717a", fontSize: 12 }}>
              {recurring && startDate
                ? `Repeats every ${getDayName(startDate)} (weekly)`
                : "Recurring (weekly)"}
            </Text>
            <Switch
              value={recurring}
              onValueChange={setRecurring}
              trackColor={{ false: "#27272a", true: "#fb5536" }}
              thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Primary Location */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Primary Location</Text>
          <Text style={{ color: "#52525b", fontSize: 11, marginBottom: 10 }}>
            You can add more venues later
          </Text>
          {venue ? (
            <View
              style={{
                backgroundColor: "#18181b",
                borderRadius: 12,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Ionicons name="location" size={18} color="#71717a" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>
                  {venue.venueName}
                </Text>
                <Text style={{ color: "#71717a", fontSize: 12, marginTop: 2 }}>
                  {[venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}
                </Text>
              </View>
              <Pressable onPress={() => setVenue(null)}>
                <Ionicons name="close-circle" size={20} color="#71717a" />
              </Pressable>
            </View>
          ) : (
            <VenueAutocomplete onSelect={setVenue} />
          )}
        </View>

        {/* Event Description */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Event Description</Text>
          <Text style={{ color: "#52525b", fontSize: 11, marginBottom: 10 }}>
            Add all relevant information about your event, we'll take it from there. You can edit details after your event is created.
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell people what your event is about..."
            placeholderTextColor="#71717a"
            multiline
            numberOfLines={3}
            style={{ ...inputStyle, minHeight: 80, textAlignVertical: "top" }}
          />
        </View>
      </ScrollView>

      {/* Shared DateTimePicker Modal */}
      <DateTimePickerModal
        isVisible={pickerVisible}
        mode={pickerMode}
        date={getPickerDate()}
        onConfirm={handlePickerConfirm}
        onCancel={() => setPickerVisible(false)}
        themeVariant="dark"
      />

      <StatusBar style="light" />
    </View>
  );
}
