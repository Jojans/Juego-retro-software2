import { DataTypes, Model, Optional, QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface IGameEvent {
  id: string;
  type: 'enemy_killed' | 'powerup_collected' | 'level_completed' | 'death' | 'boss_defeated' | 'achievement_unlocked';
  timestamp: Date;
  data: Record<string, any>;
}

export interface IGameSessionAttributes {
  id: number;
  userId: number;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  score: number;
  level: number;
  wave: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  deaths: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  completed: boolean;
  gameEvents: IGameEvent[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGameSessionCreationAttributes extends Optional<IGameSessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class GameSession extends Model<IGameSessionAttributes, IGameSessionCreationAttributes> implements IGameSessionAttributes {
  public id!: number;
  public userId!: number;
  public sessionId!: string;
  public startTime!: Date;
  public endTime?: Date;
  public duration?: number;
  public score!: number;
  public level!: number;
  public wave!: number;
  public enemiesKilled!: number;
  public powerUpsCollected!: number;
  public deaths!: number;
  public difficulty!: 'easy' | 'normal' | 'hard' | 'nightmare';
  public completed!: boolean;
  public gameEvents!: IGameEvent[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual for session duration
  get sessionDuration(): number {
    if (this.endTime) {
      return this.endTime.getTime() - this.startTime.getTime();
    }
    return Date.now() - this.startTime.getTime();
  }

  // Methods
  public async endSession(completed: boolean = false): Promise<GameSession> {
    this.endTime = new Date();
    this.duration = this.sessionDuration;
    this.completed = completed;
    return this.save();
  }

  public async addEvent(type: IGameEvent['type'], data: Record<string, any> = {}): Promise<GameSession> {
    const event: IGameEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      data
    };
    
    this.gameEvents.push(event);
    return this.save();
  }

  public async updateScore(score: number): Promise<GameSession> {
    this.score = Math.max(this.score, score);
    return this.save();
  }

  public async incrementStat(stat: keyof IGameSessionAttributes, amount: number = 1): Promise<GameSession> {
    if (typeof this[stat] === 'number') {
      (this as any)[stat] += amount;
    }
    return this.save();
  }

  // Static methods
  public static async findByUser(userId: number, limit: number = 10): Promise<GameSession[]> {
    return this.findAll({
      where: { userId },
      order: [['startTime', 'DESC']],
      limit
    });
  }

  public static async getLeaderboard(difficulty?: string, limit: number = 10): Promise<any[]> {
    const whereClause: any = { completed: true };
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }
    
    return this.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'level']
      }],
      order: [['score', 'DESC']],
      limit
    });
  }

  public static async getUserStats(userId: number): Promise<any[]> {
    const query = `
      SELECT 
        COUNT(*) as "totalGames",
        COALESCE(SUM(score), 0) as "totalScore",
        COALESCE(MAX(score), 0) as "bestScore",
        COALESCE(AVG(score), 0) as "averageScore",
        COALESCE(SUM(duration), 0) as "totalTimePlayed",
        COALESCE(SUM(enemies_killed), 0) as "totalEnemiesKilled",
        COALESCE(SUM(power_ups_collected), 0) as "totalPowerUpsCollected",
        COALESCE(SUM(deaths), 0) as "totalDeaths",
        COUNT(CASE WHEN completed = true THEN 1 END) as "completedGames",
        COALESCE(AVG(level), 0) as "averageLevelReached",
        COALESCE(MAX(wave), 0) as "longestStreak"
      FROM game_sessions 
      WHERE user_id = :userId
    `;
    
    return sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });
  }

  public static async getAnalytics(startDate?: Date, endDate?: Date): Promise<any[]> {
    let whereClause = '';
    const replacements: any = {};
    
    if (startDate && endDate) {
      whereClause = 'WHERE start_time BETWEEN :startDate AND :endDate';
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    } else if (startDate) {
      whereClause = 'WHERE start_time >= :startDate';
      replacements.startDate = startDate;
    } else if (endDate) {
      whereClause = 'WHERE start_time <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT 
        COUNT(*) as "totalSessions",
        COUNT(DISTINCT user_id) as "uniquePlayers",
        COALESCE(AVG(score), 0) as "averageScore",
        COALESCE(AVG(duration), 0) as "averageDuration",
        COALESCE(AVG(CASE WHEN completed = true THEN 1.0 ELSE 0.0 END), 0) as "completionRate",
        array_agg(difficulty) as "difficultyDistribution"
      FROM game_sessions 
      ${whereClause}
    `;
    
    return sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
  }
}

GameSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    wave: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    enemiesKilled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'enemies_killed',
      validate: {
        min: 0
      }
    },
    powerUpsCollected: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'power_ups_collected',
      validate: {
        min: 0
      }
    },
    deaths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'normal', 'hard', 'nightmare'),
      allowNull: false,
      defaultValue: 'normal'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    gameEvents: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'game_events'
    }
  },
  {
    sequelize,
    modelName: 'GameSession',
    tableName: 'game_sessions',
    indexes: [
      { fields: ['user_id', 'start_time'] },
      { fields: ['score'] },
      { fields: ['difficulty', 'score'] },
      { fields: ['completed'] },
      { fields: ['start_time'] }
    ]
  }
);

// Define associations
GameSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(GameSession, { foreignKey: 'userId', as: 'gameSessions' });

export default GameSession;
