import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function InboxScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Inbox</Text>
      <StatusBar style="light" />
    </View>
  );
}
