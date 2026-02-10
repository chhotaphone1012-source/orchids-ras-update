import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, setDoc, doc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";

export async function POST() {
  try {
    const collections = ["games", "users", "leaderboard", "userStats", "achievements", "dailyChallenges", "notifications", "banners", "rewards", "reports"];
    
    // Clear existing data
    for (const coll of collections) {
      const snap = await getDocs(collection(db, coll));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, coll, d.id));
      }
    }

    const games = [
      { id: "ball-maze", name: "Ball Maze", icon: "⚽", description: "Navigate through golden mazes with precision controls", levels: 10, category: "Puzzle", disabled: false, isActive: true, players: 1250, topScore: 8500, createdAt: new Date().toISOString() },
      { id: "ghost-kill", name: "Ghost Kill", icon: "👻", description: "Slay ghosts with your cursor and reflexes", levels: 10, category: "Action", disabled: false, isActive: true, players: 840, topScore: 12000, createdAt: new Date().toISOString() },
      { id: "bird-fly", name: "Bird Fly", icon: "🐦", description: "Fly through challenging obstacles", levels: 10, category: "Arcade", disabled: false, isActive: true, players: 2100, topScore: 4500, createdAt: new Date().toISOString() },
      { id: "snake-pro", name: "Snake Pro", icon: "🐍", description: "Classic snake game reimagined", levels: 10, category: "Classic", disabled: false, isActive: true, players: 3200, topScore: 7200, createdAt: new Date().toISOString() },
      { id: "typing-master", name: "Typing Master", icon: "⌨️", description: "Test your typing speed and accuracy", levels: 10, category: "Educational", disabled: false, isActive: true, players: 1500, topScore: 95, createdAt: new Date().toISOString() },
      { id: "word-maker", name: "Word Maker", icon: "🔤", description: "Create words from scrambled letters", levels: 10, category: "Word", disabled: false, isActive: true, players: 920, topScore: 3200, createdAt: new Date().toISOString() },
      { id: "ludo-king", name: "Ludo King", icon: "🎲", description: "The classic board game with a gold twist (Coming Soon)", levels: 10, category: "Board", disabled: true, isActive: true, players: 0, topScore: 0, createdAt: new Date().toISOString() },
      { id: "car-racing", name: "Car Racing", icon: "🏎️", description: "High-speed highway racing (Coming Soon)", levels: 10, category: "Racing", disabled: true, isActive: true, players: 0, topScore: 0, createdAt: new Date().toISOString() },
      { id: "educational-adventures", name: "Educational Adventures", icon: "🧠", description: "Learn Math, Science, History & more while playing!", levels: 10, category: "Educational", disabled: true, isActive: true, players: 0, topScore: 0, createdAt: new Date().toISOString() },
      { id: "endless-runner", name: "Endless Runner", icon: "🏃", description: "Run, jump, slide! Collect coins and avoid obstacles!", levels: 10, category: "Arcade", disabled: true, isActive: true, players: 0, topScore: 0, createdAt: new Date().toISOString() },
    ];

    const dummyUsers = [
      {
        uid: "rakeshshukla-uid-001",
        name: "Rakesh Shukla",
        email: "rakeshshukla@gmail.com",
        username: "rakeshshukla",
        role: "user",
        isVerified: true,
        isBanned: false,
        createdAt: new Date().toISOString(),
      },
      {
        uid: "aman-uid-002",
        name: "Aman Shukla",
        email: "aman@6gamer.com",
        username: "aman_pro",
        role: "admin",
        isVerified: true,
        isBanned: false,
        createdAt: new Date().toISOString(),
      },
      {
        uid: "mamta-uid-003",
        name: "Mamta",
        email: "mamta@6gamer.com",
        username: "mamta_gamer",
        role: "user",
        isVerified: true,
        isBanned: false,
        createdAt: new Date().toISOString(),
      },
      {
        uid: "shammi-uid-004",
        name: "Shammi",
        email: "shammi@6gamer.com",
        username: "shammi_legend",
        role: "user",
        isVerified: true,
        isBanned: false,
        createdAt: new Date().toISOString(),
      }
    ];

    const dummyLeaderboard = [
      { uid: "rakeshshukla-uid-001", username: "rakeshshukla", gameId: "ball-maze", gameName: "BALL MAZE", score: 8500, level: 12, timestamp: new Date().toISOString() },
      { uid: "aman-uid-002", username: "aman_pro", gameId: "ghost-kill", gameName: "GHOST KILL", score: 12000, level: 25, timestamp: new Date().toISOString() },
      { uid: "mamta-uid-003", username: "mamta_gamer", gameId: "bird-fly", gameName: "BIRD FLY", score: 4500, level: 8, timestamp: new Date().toISOString() },
      { uid: "shammi-uid-004", username: "shammi_legend", gameId: "snake-pro", gameName: "SNAKE PRO", score: 7200, level: 15, timestamp: new Date().toISOString() },
      { uid: "rakeshshukla-uid-001", username: "rakeshshukla", gameId: "typing-master", gameName: "TYPING MASTER", score: 95, level: 10, timestamp: new Date().toISOString() },
      { uid: "mamta-uid-003", username: "mamta_gamer", gameId: "word-maker", gameName: "WORD MAKER", score: 3200, level: 5, timestamp: new Date().toISOString() },
    ];

    const dummyAchievements = [
      { id: "first-win", title: "First Blood", description: "Win your first game session", icon: "🏆", points: 100 },
      { id: "score-1000", title: "Centurion", description: "Score over 1000 points in any game", icon: "⭐", points: 200 },
      { id: "master-typer", title: "Speed Demon", description: "Reach 80 WPM in Typing Master", icon: "⌨️", points: 500 },
    ];

    const banners = [
      { title: "Level Up Your Skills", subtitle: "Experience gaming like never before with 6GAMER.", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070", createdAt: new Date().toISOString() },
      { title: "Real-Time Leadership", subtitle: "Compete with players worldwide and reach the top.", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071", createdAt: new Date().toISOString() }
    ];

    for (const game of games) {
      await setDoc(doc(db, "games", game.id), game);
    }

    for (const user of dummyUsers) {
      await setDoc(doc(db, "users", user.uid), user);
      await setDoc(doc(db, "userStats", user.uid), {
        userId: user.uid,
        gamesPlayed: Math.floor(Math.random() * 50) + 10,
        gamesWon: Math.floor(Math.random() * 20) + 5,
        totalScore: Math.floor(Math.random() * 10000) + 2000,
      });
      
      // Add achievement for each user
      await addDoc(collection(db, "achievements"), {
        userId: user.uid,
        achievementId: "first-win",
        unlockedAt: new Date().toISOString()
      });

      // Add notification for each user
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Welcome to 6GAMER!",
        message: "Start your gaming journey now.",
        read: false,
        timestamp: new Date().toISOString()
      });
    }

    for (const entry of dummyLeaderboard) {
      await addDoc(collection(db, "leaderboard"), entry);
    }

    for (const banner of banners) {
      await addDoc(collection(db, "banners"), banner);
    }

    const dummyChallenges = [
      { title: "Daily Maze Runner", gameId: "ball-maze", target: 5000, reward: 500, expiresAt: new Date(Date.now() + 86400000).toISOString() },
      { title: "Ghost Hunter", gameId: "ghost-kill", target: 20, reward: 300, expiresAt: new Date(Date.now() + 86400000).toISOString() }
    ];

    const dummyReports = [
      { userId: "rakeshshukla-uid-001", type: "bug", description: "UI lag on mobile", status: "pending", createdAt: new Date().toISOString() }
    ];

    for (const challenge of dummyChallenges) {
      await addDoc(collection(db, "dailyChallenges"), challenge);
    }

    for (const report of dummyReports) {
      await addDoc(collection(db, "reports"), report);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded with 10 games and dummy data!"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const collections = ["games", "users", "leaderboard", "userStats", "achievements", "dailyChallenges", "notifications", "banners", "rewards", "reports"];
    
    for (const coll of collections) {
      const snap = await getDocs(collection(db, coll));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, coll, d.id));
      }
    }

    return NextResponse.json({ success: true, message: "All data cleared!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
