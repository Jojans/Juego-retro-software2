import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface IUserPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectsEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  controls: {
    moveLeft: string;
    moveRight: string;
    shoot: string;
    pause: string;
  };
  theme: 'retro' | 'modern' | 'neon';
}

export interface IUserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  level: number;
  experience: number;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  achievements: IAchievement[];
  preferences: IUserPreferences;
  isActive: boolean;
  lastLogin: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public avatar?: string;
  public level!: number;
  public experience!: number;
  public totalScore!: number;
  public gamesPlayed!: number;
  public bestScore!: number;
  public achievements!: IAchievement[];
  public preferences!: IUserPreferences;
  public isActive!: boolean;
  public lastLogin!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual for experience needed for next level
  get experienceToNextLevel(): number {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  // Methods
  public addExperience(amount: number): boolean {
    this.experience += amount;
    
    // Check for level up
    const expNeeded = this.experienceToNextLevel;
    if (this.experience >= expNeeded) {
      this.level += 1;
      this.experience -= expNeeded;
      return true; // Leveled up
    }
    return false; // No level up
  }

  public updateScore(score: number): void {
    this.totalScore += score;
    if (score > this.bestScore) {
      this.bestScore = score;
    }
    this.gamesPlayed += 1;
  }

  public addAchievement(achievement: IAchievement): boolean {
    // Check if achievement already exists
    const existingAchievement = this.achievements.find(a => a.id === achievement.id);
    if (!existingAchievement) {
      this.achievements.push(achievement);
      return true; // Achievement added
    }
    return false; // Achievement already exists
  }

  // Static methods
  public static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email: email.toLowerCase() } });
  }

  public static async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username: username.toLowerCase() } });
  }

  public static async getLeaderboard(limit: number = 10): Promise<User[]> {
    return this.findAll({
      where: { isActive: true },
      attributes: ['id', 'username', 'level', 'totalScore', 'bestScore', 'avatar'],
      order: [['bestScore', 'DESC']],
      limit
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
        is: /^[a-zA-Z0-9_]+$/
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    gamesPlayed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    bestScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    achievements: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        soundEnabled: true,
        musicEnabled: true,
        effectsEnabled: true,
        difficulty: 'normal',
        controls: {
          moveLeft: 'ArrowLeft',
          moveRight: 'ArrowRight',
          shoot: 'Space',
          pause: 'Escape'
        },
        theme: 'neon'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['username'] },
      { fields: ['totalScore'] },
      { fields: ['bestScore'] },
      { fields: ['level'] }
    ],
    hooks: {
      beforeCreate: (user: User) => {
        user.email = user.email.toLowerCase();
        user.username = user.username.toLowerCase();
      },
      beforeUpdate: (user: User) => {
        if (user.changed('email')) {
          user.email = user.email.toLowerCase();
        }
        if (user.changed('username')) {
          user.username = user.username.toLowerCase();
        }
      }
    }
  }
);

export default User;
