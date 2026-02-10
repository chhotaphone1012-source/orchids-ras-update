import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { Game, LeaderboardEntry, UserStats, User, Achievement } from "./types";

export const gamesCollection = collection(db, "games");
export const usersCollection = collection(db, "users");
export const leaderboardCollection = collection(db, "leaderboard");
export const userStatsCollection = collection(db, "userStats");

export async function createGame(game: Omit<Game, "id" | "createdAt">) {
  const docRef = await addDoc(gamesCollection, {
    ...game,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getGame(gameId: string) {
  const docRef = doc(db, "games", gameId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Game : null;
}

export async function getAllGames() {
  const snapshot = await getDocs(query(gamesCollection, where("isActive", "==", true)));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Game[];
}

export async function updateGame(gameId: string, data: Partial<Game>) {
  const docRef = doc(db, "games", gameId);
  await updateDoc(docRef, data);
}

export async function deleteGame(gameId: string) {
  await deleteDoc(doc(db, "games", gameId));
}

export async function addLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "playedAt">) {
  const docRef = await addDoc(leaderboardCollection, {
    ...entry,
    playedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getTopScores(gameId?: string, limitCount: number = 20) {
  let q;
  if (gameId) {
    q = query(leaderboardCollection, where("gameId", "==", gameId), orderBy("score", "desc"), limit(limitCount));
  } else {
    q = query(leaderboardCollection, orderBy("score", "desc"), limit(limitCount));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as LeaderboardEntry[];
}

export async function getUserStats(userId: string) {
  const docRef = doc(db, "userStats", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as UserStats : null;
}

export async function updateUserStats(userId: string, stats: Partial<UserStats>) {
  const docRef = doc(db, "userStats", userId);
  const existing = await getDoc(docRef);
  
  if (existing.exists()) {
    await updateDoc(docRef, stats);
  } else {
    await setDoc(docRef, {
      userId,
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      highestLevel: 0,
      achievements: [],
      lastPlayed: new Date().toISOString(),
      ...stats,
    });
  }
}

export async function incrementGameStats(userId: string, score: number, level: number, won: boolean) {
  const stats = await getUserStats(userId);
  
  const newStats: Partial<UserStats> = {
    gamesPlayed: (stats?.gamesPlayed || 0) + 1,
    gamesWon: (stats?.gamesWon || 0) + (won ? 1 : 0),
    totalScore: (stats?.totalScore || 0) + score,
    highestLevel: Math.max(stats?.highestLevel || 0, level),
    lastPlayed: new Date().toISOString(),
  };
  
  await updateUserStats(userId, newStats);
}

export async function addAchievement(userId: string, achievement: Achievement) {
  const stats = await getUserStats(userId);
  const achievements = stats?.achievements || [];
  
  if (!achievements.find(a => a.id === achievement.id)) {
    achievements.push(achievement);
    await updateUserStats(userId, { achievements });
  }
}

export async function getUser(userId: string) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null;
}

export async function updateUser(userId: string, data: Partial<User>) {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, data);
}

export async function deleteUser(userId: string) {
  await deleteDoc(doc(db, "users", userId));
  await deleteDoc(doc(db, "userStats", userId));
}

export const defaultGames: Omit<Game, "id" | "createdAt">[] = [
  { name: "Ball Maze", icon: "⚽", description: "Navigate through the maze using your keyboard.", levels: 10, category: "puzzle", isActive: true },
  { name: "Ghost Kill", icon: "👻", description: "Slay ghosts with your mouse. Watch out!", levels: 10, category: "action", isActive: true },
  { name: "Bird Fly", icon: "🐦", description: "Keep the bird flying through obstacles.", levels: 10, category: "arcade", isActive: true },
  { name: "Snake Pro", icon: "🐍", description: "Classic snake with a gold twist.", levels: 10, category: "arcade", isActive: true },
  { name: "Typing Master", icon: "⌨️", description: "Type fast before the text vanishes.", levels: 10, category: "skill", isActive: true },
  { name: "Word Maker", icon: "🔤", description: "Create words from scrambled letters.", levels: 10, category: "puzzle", isActive: true },
];
