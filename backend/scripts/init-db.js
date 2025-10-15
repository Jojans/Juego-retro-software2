// MongoDB initialization script
db = db.getSiblingDB('space_arcade');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 20
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        }
      }
    }
  }
});

db.createCollection('gamesessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'sessionId', 'startTime', 'score', 'level', 'wave'],
      properties: {
        userId: { bsonType: 'string' },
        sessionId: { bsonType: 'string' },
        startTime: { bsonType: 'date' },
        score: { bsonType: 'number', minimum: 0 },
        level: { bsonType: 'number', minimum: 1 },
        wave: { bsonType: 'number', minimum: 1 }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ totalScore: -1 });
db.users.createIndex({ bestScore: -1 });

db.gamesessions.createIndex({ userId: 1, startTime: -1 });
db.gamesessions.createIndex({ score: -1 });
db.gamesessions.createIndex({ difficulty: 1, score: -1 });
db.gamesessions.createIndex({ completed: 1 });

// Insert sample data
db.users.insertOne({
  username: 'admin',
  email: 'admin@spacearcade.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // password: admin123
  level: 1,
  experience: 0,
  totalScore: 0,
  gamesPlayed: 0,
  bestScore: 0,
  achievements: [],
  preferences: {
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
  },
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
