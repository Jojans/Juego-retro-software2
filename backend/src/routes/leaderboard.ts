import express from 'express';
import GameSession from '../models/GameSession';
import User from '../models/User';
import { optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// @route   GET /api/leaderboard/global
// @desc    Get global leaderboard
// @access  Public
router.get('/global', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const difficulty = req.query.difficulty as string;

    let leaderboard;
    
    if (difficulty) {
      leaderboard = await GameSession.getLeaderboard(difficulty, limit);
    } else {
      leaderboard = await GameSession.getLeaderboard(undefined, limit);
    }

    res.json({
      success: true,
      leaderboard,
      difficulty: difficulty || 'all'
    });
  } catch (error) {
    logger.error('Get global leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/user
// @desc    Get user's position in leaderboard
// @access  Private
router.get('/user', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's rank based on best score
    const userRank = await GameSession.countDocuments({
      score: { $gt: user.bestScore }
    }) + 1;

    // Get users around this user's rank
    const nearbyUsers = await GameSession.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { score: -1 }
      },
      {
        $skip: Math.max(0, userRank - 3)
      },
      {
        $limit: 7
      },
      {
        $project: {
          score: 1,
          level: 1,
          wave: 1,
          completed: 1,
          'user.username': 1,
          'user.avatar': 1,
          'user.level': 1
        }
      }
    ]);

    res.json({
      success: true,
      userRank,
      userScore: user.bestScore,
      nearbyUsers
    });
  } catch (error) {
    logger.error('Get user leaderboard position error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user position'
    });
  }
});

// @route   GET /api/leaderboard/daily
// @desc    Get daily leaderboard
// @access  Public
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leaderboard = await GameSession.aggregate([
      {
        $match: {
          startTime: {
            $gte: today,
            $lt: tomorrow
          },
          completed: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          score: 1,
          level: 1,
          wave: 1,
          difficulty: 1,
          'user.username': 1,
          'user.avatar': 1,
          'user.level': 1,
          startTime: 1
        }
      }
    ]);

    res.json({
      success: true,
      leaderboard,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    logger.error('Get daily leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting daily leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/weekly
// @desc    Get weekly leaderboard
// @access  Public
router.get('/weekly', async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const leaderboard = await GameSession.aggregate([
      {
        $match: {
          startTime: { $gte: weekStart },
          completed: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          score: 1,
          level: 1,
          wave: 1,
          difficulty: 1,
          'user.username': 1,
          'user.avatar': 1,
          'user.level': 1,
          startTime: 1
        }
      }
    ]);

    res.json({
      success: true,
      leaderboard,
      weekStart: weekStart.toISOString().split('T')[0]
    });
  } catch (error) {
    logger.error('Get weekly leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting weekly leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/difficulty/:difficulty
// @desc    Get leaderboard for specific difficulty
// @access  Public
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!['easy', 'normal', 'hard', 'nightmare'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level'
      });
    }

    const leaderboard = await GameSession.getLeaderboard(difficulty, limit);

    res.json({
      success: true,
      leaderboard,
      difficulty
    });
  } catch (error) {
    logger.error('Get difficulty leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting difficulty leaderboard'
    });
  }
});

export default router;
