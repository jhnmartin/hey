import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const profile = useQuery(api.profiles.get);
  const seedProfile = useMutation(api.profiles.seed);
  const updateProfile = useMutation(api.profiles.update);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void seedProfile();
  }, [seedProfile]);

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
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 16 },
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
