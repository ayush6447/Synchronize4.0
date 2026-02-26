"use client"

import { FileCheck } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"

const links = {
  Platform: ["Similarity Check", "Language Engine", "Compliance Rules", "API Docs"],
  Resources: ["Documentation", "Use Cases", "Changelog", "Support"],
  Legal: ["Privacy", "Terms", "Security", "Compliance"],
}

export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(16,185,129,0.08)] px-6 py-16">
      {/* Top border glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2"
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-4">
          <ScrollReveal variant="converge-right" duration={800}>
            <div>
              <a href="#" className="group flex items-center gap-2" aria-label="TitleGuard home">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  TitleGuard
                </span>
              </a>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Intelligent title verification for the Press Registrar General
                of India. Ensuring uniqueness, compliance, and integrity across
                160,000+ registered press titles.
              </p>
            </div>
          </ScrollReveal>

          {Object.entries(links).map(([category, items], i) => (
            <ScrollReveal key={category} variant={i < 1 ? "fade-up" : "converge-left"} delay={i * 100} duration={800}>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="group/link relative text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {item}
                        <span className="absolute -bottom-px left-0 h-px w-0 bg-primary/40 transition-all duration-300 group-hover/link:w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fade-up" delay={200} duration={800}>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgba(16,185,129,0.08)] pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              {"2026 TitleGuard - PRGI Title Verification System. All rights reserved."}
            </p>
            <div className="flex gap-6">
              {["GitHub", "Documentation", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  aria-label={item}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
