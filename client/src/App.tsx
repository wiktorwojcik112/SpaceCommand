import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useSpaceGame } from "./lib/stores/useSpaceGame";
import "@fontsource/inter";

import SpaceInvaders from "./components/Game/SpaceInvaders";
import StartScreen from "./components/Game/StartScreen";
import GameUI from "./components/Game/GameUI";
import TouchControls from "./components/Game/TouchControls";
import { useIsMobile } from "./hooks/use-is-mobile";

// Define control keys for the game
const controls = [
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "up", keys: ["KeyW", "ArrowUp"] },
  { name: "down", keys: ["KeyS", "ArrowDown"] },
  { name: "shoot", keys: ["Space"] },
  { name: "pause", keys: ["KeyP", "Escape"] },
];

function App() {
  const { gameState } = useSpaceGame();
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted } = useAudio();
  const [showCanvas, setShowCanvas] = useState(false);
  const isMobile = useIsMobile();

  // Initialize audio
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.4;
    setSuccessSound(successAudio);

    setShowCanvas(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Handle background music
  useEffect(() => {
    const { backgroundMusic } = useAudio.getState();
    if (backgroundMusic) {
      if (gameState === 'playing' && !isMuted) {
        backgroundMusic.play().catch(console.error);
      } else {
        backgroundMusic.pause();
      }
    }
  }, [gameState, isMuted]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #0a0a23 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          {gameState === 'menu' && <StartScreen />}
          
          {(gameState === 'playing' || gameState === 'paused' || gameState === 'gameOver') && (
            <>
              <Canvas
                shadows
                camera={{
                  position: [0, 0, 10],
                  fov: 75,
                  near: 0.1,
                  far: 1000
                }}
                gl={{
                  antialias: true,
                  powerPreference: "high-performance"
                }}
              >
                <Suspense fallback={null}>
                  <SpaceInvaders />
                </Suspense>
              </Canvas>
              <GameUI />
              {isMobile && <TouchControls />}
            </>
          )}
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
