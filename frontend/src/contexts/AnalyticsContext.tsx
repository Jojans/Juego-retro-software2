import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface GameSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  score: number;
  level: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  deaths: number;
  difficulty: string;
  completed: boolean;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  totalTimePlayed: number;
  totalEnemiesKilled: number;
  totalPowerUpsCollected: number;
  favoriteDifficulty: string;
  winRate: number;
  averageLevelReached: number;
  longestStreak: number;
  currentStreak: number;
}

export interface GameEvent {
  id: string;
  sessionId: string;
  userId: string;
  type: 'enemy_killed' | 'powerup_collected' | 'level_completed' | 'death' | 'boss_defeated' | 'achievement_unlocked' | 'leaderboard_viewed' | 'leaderboard_error';
  timestamp: number;
  data: Record<string, any>;
}

export interface AnalyticsState {
  currentSession: GameSession | null;
  playerStats: PlayerStats | null;
  events: GameEvent[];
  isLoading: boolean;
  error: string | null;
}

// Actions
type AnalyticsAction =
  | { type: 'START_SESSION'; payload: GameSession }
  | { type: 'END_SESSION'; payload: { endTime: number; completed: boolean } }
  | { type: 'UPDATE_SESSION'; payload: Partial<GameSession> }
  | { type: 'ADD_EVENT'; payload: GameEvent }
  | { type: 'LOAD_STATS'; payload: PlayerStats }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial State
const initialState: AnalyticsState = {
  currentSession: null,
  playerStats: null,
  events: [],
  isLoading: false,
  error: null,
};

// Reducer
const analyticsReducer = (state: AnalyticsState, action: AnalyticsAction): AnalyticsState => {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        events: [],
        error: null,
      };

    case 'END_SESSION':
      return {
        ...state,
        currentSession: state.currentSession ? {
          ...state.currentSession,
          endTime: action.payload.endTime,
          duration: action.payload.endTime - state.currentSession.startTime,
          completed: action.payload.completed,
        } : null,
      };

    case 'UPDATE_SESSION':
      return {
        ...state,
        currentSession: state.currentSession ? {
          ...state.currentSession,
          ...action.payload,
        } : null,
      };

    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'LOAD_STATS':
      return {
        ...state,
        playerStats: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
interface AnalyticsContextType {
  state: AnalyticsState;
  startSession: (difficulty: string) => void;
  endSession: (completed: boolean) => void;
  updateSession: (updates: Partial<GameSession>) => void;
  trackEvent: (type: GameEvent['type'], data: Record<string, any>) => void;
  loadPlayerStats: () => Promise<void>;
  clearError: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Provider
interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  const startSession = (difficulty: string) => {
    const session: GameSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'anonymous', // Will be updated when user logs in
      startTime: Date.now(),
      score: 0,
      level: 1,
      enemiesKilled: 0,
      powerUpsCollected: 0,
      deaths: 0,
      difficulty,
      completed: false,
    };

    dispatch({ type: 'START_SESSION', payload: session });
  };

  const endSession = (completed: boolean) => {
    if (state.currentSession) {
      dispatch({ type: 'END_SESSION', payload: { endTime: Date.now(), completed } });
      
      // Send session data to backend
      sendSessionData(state.currentSession, completed);
    }
  };

  const updateSession = (updates: Partial<GameSession>) => {
    dispatch({ type: 'UPDATE_SESSION', payload: updates });
  };

  const trackEvent = (type: GameEvent['type'], data: Record<string, any>) => {
    if (!state.currentSession) return;

    const event: GameEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: state.currentSession.id,
      userId: state.currentSession.userId,
      type,
      timestamp: Date.now(),
      data,
    };

    dispatch({ type: 'ADD_EVENT', payload: event });
    
    // Send event to backend
    sendEventData(event);
  };

  const loadPlayerStats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/analytics/stats`);
      if (response.ok) {
        const stats = await response.json();
        dispatch({ type: 'LOAD_STATS', payload: stats });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load stats' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Helper functions to send data to backend
  const sendSessionData = async (session: GameSession, completed: boolean) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/analytics/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...session,
          completed,
        }),
      });
    } catch (error) {
      console.log('Analytics: Backend not available, session data not sent');
    }
  };

  const sendEventData = async (event: GameEvent) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.log('Analytics: Backend not available, event data not sent');
    }
  };

  const value: AnalyticsContextType = {
    state,
    startSession,
    endSession,
    updateSession,
    trackEvent,
    loadPlayerStats,
    clearError,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
