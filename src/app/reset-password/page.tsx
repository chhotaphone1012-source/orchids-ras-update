"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, KeyRound, ShieldCheck, ArrowRight, CheckCircle, Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset" }),
      });

        if (response.ok) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("reset_email", email);
          }
          toast.success("OTP sent to your email!");
          setStep(2);
        } else {
        toast.error("Failed to send OTP.");
      }
    } catch (error) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: "reset" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP verified!");
        setStep(3);
      } else {
        toast.error(data.error || "Invalid OTP.");
      }
    } catch (error) {
      toast.error("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      sessionStorage.removeItem("reset_email");
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen galaxy-bg flex items-center justify-center p-4 relative">
      <div className="galaxy-stars fixed inset-0 pointer-events-none z-0" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="gold-border-glow bg-black/70 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              animate={{ rotate: step === 4 ? 0 : [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: step === 4 ? 0 : Infinity }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl gold-gradient flex items-center justify-center animate-pulse-glow shadow-2xl"
            >
              {step === 4 ? (
                <CheckCircle className="w-14 h-14 text-black" />
              ) : (
                <KeyRound className="w-14 h-14 text-black" />
              )}
            </motion.div>
            <CardTitle className="text-4xl font-black gold-text-gradient">
              {step === 4 ? "Email Sent!" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-orange-400 text-lg font-medium">
              {step === 1 && "Enter your email to receive an OTP"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Click to receive password reset link"}
              {step === 4 && "Check your inbox for the reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  animate={{ scale: step >= s ? 1.2 : 1 }}
                  className={`w-4 h-4 rounded-full transition-all ${
                    step >= s ? "gold-gradient" : "bg-orange-500/30"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-orange-300 flex items-center gap-2 text-lg font-medium">
                    <Mail className="w-5 h-5" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-14 text-lg focus:border-orange-500"
                    placeholder="your@email.com"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gold-gradient text-black font-bold h-14 text-xl hover:scale-105 transition-transform shadow-lg" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-orange-300 flex items-center gap-2 text-lg font-medium">
                    <ShieldCheck className="w-5 h-5" /> Enter 6-digit OTP
                  </Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    maxLength={6} 
                    className="text-center text-3xl tracking-[0.5em] h-16 bg-black/50 border-2 border-orange-500/30 text-orange-100 font-mono focus:border-orange-500" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gold-gradient text-black font-bold h-14 text-xl hover:scale-105 transition-transform shadow-lg" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSendResetLink} className="space-y-6">
                <p className="text-center text-orange-300 text-lg">
                  OTP verified! Click below to receive a password reset link at <span className="text-orange-500 font-bold">{email}</span>
                </p>
                <Button 
                  type="submit" 
                  className="w-full gold-gradient text-black font-bold h-14 text-xl hover:scale-105 transition-transform shadow-lg" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                  <Mail className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center space-y-6">
                <p className="text-orange-300 text-lg">
                  We've sent a password reset link to your email. Please check your inbox and follow the instructions.
                </p>
                <Link href="/login">
                  <Button className="gold-gradient text-black font-bold h-14 text-xl px-10 hover:scale-105 transition-transform shadow-lg">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 py-4">
        <div className="flex items-center justify-center gap-3">
          <Gamepad2 className="w-6 h-6 text-black" />
          <p className="text-black font-bold">© 2024 6gamer. Premium Gaming Platform.</p>
        </div>
      </footer>
    </div>
  );
}
