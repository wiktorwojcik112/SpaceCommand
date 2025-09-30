import { useRef, useCallback } from "react";
import { useSpaceGame } from "../../lib/stores/useSpaceGame";
import { Button } from "../ui/button";

export default function TouchControls() {
  const { movePlayer, playerShoot } = useSpaceGame();
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMoving = useCallback((direction: 'left' | 'right') => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    
    moveIntervalRef.current = setInterval(() => {
      movePlayer(direction === 'left' ? -0.2 : 0.2);
    }, 16); // ~60fps
  }, [movePlayer]);

  const stopMoving = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }, []);

  const handleShoot = useCallback(() => {
    playerShoot();
  }, [playerShoot]);

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-between items-end px-4 pointer-events-none z-50">
      {/* Movement Controls */}
      <div className="flex gap-4 pointer-events-auto">
        <Button
          variant="outline"
          size="lg"
          className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-gray-800 active:bg-gray-700 touch-manipulation"
          onTouchStart={() => startMoving('left')}
          onTouchEnd={stopMoving}
          onMouseDown={() => startMoving('left')}
          onMouseUp={stopMoving}
          onMouseLeave={stopMoving}
        >
          ←
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-gray-800 active:bg-gray-700 touch-manipulation"
          onTouchStart={() => startMoving('right')}
          onTouchEnd={stopMoving}
          onMouseDown={() => startMoving('right')}
          onMouseUp={stopMoving}
          onMouseLeave={stopMoving}
        >
          →
        </Button>
      </div>

      {/* Shoot Button */}
      <div className="pointer-events-auto">
        <Button
          variant="outline"
          size="lg"
          className="bg-red-600 bg-opacity-70 border-red-500 text-white hover:bg-red-700 active:bg-red-800 touch-manipulation px-8"
          onTouchStart={handleShoot}
          onMouseDown={handleShoot}
        >
          FIRE
        </Button>
      </div>
    </div>
  );
}
