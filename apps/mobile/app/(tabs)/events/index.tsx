import { View, Text, ScrollView, Pressable } from "react-native";

const EVENTS = [
  { id: "1", title: "Rooftop Jazz Night", date: "Feb 13", venue: "The Loft", color: "#6366f1" },
  { id: "2", title: "Vinyl & Vibes", date: "Feb 14", venue: "Warehouse 9", color: "#ec4899" },
  { id: "3", title: "Comedy Thursday", date: "Feb 20", venue: "Laugh Factory", color: "#f59e0b" },
  { id: "4", title: "Art Walk", date: "Feb 22", venue: "Gallery Row", color: "#10b981" },
  { id: "5", title: "Food Truck Rally", date: "Mar 1", venue: "Central Park", color: "#ef4444" },
];

function EventCard({ title, date, venue, color }: typeof EVENTS[number]) {
  return (
    <Pressable
      className="mr-3 w-44 rounded-2xl p-4"
      style={{ backgroundColor: color }}
    >
      <Text className="text-sm font-medium text-white/70">{date}</Text>
      <Text className="mt-1 text-lg font-bold text-white">{title}</Text>
      <Text className="mt-2 text-sm text-white/80">{venue}</Text>
    </Pressable>
  );
}

export default function EventsScreen() {
  return (
    <View className="flex-1 bg-background pt-4">
      <Text className="px-6 text-2xl font-bold text-black">
        Discover Events
      </Text>
      <Text className="mt-2 px-6 text-base text-gray-500">
        Browse upcoming events near you.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6"
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {EVENTS.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </ScrollView>
    </View>
  );
}
