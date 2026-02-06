"use client"

import Link from "next/link"
import { useOrg } from "@/components/org-context"

const allFiles = [
  {
    id: "f1",
    name: "Event Contracts",
    type: "folder" as const,
    items: 4,
    updated: "Feb 10, 2025",
    org: "hey thursday",
  },
  {
    id: "f2",
    name: "Marketing Assets",
    type: "folder" as const,
    items: 12,
    updated: "Feb 9, 2025",
    org: "hey thursday",
  },
  {
    id: "f3",
    name: "Thursday Night Live - Run of Show.pdf",
    type: "file" as const,
    items: 0,
    updated: "Feb 8, 2025",
    org: "hey thursday",
  },
  {
    id: "f4",
    name: "Sponsorship Decks",
    type: "folder" as const,
    items: 3,
    updated: "Feb 11, 2025",
    org: "Neon Events Co",
  },
  {
    id: "f5",
    name: "Venue Floorplans",
    type: "folder" as const,
    items: 6,
    updated: "Feb 7, 2025",
    org: "Neon Events Co",
  },
  {
    id: "f6",
    name: "Neon Nights Budget.xlsx",
    type: "file" as const,
    items: 0,
    updated: "Feb 6, 2025",
    org: "Neon Events Co",
  },
]

export default function FilesPage() {
  const { activeOrg } = useOrg()
  const files = allFiles.filter((f) => f.org === activeOrg.name)

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Files</h1>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-not-allowed items-center rounded-md px-4 py-2 text-sm font-medium opacity-50">
          Upload
        </button>
      </div>
      <div className="bg-muted/50 rounded-xl">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between border-b p-4 last:border-b-0"
          >
            {file.type === "folder" ? (
              <Link
                href={`/dashboard/files/${file.id}`}
                className="hover:underline"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-9 items-center justify-center rounded-lg text-lg">
                    📁
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {file.items} items
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-9 items-center justify-center rounded-lg text-lg">
                  📄
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">Document</p>
                </div>
              </div>
            )}
            <span className="text-muted-foreground text-xs">
              {file.updated}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
