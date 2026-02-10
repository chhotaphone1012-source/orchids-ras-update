import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanExpiredOTPs(data: OTPData): OTPData {
  const now = Date.now();
  data.otps = data.otps.filter((entry) => entry.expiresAt > now);
  return data;
}

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    const otp = generateOTP();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000;

    let data = readOTPs();
    data = cleanExpiredOTPs(data);
    
    data.otps = data.otps.filter((entry) => !(entry.email === email && entry.type === type));
    
    data.otps.push({
      email,
      otp,
      type,
      createdAt: now,
      expiresAt,
    });

    if (data.otps.length > 150) {
      data.otps = data.otps.slice(-150);
    }

    writeOTPs(data);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = type === "verify" ? "Verify your 6gamer Account" : "Reset your 6gamer Password";
    const text = `Your OTP for 6gamer is: ${otp}. Do not share it with anyone. Valid for 10 minutes.`;

    await transporter.sendMail({
      from: `"6gamer Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #FFD700; border-radius: 10px; background: #fffcf0;">
          <h2 style="color: #FFA500;">6gamer Authentication</h2>
          <p>${subject}</p>
          <div style="font-size: 24px; font-weight: bold; color: #B8860B; padding: 10px; border: 2px dashed #FFD700; display: inline-block;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP Send Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
