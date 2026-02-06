import { View, Text, StyleSheet } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchPlaceholder}>
          Search events, venues, people...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  searchBox: { marginTop: 16, borderRadius: 12, backgroundColor: "#f3f4f6", paddingHorizontal: 16, paddingVertical: 12 },
  searchPlaceholder: { fontSize: 16, color: "#9ca3af" },
});
