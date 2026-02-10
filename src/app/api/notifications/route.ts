import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit, where } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limitCount = parseInt(searchParams.get("limit") || "50");

    const notificationsRef = collection(db, "notifications");
    let q;

    if (type && type !== "all") {
      q = query(notificationsRef, where("type", "==", type), orderBy("createdAt", "desc"), limit(limitCount));
    } else {
      q = query(notificationsRef, orderBy("createdAt", "desc"), limit(limitCount));
    }

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, notifications, count: notifications.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, type, targetUsers } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const notificationsRef = collection(db, "notifications");
    const docRef = await addDoc(notificationsRef, {
      title,
      content,
      type: type || "info",
      targetUsers: targetUsers || [],
      isGlobal: !targetUsers || targetUsers.length === 0,
      readBy: [],
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "Missing notification ID" }, { status: 400 });
    }

    await deleteDoc(doc(db, "notifications", notificationId));

    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
