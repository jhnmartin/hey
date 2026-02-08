"use client"

import { useRef, useState, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type ImageUploaderProps = {
  storageId: string | null
  onUpload: (storageId: string) => void
  onRemove: () => void
  className?: string
}

export function ImageUploader({ storageId, onUpload, onRemove, className }: ImageUploaderProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const imageUrl = useQuery(
    api.storage.getUrl,
    storageId ? { storageId: storageId as any } : "skip",
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Image must be under 5MB")
        return
      }

      setUploading(true)
      try {
        const url = await generateUploadUrl()
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        const { storageId: newId } = await result.json()
        onUpload(newId)
      } catch {
        setError("Upload failed. Please try again.")
      } finally {
        setUploading(false)
      }
    },
    [generateUploadUrl, onUpload],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (storageId && imageUrl) {
    return (
      <div className={cn("relative", className)}>
        <img
          src={imageUrl}
          alt="Cover"
          className="size-full rounded-lg object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
          className="bg-background/80 hover:bg-background absolute top-2 right-2 rounded-full p-1"
        >
          <IconX className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex size-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        {uploading ? (
          <p className="text-muted-foreground text-sm">Uploading...</p>
        ) : (
          <>
            <IconPhoto className="text-muted-foreground mb-2 size-8" />
            <p className="text-muted-foreground text-sm">
              Click or drag to upload
            </p>
            <p className="text-muted-foreground/60 mt-1 text-xs">Max 5MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
    </div>
  )
}
