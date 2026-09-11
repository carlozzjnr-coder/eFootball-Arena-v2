-- eFootball Arena v2 Database Schema
-- PostgreSQL

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('player', 'admin', 'moderator');
CREATE TYPE tournament_format AS ENUM ('knockout', 'group_stage', 'swiss', 'round_robin');
CREATE TYPE tournament_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'pending_approval', 'completed', 'disputed', 'cancelled');
CREATE TYPE report_status AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'player',
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Players Table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    konami_id VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    bio TEXT,
    avatar VARCHAR(500),
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    fair_play_score INT DEFAULT 100,
    warnings INT DEFAULT 0,
    total_tournaments INT DEFAULT 0,
    ranking_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_is_verified ON players(is_verified);
CREATE INDEX idx_players_is_banned ON players(is_banned);
CREATE INDEX idx_players_ranking_points ON players(ranking_points DESC);

-- Konami Verification Table
CREATE TABLE konami_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL UNIQUE,
    konami_id VARCHAR(100) NOT NULL,
    verified_at TIMESTAMP,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Tournaments Table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_players INT NOT NULL DEFAULT 64,
    current_players INT DEFAULT 0,
    format tournament_format DEFAULT 'knockout',
    status tournament_status DEFAULT 'upcoming',
    prize_pool DECIMAL(10, 2) DEFAULT 0,
    created_by UUID,
    winner_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);

-- Tournament Players Table (Join Table)
CREATE TABLE tournament_players (
    tournament_id UUID NOT NULL,
    player_id UUID NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    eliminated_at TIMESTAMP,
    final_position INT,
    PRIMARY KEY (tournament_id, player_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_tournament_players_tournament_id ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_player_id ON tournament_players(player_id);

-- Matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID,
    player1_id UUID NOT NULL,
    player2_id UUID NOT NULL,
    round INT,
    player1_score INT,
    player2_score INT,
    winner_id UUID,
    loser_id UUID,
    status match_status DEFAULT 'scheduled',
    duration INT,
    notes TEXT,
    dispute_reason TEXT,
    started_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE SET NULL,
    FOREIGN KEY (loser_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_player1_id ON matches(player1_id);
CREATE INDEX idx_matches_player2_id ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);

-- Rankings Table
CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    season VARCHAR(20),
    rank INT,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    win_rate DECIMAL(5, 2),
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(player_id, season)
);

CREATE INDEX idx_rankings_player_id ON rankings(player_id);
CREATE INDEX idx_rankings_season ON rankings(season);
CREATE INDEX idx_rankings_rank ON rankings(rank);

-- Messages Table (Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(255) NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (sender_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Muted Players Table
CREATE TABLE muted_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(255) NOT NULL,
    player_id UUID NOT NULL,
    muted_at TIMESTAMP DEFAULT NOW(),
    muted_until TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Player Reports Table (Anti-Cheat)
CREATE TABLE player_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_id UUID NOT NULL,
    reported_player_id UUID NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    status report_status DEFAULT 'pending',
    resolution TEXT,
    resolved_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (reported_by_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_player_reports_reported_player_id ON player_reports(reported_player_id);
CREATE INDEX idx_player_reports_status ON player_reports(status);
CREATE INDEX idx_player_reports_created_at ON player_reports(created_at DESC);

-- Duplicate Account Detection Table
CREATE TABLE account_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    risk_type VARCHAR(100) NOT NULL,
    risk_score INT,
    description TEXT,
    flagged_at TIMESTAMP DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Audit Log Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    actor_id UUID,
    target_id UUID,
    description TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_reports_updated_at BEFORE UPDATE ON player_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if using a separate app user)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO efootball_user;
