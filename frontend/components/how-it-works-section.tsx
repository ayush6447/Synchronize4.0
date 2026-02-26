"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GlassCard } from "@/components/glass-card"
import { Upload, ScanSearch, ShieldAlert, CheckCircle2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Submit Title",
    description:
      "A new title is submitted for verification. The system ingests it and prepares it for multi-layer analysis against the full PRGI database.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "Analyze & Compare",
    description:
      "Phonetic algorithms, semantic matching, and rule-based engines scan the title against 160,000+ existing entries simultaneously.",
  },
  {
    icon: ShieldAlert,
    step: "03",
    title: "Flag & Score",
    description:
      "The system flags disallowed words, prefix/suffix violations, and cross-language duplicates, then generates a verification probability score.",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Feedback & Iterate",
    description:
      "Clear, actionable feedback explains why a title was accepted or rejected. Users can modify and resubmit until compliance is achieved.",
  },
]

function AnimatedLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      <div
        className={`h-full w-full transition-all duration-[2000ms] ease-out ${visible ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}`}
        style={{
          background: "linear-gradient(180deg, rgba(16,185,129,0.25), rgba(52,211,153,0.08), rgba(16,185,129,0.25))",
          transformOrigin: "top",
        }}
      />
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      {/* Section divider */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/30" />
          <div className="h-2 w-2 rotate-45 border border-primary/30" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <ScrollReveal variant="blur-in" duration={1000}>
          <div className="mb-20 text-center">
            <span className="mb-4 inline-block text-sm font-medium tracking-wider text-accent uppercase">
              The Process
            </span>
            <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Four Steps to Verified Titles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              From submission to approval, every title passes through a rigorous
              multi-stage validation pipeline in under 2 seconds.
            </p>
          </div>
        </ScrollReveal>

        {/* Vertical timeline layout */}
        <div className="relative">
          {/* Animated center line */}
          <AnimatedLine className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 md:block" />

          <div className="flex flex-col gap-16 md:gap-24">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0
              return (
                <ScrollReveal
                  key={step.title}
                  delay={i * 200}
                  variant={isLeft ? "converge-right" : "converge-left"}
                  duration={1000}
                >
                  <div className={`flex items-center gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
                      <GlassCard className="group relative overflow-hidden">
                        {/* Hover glow */}
                        <div
                          className={`pointer-events-none absolute -top-16 h-32 w-32 rounded-full opacity-0 transition-all duration-700 group-hover:opacity-100 ${isLeft ? "-right-16" : "-left-16"}`}
                          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)", filter: "blur(25px)" }}
                        />
                        <div className="relative">
                          <div className={`mb-4 flex items-center gap-4 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                              <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                          </div>
                          <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                        </div>
                        {/* Bottom accent */}
                        <div className="absolute right-0 bottom-0 left-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)" }} />
                      </GlassCard>
                    </div>

                    {/* Center node */}
                    <div className="relative z-10 hidden shrink-0 md:block">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-secondary text-lg font-bold text-primary transition-all duration-500 hover:scale-110 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20">
                        {step.step}
                      </div>
                      <div className="absolute inset-0 -z-10 animate-pulse rounded-full opacity-30" style={{ boxShadow: "0 0 20px rgba(137,152,120,0.3)" }} />
                    </div>

                    {/* Spacer for the other side */}
                    <div className="hidden flex-1 md:block" />
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
