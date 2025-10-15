import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { leaderboardService } from '../services/LeaderboardService';

// Types
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  score: number;
  level: number;
  lives: number;
  powerUps: PowerUp[];
  currentWave: number;
  enemiesKilled: number;
  timePlayed: number;
  gameStartTime: number | null;
}

export interface PowerUp {
  id: string;
  type: 'shield' | 'rapid-fire' | 'multi-shot' | 'bomb' | 'health';
  duration: number;
  level: number;
  active: boolean;
}


// Actions
type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'UPDATE_LEVEL'; payload: number }
  | { type: 'UPDATE_LIVES'; payload: number }
  | { type: 'ADD_POWERUP'; payload: PowerUp }
  | { type: 'REMOVE_POWERUP'; payload: string }
  | { type: 'UPDATE_POWERUP'; payload: PowerUp }
  | { type: 'UPDATE_WAVE'; payload: number }
  | { type: 'ENEMY_KILLED' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_TIME' };

// Initial State
const initialState: GameState = {
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  isVictory: false,
  score: 0,
  level: 1,
  lives: 3,
  powerUps: [],
  currentWave: 1,
  enemiesKilled: 0,
  timePlayed: 0,
  gameStartTime: null,
};

// Reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        isVictory: false,
        score: 0,
        level: 1,
        lives: 3,
        powerUps: [],
        currentWave: 1,
        enemiesKilled: 0,
        timePlayed: 0,
        gameStartTime: Date.now(),
      };

    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: true,
      };

    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false,
      };

    case 'GAME_OVER':
      return {
        ...state,
        isPlaying: false,
        isGameOver: true,
        gameStartTime: null,
      };

    case 'VICTORY':
      return {
        ...state,
        isPlaying: false,
        isVictory: true,
        gameStartTime: null,
      };

    case 'UPDATE_SCORE':
      return {
        ...state,
        score: state.score + action.payload,
      };

    case 'UPDATE_LEVEL':
      return {
        ...state,
        level: action.payload,
      };

    case 'UPDATE_LIVES':
      return {
        ...state,
        lives: Math.max(0, action.payload),
      };

    case 'ADD_POWERUP':
      return {
        ...state,
        powerUps: [...state.powerUps, action.payload],
      };

    case 'REMOVE_POWERUP':
      return {
        ...state,
        powerUps: state.powerUps.filter(p => p.id !== action.payload),
      };

    case 'UPDATE_POWERUP':
      return {
        ...state,
        powerUps: state.powerUps.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'UPDATE_WAVE':
      return {
        ...state,
        currentWave: action.payload,
      };

    case 'ENEMY_KILLED':
      return {
        ...state,
        enemiesKilled: state.enemiesKilled + 1,
      };

    case 'RESET_GAME':
      return initialState;

    case 'UPDATE_TIME':
      return {
        ...state,
        timePlayed: state.gameStartTime ? Date.now() - state.gameStartTime : 0,
      };

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  victory: () => void;
  addScore: (points: number) => void;
  updateLevel: (level: number) => void;
  updateLives: (lives: number) => void;
  addPowerUp: (powerUp: PowerUp) => void;
  removePowerUp: (id: string) => void;
  updatePowerUp: (powerUp: PowerUp) => void;
  updateWave: (wave: number) => void;
  killEnemy: () => void;
  resetGame: () => void;
  updateTime: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = () => dispatch({ type: 'START_GAME' });
  const pauseGame = () => dispatch({ type: 'PAUSE_GAME' });
  const resumeGame = () => dispatch({ type: 'RESUME_GAME' });
  const gameOver = () => {
    console.log('GameContext: gameOver called, current score:', state.score);
    // Dispatch game over first to update UI
    dispatch({ type: 'GAME_OVER' });
    
    // Note: Leaderboard saving is now handled in GameOverScene
    console.log('GameContext: Game over - leaderboard will be handled in GameOverScene');
  };
  const victory = () => dispatch({ type: 'VICTORY' });
  const addScore = (points: number) => dispatch({ type: 'UPDATE_SCORE', payload: points });
  const updateLevel = (level: number) => dispatch({ type: 'UPDATE_LEVEL', payload: level });
  const updateLives = (lives: number) => dispatch({ type: 'UPDATE_LIVES', payload: lives });
  const addPowerUp = (powerUp: PowerUp) => dispatch({ type: 'ADD_POWERUP', payload: powerUp });
  const removePowerUp = (id: string) => dispatch({ type: 'REMOVE_POWERUP', payload: id });
  const updatePowerUp = (powerUp: PowerUp) => dispatch({ type: 'UPDATE_POWERUP', payload: powerUp });
  const updateWave = (wave: number) => dispatch({ type: 'UPDATE_WAVE', payload: wave });
  const killEnemy = () => dispatch({ type: 'ENEMY_KILLED' });
  const resetGame = () => dispatch({ type: 'RESET_GAME' });
  const updateTime = () => dispatch({ type: 'UPDATE_TIME' });

  const value: GameContextType = {
    state,
    dispatch,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    victory,
    addScore,
    updateLevel,
    updateLives,
    addPowerUp,
    removePowerUp,
    updatePowerUp,
    updateWave,
    killEnemy,
    resetGame,
    updateTime,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
