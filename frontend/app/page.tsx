import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { VerificationSection } from "@/components/verification-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TrustSection } from "@/components/trust-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { BlockchainLookup } from "@/components/blockchain-lookup"
import { MeshBackground } from "@/components/mesh-background"
import { CursorGlow } from "@/components/cursor-glow"
import { SceneWrapper } from "@/components/scene-wrapper"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <MeshBackground />
      <SceneWrapper />
      <CursorGlow />
      <Navbar />
      <HeroSection />
      <VerificationSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <CTASection />
      <BlockchainLookup />
      <Footer />
    </main>
  )
}
