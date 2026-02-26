"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative px-6 py-32">
      {/* Section divider */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="h-px w-32 bg-gradient-to-r from-transparent to-primary/30" />
          <div className="h-2 w-2 rounded-full border border-primary/30" />
          <div className="h-px w-32 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <ScrollReveal variant="scale-in" duration={1000}>
          <div
            className="group relative overflow-hidden rounded-3xl border border-[rgba(16,185,129,0.1)] bg-[rgba(18,17,19,0.3)] p-12 text-center backdrop-blur-xl md:p-20"
          >
            {/* Animated gradient bg */}
            <div className="pointer-events-none absolute inset-0 transition-opacity duration-700 group-hover:opacity-150" style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 60%)" }} aria-hidden="true" />

            {/* Converging corner glows */}
            <div
              className={`pointer-events-none absolute top-0 left-0 h-40 w-40 transition-all duration-[2000ms] ${inView ? "opacity-60" : "opacity-0 -translate-x-10 -translate-y-10"}`}
              style={{ background: "radial-gradient(circle at top left, rgba(16,185,129,0.1), transparent 70%)" }}
            />
            <div
              className={`pointer-events-none absolute right-0 bottom-0 h-40 w-40 transition-all duration-[2000ms] delay-300 ${inView ? "opacity-60" : "opacity-0 translate-x-10 translate-y-10"}`}
              style={{ background: "radial-gradient(circle at bottom right, rgba(52,211,153,0.08), transparent 70%)" }}
            />
            <div
              className={`pointer-events-none absolute top-0 right-0 h-32 w-32 transition-all duration-[2000ms] delay-150 ${inView ? "opacity-40" : "opacity-0 translate-x-10 -translate-y-10"}`}
              style={{ background: "radial-gradient(circle at top right, rgba(52,211,153,0.06), transparent 70%)" }}
            />
            <div
              className={`pointer-events-none absolute bottom-0 left-0 h-32 w-32 transition-all duration-[2000ms] delay-450 ${inView ? "opacity-40" : "opacity-0 -translate-x-10 translate-y-10"}`}
              style={{ background: "radial-gradient(circle at bottom left, rgba(16,185,129,0.06), transparent 70%)" }}
            />

            <div className="relative">
              <ScrollReveal variant="blur-in" delay={200} duration={900}>
                <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  Ready to Modernize
                  <br />
                  Title Verification?
                </h2>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={400} duration={800}>
                <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
                  Join the PRGI{"'"}s initiative to automate compliance and protect
                  the integrity of India{"'"}s press title registry.
                </p>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={600} duration={800}>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a
                    href="#"
                    className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-[0.98]"
                    style={{
                      boxShadow: "0 0 30px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.1)",
                    }}
                  >
                    <span
                      className="absolute inset-0 -translate-x-full"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(110,231,183,0.2), transparent)",
                        animation: "shimmer-line 3s ease-in-out infinite",
                      }}
                    />
                    <span className="relative">Request Access</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,185,129,0.12)] bg-[rgba(16,185,129,0.04)] px-8 py-3.5 text-base font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[rgba(16,185,129,0.22)] hover:bg-[rgba(16,185,129,0.07)]"
                  >
                    View Documentation
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
