import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <Text style={styles.name}>Guest</Text>
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

        <Pressable style={styles.menuItem}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  avatarSection: { marginTop: 24, alignItems: "center" },
  avatar: {
    height: 80, width: 80, borderRadius: 40,
    backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 24, color: "#6b7280" },
  name: { marginTop: 12, fontSize: 18, fontWeight: "600", color: "#000" },
  menu: { marginTop: 32, gap: 8 },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, backgroundColor: "#f9fafb", paddingHorizontal: 16, paddingVertical: 12,
  },
  menuText: { fontSize: 16, color: "#000" },
});
