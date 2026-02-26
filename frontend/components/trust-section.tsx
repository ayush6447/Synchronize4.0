"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GlassCard } from "@/components/glass-card"
import { useEffect, useRef, useState } from "react"

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const startTime = performance.now()
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

const stats = [
  { value: 160000, suffix: "+", label: "Registered Titles", prefix: "", description: "Comprehensive database of India's press titles" },
  { value: 2, suffix: "s", label: "Verification Speed", prefix: "< ", description: "End-to-end processing for each submission" },
  { value: 99, suffix: ".8%", label: "Detection Accuracy", prefix: "", description: "Across phonetic and semantic matching" },
  { value: 12, suffix: "+", label: "Languages Covered", prefix: "", description: "Multilingual support for India's diversity" },
]

export function TrustSection() {
  return (
    <section id="stats" className="relative px-6 py-32">
      {/* Section divider */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-accent/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-accent/40" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-accent/30" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <ScrollReveal variant="blur-in" duration={1000}>
          <div className="mb-20 text-center">
            <span className="mb-4 inline-block text-sm font-medium tracking-wider text-accent uppercase">
              System Performance
            </span>
            <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Built for Scale & Precision
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Designed to handle the growing volume of title submissions across
              India, with optimized indexing and concurrent request processing.
            </p>
          </div>
        </ScrollReveal>

        {/* Asymmetric stats layout */}
        <div className="flex flex-col gap-8">
          {/* Top row: large stat + two smaller */}
          <div className="flex flex-col gap-8 lg:flex-row">
            <ScrollReveal variant="converge-right" delay={0} duration={1000} className="lg:w-1/2">
              <GlassCard className="group relative h-full overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.08), transparent 60%)" }} />
                <div className="relative">
                  <p className="text-6xl font-bold tracking-tight text-accent md:text-7xl">
                    <AnimatedCounter target={stats[0].value} suffix={stats[0].suffix} prefix={stats[0].prefix} />
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-foreground">{stats[0].label}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{stats[0].description}</p>
                  {/* Animated underline */}
                  <div className="mt-6 h-px w-full overflow-hidden">
                    <div className="h-full w-full origin-left scale-x-0 transition-transform duration-[1500ms] group-hover:scale-x-100" style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.4), transparent)" }} />
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
            <div className="flex flex-col gap-8 lg:w-1/2">
              <ScrollReveal variant="converge-left" delay={150} duration={900}>
                <GlassCard className="group relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle at top right, rgba(52,211,153,0.06), transparent 60%)" }} />
                  <div className="relative flex items-baseline gap-4">
                    <p className="text-4xl font-bold text-accent md:text-5xl">
                      <AnimatedCounter target={stats[1].value} suffix={stats[1].suffix} prefix={stats[1].prefix} />
                    </p>
                    <div>
                      <h3 className="font-semibold text-foreground">{stats[1].label}</h3>
                      <p className="text-sm text-muted-foreground">{stats[1].description}</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
              <ScrollReveal variant="converge-left" delay={300} duration={900}>
                <GlassCard className="group relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle at bottom left, rgba(16,185,129,0.06), transparent 60%)" }} />
                  <div className="relative flex items-baseline gap-4">
                    <p className="text-4xl font-bold text-accent md:text-5xl">
                      <AnimatedCounter target={stats[2].value} suffix={stats[2].suffix} prefix={stats[2].prefix} />
                    </p>
                    <div>
                      <h3 className="font-semibold text-foreground">{stats[2].label}</h3>
                      <p className="text-sm text-muted-foreground">{stats[2].description}</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>

          {/* Bottom: wide language stat */}
          <ScrollReveal variant="scale-in" delay={200} duration={1000}>
            <GlassCard className="group relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.05), transparent 60%)" }} />
              <div className="relative flex flex-col items-center gap-6 sm:flex-row">
                <p className="text-5xl font-bold text-accent md:text-6xl">
                  <AnimatedCounter target={stats[3].value} suffix={stats[3].suffix} prefix={stats[3].prefix} />
                </p>
                <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent sm:block" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{stats[3].label}</h3>
                  <p className="mt-1 text-muted-foreground">{stats[3].description}</p>
                </div>
                <div className="ml-auto hidden gap-2 lg:flex">
                  {["Hindi", "Tamil", "Bengali", "Telugu", "Urdu", "Marathi"].map((lang) => (
                    <span key={lang} className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-primary transition-all duration-300 hover:border-primary/30 hover:bg-primary/10">{lang}</span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Testimonial */}
        <ScrollReveal delay={300} variant="fade-up" duration={1000}>
          <GlassCard className="group relative mt-16 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.04), transparent, rgba(52,211,153,0.03), transparent)" }} />
            <div className="relative flex flex-col items-center text-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="mb-6 h-8 w-8 text-primary/30" aria-hidden="true">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="max-w-3xl text-lg leading-relaxed text-foreground md:text-xl">
                {'"The system identified cross-language duplicates that our manual review process consistently missed. It has fundamentally transformed how we ensure title uniqueness across India\'s diverse linguistic landscape."'}
              </blockquote>
              <div className="mt-6">
                <p className="font-semibold text-foreground">Registrar Review Board</p>
                <p className="text-sm text-muted-foreground">Press Registrar General of India</p>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  )
}
