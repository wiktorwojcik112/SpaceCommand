import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Bullet as BulletType } from "../../lib/stores/useSpaceGame";

interface BulletProps {
  bullet: BulletType;
}

export default function Bullet({ bullet }: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.1;
    }
  });

  const isPlayerBullet = bullet.isPlayerBullet;
  const color = isPlayerBullet ? "#44ff88" : "#ff4444";

  return (
    <group position={bullet.position}>
      {/* Bullet trail */}
      <mesh ref={trailRef} position={[0, isPlayerBullet ? -0.2 : 0.2, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Main bullet */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.08, 0.15, 0.05]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Bullet glow */}
      <mesh>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
