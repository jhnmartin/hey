import { View, Text, StyleSheet } from "react-native";

export default function PassportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passport</Text>

      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrText}>QR Code</Text>
      </View>

      <Text style={styles.sectionTitle}>Active Tickets</Text>
      <Text style={styles.sectionBody}>
        Your active tickets will appear here.
      </Text>

      <Text style={styles.sectionTitle}>Scan History</Text>
      <Text style={styles.sectionBody}>
        Your loyalty scan history will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff1ee", paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  qrPlaceholder: {
    marginTop: 24, alignItems: "center", justifyContent: "center",
    borderRadius: 16, borderWidth: 1, borderStyle: "dashed", borderColor: "#d1d5db", padding: 40,
  },
  qrText: { fontSize: 16, color: "#9ca3af" },
  sectionTitle: { marginTop: 24, fontSize: 18, fontWeight: "600", color: "#000" },
  sectionBody: { marginTop: 4, fontSize: 16, color: "#6b7280" },
});
