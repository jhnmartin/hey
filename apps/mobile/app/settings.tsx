import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SettingsScreen() {
  const profile = useQuery(api.profiles.get);
  const updateProfile = useMutation(api.profiles.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone ?? "");
      setCity(profile.city ?? "");
      setDateOfBirth(profile.dateOfBirth ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  async function pickAndUploadAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    if (!profile) return;

    setUploading(true);
    try {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      const { storageId } = await uploadResult.json();

      await updateProfile({
        id: profile._id,
        avatarStorageId: storageId,
      });
    } catch {
      Alert.alert("Error", "Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await updateProfile({
      id: profile._id,
      name,
      email,
      phone,
      city,
      dateOfBirth,
      bio,
    });
    setSaving(false);
    Alert.alert("Saved", "Your profile has been updated.");
  }

  if (profile === undefined) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Settings" }} />
        <View style={styles.container}>
          <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Settings" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Profile</Text>

        <View style={styles.avatarRow}>
          <Pressable onPress={pickAndUploadAvatar} disabled={uploading}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(name || "?")}</Text>
              </View>
            )}
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </Pressable>
          <Text style={styles.avatarHint}>Tap to change</Text>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff1ee" },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 16 },
  avatarRow: { alignItems: "center", marginBottom: 16 },
  avatar: {
    height: 80, width: 80, borderRadius: 40,
    backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: { fontSize: 24, color: "#6b7280" },
  avatarOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 40, backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  avatarHint: { marginTop: 6, fontSize: 12, color: "#9ca3af" },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginTop: 12 },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
