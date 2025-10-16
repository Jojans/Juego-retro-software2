import express from 'express';
import { getClient } from '../config/database';

const router = express.Router();

// Get game statistics
router.get('/stats', async (req, res) => {
  try {
    const client = await getClient();
    
    try {
      // Get total games played
      const totalGamesResult = await client.query('SELECT COUNT(*) as total FROM scores');
      const totalGames = parseInt(totalGamesResult.rows[0].total);

      // Get total players
      const totalPlayersResult = await client.query('SELECT COUNT(DISTINCT player_name) as total FROM scores');
      const totalPlayers = parseInt(totalPlayersResult.rows[0].total);

      // Get highest score
      const highestScoreResult = await client.query('SELECT MAX(score) as highest FROM scores');
      const highestScore = highestScoreResult.rows[0].highest || 0;

      // Get average score
      const avgScoreResult = await client.query('SELECT AVG(score) as average FROM scores');
      const averageScore = Math.round(avgScoreResult.rows[0].average || 0);

      // Get highest wave
      const highestWaveResult = await client.query('SELECT MAX(wave) as highest FROM scores');
      const highestWave = highestWaveResult.rows[0].highest || 0;

      res.json({
        success: true,
        data: {
          totalGames,
          totalPlayers,
          highestScore,
          averageScore,
          highestWave
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Save game session
router.post('/session', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const client = await getClient();
    
    try {
      const result = await client.query(
        'INSERT INTO game_sessions (session_id, user_id) VALUES ($1, $2) RETURNING id',
        [sessionId, userId || null]
      );

      res.status(201).json({
        success: true,
        message: 'Game session created',
        data: {
          sessionId: result.rows[0].id
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// End game session
router.put('/session/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const client = await getClient();
    
    try {
      await client.query(
        'UPDATE game_sessions SET is_active = false, ended_at = CURRENT_TIMESTAMP WHERE session_id = $1',
        [sessionId]
      );

      res.json({
        success: true,
        message: 'Game session ended'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('End game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recent games
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const client = await getClient();
    
    try {
      const result = await client.query(
        `SELECT s.player_name, s.score, s.wave, s.game_duration, s.created_at
         FROM scores s
         ORDER BY s.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json({
        success: true,
        data: {
          games: result.rows,
          pagination: {
            limit,
            offset,
            total: result.rows.length
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get recent games error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
