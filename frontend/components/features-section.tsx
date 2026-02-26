"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GlassCard } from "@/components/glass-card"
import { AudioLines, Code2, ShieldCheck, Languages, Clock, BarChart3 } from "lucide-react"

const features = [
  {
    icon: AudioLines,
    title: "Phonetic Similarity Detection",
    description:
      "Advanced Soundex and Metaphone algorithms catch similar-sounding titles. Variations like 'Namaskar' vs 'Namascar' are detected instantly with high accuracy.",
    tag: "Sound Match",
  },
  {
    icon: Code2,
    title: "Prefix & Suffix Validation",
    description:
      "Maintains a curated list of disallowed prefixes and suffixes. Rejects new titles that closely resemble existing ones through common additions like 'The', 'India', or 'News'.",
    tag: "Rule Engine",
  },
  {
    icon: ShieldCheck,
    title: "Guideline Enforcement",
    description:
      "Automatically rejects titles with disallowed words (Police, Crime, CBI, Army) and prevents creation of new titles by combining existing registered names.",
    tag: "Compliance",
  },
  {
    icon: Languages,
    title: "Cross-Language Semantics",
    description:
      "Detects titles with similar meanings across languages. 'Daily Evening' and 'Pratidin Sandhya' are recognized as semantically identical and flagged immediately.",
    tag: "Multilingual",
  },
  {
    icon: Clock,
    title: "Periodicity Guard",
    description:
      "Prevents adding periodicity (daily, weekly, monthly) to existing titles to form new ones. Conceptual themes like 'Morning Herald' and 'Dawn Dispatch' are caught.",
    tag: "Smart Block",
  },
  {
    icon: BarChart3,
    title: "Verification Probability",
    description:
      "Provides a real-time probability score indicating likelihood of title approval. An 80% similarity score yields no more than 20% verification probability.",
    tag: "Scoring",
  },
]

export function FeaturesSection() {
  const Icon0 = features[0].icon;
  const Icon1 = features[1].icon;
  const Icon3 = features[3].icon;
  const Icon4 = features[4].icon;
  const Icon5 = features[5].icon;

  return (
    <section id="features" className="relative px-6 py-32">
      {/* Decorative top accent */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <ScrollReveal variant="blur-in" duration={1000}>
          <div className="mb-20 max-w-2xl">
            <span className="mb-4 inline-block text-sm font-medium tracking-wider text-accent uppercase">
              Core Capabilities
            </span>
            <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Intelligent Title
              <br />
              Verification
            </h2>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Six layers of validation combining string matching, rule-based enforcement,
              and semantic analysis to ensure{" "}
              <span className="font-semibold text-accent">complete title uniqueness</span>{" "}
              across India{"'"}s press registry.
            </p>
          </div>
        </ScrollReveal>

        {/* Organic staggered layout instead of grid */}
        <div className="flex flex-col gap-8">
          {/* Row 1: two cards offset */}
          <div className="flex flex-col gap-8 lg:flex-row">
            <ScrollReveal variant="converge-right" delay={0} duration={900} className="lg:w-[55%]">
              <GlassCard className="group relative h-full overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(30px)" }} />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <Icon0 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">{features[0].tag}</span>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{features[0].title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{features[0].description}</p>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal variant="converge-left" delay={150} duration={900} className="lg:w-[45%] lg:mt-12">
              <GlassCard className="group relative h-full overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)", filter: "blur(30px)" }} />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <Icon1 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">{features[1].tag}</span>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{features[1].title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{features[1].description}</p>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>

          {/* Row 2: full width highlight */}
          <ScrollReveal variant="scale-in" delay={100} duration={1000}>
            <GlassCard className="group relative overflow-hidden border-primary/15">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 60%)" }} />
              <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/15">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">{features[2].tag}</span>
                  <h3 className="mb-2 text-2xl font-semibold text-foreground">{features[2].title}</h3>
                  <p className="max-w-2xl leading-relaxed text-muted-foreground">{features[2].description}</p>
                </div>
                <div className="hidden h-20 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent lg:block" />
                <div className="flex flex-col items-center gap-1 lg:items-start">
                  <span className="text-3xl font-bold text-accent">100%</span>
                  <span className="text-sm text-muted-foreground">Automated Review</span>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Row 3: three staggered cards */}
          <div className="flex flex-col gap-8 lg:flex-row">
            <ScrollReveal variant="converge-right" delay={0} duration={900} className="lg:w-[38%]">
              <GlassCard className="group relative h-full overflow-hidden">
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(30px)" }} />
                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <Icon3 className="h-7 w-7 text-primary" />
                  </div>
                  <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">{features[3].tag}</span>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{features[3].title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{features[3].description}</p>
                </div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={150} duration={900} className="lg:w-[32%] lg:-mt-6">
              <GlassCard className="group relative h-full overflow-hidden">
                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <Icon4 className="h-7 w-7 text-primary" />
                  </div>
                  <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">{features[4].tag}</span>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{features[4].title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{features[4].description}</p>
                </div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal variant="converge-left" delay={300} duration={900} className="lg:w-[30%] lg:mt-8">
              <GlassCard className="group relative h-full overflow-hidden">
                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <Icon5 className="h-7 w-7 text-primary" />
                  </div>
                  <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary">{features[5].tag}</span>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{features[5].title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{features[5].description}</p>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
