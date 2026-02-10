import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OTP_FILE_PATH = path.join(process.cwd(), "data", "otps.json");

interface OTPEntry {
  email: string;
  otp: string;
  type: "verify" | "reset";
  createdAt: number;
  expiresAt: number;
}

interface OTPData {
  otps: OTPEntry[];
}

function readOTPs(): OTPData {
  try {
    const data = fs.readFileSync(OTP_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { otps: [] };
  }
}

function writeOTPs(data: OTPData): void {
  fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    const { email, otp, type } = await req.json();

    if (!email || !otp || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const data = readOTPs();
    const now = Date.now();

    const otpEntry = data.otps.find(
      (entry) =>
        entry.email === email &&
        entry.otp === otp &&
        entry.type === type &&
        entry.expiresAt > now
    );

    if (!otpEntry) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
    }

    data.otps = data.otps.filter(
      (entry) => !(entry.email === email && entry.type === type)
    );
    writeOTPs(data);

    return NextResponse.json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
