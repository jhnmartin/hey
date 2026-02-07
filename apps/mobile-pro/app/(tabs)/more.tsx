import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function MoreScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>More</Text>
      <StatusBar style="light" />
    </View>
  );
}
