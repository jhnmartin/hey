import { View, Text, StyleSheet } from "react-native";

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Events</Text>
      <Text style={styles.subtitle}>Browse upcoming events near you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  subtitle: { marginTop: 8, fontSize: 16, color: "#6b7280" },
});
