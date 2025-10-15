import express from 'express';
import { body, validationResult } from 'express-validator';
import GameSession from '../models/GameSession';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// @route   POST /api/game/start
// @desc    Start a new game session
// @access  Private
router.post('/start', auth, [
  body('difficulty')
    .isIn(['easy', 'normal', 'hard', 'nightmare'])
    .withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { difficulty } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new game session
    const gameSession = new GameSession({
      userId: req.userId,
      sessionId,
      difficulty,
      startTime: new Date()
    });

    await gameSession.save();

    logger.info(`Game session started: ${sessionId} for user ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Game session started',
      sessionId,
      gameSession: {
        id: gameSession._id,
        sessionId: gameSession.sessionId,
        startTime: gameSession.startTime,
        difficulty: gameSession.difficulty
      }
    });
  } catch (error) {
    logger.error('Start game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting game'
    });
  }
});

// @route   POST /api/game/end
// @desc    End a game session
// @access  Private
router.post('/end', auth, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('score').isNumeric().withMessage('Score must be a number'),
  body('level').isInt({ min: 1 }).withMessage('Level must be a positive integer'),
  body('wave').isInt({ min: 1 }).withMessage('Wave must be a positive integer'),
  body('enemiesKilled').isInt({ min: 0 }).withMessage('Enemies killed must be non-negative'),
  body('powerUpsCollected').isInt({ min: 0 }).withMessage('Power-ups collected must be non-negative'),
  body('deaths').isInt({ min: 0 }).withMessage('Deaths must be non-negative'),
  body('completed').isBoolean().withMessage('Completed must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      sessionId,
      score,
      level,
      wave,
      enemiesKilled,
      powerUpsCollected,
      deaths,
      completed
    } = req.body;

    // Find and update game session
    const gameSession = await GameSession.findOne({
      where: {
        sessionId,
        userId: req.userId
      }
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    // Update session data
    gameSession.score = score;
    gameSession.level = level;
    gameSession.wave = wave;
    gameSession.enemiesKilled = enemiesKilled;
    gameSession.powerUpsCollected = powerUpsCollected;
    gameSession.deaths = deaths;
    gameSession.completed = completed;

    await gameSession.endSession(completed);

    // Update user stats
    const user = await User.findById(req.userId);
    if (user) {
      user.updateScore(score);
      await user.save();
    }

    logger.info(`Game session ended: ${sessionId} - Score: ${score}, Completed: ${completed}`);

    res.json({
      success: true,
      message: 'Game session ended',
      gameSession: {
        id: gameSession._id,
        sessionId: gameSession.sessionId,
        score: gameSession.score,
        level: gameSession.level,
        wave: gameSession.wave,
        enemiesKilled: gameSession.enemiesKilled,
        powerUpsCollected: gameSession.powerUpsCollected,
        deaths: gameSession.deaths,
        completed: gameSession.completed,
        duration: gameSession.duration,
        startTime: gameSession.startTime,
        endTime: gameSession.endTime
      }
    });
  } catch (error) {
    logger.error('End game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error ending game'
    });
  }
});

// @route   POST /api/game/event
// @desc    Add an event to a game session
// @access  Private
router.post('/event', auth, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('type')
    .isIn(['enemy_killed', 'powerup_collected', 'level_completed', 'death', 'boss_defeated', 'achievement_unlocked'])
    .withMessage('Invalid event type'),
  body('data').isObject().withMessage('Data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, type, data } = req.body;

    // Find game session
    const gameSession = await GameSession.findOne({
      where: {
        sessionId,
        userId: req.userId
      }
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    // Add event to session
    await gameSession.addEvent(type, data);

    res.json({
      success: true,
      message: 'Event added to game session'
    });
  } catch (error) {
    logger.error('Add game event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding game event'
    });
  }
});

// @route   GET /api/game/sessions
// @desc    Get user's game sessions
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const sessions = await GameSession.findByUser(req.userId!, limit)
      .skip(skip)
      .limit(limit);

    const totalSessions = await GameSession.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNext: page < Math.ceil(totalSessions / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error('Get game sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting game sessions'
    });
  }
});

// @route   GET /api/game/session/:sessionId
// @desc    Get specific game session
// @access  Private
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const gameSession = await GameSession.findOne({
      where: {
        sessionId,
        userId: req.userId
      }
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    res.json({
      success: true,
      gameSession
    });
  } catch (error) {
    logger.error('Get game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting game session'
    });
  }
});

export default router;
