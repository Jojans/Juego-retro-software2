import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        experienceToNextLevel: user.experienceToNextLevel,
        totalScore: user.totalScore,
        bestScore: user.bestScore,
        gamesPlayed: user.gamesPlayed,
        achievements: user.achievements,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
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

    const { username, avatar } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    logger.info(`User profile updated: ${user.username}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        totalScore: user.totalScore,
        bestScore: user.bestScore,
        gamesPlayed: user.gamesPlayed,
        achievements: user.achievements,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('soundEnabled').optional().isBoolean().withMessage('Sound enabled must be a boolean'),
  body('musicEnabled').optional().isBoolean().withMessage('Music enabled must be a boolean'),
  body('effectsEnabled').optional().isBoolean().withMessage('Effects enabled must be a boolean'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'normal', 'hard', 'nightmare'])
    .withMessage('Invalid difficulty level'),
  body('theme')
    .optional()
    .isIn(['retro', 'modern', 'neon'])
    .withMessage('Invalid theme'),
  body('controls')
    .optional()
    .isObject()
    .withMessage('Controls must be an object')
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

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    const { soundEnabled, musicEnabled, effectsEnabled, difficulty, theme, controls } = req.body;
    
    if (soundEnabled !== undefined) user.preferences.soundEnabled = soundEnabled;
    if (musicEnabled !== undefined) user.preferences.musicEnabled = musicEnabled;
    if (effectsEnabled !== undefined) user.preferences.effectsEnabled = effectsEnabled;
    if (difficulty) user.preferences.difficulty = difficulty;
    if (theme) user.preferences.theme = theme;
    if (controls) {
      user.preferences.controls = { ...user.preferences.controls, ...controls };
    }

    await user.save();

    logger.info(`User preferences updated: ${user.username}`);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    logger.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

// @route   GET /api/user/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      achievements: user.achievements
    });
  } catch (error) {
    logger.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting achievements'
    });
  }
});

// @route   POST /api/user/achievements
// @desc    Add achievement to user
// @access  Private
router.post('/achievements', auth, [
  body('id').notEmpty().withMessage('Achievement ID is required'),
  body('name').notEmpty().withMessage('Achievement name is required'),
  body('description').notEmpty().withMessage('Achievement description is required'),
  body('icon').notEmpty().withMessage('Achievement icon is required'),
  body('rarity')
    .isIn(['common', 'rare', 'epic', 'legendary'])
    .withMessage('Invalid achievement rarity')
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

    const { id, name, description, icon, rarity } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const achievement = {
      id,
      name,
      description,
      icon,
      rarity,
      unlockedAt: new Date()
    };

    const added = user.addAchievement(achievement);
    if (!added) {
      return res.status(400).json({
        success: false,
        message: 'Achievement already exists'
      });
    }

    await user.save();

    logger.info(`Achievement unlocked: ${name} for user ${user.username}`);

    res.json({
      success: true,
      message: 'Achievement unlocked',
      achievement
    });
  } catch (error) {
    logger.error('Add achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding achievement'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Deactivate account instead of deleting
    user.isActive = false;
    await user.save();

    logger.info(`User account deactivated: ${user.username}`);

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
});

export default router;
