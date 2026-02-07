import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function ScanScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Scan</Text>
      <StatusBar style="light" />
    </View>
  );
}
