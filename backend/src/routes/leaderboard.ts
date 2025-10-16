import express from 'express';
import { getClient } from '../config/database';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const timeRange = req.query.timeRange as string || 'all'; // all, day, week, month

    const client = await getClient();
    
    try {
      let timeFilter = '';
      let queryParams: any[] = [limit, offset];

      // Add time filter based on timeRange
      switch (timeRange) {
        case 'day':
          timeFilter = 'AND s.created_at >= CURRENT_DATE';
          break;
        case 'week':
          timeFilter = 'AND s.created_at >= CURRENT_DATE - INTERVAL \'7 days\'';
          break;
        case 'month':
          timeFilter = 'AND s.created_at >= CURRENT_DATE - INTERVAL \'30 days\'';
          break;
        default:
          timeFilter = '';
      }

      const query = `
        SELECT 
          s.player_name,
          s.score,
          s.wave,
          s.game_duration,
          s.created_at,
          ROW_NUMBER() OVER (ORDER BY s.score DESC) as rank
        FROM scores s
        WHERE 1=1 ${timeFilter}
        ORDER BY s.score DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await client.query(query, queryParams);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM scores s
        WHERE 1=1 ${timeFilter}
      `;
      
      const countResult = await client.query(countQuery, timeRange !== 'all' ? [timeFilter] : []);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: {
          leaderboard: result.rows,
          pagination: {
            limit,
            offset,
            total,
            hasMore: offset + limit < total
          },
          timeRange
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit score
router.post('/submit', async (req, res) => {
  try {
    const { playerName, score, wave, gameDuration, userId } = req.body;

    // Validation
    if (!playerName || score === undefined || wave === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Player name, score, and wave are required'
      });
    }

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a positive number'
      });
    }

    if (typeof wave !== 'number' || wave < 1) {
      return res.status(400).json({
        success: false,
        message: 'Wave must be a positive number'
      });
    }

    const client = await getClient();
    
    try {
      // Insert score
      const result = await client.query(
        `INSERT INTO scores (player_name, score, wave, game_duration, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, player_name, score, wave, game_duration, created_at`,
        [playerName, score, wave, gameDuration || 0, userId || null]
      );

      const newScore = result.rows[0];

      // Get player's rank
      const rankResult = await client.query(
        `SELECT COUNT(*) + 1 as rank
         FROM scores
         WHERE score > $1`,
        [score]
      );

      const rank = parseInt(rankResult.rows[0].rank);

      res.status(201).json({
        success: true,
        message: 'Score submitted successfully',
        data: {
          score: newScore,
          rank
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get player's best scores
router.get('/player/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const client = await getClient();
    
    try {
      const result = await client.query(
        `SELECT 
           player_name,
           score,
           wave,
           game_duration,
           created_at,
           ROW_NUMBER() OVER (ORDER BY score DESC) as rank
         FROM scores
         WHERE player_name = $1
         ORDER BY score DESC
         LIMIT $2`,
        [playerName, limit]
      );

      res.json({
        success: true,
        data: {
          player: playerName,
          scores: result.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get player scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get top players by wave
router.get('/waves', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const client = await getClient();
    
    try {
      const result = await client.query(
        `SELECT 
           player_name,
           MAX(wave) as highest_wave,
           MAX(score) as best_score,
           COUNT(*) as games_played,
           MAX(created_at) as last_played
         FROM scores
         GROUP BY player_name
         ORDER BY highest_wave DESC, best_score DESC
         LIMIT $1`,
        [limit]
      );

      res.json({
        success: true,
        data: {
          topWaves: result.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get top waves error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
