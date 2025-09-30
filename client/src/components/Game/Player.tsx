import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpaceGame } from "../../lib/stores/useSpaceGame";

export default function Player() {
  const { playerPosition, playerHealth, playerMaxHealth, playerShield } = useSpaceGame();
  const meshRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Animate player ship
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    // Animate shield
    if (shieldRef.current && playerShield > 0) {
      shieldRef.current.rotation.y += 0.02;
      const material = shieldRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      }
    }
  });

  const healthPercentage = playerHealth / playerMaxHealth;
  const shipColor = healthPercentage > 0.6 ? "#00ff88" : healthPercentage > 0.3 ? "#ffaa00" : "#ff4444";

  return (
    <group position={playerPosition}>
      {/* Main ship body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 0.8, 0.2]} />
        <meshStandardMaterial 
          color={shipColor} 
          emissive={shipColor} 
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Ship wings */}
      <mesh position={[-0.4, -0.2, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color={shipColor} emissive={shipColor} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.4, -0.2, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color={shipColor} emissive={shipColor} emissiveIntensity={0.1} />
      </mesh>

      {/* Engine glow */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial 
          color="#4488ff" 
          emissive="#4488ff" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Shield effect */}
      {playerShield > 0 && (
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.8, 16, 8]} />
          <meshStandardMaterial 
            color="#44aaff" 
            transparent 
            opacity={0.3}
            emissive="#44aaff"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      {/* Health indicator */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.8 * healthPercentage, 0.05, 0.01]} />
        <meshBasicMaterial color={shipColor} />
      </mesh>
    </group>
  );
}
