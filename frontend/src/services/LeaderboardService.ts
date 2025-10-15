export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  level: number;
  wave: number;
  createdAt: string;
}

class LeaderboardService {
  private readonly STORAGE_KEY = 'space_arcade_leaderboard';
  private readonly MAX_ENTRIES = 100;

  // Get all leaderboard entries from localStorage
  getLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const entries = JSON.parse(stored) as LeaderboardEntry[];
      return entries.sort((a, b) => b.score - a.score); // Sort by score descending
    } catch (error) {
      console.error('Error loading leaderboard from localStorage:', error);
      return [];
    }
  }

  // Add a new score to the leaderboard
  addScore(username: string, score: number, level: number, wave: number): LeaderboardEntry {
    const entry: LeaderboardEntry = {
      id: this.generateId(),
      username: username.trim() || 'Anonymous',
      score,
      level,
      wave,
      createdAt: new Date().toISOString()
    };

    const leaderboard = this.getLeaderboard();
    leaderboard.push(entry);
    
    // Sort by score and keep only top entries
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_ENTRIES);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedLeaderboard));
      console.log(`Score added to leaderboard: ${username} - ${score} points`);
    } catch (error) {
      console.error('Error saving leaderboard to localStorage:', error);
    }

    return entry;
  }

  // Get top N scores
  getTopScores(count: number = 10): LeaderboardEntry[] {
    return this.getLeaderboard().slice(0, count);
  }

  // Check if a score qualifies for the leaderboard
  isHighScore(score: number): boolean {
    const leaderboard = this.getLeaderboard();
    if (leaderboard.length < this.MAX_ENTRIES) return true;
    
    const lowestScore = leaderboard[leaderboard.length - 1]?.score || 0;
    return score > lowestScore;
  }

  // Get player's rank for a given score
  getPlayerRank(score: number): number {
    const leaderboard = this.getLeaderboard();
    const higherScores = leaderboard.filter(entry => entry.score > score);
    return higherScores.length + 1;
  }

  // Clear all leaderboard data
  clearLeaderboard(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Leaderboard cleared');
  }

  // Export leaderboard data
  exportLeaderboard(): string {
    return JSON.stringify(this.getLeaderboard(), null, 2);
  }

  // Import leaderboard data
  importLeaderboard(data: string): boolean {
    try {
      const entries = JSON.parse(data) as LeaderboardEntry[];
      if (Array.isArray(entries)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
        console.log('Leaderboard imported successfully');
        return true;
      }
    } catch (error) {
      console.error('Error importing leaderboard:', error);
    }
    return false;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const leaderboardService = new LeaderboardService();



