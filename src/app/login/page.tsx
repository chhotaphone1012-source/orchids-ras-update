"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Lock, Mail, LogIn } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

      try {
        if (formData.email === "admin@gmail.com" && formData.password === "123456") {
          if (typeof window !== "undefined") {
            localStorage.setItem("adminAuth", "true");
          }
          toast.success("Welcome Admin!");
          router.push("/admin");
          return;
        }

      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          toast.success("Welcome Admin!");
          router.push("/admin");
        } else {
          toast.success("Logged in successfully!");
          router.push("/user-dashboard");
        }
      } else {
        toast.error("User profile not found.");
      }
    } catch (error: any) {
      toast.error("Invalid email or password.");
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
          <CardHeader className="text-center pb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl gold-gradient flex items-center justify-center animate-pulse-glow shadow-2xl"
            >
              <Gamepad2 className="w-14 h-14 text-black" />
            </motion.div>
            <CardTitle className="text-4xl font-black gold-text-gradient">Welcome Back</CardTitle>
            <CardDescription className="text-orange-400 text-lg font-medium">Login to your 6gamer account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-orange-300 flex items-center gap-2 text-lg font-medium">
                  <Mail className="w-5 h-5" /> Email Address
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-14 text-lg focus:border-orange-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-orange-300 flex items-center gap-2 text-lg font-medium">
                  <Lock className="w-5 h-5" /> Password
                </Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-14 text-lg focus:border-orange-500"
                />
              </div>
              <div className="text-right">
                <Link href="/reset-password" className="text-lg text-orange-500 hover:text-orange-400 transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
<CardFooter className="flex flex-col space-y-5 px-8 pb-8 pt-6">
                <Button 
                  type="submit" 
                  className="w-full gold-gradient text-black font-bold h-14 text-xl hover:scale-105 transition-transform shadow-lg cursor-pointer" 
                  disabled={loading}
                >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="w-6 h-6 mr-2" /> Login
                  </>
                )}
              </Button>
              <p className="text-lg text-center text-orange-300">
                Don't have an account?{" "}
                <Link href="/signup" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
