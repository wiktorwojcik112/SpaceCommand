import * as THREE from "three";
import { Enemy } from "./stores/useSpaceGame";

export function checkCollision(
  pos1: [number, number, number], 
  size1: number,
  pos2: [number, number, number], 
  size2: number
): boolean {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (size1 + size2);
}

export function createExplosionParticles(
  position: [number, number, number],
  count: number = 15,
  color: string = '#ff4444'
) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 0.05 + Math.random() * 0.1;
    const life = 0.5 + Math.random() * 0.5;
    
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      position: [...position] as [number, number, number],
      velocity: [
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 0.02
      ] as [number, number, number],
      life,
      maxLife: life,
      color,
      size: 0.1 + Math.random() * 0.1
    });
  }
  return particles;
}

export function getEnemyPatterns() {
  return {
    basic: {
      health: 20,
      speed: 0.01,
      score: 10,
      shootChance: 0.002
    },
    fast: {
      health: 15,
      speed: 0.02,
      score: 20,
      shootChance: 0.001
    },
    tank: {
      health: 50,
      speed: 0.005,
      score: 50,
      shootChance: 0.003
    },
    boss: {
      health: 200,
      speed: 0.008,
      score: 500,
      shootChance: 0.005
    },
    bossShield: {
      health: 300,
      speed: 0.01,
      score: 800,
      shootChance: 0.004
    },
    bossRapid: {
      health: 250,
      speed: 0.012,
      score: 700,
      shootChance: 0.008
    },
    bossTank: {
      health: 400,
      speed: 0.006,
      score: 1000,
      shootChance: 0.006
    }
  };
}

export function createWaveEnemies(level: number): Enemy[] {
  const enemies: Enemy[] = [];
  const patterns = getEnemyPatterns();
  
  // Boss levels - every 5 levels spawn a special boss
  if (level % 5 === 0) {
    const bossTypes: Array<'boss' | 'bossShield' | 'bossRapid' | 'bossTank'> = ['boss', 'bossShield', 'bossRapid', 'bossTank'];
    const bossType = bossTypes[Math.floor(level / 5) % bossTypes.length];
    const pattern = patterns[bossType];
    
    enemies.push({
      id: `boss-${level}`,
      position: [0, 4, 0] as [number, number, number],
      type: bossType,
      health: pattern.health + Math.floor(level / 5) * 50,
      maxHealth: pattern.health + Math.floor(level / 5) * 50,
      speed: pattern.speed * (1 + level * 0.05),
      lastShot: 0,
      direction: 1,
      bossPhase: 1,
      shieldActive: bossType === 'bossShield'
    });
    
    // Add some support enemies for boss levels
    const supportCount = Math.min(6, 2 + Math.floor(level / 10));
    for (let i = 0; i < supportCount; i++) {
      const x = (i - (supportCount - 1) / 2) * 2;
      enemies.push({
        id: `support-${i}`,
        position: [x, 2, 0] as [number, number, number],
        type: 'fast',
        health: patterns.fast.health + Math.floor(level / 3) * 5,
        maxHealth: patterns.fast.health + Math.floor(level / 3) * 5,
        speed: patterns.fast.speed * (1 + level * 0.1),
        lastShot: 0,
        direction: 1
      });
    }
  } else {
    // Normal wave structure
    const baseEnemyCount = 8 + Math.floor(level / 2);
    const rows = Math.min(5, 2 + Math.floor(level / 3));
    
    for (let row = 0; row < rows; row++) {
      const enemiesInRow = Math.max(4, baseEnemyCount - row * 2);
      const rowY = 3 + row * 1.2;
      
      for (let col = 0; col < enemiesInRow; col++) {
        const x = (col - (enemiesInRow - 1) / 2) * 1.5;
        
        let type: 'basic' | 'fast' | 'tank' = 'basic';
        
        // Determine enemy type based on level and position
        if (level >= 3 && Math.random() < 0.3) {
          type = 'fast';
        }
        if (level >= 5 && Math.random() < 0.2) {
          type = 'tank';
        }
        
        const pattern = patterns[type];
        
        enemies.push({
          id: `enemy-${row}-${col}`,
          position: [x, rowY, 0] as [number, number, number],
          type,
          health: pattern.health + Math.floor(level / 3) * 5,
          maxHealth: pattern.health + Math.floor(level / 3) * 5,
          speed: pattern.speed * (1 + level * 0.1),
          lastShot: 0,
          direction: 1
        });
      }
    }
  }
  
  return enemies;
}

export function updateGameLogic(deltaTime: number) {
  // This will be called from the main game loop
  // Handle enemy movement, collision detection, etc.
}

export const GAME_BOUNDS = {
  LEFT: -8,
  RIGHT: 8,
  TOP: 6,
  BOTTOM: -6
};

export function isOutOfBounds(position: [number, number, number]): boolean {
  return position[0] < GAME_BOUNDS.LEFT || 
         position[0] > GAME_BOUNDS.RIGHT || 
         position[1] < GAME_BOUNDS.BOTTOM || 
         position[1] > GAME_BOUNDS.TOP;
}
