import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "paused" | "gameOver";

export interface Enemy {
  id: string;
  position: [number, number, number];
  type: 'basic' | 'fast' | 'tank' | 'boss';
  health: number;
  maxHealth: number;
  speed: number;
  lastShot: number;
  direction: number;
}

export interface Bullet {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  isPlayerBullet: boolean;
  damage: number;
}

export interface PowerUp {
  id: string;
  position: [number, number, number];
  type: 'rapidFire' | 'shield' | 'bomb' | 'multiShot';
  velocity: [number, number, number];
}

export interface Particle {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface SpaceGameState {
  gameState: GameState;
  score: number;
  level: number;
  lives: number;
  highScore: number;
  
  // Player state
  playerPosition: [number, number, number];
  playerHealth: number;
  playerMaxHealth: number;
  playerShield: number;
  weaponLevel: number;
  lastPlayerShot: number;
  
  // Game objects
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
  
  // Power-up effects
  rapidFireUntil: number;
  multiShotUntil: number;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  restartGame: () => void;
  
  // Player actions
  movePlayer: (x: number) => void;
  setPlayerPosition: (position: [number, number, number]) => void;
  playerShoot: () => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  addShield: (amount: number) => void;
  
  // Game object management
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  updateBullets: (bullets: Bullet[]) => void;
  addPowerUp: (powerUp: PowerUp) => void;
  removePowerUp: (id: string) => void;
  collectPowerUp: (powerUp: PowerUp) => void;
  addParticles: (particles: Particle[]) => void;
  updateParticles: (particles: Particle[]) => void;
  
  // Score and progression
  addScore: (points: number) => void;
  nextLevel: () => void;
  addLife: () => void;
  removeLife: () => void;
}

export const useSpaceGame = create<SpaceGameState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    score: 0,
    level: 1,
    lives: 3,
    highScore: parseInt(localStorage.getItem('spaceInvadersHighScore') || '0'),
    
    // Player initial state
    playerPosition: [0, -4, 0],
    playerHealth: 100,
    playerMaxHealth: 100,
    playerShield: 0,
    weaponLevel: 1,
    lastPlayerShot: 0,
    
    // Game objects
    enemies: [],
    bullets: [],
    powerUps: [],
    particles: [],
    
    // Power-up effects
    rapidFireUntil: 0,
    multiShotUntil: 0,
    
    startGame: () => set({ 
      gameState: "playing",
      score: 0,
      level: 1,
      lives: 3,
      playerPosition: [0, -4, 0],
      playerHealth: 100,
      playerShield: 0,
      weaponLevel: 1,
      enemies: [],
      bullets: [],
      powerUps: [],
      particles: [],
      rapidFireUntil: 0,
      multiShotUntil: 0,
      lastPlayerShot: 0
    }),
    
    pauseGame: () => set((state) => ({ 
      gameState: state.gameState === "playing" ? "paused" : state.gameState 
    })),
    
    resumeGame: () => set((state) => ({ 
      gameState: state.gameState === "paused" ? "playing" : state.gameState 
    })),
    
    gameOver: () => set((state) => {
      const newHighScore = Math.max(state.score, state.highScore);
      localStorage.setItem('spaceInvadersHighScore', newHighScore.toString());
      return { gameState: "gameOver", highScore: newHighScore };
    }),
    
    restartGame: () => {
      const { startGame } = get();
      startGame();
    },
    
    movePlayer: (x: number) => set((state) => ({
      playerPosition: [
        Math.max(-7, Math.min(7, state.playerPosition[0] + x)), 
        state.playerPosition[1], 
        state.playerPosition[2]
      ]
    })),
    
    setPlayerPosition: (position) => set({ playerPosition: position }),
    
    playerShoot: () => set((state) => {
      const now = Date.now();
      const fireRate = state.rapidFireUntil > now ? 100 : 200;
      
      if (now - state.lastPlayerShot < fireRate) return {};
      
      const bullets: Bullet[] = [];
      const multiShot = state.multiShotUntil > now || state.weaponLevel >= 3;
      
      if (multiShot) {
        // Multi-shot
        bullets.push({
          id: `bullet-${now}-0`,
          position: [state.playerPosition[0] - 0.3, state.playerPosition[1] + 0.5, state.playerPosition[2]],
          velocity: [0, 0.3, 0],
          isPlayerBullet: true,
          damage: 20 + (state.weaponLevel * 5)
        });
        bullets.push({
          id: `bullet-${now}-1`,
          position: [state.playerPosition[0], state.playerPosition[1] + 0.5, state.playerPosition[2]],
          velocity: [0, 0.3, 0],
          isPlayerBullet: true,
          damage: 20 + (state.weaponLevel * 5)
        });
        bullets.push({
          id: `bullet-${now}-2`,
          position: [state.playerPosition[0] + 0.3, state.playerPosition[1] + 0.5, state.playerPosition[2]],
          velocity: [0, 0.3, 0],
          isPlayerBullet: true,
          damage: 20 + (state.weaponLevel * 5)
        });
      } else {
        // Single shot
        bullets.push({
          id: `bullet-${now}`,
          position: [state.playerPosition[0], state.playerPosition[1] + 0.5, state.playerPosition[2]],
          velocity: [0, 0.3, 0],
          isPlayerBullet: true,
          damage: 20 + (state.weaponLevel * 5)
        });
      }
      
      return {
        bullets: [...state.bullets, ...bullets],
        lastPlayerShot: now
      };
    }),
    
    takeDamage: (damage) => set((state) => {
      let actualDamage = damage;
      let newShield = state.playerShield;
      
      if (state.playerShield > 0) {
        if (damage <= state.playerShield) {
          newShield = state.playerShield - damage;
          actualDamage = 0;
        } else {
          actualDamage = damage - state.playerShield;
          newShield = 0;
        }
      }
      
      const newHealth = Math.max(0, state.playerHealth - actualDamage);
      
      return {
        playerHealth: newHealth,
        playerShield: newShield
      };
    }),
    
    heal: (amount) => set((state) => ({
      playerHealth: Math.min(state.playerMaxHealth, state.playerHealth + amount)
    })),
    
    addShield: (amount) => set((state) => ({
      playerShield: Math.min(100, state.playerShield + amount)
    })),
    
    addEnemy: (enemy) => set((state) => ({
      enemies: [...state.enemies, enemy]
    })),
    
    removeEnemy: (id) => set((state) => ({
      enemies: state.enemies.filter(e => e.id !== id)
    })),
    
    updateEnemies: (enemies) => set({ enemies }),
    
    addBullet: (bullet) => set((state) => ({
      bullets: [...state.bullets, bullet]
    })),
    
    removeBullet: (id) => set((state) => ({
      bullets: state.bullets.filter(b => b.id !== id)
    })),
    
    updateBullets: (bullets) => set({ bullets }),
    
    addPowerUp: (powerUp) => set((state) => ({
      powerUps: [...state.powerUps, powerUp]
    })),
    
    removePowerUp: (id) => set((state) => ({
      powerUps: state.powerUps.filter(p => p.id !== id)
    })),
    
    collectPowerUp: (powerUp) => set((state) => {
      const now = Date.now();
      let updates: Partial<SpaceGameState> = {};
      
      switch (powerUp.type) {
        case 'rapidFire':
          updates.rapidFireUntil = now + 10000; // 10 seconds
          break;
        case 'shield':
          updates.playerShield = Math.min(100, state.playerShield + 50);
          break;
        case 'bomb':
          // Clear all enemies and bullets
          updates.enemies = [];
          updates.bullets = state.bullets.filter(b => b.isPlayerBullet);
          break;
        case 'multiShot':
          updates.multiShotUntil = now + 15000; // 15 seconds
          break;
      }
      
      return {
        ...updates,
        powerUps: state.powerUps.filter(p => p.id !== powerUp.id),
        score: state.score + 100
      };
    }),
    
    addParticles: (particles) => set((state) => ({
      particles: [...state.particles, ...particles]
    })),
    
    updateParticles: (particles) => set({ particles }),
    
    addScore: (points) => set((state) => ({
      score: state.score + points
    })),
    
    nextLevel: () => set((state) => ({
      level: state.level + 1,
      enemies: [],
      bullets: state.bullets.filter(b => b.isPlayerBullet),
      powerUps: []
    })),
    
    addLife: () => set((state) => ({
      lives: state.lives + 1
    })),
    
    removeLife: () => set((state) => {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        get().gameOver();
      }
      return { lives: newLives };
    })
  }))
);
