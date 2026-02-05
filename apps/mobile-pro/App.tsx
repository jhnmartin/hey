import { StatusBar } from "expo-status-bar";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

function TaskList() {
  const tasks = useQuery(api.tasks.list);

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Text style={styles.task}>
          {item.isCompleted ? "✅" : "⬜"} {item.text}
        </Text>
      )}
      style={styles.list}
    />
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <View style={styles.container}>
        <Text style={styles.text}>hey pro</Text>
        <TaskList />
        <StatusBar style="light" />
      </View>
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 120,
    fontWeight: "600",
    color: "#fff",
  },
  list: {
    maxHeight: 200,
    width: "80%",
  },
  task: {
    fontSize: 18,
    paddingVertical: 4,
    color: "#fff",
  },
});
