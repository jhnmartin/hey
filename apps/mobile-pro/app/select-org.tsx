import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useOrg } from "../contexts/org-context";

export default function SelectOrgScreen() {
  const { orgs, activeOrg, setActiveOrg } = useOrg();
  const router = useRouter();

  function handleSelect(org: (typeof orgs)[number]) {
    setActiveOrg(org);
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
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
          Organizations
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {orgs.length === 0 && (
          <Text style={{ color: "#71717a", marginBottom: 24, fontSize: 15 }}>
            No organizations yet. Create one to get started.
          </Text>
        )}

        {orgs.map((org) => {
          const isActive = activeOrg?._id === org._id;
          return (
            <Pressable
              key={org._id}
              onPress={() => handleSelect(org)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isActive ? "#27272a" : "#18181b",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                gap: 12,
              }}
            >
              {org.avatarUrl ? (
                <Image
                  source={{ uri: org.avatarUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#3f3f46",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                >
                  {org.name}
                </Text>
                <Text
                  style={{
                    color: "#71717a",
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  {org.role}
                </Text>
              </View>
              {isActive && (
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
              )}
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => router.push("/create-org")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingVertical: 14,
            marginTop: 8,
            marginBottom: 40,
            gap: 8,
          }}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={{ color: "#000", fontWeight: "600", fontSize: 15 }}>
            Create Organization
          </Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}
