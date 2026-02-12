import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

type OrgRole = "venue" | "performer" | "promoter";

const roles: OrgRole[] = ["venue", "performer", "promoter"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CreateOrgScreen() {
  const router = useRouter();
  const createOrg = useMutation(api.organizations.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [name, setName] = useState("");
  const [role, setRole] = useState<OrgRole>("venue");
  const [email, setEmail] = useState("");
  const [avatarStorageId, setAvatarStorageId] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function pickAndUploadAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const uri = result.assets[0].uri;
      setAvatarPreview(uri);

      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      const { storageId } = await uploadResult.json();
      setAvatarStorageId(storageId);
    } catch {
      Alert.alert("Error", "Failed to upload avatar.");
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate() {
    if (!name || !email) return;
    setSaving(true);
    await createOrg({
      name,
      role,
      email,
      ...(avatarStorageId ? { avatarStorageId: avatarStorageId as any } : {}),
    });
    setSaving(false);
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
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
          Create Organization
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Pressable onPress={pickAndUploadAvatar} disabled={uploading}>
            {avatarPreview ? (
              <Image
                source={{ uri: avatarPreview }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
              />
            ) : (
              <View
                style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: "#18181b", alignItems: "center", justifyContent: "center",
                }}
              >
                {name ? (
                  <Text style={{ color: "#71717a", fontSize: 24 }}>
                    {getInitials(name)}
                  </Text>
                ) : (
                  <Ionicons name="camera-outline" size={28} color="#71717a" />
                )}
              </View>
            )}
            {uploading && (
              <View
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  borderRadius: 40, backgroundColor: "rgba(0,0,0,0.5)",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </Pressable>
          <Text style={{ color: "#71717a", fontSize: 12, marginTop: 6 }}>
            Tap to add avatar
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 6 }}>
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Organization name"
            placeholderTextColor="#71717a"
            style={{
              backgroundColor: "#18181b",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "#fff",
              fontSize: 15,
            }}
          />
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 6 }}>
            Role
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {roles.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 14,
                  backgroundColor: role === r ? "#fff" : "#18181b",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    textTransform: "capitalize",
                    color: role === r ? "#000" : "#71717a",
                  }}
                >
                  {r}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 6 }}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="contact@org.com"
            placeholderTextColor="#71717a"
            style={{
              backgroundColor: "#18181b",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "#fff",
              fontSize: 15,
            }}
          />
        </View>

        <Pressable
          onPress={handleCreate}
          disabled={saving || !name || !email}
          style={{
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingVertical: 14,
            marginTop: 8,
            marginBottom: 40,
            opacity: (saving || !name || !email) ? 0.5 : 1,
          }}
        >
          <Text style={{ color: "#000", fontWeight: "600", fontSize: 15 }}>
            {saving ? "Creating..." : "Create Organization"}
          </Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}
