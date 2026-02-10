import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const achievementsRef = collection(db, "achievements");
    const snapshot = await getDocs(achievementsRef);
    const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, achievements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon, criteria } = body;

    if (!name || !description || !icon) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const achievementsRef = collection(db, "achievements");

    const docRef = await addDoc(achievementsRef, {
      name,
      description,
      icon,
      criteria: criteria || { type: "custom", value: 0 },
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const achievementTypes = {
  FIRST_GAME: { name: "First Steps", description: "Play your first game", points: 10 },
  LEVEL_5: { name: "Rising Star", description: "Reach level 5 in any game", points: 25 },
  LEVEL_10: { name: "Game Master", description: "Complete all 10 levels", points: 100 },
  SCORE_1000: { name: "High Scorer", description: "Score over 1000 points", points: 50 },
  SCORE_5000: { name: "Legend", description: "Score over 5000 points", points: 150 },
  ALL_GAMES: { name: "Explorer", description: "Play all 6 games", points: 75 },
  DAILY_STREAK: { name: "Dedicated", description: "Play 7 days in a row", points: 100 },
  TOP_10: { name: "Elite", description: "Reach top 10 on leaderboard", points: 200 },
};
