import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  level: number;
  createdAt: string;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend first
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/leaderboard`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
          trackEvent('leaderboard_viewed', { entries_count: data.length });
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, using localStorage');
      }
      
      // Fallback to localStorage
      const leaderboardKey = 'space_arcade_leaderboard';
      const storedData = localStorage.getItem(leaderboardKey);
      if (storedData) {
        const data = JSON.parse(storedData);
        setLeaderboard(data);
        trackEvent('leaderboard_viewed', { entries_count: data.length });
      } else {
        setLeaderboard([]);
        trackEvent('leaderboard_viewed', { entries_count: 0 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      trackEvent('leaderboard_error', { error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-neon-cyan text-xl font-arcade animate-pulse">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-red-400 text-xl font-arcade text-center">
          <p>Error loading leaderboard</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="mt-4 px-6 py-2 bg-neon-cyan text-space-blue rounded-lg font-arcade hover:bg-opacity-80 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-gradient py-8">
      <div className="container mx-auto px-4">
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-space-dark bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center font-arcade text-neon-yellow">
              <div>RANK</div>
              <div>PLAYER</div>
              <div>SCORE</div>
            </div>
            
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg transition-all hover:bg-opacity-70 ${
                    index === 0 ? 'bg-yellow-500 bg-opacity-20 border-2 border-yellow-400' :
                    index === 1 ? 'bg-gray-400 bg-opacity-20 border-2 border-gray-300' :
                    index === 2 ? 'bg-orange-500 bg-opacity-20 border-2 border-orange-400' :
                    'bg-space-purple bg-opacity-30 border border-neon-cyan'
                  }`}
                >
                  <div className="text-center font-arcade text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="text-center font-arcade text-neon-cyan">
                    {entry.username}
                  </div>
                  <div className="text-center font-arcade text-neon-green">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            {leaderboard.length === 0 && (
              <div className="text-center text-gray-400 font-arcade py-8">
                No scores yet. Be the first to play!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
