"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Gamepad2, User, Trophy, Star, Zap, LogOut, Crown, Target, Award, TrendingUp, Medal, Sparkles, Flame, ChevronRight, Edit, Camera, Calendar, FlipHorizontal, Palette, X, Rocket, Share2, Download, Play, Timer } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageLoader from "@/components/animations/PageLoader";

const defaultGames = [
  { id: "ball-maze", name: "Ball Maze", icon: "⚽", desc: "Navigate through golden mazes with precision controls", color: "from-amber-500 to-orange-600" },
  { id: "ghost-kill", name: "Ghost Kill", icon: "👻", desc: "Slay ghosts with your cursor and reflexes", color: "from-purple-500 to-pink-600" },
  { id: "bird-fly", name: "Bird Fly", icon: "🐦", desc: "Fly through challenging obstacles", color: "from-cyan-500 to-blue-600" },
  { id: "snake-pro", name: "Snake Pro", icon: "🐍", desc: "Classic snake game reimagined", color: "from-green-500 to-emerald-600" },
  { id: "typing-master", name: "Typing Master", icon: "⌨️", desc: "Test your typing speed and accuracy", color: "from-rose-500 to-red-600" },
  { id: "word-maker", name: "Word Maker", icon: "🔤", desc: "Create words from scrambled letters", color: "from-indigo-500 to-violet-600" },
  { id: "ludo-king", name: "Ludo King", icon: "🎲", desc: "The classic board game with a gold twist", color: "from-amber-400 to-yellow-600" },
];

const themes = [
  { id: "cyber", name: "Cyber Neon", primary: "from-cyan-500 to-blue-600", accent: "cyan", bg: "from-slate-900 via-blue-950 to-slate-900", textColor: "text-cyan-400" },
  { id: "neon", name: "Hyper Glow", primary: "from-pink-500 to-purple-600", accent: "pink", bg: "from-purple-950 via-pink-950 to-purple-950", textColor: "text-pink-400" },
  { id: "retro", name: "Retro Gold", primary: "from-amber-500 to-orange-600", accent: "orange", bg: "from-amber-950 via-orange-950 to-red-950", textColor: "text-yellow-400" },
];

export default function UserDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
    const [recentScores, setRecentScores] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isHoveringBanner, setIsHoveringBanner] = useState(false);
    const [uploading, setUploading] = useState(false);
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editData, setEditData] = useState({ name: "", username: "", bio: "", location: "" });
  const [currentTheme, setCurrentTheme] = useState(themes[2]); // Retro Gold as default
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const isAdminAuth = typeof window !== "undefined" && localStorage.getItem("adminAuth") === "true";
          
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setEditData({
              name: data.name || "",
              username: data.username || "",
              bio: data.bio || "",
              location: data.location || ""
            });
          }

          const statsDoc = await getDoc(doc(db, "userStats", user.uid));
          if (statsDoc.exists()) setUserStats(statsDoc.data());

          const scoresQuery = query(collection(db, "leaderboard"), where("uid", "==", user.uid), orderBy("timestamp", "desc"), limit(5));
          const scoresSnap = await getDocs(scoresQuery);
          setRecentScores(scoresSnap.docs.map(d => d.data()));

            // Fetch Banners
            const bannersSnap = await getDocs(query(collection(db, "banners"), orderBy("createdAt", "desc"), limit(5)));
            setBanners(bannersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          // Fetch Games from Firestore
          const gamesSnap = await getDocs(collection(db, "games"));
          const gamesData = gamesSnap.docs.map(d => {
            const data = d.data();
            // Add color mapping if not present
            const colors: any = {
              'ball-maze': 'from-amber-500 to-orange-600',
              'ghost-kill': 'from-purple-500 to-pink-600',
              'bird-fly': 'from-cyan-500 to-blue-600',
              'snake-pro': 'from-green-500 to-emerald-600',
              'typing-master': 'from-rose-500 to-red-600',
              'word-maker': 'from-indigo-500 to-violet-600',
              'ludo-king': 'from-amber-400 to-yellow-600',
              'car-racing': 'from-slate-500 to-slate-800'
            };
            return { ...data, color: colors[d.id] || 'from-gray-500 to-gray-600' };
          });
          setGamesList(gamesData);

        } else if (typeof window !== "undefined" && localStorage.getItem("adminAuth") === "true") {
           setUserData({ name: "Admin", username: "admin", role: "admin" });
        } else {
          router.push("/login");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, [router]);


      useEffect(() => {
        if (banners.length > 1 && !isHoveringBanner) {
          const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
          }, 5000);
          return () => clearInterval(timer);
        }
      }, [banners.length, isHoveringBanner]);

      const handleLogout = async () => {
      await signOut(auth);
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminAuth");
      }
      router.push("/");
    };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: editData.name,
        username: editData.username,
        bio: editData.bio,
        location: editData.location
      });
      await updateProfile(auth.currentUser, { displayName: editData.name });
      setUserData({ ...userData, ...editData });
      setEditProfileDialog(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url });
      await updateProfile(auth.currentUser, { photoURL: url });
      setUserData({ ...userData, photoURL: url });
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload photo");
    }
    setUploading(false);
  };

  if (loading) {
    return <PageLoader isLoading={true} />;
  }

  return (
    <div className={`min-h-screen relative overflow-x-hidden bg-gradient-to-br ${currentTheme.bg} transition-colors duration-1000 ${mirrorMode ? "scale-x-[-1]" : ""}`}>
      <div className="galaxy-stars fixed inset-0 pointer-events-none z-0 opacity-40" />
      
      <div className={`relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${mirrorMode ? "scale-x-[-1]" : ""}`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-2xl"
              >
                <Gamepad2 className="w-10 h-10 text-black" />
              </motion.div>
                <h1 className="text-4xl font-black gold-text-gradient uppercase tracking-tighter">MY PAGE</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMirrorMode(!mirrorMode)}
                  className={`p-4 rounded-2xl border-2 transition-all shadow-xl ${mirrorMode ? "gold-gradient text-black border-yellow-400" : "bg-black/40 text-orange-400 border-orange-500/30 hover:border-orange-500"}`}
                >
                  <FlipHorizontal className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="p-4 rounded-2xl bg-black/40 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500 transition-all shadow-xl"
                >
                  <Palette className="w-6 h-6" />
                </motion.button>
                <Button onClick={handleLogout} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border-2 border-red-600/30 font-black px-6 py-6 rounded-2xl transition-all">
                  <LogOut className="w-5 h-5 mr-2" /> LOGOUT
                </Button>
              </div>
            </div>
  
            <AnimatePresence>
              {showThemeSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 0.9 }}
                  className="mb-12"
                >
                  <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-effect opacity-10" />
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                        <Palette className="w-8 h-8 text-orange-500 animate-pulse" /> Pick Colors
                      </h3>
                      <Button variant="ghost" size="icon" onClick={() => setShowThemeSelector(false)} className="text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((theme) => (
                      <motion.button
                        key={theme.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentTheme(theme);
                          toast.success(`${theme.name} Theme Set!`);
                        }}
                        className={`group relative h-32 rounded-[2rem] bg-gradient-to-br ${theme.bg} border-4 transition-all overflow-hidden ${
                          currentTheme.id === theme.id ? "border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]" : "border-white/10 grayscale-[40%] hover:grayscale-0"
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <span className={`relative z-10 text-2xl font-black italic tracking-widest ${theme.textColor}`}>
                          {theme.name.toUpperCase()}
                        </span>
                        {currentTheme.id === theme.id && (
                          <div className="absolute top-4 right-4 bg-yellow-400 p-1 rounded-full">
                            <Star className="w-4 h-4 text-black fill-black" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1 space-y-10">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="gold-border-glow bg-black/60 backdrop-blur-3xl overflow-hidden rounded-[3rem]">
                  <div className={`h-4 bg-gradient-to-r ${currentTheme.primary} animate-pulse-glow`} />
                  <CardContent className="pt-10 text-center pb-10">
                    <div className="relative inline-block mb-8">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-40 h-40 rounded-[2.5rem] gold-gradient mx-auto flex items-center justify-center text-6xl font-black text-black animate-pulse-glow overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.3)] border-4 border-black/20"
                      >
                        {userData?.photoURL ? (
                          <img src={userData.photoURL} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          userData?.name?.[0] || <User className="w-20 h-20" />
                        )}
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-black shadow-2xl border-4 border-black/20"
                      >
                        {uploading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-6 h-6 border-4 border-black border-t-transparent rounded-full" />
                        ) : (
                          <Camera className="w-7 h-7" />
                        )}
                      </motion.button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </div>
                    
                      <h2 className="text-3xl font-black gold-text-gradient uppercase tracking-tight mb-1">{userData?.name || "PLAYER"}</h2>
                      <p className={`text-xl font-bold ${currentTheme.textColor} italic mb-6`}>@{userData?.username || "player"}</p>
                      
                        <div className="flex items-center justify-center gap-3 text-white/40 font-black uppercase text-xs tracking-[0.2em] mb-8 bg-black/40 py-3 rounded-2xl">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span>Joined: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "2026"}</span>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={() => setEditProfileDialog(true)} className="w-full gold-gradient text-black font-black py-7 text-xl rounded-2xl shadow-xl">
                            <Edit className="w-6 h-6 mr-2" /> Update Info
                          </Button>
                        </motion.div>
                        
                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} className="p-5 rounded-2xl bg-black/40 border-2 border-orange-500/20 text-center group">
                                <div className="text-4xl font-black gold-text-gradient group-hover:scale-110 transition-transform">{userStats?.gamesPlayed || 0}</div>
                                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Games Played</div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} className="p-5 rounded-2xl bg-black/40 border-2 border-orange-500/20 text-center group">
                                <div className="text-4xl font-black text-yellow-400 group-hover:scale-110 transition-transform">{userStats?.gamesWon || 0}</div>
                                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Wins</div>
                            </motion.div>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.03 }} className="mt-6 p-8 rounded-[2rem] bg-black/60 border-2 border-yellow-500/30 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <Crown className="w-8 h-8 text-yellow-500 animate-pulse" />
                              <span className="text-5xl font-black gold-text-gradient tabular-nums">{userStats?.totalScore?.toLocaleString() || 0}</span>
                            </div>
                            <div className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Total Score</div>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
    
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="gold-border-glow bg-black/60 backdrop-blur-3xl rounded-[2rem]">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-black flex items-center gap-4 text-white uppercase tracking-tighter">
                          <Award className="w-6 h-6 text-yellow-500" /> My Prizes
                        </CardTitle>
                      </CardHeader>
                    <CardContent className="space-y-4">
                      {userStats?.achievements?.length > 0 ? (
                        <div className="space-y-3">
                          {userStats.achievements.slice(0, 4).map((ach: any, i: number) => (
                            <motion.div key={i} whileHover={{ x: 10, scale: 1.02 }} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group">
                              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center group-hover:animate-pulse">
                                <Star className="w-6 h-6 text-black fill-black" />
                              </div>
                              <span className="text-white font-black uppercase text-xs tracking-widest">{ach.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Medal className="w-12 h-12 mx-auto text-white/10 mb-4" />
                          <p className="text-xs text-white/30 font-black uppercase tracking-widest leading-relaxed">No awards yet.<br/>Play to win prizes!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
            </div>

            <div className="lg:col-span-3 space-y-10">
                {/* Announcement Banner */}
                <AnimatePresence mode="wait">
                  {banners.length > 0 && (
                    <motion.div
                      key={currentBanner}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="mb-10"
                    >
                      <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] p-1 shadow-2xl relative">
                        <div className="relative h-48 md:h-64 rounded-[2.2rem] overflow-hidden group">
                          <img 
                            src={banners[currentBanner].image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000"} 
                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            alt="Banner"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="flex items-center gap-3 mb-2">
                                   <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                                   <span className="text-yellow-500 font-black tracking-[0.3em] text-xs uppercase">New Info</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">{banners[currentBanner].title}</h3>
                                <p className="text-orange-100/60 font-bold uppercase tracking-widest text-sm md:text-base">{banners[currentBanner].subtitle}</p>
                              </div>
                              <div className="absolute top-6 right-6">
                                 <div className="gold-gradient text-black font-black px-6 py-2 rounded-full text-xs shadow-2xl animate-bounce">
                                    ANNOUNCEMENT
                                 </div>
                              </div>
                            </div>
                            
                            {/* Dot Indicators */}
                            {banners.length > 1 && (
                              <div className="absolute bottom-4 right-8 flex gap-2">
                                {banners.map((_, i) => (
                                  <div 
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? "w-6 gold-gradient" : "w-2 bg-white/20"}`}
                                  />
                                ))}
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
    
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                          <Rocket className="w-10 h-10 text-orange-500" />
                        </motion.div>
                        <h2 className="text-5xl font-black gold-text-gradient uppercase tracking-tighter">Games</h2>
                      </div>
                      <p className="text-2xl text-orange-100 font-black uppercase tracking-widest opacity-60 italic">CHOOSE A GAME TO PLAY</p>
                    </div>
                    <Link href="/games">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="outline" className="border-4 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-10 py-7 text-xl font-black rounded-full transition-all">
                          SEE ALL <ChevronRight className="w-6 h-6 ml-2" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {gamesList.map((game, i) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -15, scale: 1.03 }}
                    >
                      <Card className="gold-border-glow bg-black/70 backdrop-blur-3xl overflow-hidden h-full flex flex-col group rounded-[2.5rem]">
                        <div className={`h-40 bg-gradient-to-br ${game.color} flex items-center justify-center relative overflow-hidden`}>
                          <motion.span className="text-8xl relative z-10" animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}>
                            {game.icon}
                          </motion.span>
                          <div className="absolute inset-0 shimmer-effect opacity-30" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </div>
                        <CardHeader className="pb-4">
                          <CardTitle className="flex justify-between items-center text-white text-2xl font-black uppercase tracking-tighter">
                            {game.name}
                            <Crown className="h-6 w-6 text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                        </CardHeader>
                          <CardContent className="flex-grow flex flex-col p-8 pt-0">
                            <p className="text-sm text-orange-100/60 mb-6 flex-grow font-medium leading-relaxed italic">"{game.description || game.desc}"</p>
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Status</span>
                                <span className={`flex items-center gap-2 ${game.disabled ? 'text-orange-500' : 'text-green-400'} font-black text-sm uppercase`}>
                                  {game.disabled ? <Timer className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                  {game.disabled ? 'SOON' : 'OPEN'}
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">People Playing</span>
                                <span className="text-white font-black text-sm">{game.players?.toLocaleString() || 0}</span>
                              </div>
                            </div>
                            <Link href={game.disabled ? "#" : `/games/${game.id}`}>
                                  <motion.div whileHover={game.disabled ? {} : { scale: 1.05 }} whileTap={game.disabled ? {} : { scale: 0.95 }}>
                                    <Button 
                                      disabled={game.disabled}
                                      className={`w-full bg-gradient-to-r ${game.disabled ? 'from-zinc-600 to-zinc-800 opacity-50 cursor-not-allowed' : currentTheme.primary} text-black font-black text-lg h-16 rounded-2xl shadow-xl ${!game.disabled && 'group-hover:animate-pulse-glow'}`}>
                                      {game.disabled ? (
                                        <>
                                          <Timer className="w-6 h-6 mr-2" /> SOON
                                        </>
                                      ) : (
                                        <>
                                          <Play className="w-6 h-6 mr-2 fill-current" /> PLAY
                                        </>
                                      )}
                                    </Button>
                                  </motion.div>
                                </Link>
    
    
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
    
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden p-12">
                      <div className="absolute inset-0 shimmer-effect opacity-10" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                          <h3 className="text-4xl font-black gold-text-gradient uppercase tracking-tighter mb-4 flex items-center gap-4">
                            <Trophy className="w-12 h-12 text-yellow-500" /> LAST SCORES
                          </h3>
                          <p className="text-xl text-orange-100/60 font-bold italic mb-8 uppercase tracking-widest">Your last 5 game scores</p>
                          
                          {recentScores.length > 0 ? (
                            <div className="space-y-4">
                              {recentScores.slice(0, 5).map((score, i) => (
                                <motion.div 
                                  key={i} 
                                  whileHover={{ x: 20, backgroundColor: "rgba(251, 191, 36, 0.1)" }} 
                                  className="flex justify-between items-center p-5 rounded-2xl bg-black/40 border border-white/5 group transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center font-black text-black italic">
                                      {i+1}
                                    </div>
                                    <span className="text-white font-black uppercase tracking-tighter text-lg">{score.gameName}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="gold-text-gradient font-black text-2xl tabular-nums">{score.score?.toLocaleString()}</span>
                                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">SCORE</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-[2rem]">
                              <Target className="w-16 h-16 mx-auto text-white/10 mb-4" />
                              <p className="text-white/20 font-black uppercase tracking-widest">NO SCORES YET</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-black/40 p-10 rounded-[3rem] border-2 border-orange-500/20 text-center relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <motion.div
                            animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="mb-8"
                          >
                            <Crown className="w-24 h-24 mx-auto text-yellow-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                          </motion.div>
                          <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">KEEP PLAYING</h4>
                          <p className="text-orange-100/40 text-lg font-bold uppercase tracking-widest leading-relaxed mb-10">YOUR SCORE IS SAVED ON THE LIST</p>
                          <Link href="/leadership">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button className="gold-gradient text-black font-black px-12 py-8 text-2xl rounded-full shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                                See Best Players
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
    
          <footer className="relative z-10 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 py-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-black flex items-center justify-center shadow-2xl gold-border-glow">
                      <Gamepad2 className="w-12 h-12 text-orange-500" />
                    </div>
                      <span className="text-6xl font-black text-black tracking-tighter italic">6gamer</span>
                  </div>
                  <p className="text-black text-2xl font-black leading-relaxed max-w-lg mb-8 drop-shadow-sm uppercase">
                    THE BEST PLACE TO PLAY. 6 FUN GAMES. BEST PLAYER LIST.
                  </p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-black mb-8 border-b-4 border-black/30 pb-2 inline-block uppercase tracking-tighter">LINKS</h4>
                  <ul className="space-y-4">
                    <li><Link href="/games" className="text-black/80 hover:text-black text-xl font-black transition-all hover:translate-x-2 inline-block uppercase italic">GAMES</Link></li>
                    <li><Link href="/leadership" className="text-black/80 hover:text-black text-xl font-black transition-all hover:translate-x-2 inline-block uppercase italic">BEST PLAYERS</Link></li>
                    <li><Link href="/" className="text-black/80 hover:text-black text-xl font-black transition-all hover:translate-x-2 inline-block uppercase italic">HOME</Link></li>
                  </ul>
                </div>
                  <div>
                    <h4 className="text-3xl font-black text-black mb-8 border-b-4 border-black/30 pb-2 inline-block uppercase tracking-tighter">SHARE</h4>
                    <div className="space-y-6">
                      <Button className="w-full bg-black text-orange-500 font-black rounded-2xl h-14 hover:scale-105 transition-transform text-lg">
                        <Share2 className="w-6 h-6 mr-2" /> SHARE PAGE
                      </Button>
                    </div>
                  </div>
              </div>
              <div className="border-t-4 border-black/30 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-black text-2xl font-black tracking-tight uppercase">© 2026 6GAMER PRO. ALL RIGHTS RESERVED.</p>
                <div className="flex items-center gap-6">
                  <span className="text-black/80 text-xl font-black tracking-[0.3em] uppercase">Best Games</span>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                    <Crown className="w-12 h-12 text-black shadow-2xl" />
                  </motion.div>
                </div>
              </div>
            </div>
          </footer>

      <Dialog open={editProfileDialog} onOpenChange={setEditProfileDialog}>
        <DialogContent className="bg-black/95 border-4 border-orange-500/30 rounded-[3rem] p-10 max-w-lg">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black gold-text-gradient flex items-center gap-4 uppercase tracking-tighter">
                <Edit className="w-8 h-8 text-orange-500" /> Update Info
              </DialogTitle>
            </DialogHeader>
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-orange-400 font-black uppercase text-xs tracking-widest">Name</Label>
                  <Input 
                    value={editData.name} 
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                    className="bg-white/5 border-2 border-white/10 text-white h-14 text-lg rounded-2xl focus:border-orange-500" 
                    placeholder="Enter your name" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-orange-400 font-black uppercase text-xs tracking-widest">Username</Label>
                  <Input 
                    value={editData.username} 
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })} 
                    className="bg-white/5 border-2 border-white/10 text-white h-14 text-lg rounded-2xl focus:border-orange-500" 
                    placeholder="Enter username" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-orange-400 font-black uppercase text-xs tracking-widest">Bio</Label>
                  <Input 
                    value={editData.bio} 
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })} 
                    className="bg-white/5 border-2 border-white/10 text-white h-14 text-lg rounded-2xl focus:border-orange-500" 
                    placeholder="Tell us about yourself" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-orange-400 font-black uppercase text-xs tracking-widest">City</Label>
                  <Input 
                    value={editData.location} 
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })} 
                    className="bg-white/5 border-2 border-white/10 text-white h-14 text-lg rounded-2xl focus:border-orange-500" 
                    placeholder="Where do you live?" 
                  />
                </div>
              </div>
            <DialogFooter className="mt-10 gap-4">
              <Button variant="ghost" onClick={() => setEditProfileDialog(false)} className="text-white/40 hover:text-white hover:bg-white/10 font-black uppercase py-7 px-8 text-lg rounded-2xl transition-all">
                CANCEL
              </Button>
              <Button onClick={handleUpdateProfile} className="gold-gradient text-black font-black py-7 px-10 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                SAVE
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
