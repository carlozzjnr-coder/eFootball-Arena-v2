-- Sample Data for eFootball Arena v2

-- Create admin user
INSERT INTO users (id, email, username, password_hash, role, is_admin) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@efootballarena.com', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'admin', true);

-- Create test players
INSERT INTO users (email, username, password_hash, role) VALUES
('player1@test.com', 'SonicStrike', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player2@test.com', 'PhantomGoal', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player3@test.com', 'ThunderStrike', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player4@test.com', 'MysticPro', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player5@test.com', 'VortexKing', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player6@test.com', 'PrimalForce', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player7@test.com', 'NovaShot', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player'),
('player8@test.com', 'InfinityStrike', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36MM4dJS', 'player');

-- Get user IDs for reference (in real scenario, use actual IDs)
WITH user_ids AS (
    SELECT id, email FROM users WHERE role = 'player' LIMIT 8
)
INSERT INTO players (user_id, username, konami_id, is_verified, wins, losses, fair_play_score)
SELECT 
    id,
    username,
    'KONAMI_' || (ROW_NUMBER() OVER (ORDER BY id)) || '0001',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY id) <= 4 THEN true ELSE false END,
    FLOOR(RANDOM() * 50),
    FLOOR(RANDOM() * 30),
    85 + FLOOR(RANDOM() * 15)
FROM users WHERE role = 'player';

-- Create tournaments
INSERT INTO tournaments (name, description, start_date, end_date, max_players, format, status, created_by, prize_pool) VALUES
(
    'eFootball Arena Championship 2024',
    'Main championship tournament for Q4 2024',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    64,
    'knockout',
    'upcoming',
    '550e8400-e29b-41d4-a716-446655440000',
    5000
),
(
    'Monthly Pro League',
    'Monthly competitive tournament',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '10 days',
    32,
    'group_stage',
    'upcoming',
    '550e8400-e29b-41d4-a716-446655440000',
    2000
),
(
    'Casual Cup',
    'Beginner-friendly tournament',
    NOW(),
    NOW() + INTERVAL '5 days',
    16,
    'knockout',
    'ongoing',
    '550e8400-e29b-41d4-a716-446655440000',
    500
);

-- Add players to tournaments
WITH player_ids AS (
    SELECT id FROM players LIMIT 8
),
tournament_id AS (
    SELECT id FROM tournaments WHERE name = 'Casual Cup' LIMIT 1
)
INSERT INTO tournament_players (tournament_id, player_id)
SELECT t.id, p.id
FROM player_ids p, tournament_id t;

-- Create sample matches
WITH players_sample AS (
    SELECT id FROM players ORDER BY id LIMIT 8
),
tournament_id AS (
    SELECT id FROM tournaments WHERE name = 'Casual Cup' LIMIT 1
)
INSERT INTO matches (tournament_id, player1_id, player2_id, round, status)
SELECT 
    t.id,
    p1.id,
    p2.id,
    1,
    'scheduled'
FROM tournament_id t,
(SELECT id FROM players ORDER BY id LIMIT 4) p1,
(SELECT id FROM players ORDER BY id DESC LIMIT 4) p2
WHERE p1.id != p2.id
LIMIT 4;

-- Create rankings
WITH player_data AS (
    SELECT id FROM players
)
INSERT INTO rankings (player_id, season, rank, total_wins, total_losses, win_rate, points)
SELECT 
    id,
    '2024-Q4',
    ROW_NUMBER() OVER (ORDER BY (SELECT wins FROM players WHERE players.id = player_data.id) DESC),
    (SELECT wins FROM players WHERE players.id = player_data.id),
    (SELECT losses FROM players WHERE players.id = player_data.id),
    ROUND(100.0 * (SELECT wins FROM players WHERE players.id = player_data.id) / 
          NULLIF((SELECT wins + losses FROM players WHERE players.id = player_data.id), 0), 2),
    (SELECT wins FROM players WHERE players.id = player_data.id) * 10
FROM player_data;

-- Create sample chat messages
WITH sample_messages AS (
    VALUES 
    ('casual_cup', (SELECT id FROM players LIMIT 1), 'Good luck everyone!'),
    ('casual_cup', (SELECT id FROM players OFFSET 1 LIMIT 1), 'Thanks! Let''s have a great tournament!'),
    ('casual_cup', (SELECT id FROM players OFFSET 2 LIMIT 1), 'Looking forward to the matches'),
    ('casual_cup', (SELECT id FROM players OFFSET 3 LIMIT 1), 'May the best player win!')
)
INSERT INTO messages (room_id, sender_id, content)
SELECT * FROM sample_messages;

-- Create admin audit log
INSERT INTO audit_logs (action, actor_id, description) VALUES
('DATABASE_INITIALIZED', '550e8400-e29b-41d4-a716-446655440000', 'Database schema and sample data created'),
('TOURNAMENT_CREATED', '550e8400-e29b-41d4-a716-446655440000', 'Tournament: eFootball Arena Championship 2024'),
('TOURNAMENT_CREATED', '550e8400-e29b-41d4-a716-446655440000', 'Tournament: Monthly Pro League'),
('TOURNAMENT_CREATED', '550e8400-e29b-41d4-a716-446655440000', 'Tournament: Casual Cup');
