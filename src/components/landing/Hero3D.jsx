'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

function ParticleSwarm(props) {
  const ref = useRef()
  
  // Create a spherical distribution of particles
  const positions = useMemo(() => {
    const count = 4000
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2 * Math.cbrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20
      ref.current.rotation.y -= delta / 30
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial 
            transparent 
            color="#D4AF37" 
            size={0.006} 
            sizeAttenuation={true} 
            depthWrite={false} 
            opacity={0.8}
        />
      </Points>
    </group>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1.5] }}>
        <ParticleSwarm />
      </Canvas>
    </div>
  )
}
