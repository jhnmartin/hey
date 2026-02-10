"use client"

import { useOrg } from "@/components/org-context"
import { SetPageTitle } from "@/components/page-title-context"

const columns = [
  {
    title: "To Do",
    tasks: [
      { id: "1", name: "Book DJ for Thursday Night Live", org: "hey thursday" },
      { id: "2", name: "Finalize venue contract", org: "hey thursday" },
      { id: "3", name: "Design Neon Nights poster", org: "Neon Events Co" },
      { id: "4", name: "Order sound equipment", org: "Neon Events Co" },
    ],
  },
  {
    title: "In Progress",
    tasks: [
      { id: "5", name: "Set up ticket sales page", org: "hey thursday" },
      { id: "6", name: "Confirm catering menu", org: "Neon Events Co" },
    ],
  },
  {
    title: "Review",
    tasks: [
      { id: "7", name: "Review promo video draft", org: "hey thursday" },
      { id: "8", name: "Approve sponsorship deck", org: "Neon Events Co" },
    ],
  },
  {
    title: "Done",
    tasks: [
      { id: "9", name: "Send out save-the-dates", org: "hey thursday" },
      { id: "10", name: "Book photographer", org: "Neon Events Co" },
    ],
  },
]

export default function TasksPage() {
  const { activeOrg } = useOrg()

  return (
    <>
      <SetPageTitle title="Tasks" />
      <div className="grid min-h-[60vh] gap-4 md:grid-cols-4">
        {columns.map((column) => {
          const orgTasks = column.tasks.filter(
            (t) => t.org === activeOrg?.name
          )
          return (
            <div key={column.title} className="bg-muted/50 rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                  {orgTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {orgTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-background rounded-lg border p-3 text-sm"
                  >
                    {task.name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
