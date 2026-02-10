"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, User, Mail, Phone, Lock, UserPlus, Gamepad2 } from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          uid: userCredential.user.uid,
          createdAt: new Date().toISOString(),
          role: "user",
        });

        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_email", formData.email);
        }

        await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, type: "verify" }),
      });

      toast.success("Account created! Please verify your email.");
      router.push("/verify-otp");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen galaxy-bg flex items-center justify-center p-4 relative py-20">
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
              <Crown className="w-14 h-14 text-black" />
            </motion.div>
            <CardTitle className="text-4xl font-black gold-text-gradient">Join 6GAMER</CardTitle>
            <CardDescription className="text-orange-400 text-lg font-medium">Create your gaming account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-orange-300 flex items-center gap-2 text-base font-medium">
                  <User className="w-4 h-4" /> Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-12 text-base focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-orange-300 flex items-center gap-2 text-base font-medium">
                  <Gamepad2 className="w-4 h-4" /> Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="gamer123"
                  required
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-12 text-base focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-orange-300 flex items-center gap-2 text-base font-medium">
                  <Mail className="w-4 h-4" /> Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@email.com"
                  required
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-12 text-base focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-orange-300 flex items-center gap-2 text-base font-medium">
                  <Phone className="w-4 h-4" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 234 567 890"
                  required
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-12 text-base focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-orange-300 flex items-center gap-2 text-base font-medium">
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                  className="bg-black/50 border-2 border-orange-500/30 text-orange-100 placeholder:text-orange-400/40 h-12 text-base focus:border-orange-500"
                />
              </div>
            </CardContent>
<CardFooter className="flex flex-col space-y-5 px-8 pb-8 pt-8">
                <Button
                  type="submit"
                  className="w-full gold-gradient text-black font-bold h-14 text-xl hover:scale-105 transition-transform shadow-lg cursor-pointer mt-4"
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
                    <UserPlus className="w-6 h-6 mr-2" /> Create Account
                  </>
                )}
              </Button>
              <p className="text-lg text-center text-orange-300">
                Already have an account?{" "}
                <Link href="/login" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
