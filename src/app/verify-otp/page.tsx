"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, ShieldCheck, RefreshCw, Gamepad2 } from "lucide-react";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

    useEffect(() => {
      if (typeof window !== "undefined") {
        const pendingEmail = sessionStorage.getItem("pending_email");
        if (!pendingEmail) {
          router.push("/signup");
        } else {
          setEmail(pendingEmail);
        }
      }
    }, [router]);

    const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const response = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, type: "verify" }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Email verified successfully!");
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pending_email");
          }
          router.push("/user-dashboard");
        } else {
        toast.error(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "verify" }),
      });

      if (response.ok) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error("Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("Failed to resend OTP.");
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
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl gold-gradient flex items-center justify-center animate-pulse-glow shadow-2xl"
            >
              <ShieldCheck className="w-14 h-14 text-black" />
            </motion.div>
            <CardTitle className="text-4xl font-black gold-text-gradient">Verify Email</CardTitle>
            <CardDescription className="text-orange-400 text-lg font-medium">Enter the 6-digit OTP sent to your email</CardDescription>
          </CardHeader>
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-8 px-8">
              <div className="flex justify-center">
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-4xl tracking-[0.5em] h-20 bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/30 font-mono w-full focus:border-orange-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div className="flex items-center justify-center gap-3 text-orange-400">
                <Mail className="w-5 h-5" />
                <span className="text-lg font-medium">{email}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-5 px-8 pb-8">
              <Button 
                type="submit" 
                className="w-full gold-gradient text-black font-bold h-14 text-xl hover:scale-105 transition-transform shadow-lg" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  "Verify OTP"
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleResendOtp} 
                disabled={loading} 
                className="text-orange-500 hover:text-orange-400 text-lg font-medium"
              >
                <RefreshCw className="w-5 h-5 mr-2" /> Resend OTP
              </Button>
            </CardFooter>
          </form>
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
