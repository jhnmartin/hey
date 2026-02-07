import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

type OrgRole = "venue" | "performer" | "promoter";

const roles: OrgRole[] = ["venue", "performer", "promoter"];

export default function CreateOrgScreen() {
  const router = useRouter();
  const profile = useQuery(api.profiles.get);
  const createOrg = useMutation(api.organizations.create);

  const [name, setName] = useState("");
  const [role, setRole] = useState<OrgRole>("venue");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!profile || !name || !email) return;
    setSaving(true);
    await createOrg({
      name,
      role,
      email,
      ownerId: profile._id,
      ...(avatarUrl ? { avatarUrl } : {}),
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

        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 6 }}>
            Avatar URL (optional)
          </Text>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            autoCapitalize="none"
            placeholder="https://..."
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
            opacity: saving || !name || !email ? 0.5 : 1,
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
