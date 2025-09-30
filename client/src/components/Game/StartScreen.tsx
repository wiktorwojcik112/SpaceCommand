import { useState } from "react";
import { useSpaceGame } from "../../lib/stores/useSpaceGame";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { VolumeOff, VolumeX, Play, Trophy } from "lucide-react";

export default function StartScreen() {
  const { startGame, highScore } = useSpaceGame();
  const { isMuted, toggleMute } = useAudio();
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            SPACE
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
            INVADERS
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            FUTURE
          </p>
        </div>

        {/* High Score */}
        {highScore > 0 && (
          <Card className="bg-black bg-opacity-50 border-yellow-500 mx-auto max-w-sm">
            <CardContent className="p-4 flex items-center justify-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <span className="text-yellow-400 font-bold">
                High Score: {highScore.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Main Menu */}
        {!showInstructions ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 items-center">
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold px-8 py-4 text-xl"
              >
                <Play className="mr-2" size={20} />
                START GAME
              </Button>
              
              <Button
                onClick={() => setShowInstructions(true)}
                variant="outline"
                size="lg"
                className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-3"
              >
                HOW TO PLAY
              </Button>
              
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                {isMuted ? <VolumeX size={16} /> : <VolumeOff size={16} />}
                {isMuted ? " Unmute" : " Mute"}
              </Button>
            </div>
          </div>
        ) : (
          /* Instructions */
          <Card className="bg-black bg-opacity-50 border-gray-600 mx-auto max-w-2xl">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">How to Play</h3>
              
              <div className="text-left space-y-4 text-gray-300">
                <div>
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Controls</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Move: WASD or Arrow Keys (Touch controls on mobile)</li>
                    <li>• Shoot: SPACE bar (FIRE button on mobile)</li>
                    <li>• Pause: P or ESC</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Power-ups</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <span className="text-orange-400">Rapid Fire</span>: Increased shooting speed</li>
                    <li>• <span className="text-blue-400">Shield</span>: Protective barrier</li>
                    <li>• <span className="text-red-400">Bomb</span>: Clears all enemies</li>
                    <li>• <span className="text-green-400">Multi Shot</span>: Shoot multiple bullets</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-pink-400 mb-2">Enemies</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <span className="text-red-400">Basic</span>: Standard enemy</li>
                    <li>• <span className="text-orange-400">Fast</span>: Quick moving</li>
                    <li>• <span className="text-purple-400">Tank</span>: Heavy armor</li>
                    <li>• <span className="text-red-500">Boss</span>: Powerful leader</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  <Play className="mr-2" size={16} />
                  Start Playing
                </Button>
                <Button
                  onClick={() => setShowInstructions(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back to Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
