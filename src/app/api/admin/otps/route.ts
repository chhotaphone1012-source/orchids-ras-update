import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OTP_FILE_PATH = path.join(process.cwd(), "data", "otps.json");

export async function GET() {
  try {
    const data = fs.readFileSync(OTP_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ otps: [] });
  }
}
