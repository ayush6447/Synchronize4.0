"use client"

import { useRef, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()

    // Calculate mouse position relative to center of the card
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Percentage for the shine effect
    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100

    // Calculate rotation (-8 to 8 degrees max)
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    setRotation({ x: rotateX, y: rotateY })
    setMousePos({ x: percentX, y: percentY })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
    setMousePos({ x: 50, y: 50 })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1})`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-2xl border border-[rgba(16,185,129,0.1)] bg-[rgba(247,247,242,0.03)] p-8 backdrop-blur-xl",
        "transition-colors duration-500",
        "hover:border-[rgba(16,185,129,0.22)] hover:bg-[rgba(16,185,129,0.04)] hover:shadow-2xl hover:shadow-[rgba(16,185,129,0.1)]",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.08) 0%, transparent 60%)`
        }}
      />
      {children}
    </div>
  )
}
