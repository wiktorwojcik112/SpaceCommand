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
  const shieldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
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
        case 'bossShield':
          meshRef.current.rotation.y += 0.008;
          meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
          break;
        case 'bossRapid':
          meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.15;
          meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 2) * 0.1;
          break;
        case 'bossTank':
          meshRef.current.rotation.y += 0.003;
          break;
      }
    }

    if (shieldRef.current && enemy.shieldActive) {
      shieldRef.current.rotation.y += 0.03;
      shieldRef.current.rotation.z += 0.02;
      const material = shieldRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
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
      case 'bossShield':
        return {
          size: [1.4, 0.9, 0.5] as [number, number, number],
          color: "#4488ff",
          emissiveIntensity: 0.6
        };
      case 'bossRapid':
        return {
          size: [1.0, 0.7, 0.3] as [number, number, number],
          color: "#ff8844",
          emissiveIntensity: 0.7
        };
      case 'bossTank':
        return {
          size: [1.6, 1.0, 0.6] as [number, number, number],
          color: "#aa44ff",
          emissiveIntensity: 0.4
        };
    }
  };

  const props = getEnemyProps();
  const healthPercentage = enemy.health / enemy.maxHealth;
  const isBoss = enemy.type.startsWith('boss');

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

      {/* Tank details */}
      {enemy.type === 'tank' && (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3]} />
          <meshStandardMaterial color={props.color} emissive={props.color} emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* Boss details */}
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

      {/* Boss Shield details */}
      {enemy.type === 'bossShield' && (
        <>
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.3]} />
            <meshStandardMaterial color="#6699ff" emissive="#6699ff" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.3]} />
            <meshStandardMaterial color="#6699ff" emissive="#6699ff" emissiveIntensity={0.4} />
          </mesh>
          {enemy.shieldActive && (
            <mesh ref={shieldRef}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial 
                color="#44aaff" 
                transparent 
                opacity={0.4}
                emissive="#44aaff"
                emissiveIntensity={0.3}
              />
            </mesh>
          )}
        </>
      )}

      {/* Boss Rapid details */}
      {enemy.type === 'bossRapid' && (
        <>
          <mesh position={[-0.4, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#ffaa66" emissive="#ffaa66" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.4, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#ffaa66" emissive="#ffaa66" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.4, -0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#ffaa66" emissive="#ffaa66" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.4, -0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#ffaa66" emissive="#ffaa66" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      {/* Boss Tank details */}
      {enemy.type === 'bossTank' && (
        <>
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.5, 0.6, 0.4]} />
            <meshStandardMaterial color="#cc66ff" emissive="#cc66ff" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.5, 0.6, 0.4]} />
            <meshStandardMaterial color="#cc66ff" emissive="#cc66ff" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.5]} />
            <meshStandardMaterial color="#cc66ff" emissive="#cc66ff" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}

      {/* Fast enemy details */}
      {enemy.type === 'fast' && (
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
      )}

      {/* Health bar */}
      {healthPercentage < 1 && (
        <group position={[0, props.size[1]/2 + 0.2, 0]}>
          <mesh>
            <boxGeometry args={[props.size[0], 0.05, 0.01]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh ref={healthBarRef}>
            <boxGeometry args={[props.size[0] * healthPercentage, 0.05, 0.02]} />
            <meshBasicMaterial color={healthPercentage > 0.5 ? "#44ff44" : healthPercentage > 0.25 ? "#ffaa44" : "#ff4444"} />
          </mesh>
        </group>
      )}

      {/* Boss phase indicator */}
      {isBoss && enemy.bossPhase && (
        <group position={[0, props.size[1]/2 + 0.4, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#ffff44" />
          </mesh>
        </group>
      )}
    </group>
  );
}
