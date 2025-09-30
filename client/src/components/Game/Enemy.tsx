import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Enemy as EnemyType } from "../../lib/stores/useSpaceGame";

interface EnemyProps {
  enemy: EnemyType;
}

export default function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Different animations based on enemy type
      switch (enemy.type) {
        case 'basic':
          meshRef.current.rotation.y += 0.01;
          break;
        case 'fast':
          meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.2;
          break;
        case 'tank':
          meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
          break;
        case 'boss':
          meshRef.current.rotation.y += 0.005;
          meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
          break;
      }
    }
  });

  const getEnemyProps = () => {
    switch (enemy.type) {
      case 'basic':
        return {
          size: [0.4, 0.4, 0.2] as [number, number, number],
          color: "#ff4444",
          emissiveIntensity: 0.3
        };
      case 'fast':
        return {
          size: [0.3, 0.5, 0.15] as [number, number, number],
          color: "#ffaa44",
          emissiveIntensity: 0.4
        };
      case 'tank':
        return {
          size: [0.6, 0.5, 0.3] as [number, number, number],
          color: "#8844ff",
          emissiveIntensity: 0.2
        };
      case 'boss':
        return {
          size: [1.2, 0.8, 0.4] as [number, number, number],
          color: "#ff2222",
          emissiveIntensity: 0.5
        };
    }
  };

  const props = getEnemyProps();
  const healthPercentage = enemy.health / enemy.maxHealth;

  return (
    <group position={enemy.position}>
      {/* Main enemy body */}
      <mesh ref={meshRef}>
        <boxGeometry args={props.size} />
        <meshStandardMaterial 
          color={props.color}
          emissive={props.color}
          emissiveIntensity={props.emissiveIntensity}
        />
      </mesh>

      {/* Enemy details based on type */}
      {enemy.type === 'tank' && (
        <>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color={props.color} emissive={props.color} emissiveIntensity={0.3} />
          </mesh>
        </>
      )}

      {enemy.type === 'boss' && (
        <>
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.2]} />
            <meshStandardMaterial color="#ff6666" emissive="#ff6666" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.2]} />
            <meshStandardMaterial color="#ff6666" emissive="#ff6666" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}

      {enemy.type === 'fast' && (
        <>
          <mesh position={[0, -0.3, 0]}>
            <coneGeometry args={[0.1, 0.2]} />
            <meshStandardMaterial 
              color="#ffdd44" 
              emissive="#ffdd44" 
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        </>
      )}

      {/* Health bar for damaged enemies */}
      {healthPercentage < 1 && (
        <group position={[0, props.size[1]/2 + 0.2, 0]}>
          <mesh>
            <boxGeometry args={[props.size[0], 0.05, 0.01]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh ref={healthBarRef}>
            <boxGeometry args={[props.size[0] * healthPercentage, 0.05, 0.02]} />
            <meshBasicMaterial color={healthPercentage > 0.5 ? "#44ff44" : "#ffaa44"} />
          </mesh>
        </group>
      )}
    </group>
  );
}
