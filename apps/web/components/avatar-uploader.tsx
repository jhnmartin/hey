"use client"

import { useRef, useState, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarCropDialog } from "@/components/avatar-crop-dialog"
import { IconCamera } from "@tabler/icons-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type AvatarUploaderProps = {
  storageId: string | null
  onUpload: (storageId: string) => void
  name: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AvatarUploader({ storageId, onUpload, name }: AvatarUploaderProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const imageUrl = useQuery(
    api.storage.getUrl,
    storageId ? { storageId: storageId as any } : "skip",
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleCropConfirm = useCallback(
    async (blob: Blob) => {
      setCropSrc(null)
      setUploading(true)
      try {
        const url = await generateUploadUrl()
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
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

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative cursor-pointer disabled:cursor-wait"
      >
        <Avatar className="size-24">
          {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
          <AvatarFallback className="text-2xl">
            {getInitials(name || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="bg-black/50 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
          <IconCamera className="size-6 text-white" />
        </div>
        {uploading && (
          <div className="bg-black/50 absolute inset-0 flex items-center justify-center rounded-full">
            <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {cropSrc && (
        <AvatarCropDialog
          open
          onOpenChange={(open) => { if (!open) setCropSrc(null) }}
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}
