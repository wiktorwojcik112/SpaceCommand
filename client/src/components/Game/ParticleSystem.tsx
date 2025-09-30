import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Particle } from "../../lib/stores/useSpaceGame";

interface ParticleSystemProps {
  particles: Particle[];
}

export default function ParticleSystem({ particles }: ParticleSystemProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {particles.map((particle) => {
        const lifePercentage = particle.life / particle.maxLife;
        const opacity = lifePercentage;
        const scale = lifePercentage * particle.size;

        return (
          <mesh key={particle.id} position={particle.position} scale={scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color={particle.color}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}
