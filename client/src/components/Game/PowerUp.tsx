import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PowerUp as PowerUpType } from "../../lib/stores/useSpaceGame";

interface PowerUpProps {
  powerUp: PowerUpType;
}

export default function PowerUp({ powerUp }: PowerUpProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
    
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const getPowerUpProps = () => {
    switch (powerUp.type) {
      case 'rapidFire':
        return {
          color: "#ff8844",
          icon: "R"
        };
      case 'shield':
        return {
          color: "#4488ff",
          icon: "S"
        };
      case 'bomb':
        return {
          color: "#ff4444",
          icon: "B"
        };
      case 'multiShot':
        return {
          color: "#88ff44",
          icon: "M"
        };
    }
  };

  const props = getPowerUpProps();

  return (
    <group position={powerUp.position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color={props.color}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Main power-up body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial 
          color={props.color}
          emissive={props.color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Rotating ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.02, 8, 16]} />
        <meshBasicMaterial 
          color={props.color}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
