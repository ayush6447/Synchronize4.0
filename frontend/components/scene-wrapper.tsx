"use client"

import dynamic from "next/dynamic"

const SceneBackground = dynamic(
  () => import("@/components/scene-background").then((mod) => mod.SceneBackground),
  { ssr: false }
)

export function SceneWrapper() {
  return <SceneBackground />
}
