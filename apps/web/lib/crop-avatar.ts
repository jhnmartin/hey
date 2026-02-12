type CroppedArea = {
  x: number
  y: number
  width: number
  height: number
}

const OUTPUT_SIZE = 512

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function getCroppedAvatarImage(
  imageSrc: string,
  croppedAreaPixels: CroppedArea,
): Promise<Blob> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement("canvas")
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext("2d")!

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
