# Backend - eFootball Arena v2 API Server

## Overview

Backend API server built with Node.js and Express.js providing:
- RESTful API endpoints
- Real-time WebSocket communication via Socket.io
- JWT-based authentication
- PostgreSQL database integration
- WebSocket event handling

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── models/          # Data models
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Helper functions
├── events/          # Socket.io event handlers
├── server.js        # Entry point
└── package.json
```

## Environment Variables

Create a `.env` file in the backend directory:

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=efootball_arena
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_SIZE=20
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=10
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Database Setup
```bash
# Run from project root
cd ../database
psql -U postgres -f schema.sql
psql -U postgres -f seeds.sql
cd ../backend
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run on: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify` - Verify token

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create player profile
- `PUT /api/players/:id` - Update player profile
- `GET /api/players/:id/stats` - Get player statistics
- `GET /api/players/search/:username` - Search player by username

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament (admin)
- `PUT /api/tournaments/:id` - Update tournament (admin)
- `POST /api/tournaments/:id/join` - Join tournament
- `DELETE /api/tournaments/:id/leave` - Leave tournament
- `GET /api/tournaments/:id/bracket` - Get tournament bracket

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches/:id/start` - Start match
- `POST /api/matches/:id/score` - Submit score
- `POST /api/matches/:id/approve` - Approve result (admin)
- `GET /api/matches/:id/live` - Get live match data

### Rankings
- `GET /api/rankings` - Get global rankings
- `GET /api/rankings/seasonal` - Get seasonal rankings
- `GET /api/rankings/:id` - Get player ranking

### Chat
- `GET /api/messages/:roomId` - Get messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message (admin)

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/reports` - Get misconduct reports
- `POST /api/admin/players/:id/verify` - Verify player
- `POST /api/admin/players/:id/ban` - Ban player
- `DELETE /api/admin/players/:id` - Delete player

## Real-Time Events (Socket.io)

### Client → Server
- `match:join` - Join match room
- `match:update-score` - Update match score
- `match:end` - End match
- `chat:message` - Send chat message
- `chat:join-room` - Join chat room
- `chat:leave-room` - Leave chat room
- `tournament:subscribe` - Subscribe to tournament updates

### Server → Client
- `match:score-updated` - Score update notification
- `match:status-changed` - Match status change
- `tournament:bracket-updated` - Bracket update
- `chat:new-message` - New message notification
- `ranking:updated` - Ranking update
- `notification:alert` - General notification

## Middleware

### Authentication
```javascript
const { authenticate } = require('./middleware/auth');
router.get('/protected', authenticate, controller);
```

### Admin Protection
```javascript
const { authenticateAdmin } = require('./middleware/auth');
router.post('/admin/action', authenticateAdmin, controller);
```

### Validation
```javascript
const { validate } = require('./middleware/validation');
const schema = Joi.object({...});
router.post('/endpoint', validate(schema), controller);
```

### Error Handling
```javascript
const { errorHandler } = require('./middleware/errorHandler');
// Applied globally
app.use(errorHandler);
```

## Database Models

### Users
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Players
```sql
players (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  username VARCHAR UNIQUE NOT NULL,
  konami_id VARCHAR,
  is_verified BOOLEAN DEFAULT false,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  fair_play_score INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Tournaments
```sql
tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  max_players INT NOT NULL,
  format VARCHAR DEFAULT 'knockout',
  status VARCHAR DEFAULT 'upcoming',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.

## Security

- ✅ JWT token validation
- ✅ Password encryption with bcryptjs
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation with Joi
- ✅ SQL injection prevention (using parameterized queries)
- ✅ XSS protection via Helmet
- ✅ HTTPS ready

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d efootball_arena
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### JWT Token Issues
```bash
# Regenerate JWT secret in .env
JWT_SECRET=$(openssl rand -base64 32)
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Submit Pull Request

## License

MIT License - See LICENSE file
