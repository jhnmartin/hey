import { View, Text, Pressable, StyleSheet, ActivityIndicator, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { useClerk } from "@clerk/clerk-expo";
import { api } from "@repo/backend/convex/_generated/api";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const profile = useQuery(api.profiles.get);
  const updateProfile = useMutation(api.profiles.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = useState(false);

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

  if (profile === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  const initials = profile?.name ? getInitials(profile.name) : "?";
  const displayName = profile?.name ?? "Guest";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarSection}>
        <Pressable onPress={pickAndUploadAvatar} disabled={uploading}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {uploading && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </Pressable>
        <Text style={styles.name}>{displayName}</Text>
        {profile?.email && <Text style={styles.detail}>{profile.email}</Text>}
        {profile?.city && <Text style={styles.detail}>{profile.city}</Text>}
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.menuItem} onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={20} color="#000" />
          <Text style={styles.menuText}>Settings</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={20} color="#000" />
          <Text style={styles.menuText}>Notifications</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push("/messages")}>
          <Ionicons name="mail-outline" size={20} color="#000" />
          <Text style={styles.menuText}>Messages</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff1ee", paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarSection: { marginTop: 24, alignItems: "center" },
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
  name: { marginTop: 12, fontSize: 18, fontWeight: "600", color: "#000" },
  detail: { marginTop: 4, fontSize: 14, color: "#6b7280" },
  menu: { marginTop: 32, gap: 8 },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, backgroundColor: "#f9fafb", paddingHorizontal: 16, paddingVertical: 12,
  },
  menuText: { fontSize: 16, color: "#000" },
});
