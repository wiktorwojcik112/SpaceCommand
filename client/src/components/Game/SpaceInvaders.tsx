import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { useSpaceGame } from "../../lib/stores/useSpaceGame";
import { useAudio } from "../../lib/stores/useAudio";
import { 
  checkCollision, 
  createExplosionParticles, 
  createWaveEnemies, 
  GAME_BOUNDS, 
  isOutOfBounds 
} from "../../lib/gameUtils";

import Player from "./Player";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import PowerUp from "./PowerUp";
import ParticleSystem from "./ParticleSystem";

type Controls = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shoot: boolean;
  pause: boolean;
};

export default function SpaceInvaders() {
  const { 
    gameState, 
    level,
    enemies, 
    bullets, 
    powerUps, 
    particles,
    playerPosition,
    playerHealth,
    lives,
    pauseGame,
    resumeGame,
    movePlayer,
    playerShoot,
    takeDamage,
    removeLife,
    addEnemy,
    removeEnemy,
    updateEnemies,
    addBullet,
    removeBullet,
    updateBullets,
    addPowerUp,
    removePowerUp,
    collectPowerUp,
    addParticles,
    updateParticles,
    addScore,
    nextLevel
  } = useSpaceGame();
  
  const { playHit, playSuccess } = useAudio();
  const [subscribe, getKeys] = useKeyboardControls<Controls>();
  
  const waveCompleteRef = useRef(false);
  const lastEnemySpawnRef = useRef(0);
  const gameLoopRef = useRef<{ lastTime: number }>({ lastTime: 0 });

  // Initialize first wave
  useEffect(() => {
    if (gameState === 'playing' && enemies.length === 0 && !waveCompleteRef.current) {
      const newEnemies = createWaveEnemies(level);
      newEnemies.forEach(enemy => addEnemy(enemy));
    }
  }, [gameState, level, enemies.length, addEnemy]);

  // Handle keyboard input
  useEffect(() => {
    return subscribe(
      (state) => state.pause,
      (pressed) => {
        if (pressed) {
          if (gameState === 'playing') pauseGame();
          else if (gameState === 'paused') resumeGame();
        }
      }
    );
  }, [gameState, pauseGame, resumeGame, subscribe]);

  // Main game loop
  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    const keys = getKeys();
    const now = Date.now();
    
    // Player movement
    let moveX = 0;
    if (keys.left) moveX -= delta * 8;
    if (keys.right) moveX += delta * 8;
    if (moveX !== 0) movePlayer(moveX);
    
    // Player shooting
    if (keys.shoot) {
      playerShoot();
    }

    // Update bullets
    const updatedBullets = bullets.map(bullet => ({
      ...bullet,
      position: [
        bullet.position[0] + bullet.velocity[0],
        bullet.position[1] + bullet.velocity[1],
        bullet.position[2] + bullet.velocity[2]
      ] as [number, number, number]
    })).filter(bullet => !isOutOfBounds(bullet.position));

    updateBullets(updatedBullets);

    // Update enemies
    const updatedEnemies = enemies.map(enemy => {
      let newEnemy = { ...enemy };
      
      // Move enemy
      newEnemy.position[0] += newEnemy.direction * newEnemy.speed;
      
      // Check if enemy hit edge
      if (newEnemy.position[0] <= GAME_BOUNDS.LEFT || newEnemy.position[0] >= GAME_BOUNDS.RIGHT) {
        newEnemy.direction *= -1;
        newEnemy.position[1] -= 0.3; // Move down
      }
      
      // Enemy shooting
      if (Math.random() < 0.001 && now - newEnemy.lastShot > 1000) {
        addBullet({
          id: `enemy-bullet-${now}-${newEnemy.id}`,
          position: [newEnemy.position[0], newEnemy.position[1] - 0.5, newEnemy.position[2]],
          velocity: [0, -0.15, 0],
          isPlayerBullet: false,
          damage: 20
        });
        newEnemy.lastShot = now;
      }
      
      return newEnemy;
    });

    updateEnemies(updatedEnemies);

    // Check collisions between player bullets and enemies
    for (const bullet of updatedBullets) {
      if (!bullet.isPlayerBullet) continue;
      
      for (const enemy of updatedEnemies) {
        if (checkCollision(bullet.position, 0.1, enemy.position, 0.3)) {
          // Hit enemy
          removeBullet(bullet.id);
          
          const newHealth = enemy.health - bullet.damage;
          if (newHealth <= 0) {
            // Enemy destroyed
            removeEnemy(enemy.id);
            addScore(enemy.type === 'boss' ? 500 : enemy.type === 'tank' ? 50 : enemy.type === 'fast' ? 20 : 10);
            playHit();
            
            // Create explosion particles
            const explosionParticles = createExplosionParticles(
              enemy.position,
              enemy.type === 'boss' ? 25 : 15,
              enemy.type === 'boss' ? '#ff6666' : '#ff4444'
            );
            addParticles(explosionParticles);
            
            // Random power-up spawn
            if (Math.random() < 0.15) {
              const powerUpTypes = ['rapidFire', 'shield', 'bomb', 'multiShot'];
              const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
              addPowerUp({
                id: `powerup-${now}-${enemy.id}`,
                position: [...enemy.position] as [number, number, number],
                type: randomType as any,
                velocity: [0, -0.02, 0]
              });
            }
          } else {
            // Update enemy health
            const enemyIndex = updatedEnemies.findIndex(e => e.id === enemy.id);
            if (enemyIndex !== -1) {
              updatedEnemies[enemyIndex].health = newHealth;
              updateEnemies([...updatedEnemies]);
            }
            playHit();
          }
          break;
        }
      }
    }

    // Check collisions between enemy bullets and player
    for (const bullet of updatedBullets) {
      if (bullet.isPlayerBullet) continue;
      
      if (checkCollision(bullet.position, 0.1, playerPosition, 0.3)) {
        removeBullet(bullet.id);
        takeDamage(bullet.damage);
        playHit();
        
        if (playerHealth <= 0) {
          removeLife();
          // Reset player health if still has lives
          if (lives > 1) {
            useSpaceGame.setState({ playerHealth: 100, playerShield: 0 });
          }
        }
      }
    }

    // Check collisions between player and power-ups
    for (const powerUp of powerUps) {
      if (checkCollision(powerUp.position, 0.2, playerPosition, 0.3)) {
        collectPowerUp(powerUp);
        playSuccess();
      }
    }

    // Update power-ups
    const updatedPowerUps = powerUps.map(powerUp => ({
      ...powerUp,
      position: [
        powerUp.position[0] + powerUp.velocity[0],
        powerUp.position[1] + powerUp.velocity[1],
        powerUp.position[2] + powerUp.velocity[2]
      ] as [number, number, number]
    })).filter(powerUp => !isOutOfBounds(powerUp.position));

    if (updatedPowerUps.length !== powerUps.length) {
      updatedPowerUps.forEach(pu => {
        if (!powerUps.find(existing => existing.id === pu.id)) {
          removePowerUp(pu.id);
        }
      });
    }

    // Update particles
    const updatedParticles = particles.map(particle => ({
      ...particle,
      position: [
        particle.position[0] + particle.velocity[0],
        particle.position[1] + particle.velocity[1],
        particle.position[2] + particle.velocity[2]
      ] as [number, number, number],
      life: particle.life - delta
    })).filter(particle => particle.life > 0);

    updateParticles(updatedParticles);

    // Check for wave completion
    if (updatedEnemies.length === 0 && !waveCompleteRef.current) {
      waveCompleteRef.current = true;
      setTimeout(() => {
        nextLevel();
        waveCompleteRef.current = false;
      }, 2000);
    }

    // Check game over condition (enemies reached bottom)
    const enemyReachedBottom = updatedEnemies.some(enemy => enemy.position[1] <= playerPosition[1] + 0.5);
    if (enemyReachedBottom) {
      useSpaceGame.getState().gameOver();
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#4da6ff" />

      {/* Background stars */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#000011" transparent opacity={0.8} />
      </mesh>

      {/* Game objects */}
      <Player />
      
      {enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
      
      {bullets.map(bullet => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
      
      {powerUps.map(powerUp => (
        <PowerUp key={powerUp.id} powerUp={powerUp} />
      ))}
      
      <ParticleSystem particles={particles} />
    </group>
  );
}
