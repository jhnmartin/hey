"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Attempt to generate a superellipse (squircle) path.
 *
 * The curve is defined by |x/a|^n + |y/b|^n = 1 where n controls curvature.
 * n=2 is an ellipse, n~4-5 gives the iOS-style continuous-curvature look.
 *
 * Uses objectBoundingBox coordinates (0-1) so the clip-path scales with the
 * element — no resize observers needed.
 */
function generateSquirclePath(curvature: number, points = 72): string {
  const n = curvature
  const coords: string[] = []

  for (let i = 0; i <= points; i++) {
    const angle = (2 * Math.PI * i) / points
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    const x = Math.sign(cosA) * Math.pow(Math.abs(cosA), 2 / n)
    const y = Math.sign(sinA) * Math.pow(Math.abs(sinA), 2 / n)

    // Map from [-1,1] to [0,1] for objectBoundingBox
    const bx = ((x + 1) / 2).toFixed(5)
    const by = ((y + 1) / 2).toFixed(5)

    coords.push(`${bx},${by}`)
  }

  return `M${coords.join("L")}Z`
}

// Pre-compute the default path so it's not recalculated on every render
const DEFAULT_PATH = generateSquirclePath(4)

let clipIdCounter = 0

function Squircle({
  className,
  style,
  curvature,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Superellipse exponent. Default 4 (iOS-like). Higher = more rectangular. */
  curvature?: number
  /** Render the clip on the child element instead of a wrapper div. */
  asChild?: boolean
}) {
  const idRef = React.useRef<string>("")
  if (!idRef.current) {
    idRef.current = `squircle-${++clipIdCounter}`
  }
  const clipId = idRef.current
  const path = curvature ? generateSquirclePath(curvature) : DEFAULT_PATH

  const svgDef = (
    <svg width="0" height="0" className="absolute">
      <defs>
        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
          <path d={path} />
        </clipPath>
      </defs>
    </svg>
  )

  if (asChild && React.isValidElement(children)) {
    return (
      <>
        {svgDef}
        {React.cloneElement(children as React.ReactElement<any>, {
          style: {
            ...(children.props as any).style,
            clipPath: `url(#${clipId})`,
          },
        })}
      </>
    )
  }

  return (
    <>
      {svgDef}
      <div
        data-slot="squircle"
        className={cn("overflow-hidden", className)}
        style={{ clipPath: `url(#${clipId})`, ...style }}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

export { Squircle, generateSquirclePath }
