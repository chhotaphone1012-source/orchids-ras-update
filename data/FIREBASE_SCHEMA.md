# Firebase Collections Schema - 6GAMER

## Complete Database Structure for Firebase Firestore

---

## 1. USERS Collection
**Path:** `users/{userId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | User's Firebase Auth UID | Yes |
| `email` | string | User's email address | Yes |
| `name` | string | Full name | Yes |
| `username` | string | Unique username | Yes |
| `phone` | string | Phone number | No |
| `photoURL` | string | Profile photo URL (Firebase Storage) | No |
| `role` | string | "user" or "admin" | Yes |
| `isVerified` | boolean | Email verification status | Yes |
| `isBanned` | boolean | Account ban status | Yes |
| `bannedAt` | timestamp | When user was banned | No |
| `createdAt` | timestamp | Account creation date | Yes |
| `lastLogin` | timestamp | Last login timestamp | No |
| `preferences` | object | User preferences | No |

**Example:**
```json
{
  "id": "abc123xyz",
  "email": "gamer@example.com",
  "name": "Pro Gamer",
  "username": "progamer123",
  "phone": "+1234567890",
  "photoURL": "https://firebasestorage.googleapis.com/...",
  "role": "user",
  "isVerified": true,
  "isBanned": false,
  "bannedAt": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-01-20T14:00:00Z",
  "preferences": {
    "theme": "cyber",
    "notifications": true
  }
}
```

---

## 2. GAMES Collection
**Path:** `games/{gameId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Auto-generated game ID | Yes |
| `name` | string | Game name | Yes |
| `icon` | string | Emoji icon | Yes |
| `description` | string | Game description | Yes |
| `levels` | number | Number of levels (default: 10) | Yes |
| `category` | string | Game category | No |
| `isActive` | boolean | Is game enabled | Yes |
| `createdAt` | timestamp | Creation date | Yes |
| `updatedAt` | timestamp | Last update | No |

**Example:**
```json
{
  "name": "Ball Maze",
  "icon": "⚽",
  "description": "Navigate through golden mazes with precision controls",
  "levels": 10,
  "category": "puzzle",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 3. LEADERBOARD Collection
**Path:** `leaderboard/{scoreId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Auto-generated score ID | Yes |
| `userId` | string | User's UID | Yes |
| `username` | string | Player's username | Yes |
| `gameName` | string | Name of the game | Yes |
| `gameId` | string | Game ID | Yes |
| `score` | number | Points scored | Yes |
| `level` | number | Level reached | Yes |
| `playedAt` | timestamp | When game was played | Yes |
| `duration` | number | Game duration in seconds | No |
| `rank` | string | Bronze/Silver/Gold/Diamond | No |

**Rank Calculation:**
- Bronze: 0 - 2,499 points
- Silver: 2,500 - 4,999 points
- Gold: 5,000 - 7,999 points
- Diamond: 8,000+ points

**Example:**
```json
{
  "userId": "abc123xyz",
  "username": "progamer123",
  "gameName": "Ball Maze",
  "gameId": "ball-maze",
  "score": 8500,
  "level": 10,
  "playedAt": "2024-01-20T15:30:00Z",
  "duration": 180,
  "rank": "Diamond"
}
```

---

## 4. USER_STATS Collection
**Path:** `userStats/{userId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `userId` | string | User's UID | Yes |
| `gamesPlayed` | number | Total games played | Yes |
| `gamesWon` | number | Total games won | Yes |
| `totalScore` | number | Cumulative score | Yes |
| `highestLevel` | number | Highest level reached | No |
| `favoriteGame` | string | Most played game | No |
| `achievements` | array | List of achievements | No |
| `playTime` | number | Total play time (minutes) | No |
| `lastPlayed` | timestamp | Last game played | No |

**Example:**
```json
{
  "userId": "abc123xyz",
  "gamesPlayed": 150,
  "gamesWon": 85,
  "totalScore": 125000,
  "highestLevel": 10,
  "favoriteGame": "Ball Maze",
  "achievements": [
    { "id": "first-win", "name": "First Win", "unlockedAt": "2024-01-15" }
  ],
  "playTime": 4500,
  "lastPlayed": "2024-01-20T15:30:00Z"
}
```

---

## 5. ACHIEVEMENTS Collection
**Path:** `achievements/{achievementId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Achievement ID | Yes |
| `name` | string | Achievement name | Yes |
| `description` | string | How to unlock | Yes |
| `icon` | string | Emoji icon | Yes |
| `points` | number | Points rewarded | Yes |
| `category` | string | Achievement category | No |
| `rarity` | string | common/rare/epic/legendary | No |

**Example:**
```json
{
  "name": "First Win",
  "description": "Complete your first game",
  "icon": "🏆",
  "points": 100,
  "category": "beginner",
  "rarity": "common"
}
```

---

## 6. DAILY_CHALLENGES Collection
**Path:** `dailyChallenges/{challengeId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Challenge ID | Yes |
| `title` | string | Challenge title | Yes |
| `description` | string | Challenge description | Yes |
| `game` | string | Target game name | Yes |
| `gameId` | string | Target game ID | No |
| `reward` | number | Points reward | Yes |
| `requirement` | object | Challenge requirements | Yes |
| `isActive` | boolean | Is challenge active | Yes |
| `createdAt` | timestamp | Creation date | Yes |
| `expiresAt` | timestamp | Expiration date | No |

**Example:**
```json
{
  "title": "Speed Runner",
  "description": "Complete Ball Maze in under 2 minutes",
  "game": "Ball Maze",
  "gameId": "ball-maze",
  "reward": 500,
  "requirement": {
    "type": "time",
    "value": 120,
    "operator": "less_than"
  },
  "isActive": true,
  "createdAt": "2024-01-20T00:00:00Z",
  "expiresAt": "2024-01-21T00:00:00Z"
}
```

---

## 7. NOTIFICATIONS Collection
**Path:** `notifications/{notificationId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Notification ID | Yes |
| `title` | string | Notification title | Yes |
| `content` | string | Notification message | Yes |
| `type` | string | info/success/warning/error | Yes |
| `isGlobal` | boolean | Is broadcast to all | Yes |
| `targetUserId` | string | Specific user (if not global) | No |
| `readBy` | array | User IDs who have read | Yes |
| `createdAt` | timestamp | Creation date | Yes |

**Example:**
```json
{
  "title": "New Game Added!",
  "content": "Check out our newest game: Target Hit!",
  "type": "info",
  "isGlobal": true,
  "targetUserId": null,
  "readBy": ["user1", "user2"],
  "createdAt": "2024-01-20T10:00:00Z"
}
```

---

## 8. GAME_PROGRESS Collection (Auto-Save)
**Path:** `gameProgress/{progressId}`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Progress ID | Yes |
| `userId` | string | User's UID | Yes |
| `gameId` | string | Game ID | Yes |
| `gameName` | string | Game name | Yes |
| `currentLevel` | number | Current level | Yes |
| `currentScore` | number | Current score | Yes |
| `checkpoint` | object | Game state data | No |
| `savedAt` | timestamp | Last save time | Yes |

**Example:**
```json
{
  "userId": "abc123xyz",
  "gameId": "ball-maze",
  "gameName": "Ball Maze",
  "currentLevel": 5,
  "currentScore": 3500,
  "checkpoint": {
    "position": { "x": 100, "y": 200 },
    "lives": 3
  },
  "savedAt": "2024-01-20T15:25:00Z"
}
```

---

## Firebase Storage Structure

```
avatars/
  └── {userId}         # Profile photos

game-assets/
  └── {gameId}/
      └── screenshots/
      └── thumbnails/

badges/
  └── {badgeId}.png    # Badge images
```

---

## Indexes Required

1. **leaderboard** - Composite index on `score` (desc) + `gameName`
2. **leaderboard** - Composite index on `userId` + `playedAt` (desc)
3. **users** - Index on `username` (unique)
4. **users** - Index on `email` (unique)
5. **dailyChallenges** - Composite index on `isActive` + `expiresAt`

---

## Security Rules Summary

- Users can read/write their own data
- Leaderboard is readable by all authenticated users
- Only admins can modify games, achievements, challenges
- Notifications readable by target user or all if global
