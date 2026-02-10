import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

export async function GET() {
  try {
    const gamesRef = collection(db, "games");
    const q = query(gamesRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, games });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, icon, description, levels, category } = body;

    if (!name || !icon || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const gamesRef = collection(db, "games");
    const docRef = await addDoc(gamesRef, {
      name,
      icon,
      description,
      levels: levels || 10,
      category: category || "general",
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
