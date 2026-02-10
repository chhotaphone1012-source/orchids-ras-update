import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export async function GET() {
  try {
    const usersRef = collection(db, "users");
    const scoresRef = collection(db, "leaderboard");
    const gamesRef = collection(db, "games");

    const [usersSnap, scoresSnap, gamesSnap] = await Promise.all([
      getDocs(usersRef),
      getDocs(scoresRef),
      getDocs(gamesRef),
    ]);

    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const scores = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const games = gamesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = {
      users: {
        total: users.length,
        admins: users.filter((u: any) => u.role === "admin").length,
        regular: users.filter((u: any) => u.role !== "admin").length,
        verified: users.filter((u: any) => u.isVerified).length,
        banned: users.filter((u: any) => u.isBanned).length,
        todaySignups: users.filter((u: any) => {
          if (!u.createdAt) return false;
          const created = new Date(u.createdAt);
          return created >= today;
        }).length,
      },
      games: {
        total: games.length,
        active: games.filter((g: any) => g.isActive).length,
        inactive: games.filter((g: any) => !g.isActive).length,
      },
      scores: {
        total: scores.length,
        topScore: scores.length > 0 ? Math.max(...scores.map((s: any) => s.score || 0)) : 0,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((a: number, b: any) => a + (b.score || 0), 0) / scores.length) : 0,
        uniquePlayers: new Set(scores.map((s: any) => s.userId)).size,
        totalLevelsPlayed: scores.reduce((a: number, b: any) => a + (b.level || 0), 0),
        todayPlays: scores.filter((s: any) => {
          if (!s.playedAt) return false;
          const played = new Date(s.playedAt);
          return played >= today;
        }).length,
      },
      gameStats: games.map((game: any) => ({
        name: game.name,
        icon: game.icon,
        plays: scores.filter((s: any) => s.gameName?.toLowerCase().includes(game.name?.toLowerCase())).length,
        topScore: Math.max(...scores.filter((s: any) => s.gameName?.toLowerCase().includes(game.name?.toLowerCase())).map((s: any) => s.score || 0), 0),
      })),
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
