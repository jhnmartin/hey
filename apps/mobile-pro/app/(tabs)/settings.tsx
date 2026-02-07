import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { StatusBar } from "expo-status-bar";

export default function SettingsScreen() {
  const profile = useQuery(api.profiles.get);
  const updateProfile = useMutation(api.profiles.update);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

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
  }

  if (profile === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 text-2xl font-bold text-white">Profile</Text>

        <View className="mb-3">
          <Text className="mb-1 text-sm text-zinc-400">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white"
            placeholderTextColor="#71717a"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-sm text-zinc-400">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white"
            placeholderTextColor="#71717a"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-sm text-zinc-400">Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white"
            placeholderTextColor="#71717a"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-sm text-zinc-400">City</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white"
            placeholderTextColor="#71717a"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-sm text-zinc-400">Date of Birth</Text>
          <TextInput
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white"
            placeholderTextColor="#71717a"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-sm text-zinc-400">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white"
            placeholderTextColor="#71717a"
            style={{ textAlignVertical: "top" }}
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mt-2 mb-8 items-center rounded-xl bg-white py-3"
        >
          <Text className="font-semibold text-black">
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}
