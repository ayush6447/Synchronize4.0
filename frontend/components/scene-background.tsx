"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshTransmissionMaterial, Stars, Sparkles } from "@react-three/drei"
import { useRef, useMemo } from "react"
import type { Mesh, Group, BufferGeometry } from "three"
import * as THREE from "three"

function FloatingOctahedron({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.getElapsedTime() * speed * 0.3
    ref.current.rotation.y = clock.getElapsedTime() * speed * 0.2
  })
  return (
    <Float speed={speed * 0.8} rotationIntensity={0.4} floatIntensity={1.2} floatingRange={[-0.3, 0.3]}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          color="#064E3B"
          transmission={0.95}
          roughness={0.1}
          thickness={0.5}
          chromaticAberration={0.03}
          ior={1.5}
          backside
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  )
}

function FloatingTorus({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.getElapsedTime() * speed * 0.15
    ref.current.rotation.z = clock.getElapsedTime() * speed * 0.25
  })
  return (
    <Float speed={speed * 0.6} rotationIntensity={0.3} floatIntensity={1} floatingRange={[-0.4, 0.4]}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.35, 12, 32]} />
        <MeshTransmissionMaterial
          color="#6EE7B7"
          transmission={0.92}
          roughness={0.15}
          thickness={0.4}
          chromaticAberration={0.02}
          ior={1.4}
          backside
          transparent
          opacity={0.25}
        />
      </mesh>
    </Float>
  )
}

function FloatingIcosahedron({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.getElapsedTime() * speed * 0.2
    ref.current.rotation.z = clock.getElapsedTime() * speed * 0.1
  })
  return (
    <Float speed={speed * 0.7} rotationIntensity={0.5} floatIntensity={0.8} floatingRange={[-0.2, 0.2]}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          color="#064E3B"
          transmission={0.9}
          roughness={0.2}
          thickness={0.6}
          chromaticAberration={0.04}
          ior={1.6}
          backside
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  )
}

function WireframeSphere({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.getElapsedTime() * speed * 0.08
    ref.current.rotation.x = clock.getElapsedTime() * speed * 0.05
  })
  return (
    <Float speed={speed * 0.3} rotationIntensity={0.2} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#10B981" wireframe transparent opacity={0.06} />
      </mesh>
    </Float>
  )
}

function ConvergingParticles() {
  const groupRef = useRef<Group>(null)
  const count = 120 // Lower density for performance
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])

  const originPositions = useMemo(() => Float32Array.from(positions), [positions])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const geo = groupRef.current.children[0] as Mesh
    if (!geo || !geo.geometry) return
    const posAttr = geo.geometry.attributes.position
    if (!posAttr) return
    const t = clock.getElapsedTime() * 0.3 // Slowed time factor
    const convergeFactor = (Math.sin(t * 0.15) + 1) * 0.5
    for (let i = 0; i < count; i++) {
      const ox = originPositions[i * 3]
      const oy = originPositions[i * 3 + 1]
      const oz = originPositions[i * 3 + 2]
      posAttr.setXYZ(
        i,
        ox * (1 - convergeFactor * 0.8) + Math.sin(t * 0.6 + i * 0.2) * 0.8,
        oy * (1 - convergeFactor * 0.8) + Math.cos(t * 0.5 + i * 0.2) * 0.8,
        oz * (1 - convergeFactor * 0.6) + Math.sin(t * 0.3 + i * 0.1) * 0.5
      )
    }
    posAttr.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={count}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#6EE7B7"
          size={0.06}
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Secondary ambient sparkles floating randomly */}
      <Sparkles count={50} scale={20} size={2} speed={0.1} opacity={0.3} color="#10B981" />
    </group>
  )
}

function OrbitingRing({ radius, speed, y, opacity }: { radius: number; speed: number; y: number; opacity: number }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.getElapsedTime() * speed
    ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * speed * 0.3) * 0.2
  })
  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <torusGeometry args={[radius, 0.008, 6, 64]} />
      <meshBasicMaterial color="#10B981" transparent opacity={opacity} />
    </mesh>
  )
}

function FloatingDocumentPlanes() {
  const groupRef = useRef<Group>(null)
  const planes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8 - 2,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI * 0.3,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.4,
      speed: 0.1 + Math.random() * 0.15,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime() * 0.3 // Slower motion
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as Mesh
      const p = planes[i]
      mesh.rotation.y = p.rotation[1] + t * p.speed
      mesh.rotation.z = p.rotation[2] + Math.sin(t * p.speed * 0.5) * 0.1
      mesh.position.y = p.pos[1] + Math.sin(t * p.speed * 0.8 + i) * 0.4
    })
  })

  return (
    <group ref={groupRef}>
      {planes.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rotation} scale={p.scale}>
          <planeGeometry args={[1.2, 1.6]} />
          <meshBasicMaterial
            color="#6EE7B7"
            transparent
            opacity={0.03}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function GridPlane() {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * 0.3
    ref.current.position.z = -5 + Math.sin(t * 0.15) * 0.5
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -5, -8]}>
      <planeGeometry args={[60, 60, 20, 20]} />
      <meshBasicMaterial color="#10B981" wireframe transparent opacity={0.04} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function ConnectionLines() {
  const groupRef = useRef<Group>(null)
  const lines = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; speed: number }[] = []
    for (let i = 0; i < 6; i++) {
      result.push({
        start: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6 - 2
        ),
        end: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6 - 2
        ),
        speed: 0.2 + Math.random() * 0.3,
      })
    }
    return result
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const line = child as Mesh
      const l = lines[i]
      const geo = line.geometry as THREE.BufferGeometry
      const pos = geo.attributes.position
      if (!pos) return
      const t = clock.getElapsedTime() * 0.3 // Smoother blending
      const breathe = (Math.sin(t * l.speed) + 1) * 0.5
      const mx = (l.start.x + l.end.x) * 0.5 * breathe
      const my = (l.start.y + l.end.y) * 0.5 * breathe
      const mz = (l.start.z + l.end.z) * 0.5 * breathe
      pos.setXYZ(0, l.start.x * (1 - breathe * 0.3) + mx * 0.3, l.start.y * (1 - breathe * 0.3) + my * 0.3, l.start.z)
      pos.setXYZ(1, l.end.x * (1 - breathe * 0.3) + mx * 0.3, l.end.y * (1 - breathe * 0.3) + my * 0.3, l.end.z)
      pos.needsUpdate = true
    })
  })

  return (
    <group ref={groupRef}>
      {lines.map((l, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([l.start.x, l.start.y, l.start.z, l.end.x, l.end.y, l.end.z]), 3]}
              count={2}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#10B981" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
        </line>
      ))}
    </group>
  )
}

export function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} intensity={0.5} color="#D1FAE5" penumbra={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ECFDF5" />
        <pointLight position={[-4, 3, 2]} intensity={0.6} color="#10B981" />
        <pointLight position={[3, -2, 4]} intensity={0.5} color="#6EE7B7" />

        <FloatingOctahedron position={[-3.5, 2.5, -2]} scale={0.9} speed={0.3} />
        <FloatingOctahedron position={[5, -1, -4]} scale={0.8} speed={0.2} />
        <FloatingOctahedron position={[-4, -3, -1]} scale={0.5} speed={0.4} />

        <FloatingTorus position={[3, 2, -1]} scale={0.7} speed={0.3} />
        <FloatingTorus position={[-2, -2.5, -2.5]} scale={0.5} speed={0.35} />
        <FloatingTorus position={[4, 4, -5]} scale={0.9} speed={0.2} />

        <FloatingIcosahedron position={[-4, -0.5, -1.5]} scale={0.55} speed={0.3} />
        <FloatingIcosahedron position={[2, 3.5, -2]} scale={0.4} speed={0.35} />
        <FloatingIcosahedron position={[-1, 4, -4]} scale={0.6} speed={0.4} />

        <WireframeSphere position={[0, 0, -4]} scale={3.5} speed={0.15} />
        <WireframeSphere position={[-6, 3, -7]} scale={2.5} speed={0.1} />
        <WireframeSphere position={[5, -4, -5]} scale={2} speed={0.15} />

        <ConvergingParticles />
        <FloatingDocumentPlanes />
        <ConnectionLines />

        <OrbitingRing radius={4} speed={0.02} y={0} opacity={0.1} />
        <OrbitingRing radius={5.5} speed={-0.015} y={0.5} opacity={0.08} />
        <OrbitingRing radius={3} speed={0.03} y={-0.5} opacity={0.09} />
        <OrbitingRing radius={7} speed={0.01} y={-0.2} opacity={0.05} />
        <OrbitingRing radius={8.5} speed={-0.005} y={0.8} opacity={0.03} />

        <GridPlane />

        <Stars radius={100} depth={50} count={600} factor={6} saturation={0} fade speed={0.4} />

        <fog attach="fog" args={["#121113", 4, 30]} />
      </Canvas>
    </div>
  )
}
