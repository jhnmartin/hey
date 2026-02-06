import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Folder",
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params

  const dummyFiles = [
    { name: "Document 1.pdf", updated: "Feb 10, 2025" },
    { name: "Document 2.docx", updated: "Feb 9, 2025" },
    { name: "Spreadsheet.xlsx", updated: "Feb 8, 2025" },
  ]

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/files"
          className="text-muted-foreground hover:text-foreground"
        >
          Files
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Folder {folderId}</span>
      </div>
      <h1 className="text-2xl font-bold">Folder {folderId}</h1>
      <div className="bg-muted/50 rounded-xl">
        {dummyFiles.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between border-b p-4 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-9 items-center justify-center rounded-lg text-lg">
                📄
              </div>
              <p className="font-medium">{file.name}</p>
            </div>
            <span className="text-muted-foreground text-xs">
              {file.updated}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
