"use client"

import { useEffect, useRef, useCallback } from "react"

export function CursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -500, y: -500 })
  const trail = useRef<{ x: number; y: number; age: number }[]>([])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY }
    trail.current.push({ x: e.clientX, y: e.clientY, age: 0 })
    if (trail.current.length > 30) trail.current.shift()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animFrame: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw trail
      for (let i = trail.current.length - 1; i >= 0; i--) {
        const point = trail.current[i]
        point.age += 1
        if (point.age > 40) {
          trail.current.splice(i, 1)
          continue
        }
        const alpha = (1 - point.age / 40) * 0.08
        const radius = 80 + point.age * 3
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, radius
        )
        gradient.addColorStop(0, `rgba(16, 185, 129, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(52, 211, 153, ${alpha * 0.4})`)
        gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Main glow
      const { x, y } = mouse.current
      const mainGrad = ctx.createRadialGradient(x, y, 0, x, y, 220)
      mainGrad.addColorStop(0, "rgba(16, 185, 129, 0.15)")
      mainGrad.addColorStop(0.3, "rgba(52, 211, 153, 0.05)")
      mainGrad.addColorStop(0.6, "rgba(5, 150, 105, 0.02)")
      mainGrad.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = mainGrad
      ctx.beginPath()
      ctx.arc(x, y, 220, 0, Math.PI * 2)
      ctx.fill()

      // Core bright spot
      const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, 40)
      coreGrad.addColorStop(0, "rgba(209, 250, 229, 0.1)")
      coreGrad.addColorStop(1, "rgba(16, 185, 129, 0)")
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(x, y, 40, 0, Math.PI * 2)
      ctx.fill()

      animFrame = requestAnimationFrame(animate)
    }

    animFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animFrame)
    }
  }, [handleMouseMove])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  )
}
