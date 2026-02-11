type CroppedArea = {
  x: number
  y: number
  width: number
  height: number
}

const OUTPUT_SIZE = 1080

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function getCroppedImage(
  imageSrc: string,
  croppedAreaPixels: CroppedArea,
): Promise<Blob> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement("canvas")
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext("2d")!

  // Blurred background fill: scale source to cover the 1080x1080 canvas
  const scale = Math.max(
    OUTPUT_SIZE / image.width,
    OUTPUT_SIZE / image.height,
  )
  const bgW = image.width * scale
  const bgH = image.height * scale
  const bgX = (OUTPUT_SIZE - bgW) / 2
  const bgY = (OUTPUT_SIZE - bgH) / 2

  ctx.filter = "blur(40px)"
  ctx.drawImage(image, bgX, bgY, bgW, bgH)
  ctx.filter = "none"

  // Sharp crop on top — clamp source to image bounds when crop extends beyond
  const { x: cx, y: cy, width: cw, height: ch } = croppedAreaPixels

  const sx = Math.max(0, cx)
  const sy = Math.max(0, cy)
  const sx2 = Math.min(image.width, cx + cw)
  const sy2 = Math.min(image.height, cy + ch)
  const sw = sx2 - sx
  const sh = sy2 - sy

  if (sw > 0 && sh > 0) {
    const scaleX = OUTPUT_SIZE / cw
    const scaleY = OUTPUT_SIZE / ch
    const dx = (sx - cx) * scaleX
    const dy = (sy - cy) * scaleY
    const dw = sw * scaleX
    const dh = sh * scaleY

    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      },
      "image/jpeg",
      0.9,
    )
  })
}
