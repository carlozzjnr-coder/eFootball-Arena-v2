# API Documentation - eFootball Arena v2

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123",
  "username": "PlayerName"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123"
}

Response:
{
  "token": "jwt_token",
  "userId": "uuid"
}
```

#### Verify Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

### Players

#### Get All Players
```http
GET /players?page=1&limit=20
```

#### Get Player by ID
```http
GET /players/:id
```

#### Get Player Stats
```http
GET /players/:id/stats
```

#### Create Player Profile
```http
POST /players
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "PlayerName",
  "konami_id": "KONAMI_12345",
  "bio": "Competitive eFootball player",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Update Player Profile
```http
PUT /players/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Tournaments

#### Get All Tournaments
```http
GET /tournaments?status=upcoming
```

#### Get Tournament Details
```http
GET /tournaments/:id
```

#### Get Tournament Bracket
```http
GET /tournaments/:id/bracket
```

#### Create Tournament (Admin)
```http
POST /tournaments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Championship 2024",
  "description": "Main tournament",
  "start_date": "2024-09-20T10:00:00Z",
  "end_date": "2024-09-27T10:00:00Z",
  "max_players": 64,
  "format": "knockout",
  "prize_pool": 5000
}
```

#### Join Tournament
```http
POST /tournaments/:id/join
Authorization: Bearer <token>
```

#### Leave Tournament
```http
POST /tournaments/:id/leave
Authorization: Bearer <token>
```

#### Generate Matches
```http
POST /tournaments/:id/generate-matches
Authorization: Bearer <admin_token>
```

### Matches

#### Get All Matches
```http
GET /matches?status=scheduled
```

#### Get Match Details
```http
GET /matches/:id
```

#### Start Match
```http
POST /matches/:id/start
Authorization: Bearer <token>
```

#### Submit Score
```http
POST /matches/:id/score
Authorization: Bearer <token>
Content-Type: application/json

{
  "player1_score": 3,
  "player2_score": 2,
  "duration": 1200,
  "notes": "Great match"
}
```

#### Approve Result (Admin)
```http
POST /matches/:id/approve
Authorization: Bearer <admin_token>
```

#### Dispute Result
```http
POST /matches/:id/dispute
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Invalid score"
}
```

### Rankings

#### Get Global Rankings
```http
GET /rankings?page=1&limit=50
```

#### Get Seasonal Rankings
```http
GET /rankings/seasonal?season=2024-Q4
```

#### Get Monthly Rankings
```http
GET /rankings/monthly
```

#### Get Player Ranking
```http
GET /rankings/:id
```

### Chat

#### Get Room Messages
```http
GET /chat/rooms/:roomId?limit=50
```

#### Send Message
```http
POST /chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_id": "tournament_123",
  "content": "Hello everyone!"
}
```

#### Delete Message (Admin)
```http
DELETE /chat/:messageId
Authorization: Bearer <admin_token>
```

### Admin

#### Get Platform Stats
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

#### Get All Players (Admin)
```http
GET /admin/players?page=1&limit=50
Authorization: Bearer <admin_token>
```

#### Verify Player (Admin)
```http
POST /admin/players/:id/verify
Authorization: Bearer <admin_token>
```

#### Ban Player (Admin)
```http
POST /admin/players/:id/ban
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Cheating detected"
}
```

#### Get Reports (Admin)
```http
GET /admin/reports
Authorization: Bearer <admin_token>
```

#### Resolve Report (Admin)
```http
POST /admin/reports/:id/resolve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "resolution": "Player banned"
}
```

## WebSocket Events

Connect to WebSocket at: `ws://localhost:5000`

### Match Events

**Join Match Room**
```javascript
socket.emit('match:join', { matchId: '123' });
```

**Update Score**
```javascript
socket.emit('match:update-score', {
  matchId: '123',
  player1Score: 2,
  player2Score: 1
});
```

**Receive Score Update**
```javascript
socket.on('match:score-updated', (data) => {
  console.log(data);
});
```

### Chat Events

**Join Chat Room**
```javascript
socket.emit('chat:join-room', { roomId: 'tournament_123' });
```

**Send Message**
```javascript
socket.emit('chat:message', {
  roomId: 'tournament_123',
  username: 'Player',
  content: 'Hello!'
});
```

**Receive Message**
```javascript
socket.on('chat:new-message', (data) => {
  console.log(data);
});
```

## Error Responses

All errors return appropriate HTTP status codes:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP
- WebSocket connections: 1 per user

## Authentication Headers

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md)
