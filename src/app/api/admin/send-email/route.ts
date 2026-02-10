import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"6gamer Admin" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #FFD700; border-radius: 10px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
          <h2 style="color: #FFD700; margin-bottom: 20px;">6gamer</h2>
          <div style="color: #fff; font-size: 16px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #FFD700; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">This email was sent from 6gamer Admin Panel</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Admin Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
