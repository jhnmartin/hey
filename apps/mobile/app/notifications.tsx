import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Notifications" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Your notifications will appear here.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff1ee", paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  subtitle: { marginTop: 8, fontSize: 16, color: "#6b7280" },
});
