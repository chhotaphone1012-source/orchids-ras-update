import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const docRef = doc(db, "userStats", userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return NextResponse.json({ success: false, error: "User stats not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, stats: { id: docSnap.id, ...docSnap.data() } });
    }

    const statsRef = collection(db, "userStats");
    const snapshot = await getDocs(statsRef);
    const stats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, gamesPlayed, gamesWon, totalScore, achievements } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    await setDoc(doc(db, "userStats", userId), {
      userId,
      gamesPlayed: gamesPlayed || 0,
      gamesWon: gamesWon || 0,
      totalScore: totalScore || 0,
      achievements: achievements || [],
    });

    return NextResponse.json({ success: true, id: userId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, gamesPlayed, gamesWon, totalScore, achievements } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const docRef = doc(db, "userStats", userId);
    const updates: Record<string, any> = {};
    
    if (gamesPlayed !== undefined) updates.gamesPlayed = gamesPlayed;
    if (gamesWon !== undefined) updates.gamesWon = gamesWon;
    if (totalScore !== undefined) updates.totalScore = totalScore;
    if (achievements !== undefined) updates.achievements = achievements;

    await updateDoc(docRef, updates);

    return NextResponse.json({ success: true, message: "Stats updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
