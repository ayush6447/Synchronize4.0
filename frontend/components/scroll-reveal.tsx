"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "converge-left"
  | "converge-right"
  | "scale-in"
  | "blur-in"
  | "rotate-in"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  variant?: AnimationVariant
  duration?: number
}

const variantStyles: Record<AnimationVariant, { hidden: string; visible: string }> = {
  "fade-up": {
    hidden: "translate-y-12 opacity-0",
    visible: "translate-y-0 opacity-100",
  },
  "fade-down": {
    hidden: "-translate-y-12 opacity-0",
    visible: "translate-y-0 opacity-100",
  },
  "fade-left": {
    hidden: "translate-x-12 opacity-0",
    visible: "translate-x-0 opacity-100",
  },
  "fade-right": {
    hidden: "-translate-x-12 opacity-0",
    visible: "translate-x-0 opacity-100",
  },
  "converge-left": {
    hidden: "-translate-x-24 opacity-0 scale-95",
    visible: "translate-x-0 opacity-100 scale-100",
  },
  "converge-right": {
    hidden: "translate-x-24 opacity-0 scale-95",
    visible: "translate-x-0 opacity-100 scale-100",
  },
  "scale-in": {
    hidden: "scale-75 opacity-0",
    visible: "scale-100 opacity-100",
  },
  "blur-in": {
    hidden: "opacity-0 blur-sm scale-95",
    visible: "opacity-100 blur-0 scale-100",
  },
  "rotate-in": {
    hidden: "opacity-0 rotate-3 scale-95",
    visible: "opacity-100 rotate-0 scale-100",
  },
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
  duration = 800,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  const styles = variantStyles[variant]

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${isVisible ? styles.visible : styles.hidden} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}
