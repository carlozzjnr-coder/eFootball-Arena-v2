# Database - eFootball Arena v2

## Setup Instructions

### Prerequisites
- PostgreSQL 12+
- psql CLI

### 1. Create Database and User

```bash
sudo -u postgres psql

CREATE DATABASE efootball_arena;
CREATE USER efootball_user WITH PASSWORD 'secure_password';
ALTER ROLE efootball_user SET client_encoding TO 'utf8';
ALTER ROLE efootball_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE efootball_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE efootball_arena TO efootball_user;
\q
```

### 2. Load Schema

```bash
cd database
psql -U efootball_user -d efootball_arena -f schema.sql
```

### 3. Load Sample Data

```bash
psql -U efootball_user -d efootball_arena -f seeds.sql
```

### 4. Verify Setup

```bash
psql -U efootball_user -d efootball_arena

-- Check tables
\dt

-- Check data
SELECT * FROM users;
SELECT * FROM players;
SELECT * FROM tournaments;

-- Exit
\q
```

## Database Schema

### Main Tables

#### users
- User account information
- Email, username, password hash
- Role and admin status
- Last login tracking

#### players
- Player profile linked to user
- Statistics (wins, losses)
- Konami ID verification
- Fair play score
- Ban status and warnings

#### tournaments
- Tournament information
- Format, status, dates
- Prize pool
- Participant tracking

#### matches
- Match records
- Score tracking
- Result approval workflow
- Dispute handling

#### rankings
- Player rankings by season
- Win rates and points
- Historical tracking

#### messages
- Chat messages
- Room-based organization
- Timestamp tracking

#### player_reports
- Misconduct reports
- Anti-cheat system
- Report status tracking

### Supporting Tables

- `konami_verification` - Konami ID verification workflow
- `tournament_players` - Join table for tournament participants
- `muted_players` - Chat moderation
- `account_risk_flags` - Duplicate account detection
- `refresh_tokens` - JWT token management
- `audit_logs` - Admin action logging

## Backup & Recovery

### Backup Database

```bash
pg_dump -U efootball_user -d efootball_arena > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
psql -U efootball_user -d efootball_arena < backup_20240911_120000.sql
```

### Automated Backup Script

```bash
#!/bin/bash
BACKUP_DIR=/var/backups/efootball
DB_NAME=efootball_arena
DB_USER=efootball_user
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

Schedule with cron:
```bash
0 2 * * * /usr/local/bin/backup_db.sh
```

## Common Queries

### Get Top 10 Players
```sql
SELECT username, wins, losses, ROUND(100.0 * wins / (wins + losses), 2) as win_rate
FROM players
ORDER BY wins DESC
LIMIT 10;
```

### Get Active Tournaments
```sql
SELECT name, status, current_players, max_players, start_date
FROM tournaments
WHERE status IN ('upcoming', 'ongoing')
ORDER BY start_date;
```

### Get Recent Matches
```sql
SELECT m.*, p1.username as player1, p2.username as player2
FROM matches m
JOIN players p1 ON m.player1_id = p1.id
JOIN players p2 ON m.player2_id = p2.id
ORDER BY m.created_at DESC
LIMIT 20;
```

### Get Player Statistics
```sql
SELECT 
    username,
    wins,
    losses,
    ROUND(100.0 * wins / (wins + losses), 2) as win_rate,
    fair_play_score,
    is_verified,
    is_banned
FROM players
WHERE username = 'player_username';
```

## Performance Optimization

### Create Additional Indexes
```sql
CREATE INDEX idx_players_wins ON players(wins DESC);
CREATE INDEX idx_matches_winner_id ON matches(winner_id);
CREATE INDEX idx_rankings_rank ON rankings(rank);
```

### Analyze Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM players WHERE wins > 10 ORDER BY wins DESC;
```

### Vacuum and Analyze
```bash
vacuumdb -U efootball_user -d efootball_arena
analyzedb -U efootball_user -d efootball_arena
```

## Troubleshooting

### Connection Issues
```bash
psql -U efootball_user -d efootball_arena -c "SELECT NOW();"
```

### Check PostgreSQL Status
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### View PostgreSQL Logs
```bash
sudo tail -f /var/log/postgresql/postgresql.log
```

## Migration from Old Version

If migrating from eFootball Arena v1:

1. Export old data: `pg_dump old_db > old_data.sql`
2. Create new schema
3. Transform and import data
4. Verify data integrity
5. Run consistency checks

---

For more details, see [DEPLOYMENT.md](../DEPLOYMENT.md)
