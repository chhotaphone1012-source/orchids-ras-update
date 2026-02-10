import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, limit, where } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");
    const limitCount = parseInt(searchParams.get("limit") || "20");

    const leaderboardRef = collection(db, "leaderboard");
    let q;

    if (gameId) {
      q = query(leaderboardRef, where("gameId", "==", gameId), orderBy("score", "desc"), limit(limitCount));
    } else {
      q = query(leaderboardRef, orderBy("score", "desc"), limit(limitCount));
    }

    const snapshot = await getDocs(q);
    const scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, scores });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, username, gameName, level, score } = body;

    if (!userId || !username || !gameName || !score) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const leaderboardRef = collection(db, "leaderboard");
    const docRef = await addDoc(leaderboardRef, {
      userId,
      username,
      gameName,
      score,
      level: level || 1,
      playedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
