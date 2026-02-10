# 6GAMER Firebase Database Schema

## 1. `users` (Collection)
- `uid`: string (Document ID)
- `name`: string
- `email`: string
- `username`: string
- `phone`: string (optional)
- `role`: "user" | "admin"
- `photoURL`: string (optional)
- `isVerified`: boolean
- `isBanned`: boolean
- `bannedAt`: timestamp (optional)
- `createdAt`: timestamp

## 2. `games` (Collection)
- `id`: string (Document ID)
- `name`: string
- `icon`: string (Emoji or URL)
- `description`: string
- `levels`: number
- `category`: string
- `isActive`: boolean
- `createdAt`: timestamp

## 3. `leaderboard` (Collection)
- `userId`: string
- `username`: string
- `gameName`: string
- `score`: number
- `level`: number
- `playedAt`: timestamp

## 4. `userStats` (Collection)
- `userId`: string (Document ID)
- `gamesPlayed`: number
- `gamesWon`: number
- `totalScore`: number
- `achievements`: Array<{ name: string, unlockedAt: timestamp }>

## 5. `notifications` (Collection)
- `title`: string
- `content`: string
- `type`: "info" | "success" | "warning" | "error"
- `isGlobal`: boolean
- `readBy`: Array<string> (User UIDs)
- `createdAt`: timestamp

## 6. `dailyChallenges` (Collection)
- `title`: string
- `gameId`: string
- `targetScore`: number
- `reward`: string
- `date`: string (YYYY-MM-DD)

## 7. `achievements` (Collection)
- `name`: string
- `description`: string
- `icon`: string
- `criteria`: object
