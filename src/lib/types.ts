export interface Game {
  id: string;
  name: string;
  icon: string;
  description: string;
  levels: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  gameName: string;
  gameId: string;
  level: number;
  score: number;
  playedAt: string;
}

export interface UserStats {
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  highestLevel: number;
  achievements: Achievement[];
  lastPlayed: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface User {
  uid: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
  isVerified: boolean;
}

export interface OTPEntry {
  email: string;
  otp: string;
  type: "verify" | "reset";
  createdAt: number;
  expiresAt: number;
}
