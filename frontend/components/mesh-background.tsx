"use client"

export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Emerald orb - top right */}
      <div
        className="animate-float-slow animate-pulse-glow absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 45%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Forest green orb - center left */}
      <div
        className="animate-float-slower absolute top-1/4 -left-52 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(5,150,105,0.08) 0%, rgba(5,150,105,0.02) 45%, transparent 70%)",
          filter: "blur(100px)",
          animationDelay: "5s",
        }}
      />

      {/* Deep jungle orb - bottom center */}
      <div
        className="animate-float-slowest absolute -bottom-32 left-1/3 h-[800px] w-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6,78,59,0.1) 0%, rgba(6,78,59,0.03) 45%, transparent 70%)",
          filter: "blur(120px)",
          animationDelay: "10s",
        }}
      />

      {/* Mint glow orb - mid right */}
      <div
        className="animate-float-slow absolute top-2/3 right-1/4 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 60%)",
          filter: "blur(80px)",
          animationDelay: "8s",
        }}
      />
    </div>
  )
}
