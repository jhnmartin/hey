import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team",
}

const members = [
  { name: "Jordan Smith", email: "jordan@heythursday.app", role: "Owner" },
  { name: "Alex Rivera", email: "alex@heythursday.app", role: "Admin" },
  { name: "Sam Chen", email: "sam@heythursday.app", role: "Member" },
]

export default function TeamPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team</h1>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-not-allowed items-center rounded-md px-4 py-2 text-sm font-medium opacity-50">
          Invite Member
        </button>
      </div>
      <div className="bg-muted/50 rounded-xl">
        {members.map((member) => (
          <div
            key={member.email}
            className="flex items-center justify-between border-b p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-muted-foreground text-sm">{member.email}</p>
            </div>
            <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
