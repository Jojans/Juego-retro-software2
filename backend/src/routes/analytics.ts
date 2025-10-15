import express from 'express';
import GameSession from '../models/GameSession';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// @route   GET /api/analytics/stats
// @desc    Get user's game statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await GameSession.getUserStats(req.userId!);
    
    if (stats.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalGames: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          totalTimePlayed: 0,
          totalEnemiesKilled: 0,
          totalPowerUpsCollected: 0,
          totalDeaths: 0,
          completedGames: 0,
          averageLevelReached: 0,
          longestStreak: 0,
          winRate: 0
        }
      });
    }

    const userStats = stats[0];
    const winRate = userStats.totalGames > 0 
      ? (userStats.completedGames / userStats.totalGames) * 100 
      : 0;

    res.json({
      success: true,
      stats: {
        ...userStats,
        winRate: Math.round(winRate * 100) / 100
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user statistics'
    });
  }
});

// @route   GET /api/analytics/global
// @desc    Get global analytics
// @access  Public
router.get('/global', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const analytics = await GameSession.getAnalytics(startDate, endDate);
    
    if (analytics.length === 0) {
      return res.json({
        success: true,
        analytics: {
          totalSessions: 0,
          uniquePlayers: 0,
          averageScore: 0,
          averageDuration: 0,
          completionRate: 0,
          difficultyDistribution: {}
        }
      });
    }

    const data = analytics[0];
    
    // Calculate difficulty distribution
    const difficultyCounts = data.difficultyDistribution.reduce((acc: any, difficulty: string) => {
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      analytics: {
        totalSessions: data.totalSessions,
        uniquePlayers: data.uniquePlayers,
        averageScore: Math.round(data.averageScore * 100) / 100,
        averageDuration: Math.round(data.averageDuration * 100) / 100,
        completionRate: Math.round(data.completionRate * 10000) / 100,
        difficultyDistribution: difficultyCounts
      }
    });
  } catch (error) {
    logger.error('Get global analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting global analytics'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get game trends over time
// @access  Public
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await GameSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          sessions: { $sum: 1 },
          totalScore: { $sum: '$score' },
          averageScore: { $avg: '$score' },
          completedSessions: { $sum: { $cond: ['$completed', 1, 0] } },
          uniquePlayers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          sessions: 1,
          totalScore: 1,
          averageScore: 1,
          completionRate: {
            $cond: [
              { $gt: ['$sessions', 0] },
              { $multiply: [{ $divide: ['$completedSessions', '$sessions'] }, 100] },
              0
            ]
          },
          uniquePlayers: { $size: '$uniquePlayers' }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({
      success: true,
      trends,
      period: `${days} days`
    });
  } catch (error) {
    logger.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting trends'
    });
  }
});

// @route   POST /api/analytics/sessions
// @desc    Record a game session (for analytics)
// @access  Public
router.post('/sessions', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      startTime,
      endTime,
      score,
      level,
      wave,
      enemiesKilled,
      powerUpsCollected,
      deaths,
      difficulty,
      completed
    } = req.body;

    // Create or update game session
    let gameSession = await GameSession.findOne({ sessionId });
    
    if (!gameSession) {
      gameSession = new GameSession({
        userId: userId || 'anonymous',
        sessionId,
        startTime: new Date(startTime),
        difficulty: difficulty || 'normal'
      });
    }

    // Update session data
    if (endTime) gameSession.endTime = new Date(endTime);
    if (score !== undefined) gameSession.score = score;
    if (level !== undefined) gameSession.level = level;
    if (wave !== undefined) gameSession.wave = wave;
    if (enemiesKilled !== undefined) gameSession.enemiesKilled = enemiesKilled;
    if (powerUpsCollected !== undefined) gameSession.powerUpsCollected = powerUpsCollected;
    if (deaths !== undefined) gameSession.deaths = deaths;
    if (completed !== undefined) gameSession.completed = completed;

    await gameSession.save();

    res.json({
      success: true,
      message: 'Game session recorded'
    });
  } catch (error) {
    logger.error('Record game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording game session'
    });
  }
});

// @route   POST /api/analytics/events
// @desc    Record a game event
// @access  Public
router.post('/events', async (req, res) => {
  try {
    const { sessionId, type, data } = req.body;

    const gameSession = await GameSession.findOne({ sessionId });
    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    await gameSession.addEvent(type, data);

    res.json({
      success: true,
      message: 'Game event recorded'
    });
  } catch (error) {
    logger.error('Record game event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording game event'
    });
  }
});

export default router;
