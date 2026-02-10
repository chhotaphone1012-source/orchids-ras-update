import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, orderBy, limit } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const challengesRef = collection(db, "dailyChallenges");
    const snapshot = await getDocs(challengesRef);
    const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, challenges });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, gameId, targetScore, reward, date } = body;

    if (!title || !gameId || !targetScore) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const challengesRef = collection(db, "dailyChallenges");
    const docRef = await addDoc(challengesRef, {
      title,
      gameId,
      targetScore,
      reward: reward || "100 points",
      date: date || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
