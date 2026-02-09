import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useOrg } from "../contexts/org-context";

// ─── Types ──────────────────────────────────────────────────────────────────

type EventType = "one_off" | "recurring";
type AgeRestriction = "all_ages" | "18_plus" | "21_plus";
type Visibility = "public" | "private";
type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

type Venue = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

type TicketType = {
  name: string;
  price: number;
  quantity: number;
  description: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function combineDateTime(date?: string, time?: string): number | undefined {
  if (!date) return undefined;
  const dateStr = time ? `${date}T${time}` : date;
  const ms = new Date(dateStr).getTime();
  return isNaN(ms) ? undefined : ms;
}

function generateRecurringDates(
  startDate: string,
  frequency: string,
  count: number,
  endDate?: string,
): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  for (let i = 0; i < count; i++) {
    if (end && current > end) break;
    dates.push(current.toISOString().split("T")[0]!);

    switch (frequency) {
      case "daily":
        current = new Date(current.getTime() + 86400000);
        break;
      case "weekly":
        current = new Date(current.getTime() + 7 * 86400000);
        break;
      case "biweekly":
        current = new Date(current.getTime() + 14 * 86400000);
        break;
      case "monthly":
        current = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          current.getDate(),
        );
        break;
    }
  }

  return dates;
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

const fieldWrap = { marginBottom: 14 } as const;

const STEPS = ["Event Type", "Details", "Classification", "Tickets", "Review"];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CreateEventScreen() {
  const router = useRouter();
  const { activeOrg } = useOrg();
  const createEvent = useMutation(api.events.create);
  const createTicket = useMutation(api.ticketTypes.create);
  const createSeries = useMutation(api.eventSeries.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 0 — Event Type
  const [eventType, setEventType] = useState<EventType>("one_off");

  // Step 1 — Details
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [doorsOpenDate, setDoorsOpenDate] = useState("");
  const [doorsOpenTime, setDoorsOpenTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [venues, setVenues] = useState<Venue[]>([
    { name: "", address: "", city: "", state: "", zip: "" },
  ]);

  // Recurring fields
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [seriesStartDate, setSeriesStartDate] = useState("");
  const [seriesEndDate, setSeriesEndDate] = useState("");
  const [generateCount, setGenerateCount] = useState("4");
  const [recurrenceStartTime, setRecurrenceStartTime] = useState("");
  const [recurrenceEndTime, setRecurrenceEndTime] = useState("");
  const [recurrenceDoorsOpenTime, setRecurrenceDoorsOpenTime] = useState("");

  // Step 2 — Classification
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [ageRestriction, setAgeRestriction] = useState<AgeRestriction>("all_ages");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [tagsInput, setTagsInput] = useState("");

  // Step 3 — Tickets
  const [tickets, setTickets] = useState<TicketType[]>([
    { name: "General Admission", price: 0, quantity: 100, description: "" },
  ]);

  // ─── Image picker ───────────────────────────────────────────────────────

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0]!;
    if (asset.fileSize && asset.fileSize > 3 * 1024 * 1024) {
      Alert.alert("Image too large", "Please select an image under 3MB.");
      return;
    }

    setImageUri(asset.uri);
  }

  // ─── Upload image to Convex ─────────────────────────────────────────────

  async function uploadImage(): Promise<string | undefined> {
    if (!imageUri) return undefined;

    const uploadUrl = await generateUploadUrl();
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type || "image/jpeg" },
      body: blob,
    });
    const { storageId } = await uploadResponse.json();
    return storageId;
  }

  // ─── Venue helpers ──────────────────────────────────────────────────────

  function updateVenue(index: number, field: keyof Venue, value: string) {
    setVenues((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index]!, [field]: value };
      return copy;
    });
  }

  function addVenue() {
    setVenues((prev) => [
      ...prev,
      { name: "", address: "", city: "", state: "", zip: "" },
    ]);
  }

  function removeVenue(index: number) {
    setVenues((prev) => prev.filter((_, i) => i !== index));
  }

  // ─── Ticket helpers ─────────────────────────────────────────────────────

  function updateTicket(index: number, field: keyof TicketType, value: string | number) {
    setTickets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index]!, [field]: value };
      return copy;
    });
  }

  function addTicket() {
    setTickets((prev) => [
      ...prev,
      { name: "", price: 0, quantity: 100, description: "" },
    ]);
  }

  function removeTicket(index: number) {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }

  // ─── Submit ─────────────────────────────────────────────────────────────

  async function handleSubmit(status: "draft" | "published") {
    if (!activeOrg) return;
    if (!name) {
      Alert.alert("Missing name", "Please enter an event name.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const coverImageId = await uploadImage();
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const cleanVenues = venues.filter((v) => v.name.trim());
      const cap = capacity ? Number(capacity) : undefined;

      if (eventType === "one_off") {
        const eventId = await createEvent({
          name,
          tagline: tagline || undefined,
          description: description || undefined,
          startDate: combineDateTime(startDate, startTime),
          endDate: combineDateTime(endDate, endTime),
          doorsOpen: combineDateTime(doorsOpenDate, doorsOpenTime),
          venues: cleanVenues.length > 0 ? cleanVenues : undefined,
          coverImageId: (coverImageId || undefined) as any,
          status,
          visibility,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
          ageRestriction,
          capacity: cap,
          ownerOrgId: activeOrg._id as any,
          eventType: "one_off",
          isFreeEvent,
        });

        // Create ticket types
        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i]!;
          if (ticket.name) {
            await createTicket({
              eventId,
              name: ticket.name,
              description: ticket.description || undefined,
              price: isFreeEvent ? 0 : ticket.price,
              quantity: ticket.quantity,
              sortOrder: i,
              status: "active",
            });
          }
        }
      } else {
        // Recurring
        const dates = generateRecurringDates(
          seriesStartDate || new Date().toISOString().split("T")[0]!,
          frequency,
          Number(generateCount) || 4,
          seriesEndDate || undefined,
        );

        const events = dates.map((date) => ({
          name,
          tagline: tagline || undefined,
          description: description || undefined,
          startDate: combineDateTime(date, recurrenceStartTime),
          endDate: combineDateTime(date, recurrenceEndTime),
          doorsOpen: combineDateTime(date, recurrenceDoorsOpenTime),
          venues: cleanVenues.length > 0 ? cleanVenues : undefined,
          coverImageId: (coverImageId || undefined) as any,
        }));

        await createSeries({
          name,
          tagline: tagline || undefined,
          description: description || undefined,
          seriesType: "recurring",
          coverImageId: (coverImageId || undefined) as any,
          ownerOrgId: activeOrg._id as any,
          isFreeEvent,
          ageRestriction,
          visibility,
          capacity: cap,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
          ticketTemplates: tickets
            .filter((t) => t.name)
            .map((t) => ({
              name: t.name,
              price: isFreeEvent ? 0 : t.price,
              quantity: t.quantity,
              description: t.description || undefined,
            })),
          recurrence: {
            frequency,
            startTime: recurrenceStartTime || undefined,
            endTime: recurrenceEndTime || undefined,
            doorsOpenTime: recurrenceDoorsOpenTime || undefined,
            seriesStartDate: seriesStartDate || undefined,
            seriesEndDate: seriesEndDate || undefined,
          },
          events,
          status,
        });
      }

      router.back();
    } catch (error) {
      console.error("Failed to create event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Navigation ─────────────────────────────────────────────────────────

  function goNext() {
    if (step === 1 && !name) {
      Alert.alert("Missing name", "Please enter an event name.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // ─── Step Renderers ─────────────────────────────────────────────────────

  function renderStep0() {
    return (
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
          What type of event?
        </Text>
        {(
          [
            { value: "one_off", label: "One-Off", desc: "A single event on a specific date" },
            { value: "recurring", label: "Recurring", desc: "Repeats on a schedule (weekly, monthly, etc.)" },
          ] as const
        ).map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setEventType(option.value)}
            style={{
              backgroundColor: eventType === option.value ? "#fff" : "#18181b",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: eventType === option.value ? "#000" : "#fff",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
            <Text
              style={{
                color: eventType === option.value ? "#71717a" : "#a1a1aa",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {option.desc}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderStep1() {
    return (
      <View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Event Details
        </Text>

        {/* Name */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Event name"
            placeholderTextColor="#71717a"
            style={inputStyle}
          />
        </View>

        {/* Tagline */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Tagline</Text>
          <TextInput
            value={tagline}
            onChangeText={setTagline}
            placeholder="Short tagline"
            placeholderTextColor="#71717a"
            style={inputStyle}
          />
        </View>

        {/* Description */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Event description"
            placeholderTextColor="#71717a"
            multiline
            numberOfLines={4}
            style={{ ...inputStyle, minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        {/* Cover Image */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Cover Image</Text>
          <Pressable
            onPress={pickImage}
            style={{
              backgroundColor: "#18181b",
              borderRadius: 12,
              height: 160,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="image-outline" size={32} color="#71717a" />
                <Text style={{ color: "#71717a", fontSize: 13, marginTop: 8 }}>
                  Tap to select image (1:1, max 3MB)
                </Text>
              </View>
            )}
          </Pressable>
          {imageUri ? (
            <Pressable onPress={() => setImageUri(null)} style={{ marginTop: 8 }}>
              <Text style={{ color: "#fb5536", fontSize: 13 }}>Remove image</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Date/Time fields */}
        {eventType === "one_off" ? (
          <>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Start Date</Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Start Time</Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>End Date</Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>End Time</Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Doors Open Date</Text>
              <TextInput
                value={doorsOpenDate}
                onChangeText={setDoorsOpenDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Doors Open Time</Text>
              <TextInput
                value={doorsOpenTime}
                onChangeText={setDoorsOpenTime}
                placeholder="HH:MM"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
          </>
        ) : (
          <>
            {/* Recurring fields */}
            <View style={fieldWrap}>
              <Text style={labelStyle}>Frequency</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(["daily", "weekly", "biweekly", "monthly"] as const).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFrequency(f)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: frequency === f ? "#fff" : "#18181b",
                    }}
                  >
                    <Text
                      style={{
                        color: frequency === f ? "#000" : "#71717a",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Series Start Date</Text>
              <TextInput
                value={seriesStartDate}
                onChangeText={setSeriesStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Series End Date</Text>
              <TextInput
                value={seriesEndDate}
                onChangeText={setSeriesEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Number of Occurrences</Text>
              <TextInput
                value={generateCount}
                onChangeText={setGenerateCount}
                placeholder="4"
                placeholderTextColor="#71717a"
                keyboardType="number-pad"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Start Time (each occurrence)</Text>
              <TextInput
                value={recurrenceStartTime}
                onChangeText={setRecurrenceStartTime}
                placeholder="HH:MM"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>End Time (each occurrence)</Text>
              <TextInput
                value={recurrenceEndTime}
                onChangeText={setRecurrenceEndTime}
                placeholder="HH:MM"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
            <View style={fieldWrap}>
              <Text style={labelStyle}>Doors Open Time (each occurrence)</Text>
              <TextInput
                value={recurrenceDoorsOpenTime}
                onChangeText={setRecurrenceDoorsOpenTime}
                placeholder="HH:MM"
                placeholderTextColor="#71717a"
                style={inputStyle}
              />
            </View>
          </>
        )}

        {/* Capacity */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Capacity</Text>
          <TextInput
            value={capacity}
            onChangeText={setCapacity}
            placeholder="e.g. 500"
            placeholderTextColor="#71717a"
            keyboardType="number-pad"
            style={inputStyle}
          />
        </View>

        {/* Venues */}
        <Text style={{ ...labelStyle, marginTop: 8 }}>Venues</Text>
        {venues.map((venue, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: "#18181b",
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#a1a1aa", fontSize: 12 }}>Venue {idx + 1}</Text>
              {venues.length > 1 && (
                <Pressable onPress={() => removeVenue(idx)}>
                  <Ionicons name="close-circle" size={20} color="#fb5536" />
                </Pressable>
              )}
            </View>
            <TextInput
              value={venue.name}
              onChangeText={(v) => updateVenue(idx, "name", v)}
              placeholder="Venue name"
              placeholderTextColor="#71717a"
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            <TextInput
              value={venue.address}
              onChangeText={(v) => updateVenue(idx, "address", v)}
              placeholder="Address"
              placeholderTextColor="#71717a"
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={venue.city}
                onChangeText={(v) => updateVenue(idx, "city", v)}
                placeholder="City"
                placeholderTextColor="#71717a"
                style={{ ...inputStyle, flex: 1 }}
              />
              <TextInput
                value={venue.state}
                onChangeText={(v) => updateVenue(idx, "state", v)}
                placeholder="State"
                placeholderTextColor="#71717a"
                style={{ ...inputStyle, width: 64 }}
              />
              <TextInput
                value={venue.zip}
                onChangeText={(v) => updateVenue(idx, "zip", v)}
                placeholder="ZIP"
                placeholderTextColor="#71717a"
                keyboardType="number-pad"
                style={{ ...inputStyle, width: 80 }}
              />
            </View>
          </View>
        ))}
        <Pressable onPress={addVenue} style={{ marginBottom: 14 }}>
          <Text style={{ color: "#fb5536", fontSize: 14, fontWeight: "600" }}>
            + Add Venue
          </Text>
        </Pressable>
      </View>
    );
  }

  function renderStep2() {
    return (
      <View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Classification
        </Text>

        {/* Free / Paid */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Pricing</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([false, true] as const).map((free) => (
              <Pressable
                key={String(free)}
                onPress={() => setIsFreeEvent(free)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: isFreeEvent === free ? "#fff" : "#18181b",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: isFreeEvent === free ? "#000" : "#71717a",
                  }}
                >
                  {free ? "Free" : "Paid"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Age Restriction */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Age Restriction</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(
              [
                { value: "all_ages", label: "All Ages" },
                { value: "18_plus", label: "18+" },
                { value: "21_plus", label: "21+" },
              ] as const
            ).map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setAgeRestriction(opt.value)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: ageRestriction === opt.value ? "#fff" : "#18181b",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: ageRestriction === opt.value ? "#000" : "#71717a",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Visibility</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["public", "private"] as const).map((v) => (
              <Pressable
                key={v}
                onPress={() => setVisibility(v)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: visibility === v ? "#fff" : "#18181b",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    textTransform: "capitalize",
                    color: visibility === v ? "#000" : "#71717a",
                  }}
                >
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={fieldWrap}>
          <Text style={labelStyle}>Tags (comma-separated)</Text>
          <TextInput
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="hip-hop, live music, outdoor"
            placeholderTextColor="#71717a"
            style={inputStyle}
          />
        </View>
      </View>
    );
  }

  function renderStep3() {
    return (
      <View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 4 }}>
          Tickets
        </Text>
        {isFreeEvent && (
          <Text style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 16 }}>
            This is a free event. Ticket prices will be set to $0.
          </Text>
        )}
        {eventType === "recurring" && (
          <Text style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 16 }}>
            These tickets will be applied to each occurrence.
          </Text>
        )}

        {tickets.map((ticket, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: "#18181b",
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#a1a1aa", fontSize: 12 }}>Ticket {idx + 1}</Text>
              {tickets.length > 1 && (
                <Pressable onPress={() => removeTicket(idx)}>
                  <Ionicons name="close-circle" size={20} color="#fb5536" />
                </Pressable>
              )}
            </View>
            <TextInput
              value={ticket.name}
              onChangeText={(v) => updateTicket(idx, "name", v)}
              placeholder="Ticket name"
              placeholderTextColor="#71717a"
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            {!isFreeEvent && (
              <TextInput
                value={ticket.price ? String(ticket.price) : ""}
                onChangeText={(v) => updateTicket(idx, "price", Number(v) || 0)}
                placeholder="Price"
                placeholderTextColor="#71717a"
                keyboardType="decimal-pad"
                style={{ ...inputStyle, marginBottom: 8 }}
              />
            )}
            <TextInput
              value={String(ticket.quantity)}
              onChangeText={(v) => updateTicket(idx, "quantity", Number(v) || 0)}
              placeholder="Quantity"
              placeholderTextColor="#71717a"
              keyboardType="number-pad"
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            <TextInput
              value={ticket.description}
              onChangeText={(v) => updateTicket(idx, "description", v)}
              placeholder="Description (optional)"
              placeholderTextColor="#71717a"
              style={inputStyle}
            />
          </View>
        ))}
        <Pressable onPress={addTicket} style={{ marginBottom: 14 }}>
          <Text style={{ color: "#fb5536", fontSize: 14, fontWeight: "600" }}>
            + Add Ticket Type
          </Text>
        </Pressable>
      </View>
    );
  }

  function renderStep4() {
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const cleanVenues = venues.filter((v) => v.name.trim());

    return (
      <View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Review
        </Text>

        {/* Image preview */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: "100%",
              height: 160,
              borderRadius: 12,
              marginBottom: 16,
            }}
            resizeMode="cover"
          />
        )}

        <ReviewRow label="Type" value={eventType === "one_off" ? "One-Off" : "Recurring"} />
        <ReviewRow label="Name" value={name || "—"} />
        {tagline ? <ReviewRow label="Tagline" value={tagline} /> : null}
        {description ? <ReviewRow label="Description" value={description} /> : null}

        {eventType === "one_off" ? (
          <>
            <ReviewRow label="Start" value={startDate ? `${startDate} ${startTime}` : "—"} />
            <ReviewRow label="End" value={endDate ? `${endDate} ${endTime}` : "—"} />
            {doorsOpenDate || doorsOpenTime ? (
              <ReviewRow label="Doors Open" value={`${doorsOpenDate} ${doorsOpenTime}`} />
            ) : null}
          </>
        ) : (
          <>
            <ReviewRow label="Frequency" value={frequency} />
            <ReviewRow label="Series Start" value={seriesStartDate || "—"} />
            <ReviewRow label="Series End" value={seriesEndDate || "—"} />
            <ReviewRow label="Occurrences" value={generateCount} />
            <ReviewRow label="Time" value={recurrenceStartTime ? `${recurrenceStartTime} – ${recurrenceEndTime}` : "—"} />
          </>
        )}

        {capacity ? <ReviewRow label="Capacity" value={capacity} /> : null}

        {cleanVenues.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={labelStyle}>Venues</Text>
            {cleanVenues.map((v, i) => (
              <Text key={i} style={{ color: "#fff", fontSize: 14 }}>
                {v.name}{v.city ? `, ${v.city}` : ""}
              </Text>
            ))}
          </View>
        )}

        <ReviewRow label="Pricing" value={isFreeEvent ? "Free" : "Paid"} />
        <ReviewRow label="Age" value={ageRestriction.replace("_", " ")} />
        <ReviewRow label="Visibility" value={visibility} />

        {parsedTags.length > 0 && (
          <ReviewRow label="Tags" value={parsedTags.join(", ")} />
        )}

        <View style={{ marginBottom: 12 }}>
          <Text style={labelStyle}>Tickets</Text>
          {tickets.filter((t) => t.name).map((t, i) => (
            <Text key={i} style={{ color: "#fff", fontSize: 14 }}>
              {t.name} — {isFreeEvent ? "Free" : `$${t.price}`} (qty: {t.quantity})
            </Text>
          ))}
        </View>
      </View>
    );
  }

  function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Text style={{ color: "#a1a1aa", fontSize: 13, width: 100 }}>{label}</Text>
        <Text style={{ color: "#fff", fontSize: 14, flex: 1, textTransform: "capitalize" }}>
          {value}
        </Text>
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

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
        <Pressable onPress={() => (step === 0 ? router.back() : goBack())}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
          {STEPS[step]}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step indicator */}
      <View style={{ flexDirection: "row", paddingHorizontal: 24, gap: 4, marginBottom: 8 }}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= step ? "#fb5536" : "#27272a",
            }}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {stepRenderers[step]!()}
      </ScrollView>

      {/* Bottom buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#000",
          borderTopWidth: 1,
          borderTopColor: "#27272a",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 36,
          flexDirection: "row",
          gap: 12,
        }}
      >
        {step === STEPS.length - 1 ? (
          <>
            <Pressable
              onPress={() => handleSubmit("draft")}
              disabled={submitting}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#27272a",
                opacity: submitting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
                {submitting ? "Saving..." : "Save as Draft"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleSubmit("published")}
              disabled={submitting}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: "#fb5536",
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
                  Publish
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={goNext}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: "#fb5536",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
              Next
            </Text>
          </Pressable>
        )}
      </View>

      <StatusBar style="light" />
    </View>
  );
}
