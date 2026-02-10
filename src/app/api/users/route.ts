import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, updateDoc, doc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const usersRef = collection(db, "users");
    let q;

    if (role && role !== "all") {
      q = query(usersRef, where("role", "==", role));
    } else {
      q = usersRef;
    }

    const snapshot = await getDocs(q);
    let users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Exclude admin from all user lists
    users = users.filter((u: any) => u.email !== "admin@gmail.com" && u.email !== "admin@6gamer.com");

    if (status === "banned") {
      users = users.filter((u: any) => u.isBanned);
    } else if (status === "active") {
      users = users.filter((u: any) => !u.isBanned);
    }

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, username, phone, role } = body;

    if (!name || !email || !username) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const usersRef = collection(db, "users");
    const docRef = await addDoc(usersRef, {
      uid: body.uid || "",
      name,
      email,
      username,
      phone: phone || "",
      role: role || "user",
      photoURL: body.photoURL || "",
      isVerified: false,
      isBanned: false,
      bannedAt: null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ success: false, error: "Missing userId or updates" }, { status: 400 });
    }

    await updateDoc(doc(db, "users", userId), updates);

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
