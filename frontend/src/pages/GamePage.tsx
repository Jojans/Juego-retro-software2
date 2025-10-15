import React, { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { GameEngine } from '../game/GameEngine';

const GamePage: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const { state: gameState, startGame, pauseGame, resumeGame, gameOver, victory, updateLives, addScore, updateLevel, updateWave } = useGame();
  const { startSession, endSession, trackEvent } = useAnalytics();

  useEffect(() => {
    // Initialize game engine only once
    if (gameContainerRef.current && !gameEngineRef.current && !isInitializedRef.current) {
      console.log('GamePage: Initializing game engine');
      isInitializedRef.current = true;
      gameEngineRef.current = new GameEngine();
      gameEngineRef.current.init();
      
      // Auto-start the game when on /game page
      console.log('GamePage: Auto-starting game');
      startGame();
    }

    // Don't cleanup on every render - only on unmount
    return () => {
      // Only cleanup when component is actually unmounting
      if (gameEngineRef.current && isInitializedRef.current) {
        console.log('GamePage: Component unmounting, destroying game engine');
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Listen for game events
  useEffect(() => {
    if (gameEngineRef.current) {
      const gameEngine = gameEngineRef.current;
      
      // Listen for player hit events
      const handlePlayerHit = (lives: number) => {
        console.log('GamePage: Player hit, updating lives to:', lives);
        updateLives(lives);
      };
      
      // Listen for score update events
      const handleScoreUpdate = (data: { score: number, points: number }) => {
        console.log('GamePage: Score update received:', data);
        addScore(data.points);
      };
      
      // Listen for level update events
      const handleLevelUpdate = (level: number) => {
        console.log('GamePage: Level update received:', level);
        updateLevel(level);
      };
      
      // Listen for wave update events
      const handleWaveUpdate = (wave: number) => {
        console.log('GamePage: Wave update received:', wave);
        updateWave(wave);
      };
      
      // Listen for game over events
      const handleGameOver = () => {
        console.log('GamePage: Game over event received');
        gameOver();
      };
      
      // Listen for victory events
      const handleVictory = () => {
        console.log('GamePage: Victory event received');
        victory();
      };
      
      // Add event listeners
      gameEngine.on('player-hit', handlePlayerHit);
      gameEngine.on('scoreUpdate', handleScoreUpdate);
      gameEngine.on('levelUpdate', handleLevelUpdate);
      gameEngine.on('waveUpdate', handleWaveUpdate);
      gameEngine.on('game-over', handleGameOver);
      gameEngine.on('victory', handleVictory);
      
      return () => {
        // Remove event listeners
        gameEngine.off('player-hit', handlePlayerHit);
        gameEngine.off('scoreUpdate', handleScoreUpdate);
        gameEngine.off('levelUpdate', handleLevelUpdate);
        gameEngine.off('waveUpdate', handleWaveUpdate);
        gameEngine.off('game-over', handleGameOver);
        gameEngine.off('victory', handleVictory);
      };
    }
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && gameEngineRef.current) {
      // Only start if not already started
      if (!gameEngineRef.current.isGameStarted()) {
        gameEngineRef.current.startGame();
        startSession('normal');
      }
    }
  }, [gameState.isPlaying]); // Removed startSession from dependencies

  useEffect(() => {
    if (gameState.isPaused && gameEngineRef.current) {
      gameEngineRef.current.pauseGame();
    } else if (!gameState.isPaused && gameEngineRef.current) {
      gameEngineRef.current.resumeGame();
    }
  }, [gameState.isPaused]);

  useEffect(() => {
    if (gameState.isGameOver && gameEngineRef.current) {
      gameEngineRef.current.showGameOver(gameState.score, gameState.level);
      endSession(false);
    }
  }, [gameState.isGameOver, gameState.score, gameState.level]); // Removed endSession from dependencies

  useEffect(() => {
    if (gameState.isVictory && gameEngineRef.current) {
      gameEngineRef.current.showVictory(gameState.score, gameState.level);
      endSession(true);
    }
  }, [gameState.isVictory, gameState.score, gameState.level]); // Removed endSession from dependencies

  // Track game events
  useEffect(() => {
    if (gameState.enemiesKilled > 0) {
      trackEvent('enemy_killed', { count: gameState.enemiesKilled });
    }
  }, [gameState.enemiesKilled]); // Removed trackEvent from dependencies

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (gameState.isPaused) {
        resumeGame();
      } else {
        pauseGame();
      }
    }
  };

  return (
    <div 
      className="game-container"
      onKeyDown={handleKeyPress}
      tabIndex={0}
      autoFocus
    >
      <div className="game-wrapper">
        {/* Game Canvas */}
        <div 
          id="game-container" 
          ref={gameContainerRef}
          className="game-canvas"
        />
        
        {/* Center Messages Only */}
        {gameState.isPaused && (
          <div className="hud-center">
            <div className="game-message">PAUSED</div>
            <div className="text-sm mt-4">Press ESC to resume</div>
          </div>
        )}

        {gameState.isVictory && (
          <div className="hud-center">
            <div className="game-message victory">VICTORY!</div>
            <div className="text-sm mt-4">Score: {gameState.score.toLocaleString()}</div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GamePage;
