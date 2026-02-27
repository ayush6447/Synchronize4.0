"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"

function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-primary align-middle" />
      )}
    </span>
  )
}

function FloatingBadge({ text, className }: { text: string; className: string }) {
  return (
    <div className={`absolute hidden rounded-full border border-[rgba(16,185,129,0.1)] bg-[rgba(16,185,129,0.04)] px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm lg:block ${className}`}>
      {text}
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      setMouseOffset({
        x: (e.clientX - cx) / cx * 12,
        y: (e.clientY - cy) / cy * 8,
      })
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  return (
    <section ref={containerRef} className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Animated radial rings */}
      <div
        className={`pointer-events-none absolute h-[600px] w-[600px] rounded-full border border-[rgba(16,185,129,0.05)] transition-all duration-[3000ms] ${mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        style={{ transform: `translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)` }}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute h-[900px] w-[900px] rounded-full border border-[rgba(16,185,129,0.03)] transition-all duration-[3500ms] delay-300 ${mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        style={{ transform: `translate(${mouseOffset.x * 0.15}px, ${mouseOffset.y * 0.15}px)` }}
        aria-hidden="true"
      />

      {/* Converging lines from edges */}
      <div
        className={`pointer-events-none absolute top-[30%] left-0 h-px transition-all duration-[2500ms] ease-out ${mounted ? "w-[35%] opacity-100" : "w-0 opacity-0"}`}
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.25))" }}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute top-[30%] right-0 h-px transition-all duration-[2500ms] ease-out ${mounted ? "w-[35%] opacity-100" : "w-0 opacity-0"}`}
        style={{ background: "linear-gradient(270deg, transparent, rgba(16,185,129,0.18))" }}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute top-[70%] left-0 h-px transition-all duration-[3000ms] delay-500 ease-out ${mounted ? "w-[25%] opacity-100" : "w-0 opacity-0"}`}
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.15))" }}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute top-[70%] right-0 h-px transition-all duration-[3000ms] delay-500 ease-out ${mounted ? "w-[25%] opacity-100" : "w-0 opacity-0"}`}
        style={{ background: "linear-gradient(270deg, transparent, rgba(16,185,129,0.1))" }}
        aria-hidden="true"
      />

      {/* Floating context badges */}
      <FloatingBadge text="Phonetic Matching" className={`top-[22%] left-[8%] transition-all duration-[2000ms] delay-[1500ms] ${mounted ? "opacity-60 translate-y-0" : "opacity-0 translate-y-6"}`} />
      <FloatingBadge text="160K+ Titles" className={`top-[18%] right-[10%] transition-all duration-[2000ms] delay-[1800ms] ${mounted ? "opacity-60 translate-y-0" : "opacity-0 translate-y-6"}`} />
      <FloatingBadge text="12+ Languages" className={`bottom-[28%] left-[12%] transition-all duration-[2000ms] delay-[2100ms] ${mounted ? "opacity-50 translate-y-0" : "opacity-0 translate-y-6"}`} />
      <FloatingBadge text="Sub-2s Response" className={`bottom-[25%] right-[8%] transition-all duration-[2000ms] delay-[2400ms] ${mounted ? "opacity-50 translate-y-0" : "opacity-0 translate-y-6"}`} />

      <ScrollReveal variant="scale-in" duration={1000}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(16,185,129,0.12)] bg-[rgba(16,185,129,0.04)] px-5 py-2 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm text-muted-foreground">
            Protecting India{"'"}s Press Title Registry
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="blur-in" delay={200} duration={1200}>
        <h1 className="max-w-5xl text-balance text-center text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
          <TypedText text="From Idea" delay={600} />
          <br />
          <span className="relative inline-block">
            <TypedText text="To Verified Identity" delay={1300} />
            <span
              className={`absolute -bottom-2 left-0 h-1 rounded-full transition-all duration-[1200ms] delay-[2500ms] ease-out ${mounted ? "w-full opacity-60" : "w-0 opacity-0"}`}
              style={{
                background: "linear-gradient(90deg, #10B981, #6EE7B7, #10B981)",
              }}
            />
          </span>
        </h1>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={400} duration={1000}>
        <p className="mt-8 max-w-2xl text-pretty text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
          AI-powered title validation for the Press Registrar General of India.
        </p>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={600} duration={1000}>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,185,129,0.12)] bg-[rgba(16,185,129,0.04)] px-8 py-3.5 text-base font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[rgba(16,185,129,0.22)] hover:bg-[rgba(16,185,129,0.07)]"
          >
            Explore Features
          </a>
        </div>
      </ScrollReveal>

      {/* Animated scroll indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all delay-[3000ms] duration-1000 ${mounted ? "opacity-50" : "opacity-0 translate-y-4"}`}
      >
        <a href="#features" className="flex flex-col items-center gap-2 transition-opacity duration-300 hover:opacity-80" aria-label="Scroll to features">
          <span className="text-xs tracking-widest text-muted-foreground uppercase">Discover</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
        </a>
      </div>
    </section>
  )
}
