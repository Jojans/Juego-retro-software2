-- PostgreSQL initialization script for Space Arcade Game

-- Create database if it doesn't exist (this will be handled by Docker)
-- CREATE DATABASE space_arcade;

-- Connect to the database
\c space_arcade;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE difficulty_enum AS ENUM ('easy', 'normal', 'hard', 'nightmare');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE achievement_rarity_enum AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE game_event_type_enum AS ENUM (
        'enemy_killed', 
        'powerup_collected', 
        'level_completed', 
        'death', 
        'boss_defeated', 
        'achievement_unlocked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE theme_enum AS ENUM ('retro', 'modern', 'neon');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
    total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0),
    games_played INTEGER NOT NULL DEFAULT 0 CHECK (games_played >= 0),
    best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score >= 0),
    achievements JSONB NOT NULL DEFAULT '[]',
    preferences JSONB NOT NULL DEFAULT '{
        "soundEnabled": true,
        "musicEnabled": true,
        "effectsEnabled": true,
        "difficulty": "normal",
        "controls": {
            "moveLeft": "ArrowLeft",
            "moveRight": "ArrowRight",
            "shoot": "Space",
            "pause": "Escape"
        },
        "theme": "neon"
    }',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER CHECK (duration >= 0),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    wave INTEGER NOT NULL DEFAULT 1 CHECK (wave >= 1),
    enemies_killed INTEGER NOT NULL DEFAULT 0 CHECK (enemies_killed >= 0),
    power_ups_collected INTEGER NOT NULL DEFAULT 0 CHECK (power_ups_collected >= 0),
    deaths INTEGER NOT NULL DEFAULT 0 CHECK (deaths >= 0),
    difficulty difficulty_enum NOT NULL DEFAULT 'normal',
    completed BOOLEAN NOT NULL DEFAULT false,
    game_events JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score);
CREATE INDEX IF NOT EXISTS idx_users_best_score ON users(best_score);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id_start_time ON game_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty_score ON game_sessions(difficulty, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (
    username, 
    email, 
    password, 
    level, 
    experience, 
    total_score, 
    games_played, 
    best_score
) VALUES (
    'admin',
    'admin@spacearcade.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', -- password: admin123
    1,
    0,
    0,
    0,
    0
) ON CONFLICT (email) DO NOTHING;

-- Create views for analytics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.level,
    u.experience,
    u.total_score,
    u.best_score,
    u.games_played,
    COALESCE(gs.total_games, 0) as total_sessions,
    COALESCE(gs.completed_games, 0) as completed_sessions,
    COALESCE(gs.average_score, 0) as average_score,
    COALESCE(gs.total_time_played, 0) as total_time_played,
    COALESCE(gs.total_enemies_killed, 0) as total_enemies_killed,
    COALESCE(gs.total_power_ups_collected, 0) as total_power_ups_collected,
    COALESCE(gs.total_deaths, 0) as total_deaths,
    COALESCE(gs.average_level_reached, 0) as average_level_reached,
    COALESCE(gs.longest_streak, 0) as longest_streak
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_games,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_games,
        AVG(score) as average_score,
        SUM(duration) as total_time_played,
        SUM(enemies_killed) as total_enemies_killed,
        SUM(power_ups_collected) as total_power_ups_collected,
        SUM(deaths) as total_deaths,
        AVG(level) as average_level_reached,
        MAX(wave) as longest_streak
    FROM game_sessions
    GROUP BY user_id
) gs ON u.id = gs.user_id;

-- Create function to calculate experience needed for next level
CREATE OR REPLACE FUNCTION get_experience_to_next_level(user_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(100 * POWER(1.5, user_level - 1));
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE space_arcade TO spacearcade;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spacearcade;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spacearcade;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully!';
END $$;
