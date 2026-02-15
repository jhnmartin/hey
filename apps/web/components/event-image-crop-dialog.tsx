"use client"

import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { getCroppedImage } from "@/lib/crop-image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type EventImageCropDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onConfirm: (blob: Blob) => void
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const DEFAULT_ZOOM = 1
const CROP_RATIO = 0.9

export function EventImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onConfirm,
}: EventImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [cropSize, setCropSize] = useState<{ width: number; height: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Measure container synchronously before paint — avoids the flash/black screen
  // that useEffect + ResizeObserver caused (fired too late, Cropper initialized wrong)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w > 0) {
      const size = Math.round(w * CROP_RATIO)
      setCropSize(prev =>
        prev && prev.width === size ? prev : { width: size, height: size }
      )
    }
  })

  // Reset crop/zoom when image changes
  useEffect(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(DEFAULT_ZOOM)
  }, [imageSrc])

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels)
      onConfirm(blob)
      onOpenChange(false)
    } catch (error) {
      console.error("Crop failed:", error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Crop Cover Image</DialogTitle>
          <DialogDescription>Recommended: 1080 × 1080</DialogDescription>
        </DialogHeader>

        <div ref={containerRef} className="relative aspect-square w-full overflow-hidden rounded-lg">
          {cropSize && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              cropSize={cropSize}
              objectFit="horizontal-cover"
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">Zoom</span>
          <Slider
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0]!)}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            className="flex-1"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={processing}>
            {processing ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
