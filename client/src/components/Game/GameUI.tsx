import { useSpaceGame } from "../../lib/stores/useSpaceGame";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Pause, Play, VolumeOff, VolumeX } from "lucide-react";

export default function GameUI() {
  const { 
    gameState, 
    score, 
    level, 
    lives, 
    highScore,
    playerHealth,
    playerMaxHealth,
    playerShield,
    weaponLevel,
    rapidFireUntil,
    multiShotUntil,
    laserUntil,
    timeSlowUntil,
    pauseGame,
    resumeGame,
    restartGame,
    startGame
  } = useSpaceGame();
  
  const { isMuted, toggleMute } = useAudio();

  const healthPercentage = (playerHealth / playerMaxHealth) * 100;
  const now = Date.now();
  const hasRapidFire = rapidFireUntil > now;
  const hasMultiShot = multiShotUntil > now;
  const hasLaser = laserUntil > now;
  const hasTimeSlow = timeSlowUntil > now;

  if (gameState === 'gameOver') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
          <CardContent className="pt-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
            <div className="space-y-2 mb-6 text-gray-300">
              <p>Final Score: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></p>
              <p>Level Reached: <span className="text-blue-400 font-bold">{level}</span></p>
              <p>High Score: <span className="text-green-400 font-bold">{highScore.toLocaleString()}</span></p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={restartGame}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Play Again
              </Button>
              <Button 
                onClick={startGame}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Main Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Score and Level */}
        <div className="pointer-events-auto">
          <Card className="bg-black bg-opacity-50 border-gray-600">
            <CardContent className="p-3">
              <div className="text-white space-y-1">
                <div className="text-sm">Score: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></div>
                <div className="text-sm">Level: <span className="text-blue-400 font-bold">{level}</span></div>
                <div className="text-sm">High: <span className="text-green-400 font-bold">{highScore.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-gray-800"
          >
            {isMuted ? <VolumeX size={16} /> : <VolumeOff size={16} />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={gameState === 'playing' ? pauseGame : resumeGame}
            className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-gray-800"
          >
            {gameState === 'playing' ? <Pause size={16} /> : <Play size={16} />}
          </Button>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-end">
          {/* Lives and Health */}
          <div className="pointer-events-auto">
            <Card className="bg-black bg-opacity-50 border-gray-600">
              <CardContent className="p-3">
                <div className="text-white space-y-2">
                  <div className="text-sm">Lives: <span className="text-red-400 font-bold">{lives}</span></div>
                  
                  {/* Health Bar */}
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        healthPercentage > 60 ? 'bg-green-500' : 
                        healthPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">Health: {playerHealth}/{playerMaxHealth}</div>
                  
                  {/* Shield Bar */}
                  {playerShield > 0 && (
                    <>
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${playerShield}%` }}
                        />
                      </div>
                      <div className="text-xs text-blue-400">Shield: {playerShield}</div>
                    </>
                  )}
                  
                  {/* Weapon Level */}
                  {weaponLevel > 1 && (
                    <div className="text-xs text-yellow-400">Weapon Lvl: {weaponLevel}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Power-up Status */}
          {(hasRapidFire || hasMultiShot || hasLaser || hasTimeSlow) && (
            <div className="pointer-events-auto">
              <Card className="bg-black bg-opacity-50 border-gray-600">
                <CardContent className="p-3">
                  <div className="text-white space-y-1">
                    <div className="text-sm font-bold text-orange-400 mb-2">Active Power-ups</div>
                    {hasRapidFire && (
                      <div className="text-xs text-orange-300">
                        Rapid Fire: {Math.ceil((rapidFireUntil - now) / 1000)}s
                      </div>
                    )}
                    {hasMultiShot && (
                      <div className="text-xs text-green-300">
                        Multi Shot: {Math.ceil((multiShotUntil - now) / 1000)}s
                      </div>
                    )}
                    {hasLaser && (
                      <div className="text-xs text-purple-300">
                        Laser: {Math.ceil((laserUntil - now) / 1000)}s
                      </div>
                    )}
                    {hasTimeSlow && (
                      <div className="text-xs text-cyan-300">
                        Time Slow: {Math.ceil((timeSlowUntil - now) / 1000)}s
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Pause Screen */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center pointer-events-auto">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Game Paused</h2>
              <div className="space-y-2 text-gray-300 mb-6">
                <p>Press P or ESC to resume</p>
                <p>Use WASD or Arrow Keys to move</p>
                <p>Press SPACE to shoot</p>
              </div>
              <Button 
                onClick={resumeGame}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Resume Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
