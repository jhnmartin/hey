export type DummyEvent = {
  id: string
  name: string
  venue: string
  date: string
  price: string
  rsvps: number
  org: string
}

export const allEvents: DummyEvent[] = [
  {
    id: "1",
    name: "Thursday Night Live",
    venue: "The Grand Hall",
    date: "Feb 13, 2025",
    price: "$25",
    rsvps: 234,
    org: "hey thursday",
  },
  {
    id: "2",
    name: "Rooftop Sunset Party",
    venue: "Sky Lounge",
    date: "Feb 14, 2025",
    price: "$40",
    rsvps: 89,
    org: "hey thursday",
  },
  {
    id: "3",
    name: "Underground Beats",
    venue: "The Basement",
    date: "Feb 15, 2025",
    price: "$15",
    rsvps: 567,
    org: "hey thursday",
  },
  {
    id: "4",
    name: "Jazz & Wine Evening",
    venue: "Blue Note Club",
    date: "Feb 20, 2025",
    price: "$35",
    rsvps: 45,
    org: "Neon Events Co",
  },
  {
    id: "5",
    name: "Neon Nights Festival",
    venue: "Central Park Arena",
    date: "Feb 21, 2025",
    price: "$50",
    rsvps: 312,
    org: "Neon Events Co",
  },
  {
    id: "6",
    name: "Acoustic Sessions",
    venue: "The Library Bar",
    date: "Feb 22, 2025",
    price: "Free",
    rsvps: 78,
    org: "Neon Events Co",
  },
]

export function getEventById(id: string) {
  return allEvents.find((e) => e.id === id)
}
