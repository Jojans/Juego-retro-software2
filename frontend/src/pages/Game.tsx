import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/scenes/GameScene';
import { MenuScene } from '../game/scenes/MenuScene';
import { GameOverScene } from '../game/scenes/GameOverScene';
import './Game.css';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 600,
        height: 650,
        parent: gameRef.current,
        backgroundColor: '#000000',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: [MenuScene, GameScene, GameOverScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  const startGame = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.start('GameScene');
      setGameStarted(true);
      setGameOver(false);
    }
  };

  const resetGame = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.start('MenuScene');
      setGameStarted(false);
      setGameOver(false);
      setScore(0);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Space Arcade Game</h1>
        {!gameStarted && !gameOver && (
          <button className="btn btn-primary" onClick={startGame}>
            🎮 Iniciar Juego
          </button>
        )}
        {(gameStarted || gameOver) && (
          <button className="btn btn-secondary" onClick={resetGame}>
            🔄 Reiniciar
          </button>
        )}
      </div>
      
      <div className="game-wrapper">
        <div ref={gameRef} className="game-canvas" />
      </div>
      
      <div className="game-info">
        <h2>Controles del Juego</h2>
        <div className="controls">
          <div className="control-item">
            <h4>🎮 Movimiento</h4>
            <p>← → Flechas direccionales</p>
            <p>W A S D (alternativo)</p>
          </div>
          <div className="control-item">
            <h4>🔫 Disparo</h4>
            <p>ESPACIO - Disparar</p>
            <p>Mantén presionado para disparo continuo</p>
          </div>
          <div className="control-item">
            <h4>⚡ Poder Especial</h4>
            <p>C - Activar poder especial</p>
            <p>Doble daño por 5 segundos</p>
          </div>
          <div className="control-item">
            <h4>⏸️ Pausa</h4>
            <p>P o ESC - Pausar/Reanudar</p>
            <p>Pausa el juego en cualquier momento</p>
          </div>
        </div>
        
        <div className="game-objective">
          <h3>🎯 Objetivo del Juego</h3>
          <ul>
            <li>Elimina todos los enemigos de cada oleada</li>
            <li>Supervive el mayor tiempo posible</li>
            <li>Consigue la máxima puntuación</li>
            <li>Derrota al jefe cada 5 oleadas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Game;
