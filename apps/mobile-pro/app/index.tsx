import { View, Text, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

const EVENTS = [
  { id: "1", title: "Rooftop Jazz Night", date: "Feb 13", venue: "The Loft", color: "#6366f1" },
  { id: "2", title: "Vinyl & Vibes", date: "Feb 14", venue: "Warehouse 9", color: "#ec4899" },
  { id: "3", title: "Comedy Thursday", date: "Feb 20", venue: "Laugh Factory", color: "#f59e0b" },
  { id: "4", title: "Art Walk", date: "Feb 22", venue: "Gallery Row", color: "#10b981" },
  { id: "5", title: "Food Truck Rally", date: "Mar 1", venue: "Central Park", color: "#ef4444" },
  { id: "6", title: "Open Mic Night", date: "Mar 6", venue: "The Basement", color: "#8b5cf6" },
  { id: "7", title: "Salsa Sundays", date: "Mar 9", venue: "Club Havana", color: "#f97316" },
  { id: "8", title: "Trivia Night", date: "Mar 13", venue: "The Pub", color: "#14b8a6" },
];

function EventRow({ title, date, venue, color }: typeof EVENTS[number]) {
  return (
    <Pressable className="mb-3 flex-row items-center rounded-2xl bg-zinc-900 p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: color }}>
        <Text className="text-xs font-bold text-white">{date.split(" ")[1]}</Text>
        <Text className="text-[10px] text-white/70">{date.split(" ")[0]}</Text>
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="mt-1 text-sm text-zinc-400">{venue}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-white">All Events</Text>
        <Text className="mb-6 mt-2 text-base text-zinc-500">
          Manage and monitor all events.
        </Text>

        {EVENTS.map((event) => (
          <EventRow key={event.id} {...event} />
        ))}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}
