import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { startGame } = useGame();

  const handleStartGame = () => {
    startGame();
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Game Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold neon-text animate-pulse-neon">
            SPACE ARCADE
          </h1>
          <p className="text-xl text-neon-cyan font-arcade">
            Defend Earth from the Alien Invasion
          </p>
        </div>

        {/* Main Menu */}
        <div className="space-y-4">
          <button
            onClick={handleStartGame}
            className="neon-button text-2xl px-8 py-4 block mx-auto"
          >
            START GAME
          </button>
        </div>

        {/* Controls Info */}
        <div className="mt-16 hud-container max-w-md mx-auto">
          <h3 className="text-lg font-bold text-neon-cyan mb-4">Controls</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold">Movement:</p>
              <p>Arrow Keys / WASD</p>
            </div>
            <div>
              <p className="font-bold">Shoot:</p>
              <p>Space Bar</p>
            </div>
            <div>
              <p className="font-bold">Special Power:</p>
              <p className="text-neon-green">C</p>
            </div>
            <div>
              <p className="font-bold">Pause:</p>
              <p>P / ESC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
