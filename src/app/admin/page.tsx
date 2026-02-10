"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  updateDoc, onSnapshot, query, orderBy, limit, 
  where, getDoc, serverTimestamp, setDoc
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gamepad2, Image, Megaphone, Trash2, Plus, CheckCircle2, XCircle, 
  ArrowLeft, Crown, Users, BarChart3, ShieldAlert, ShieldCheck, 
  Activity, Star, Trophy, Search, Mail, Phone, Calendar, RefreshCw,
  Edit2, Save, X, Filter, ChevronLeft, ChevronRight, Settings,
  AlertTriangle, Gift, FileText, Layers, Eye, Menu, LayoutDashboard,
  Bell, Database, BarChart, HardDrive, Shield, Play, Newspaper
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminAuthInput, setAdminAuthInput] = useState({ email: "", password: "" });
  const [isPrompting, setIsPrompting] = useState(false);
  
  const [activeTab, setActiveTab] = useState("overview");

  const [analytics, setAnalytics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all"); 
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;

  const [games, setGames] = useState<any[]>([]);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [newGame, setNewGame] = useState({ 
    name: "", 
    icon: "🎮", 
    description: "", 
    category: "arcade", 
    isActive: true,
    levels: 10,
    players: 0,
    topScore: 0,
    disabled: false
  });


  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [lbSearch, setLbSearch] = useState("");

  const [banners, setBanners] = useState<any[]>([]);
  const [newBanner, setNewBanner] = useState({ title: "", subtitle: "", image: "", category: "announcement", link: "" });

  const [rewards, setRewards] = useState<any[]>([]);
  const [newReward, setNewReward] = useState({ title: "", description: "", points: 100, icon: "🎁" });

    const [reports, setReports] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [newNotification, setNewNotification] = useState({ title: "", content: "", type: "info" });
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "general", icon: "📢" });
  
    const [settings, setSettings] = useState({

    siteName: "6GAMER",
    maintenanceMode: false,
    allowRegistration: true,
    minWithdrawal: 500,
    supportEmail: "support@6gamer.com"
  });

  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; data?: any } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u?.email === "admin@gmail.com" || u?.email === "admin@6gamer.com") {
        setAdminStatus(true);
        setUser(u);
        fetchAllData();
        setLoading(false);
      } else {
        setIsPrompting(true);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

    const handleAdminLogin = async () => {
      if ((adminAuthInput.email === "admin@gmail.com" || adminAuthInput.email === "admin@6gamer.com") && adminAuthInput.password === "123456") {
        setAdminStatus(true);
        setIsPrompting(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("adminAuth", "true");
        }
        toast.success("Welcome back, Master Admin");
        fetchAllData();
      } else {
        toast.error("Incorrect details");
      }
    };

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const analRes = await fetch("/api/analytics");
      const analData = await analRes.json();
      if (analData.success) setAnalytics(analData.analytics);

      const userSnap = await getDocs(collection(db, "users"));
      setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const unsubBanners = onSnapshot(collection(db, "banners"), (snap) => {
        setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      const gamesSnap = await getDocs(collection(db, "games"));
      setGames(gamesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const lbSnap = await getDocs(query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(100)));
      setLeaderboard(lbSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const rewardsSnap = await getDocs(collection(db, "rewards"));
      setRewards(rewardsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const reportsSnap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")));
      setReports(reportsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const notifSnap = await getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")));
      setNotifications(notifSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const announcementsSnap = await getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc")));
      setAnnouncements(announcementsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const settingsDoc = await getDoc(doc(db, "system", "config"));
      if (settingsDoc.exists()) setSettings(settingsDoc.data() as any);
      
      setRefreshing(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync data");
      setRefreshing(false);
    }
  };

  const handleSeedData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchAllData();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Seed failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleResetDB = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/seed", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Database wiped clean!");
        fetchAllData();
      }
    } catch (e) {
      toast.error("Reset failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { 
        isBanned: !isBanned,
        bannedAt: !isBanned ? new Date().toISOString() : null 
      });
      toast.success(isBanned ? "User Unbanned" : "User Banned");
      setConfirmAction(null);
      fetchAllData();
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      await deleteDoc(doc(db, "userStats", userId));
      toast.success("User deleted");
      setConfirmAction(null);
      fetchAllData();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleAddGame = async () => {
    if (!newGame.name) return toast.error("Game name required");
    try {
      const gameId = newGame.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, "games", gameId), { ...newGame, createdAt: new Date().toISOString() });
      
      // Auto-announce new game
      await addDoc(collection(db, "announcements"), {
        title: `New Game: ${newGame.name}`,
        content: `${newGame.name} has been added to 6GAMER! ${newGame.description}`,
        type: "new_game",
        gameId: gameId,
        icon: newGame.icon,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      
      setNewGame({ name: "", icon: "🎮", description: "", category: "arcade", isActive: true, levels: 10, players: 0, topScore: 0, disabled: false });
      toast.success("Game added & announced!");
      fetchAllData();
    } catch (e) {
      toast.error("Failed to add game");
    }
  };

  const handleUpdateGame = async () => {
    if (!editingGame) return;
    try {
      await updateDoc(doc(db, "games", editingGame.id), editingGame);
      setEditingGame(null);
      toast.success("Game updated");
      fetchAllData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const toggleGameStatus = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "games", id), { disabled: !current });
      toast.success("Game status toggled");
      fetchAllData();
    } catch (e) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await deleteDoc(doc(db, "games", id));
      toast.success("Game removed");
      setConfirmAction(null);
      fetchAllData();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.image) return toast.error("Title and Image required");
    try {
      await addDoc(collection(db, "banners"), { ...newBanner, createdAt: new Date().toISOString() });
      setNewBanner({ title: "", subtitle: "", image: "", category: "announcement", link: "" });
      toast.success("News/Promotion posted");
    } catch (e) {
      toast.error("Failed to post");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, "banners", id));
      toast.success("News removed");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleAddReward = async () => {
    try {
      await addDoc(collection(db, "rewards"), { ...newReward, createdAt: new Date().toISOString() });
      setNewReward({ title: "", description: "", points: 100, icon: "🎁" });
      toast.success("Reward created");
      fetchAllData();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      await deleteDoc(doc(db, "rewards", id));
      toast.success("Reward removed");
      fetchAllData();
    } catch (e) {
      toast.error("Failed");
    }
  };

    const handleSaveSettings = async () => {
      try {
        await setDoc(doc(db, "system", "config"), { ...settings, updatedAt: serverTimestamp() });
        toast.success("Settings saved");
      } catch (e) {
        toast.error("Save failed");
      }
    };
  
    const handleSendNotification = async () => {
      if (!newNotification.title || !newNotification.content) return toast.error("Title and content required");
      try {
        await addDoc(collection(db, "notifications"), {
          ...newNotification,
          createdAt: new Date().toISOString(),
          isGlobal: true,
          readBy: []
        });
        setNewNotification({ title: "", content: "", type: "info" });
        toast.success("Notification broadcasted");
        fetchAllData();
      } catch (e) {
        toast.error("Failed to send");
      }
    };
  
    const handleDeleteNotification = async (id: string) => {
      try {
        await deleteDoc(doc(db, "notifications", id));
        toast.success("Notification removed");
        fetchAllData();
      } catch (e) {
        toast.error("Failed");
      }
    };
  
    const handleDeleteLBEntry = async (id: string) => {

    try {
      await deleteDoc(doc(db, "leaderboard", id));
      toast.success("Entry removed");
      fetchAllData();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return toast.error("Title and content required");
    try {
      await addDoc(collection(db, "announcements"), {
        ...newAnnouncement,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      setNewAnnouncement({ title: "", content: "", type: "general", icon: "📢" });
      toast.success("Announcement published!");
      fetchAllData();
    } catch (e) {
      toast.error("Failed to publish");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      toast.success("Announcement removed");
      fetchAllData();
    } catch (e) {
      toast.error("Failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen galaxy-bg flex items-center justify-center">
      <RefreshCw className="w-12 h-12 text-orange-500 animate-spin" />
    </div>
  );

  if (isPrompting && !adminStatus) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="fixed inset-0 galaxy-stars opacity-40 pointer-events-none" />
        <Card className="w-full max-w-md bg-black/80 backdrop-blur-2xl border-2 border-yellow-500/20 rounded-[3rem] p-10 relative z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-3xl gold-gradient flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Shield className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl font-black gold-text-gradient uppercase tracking-tighter">Admin Portal</h2>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mt-2">Strict Access Only</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Admin Email</Label>
              <Input 
                type="email" 
                value={adminAuthInput.email} 
                placeholder="admin@6gamer.com"
                onChange={(e) => setAdminAuthInput({...adminAuthInput, email: e.target.value})}
                className="bg-white/5 border-white/10 h-16 rounded-2xl text-white text-lg" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Secure Key</Label>
              <Input 
                type="password" 
                value={adminAuthInput.password} 
                placeholder="******"
                onChange={(e) => setAdminAuthInput({...adminAuthInput, password: e.target.value})}
                className="bg-white/5 border-white/10 h-16 rounded-2xl text-white text-lg" 
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full gold-gradient text-black font-black h-20 rounded-[2rem] text-xl shadow-2xl mt-4">
              OPEN PORTAL
            </Button>
            <Link href="/user-dashboard">
              <Button variant="ghost" className="w-full text-white/30 font-black tracking-widest text-[10px] uppercase mt-2">Back to Safety</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    // Hide the master admin from the list
    if (u.email === "admin@gmail.com" || u.email === "admin@6gamer.com") return false;

    const matchesSearch = 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase());
    
    if (userFilter === "banned") return matchesSearch && u.isBanned;
    if (userFilter === "active") return matchesSearch && !u.isBanned;
    if (userFilter === "admin") return matchesSearch && u.role === "admin";
    return matchesSearch;
  });

  const paginatedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

    const TABS = [
      { id: "overview", icon: Activity, label: "Stats", desc: "Live analytics and platform health" },
      { id: "users", icon: Users, label: "Users", desc: "Manage players and restrictions" },
      { id: "games", icon: Gamepad2, label: "Games", desc: "Configure active game modules" },
      { id: "leaderboards", icon: Trophy, label: "Boards", desc: "Global rankings and high scores" },
      { id: "news", icon: Megaphone, label: "News", desc: "Broadcast banners and updates" },
      { id: "announcements", icon: Newspaper, label: "Announce", desc: "Announce new games and updates to users" },
      { id: "notifications", icon: Bell, label: "Alerts", desc: "Send direct notifications to users" },
      { id: "rewards", icon: Gift, label: "Rewards", desc: "Loyalty points and gifts" },
      { id: "reports", icon: AlertTriangle, label: "Reports", desc: "User complaints and bug fixes" },
      { id: "settings", icon: Settings, label: "System", desc: "Core platform configuration" },
    ];


  return (
    <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden">
      <div className="fixed inset-0 galaxy-stars opacity-20 pointer-events-none" />
      
      <Button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-[60] gold-gradient text-black rounded-r-2xl h-20 w-8 flex items-center justify-center transition-all ${sidebarOpen ? 'left-[320px]' : 'left-0 shadow-[0_0_30px_rgba(234,179,8,0.2)]'}`}
      >
        <Menu className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
      </Button>

        <div className={`flex-1 transition-all duration-500 overflow-y-auto no-scrollbar pt-32 pb-40 px-8 ${sidebarOpen ? 'pl-[340px]' : 'pl-12'}`}>
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black gold-text-gradient uppercase tracking-tighter leading-none mb-2">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-white/40 font-bold uppercase text-xs tracking-widest">{TABS.find(t => t.id === activeTab)?.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={fetchAllData} variant="outline" className="border-white/5 bg-white/5 text-white/60 hover:text-white rounded-2xl h-14 px-8 font-black">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> SYNC
              </Button>
              <Link href="/user-dashboard">
                <Button variant="outline" className="border-2 border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white rounded-2xl h-14 px-8 font-black">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT
                </Button>
              </Link>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Users", value: analytics?.users?.total || 0, icon: Users, color: "text-blue-400", sub: `+${analytics?.users?.todaySignups} today` },
                      { label: "Game Plays", value: analytics?.scores?.total || 0, icon: Trophy, color: "text-yellow-400", sub: `${analytics?.scores?.todayPlays} today` },
                      { label: "Active Games", value: analytics?.games?.active || 0, icon: Gamepad2, color: "text-green-400", sub: `${analytics?.games?.total} total` },
                      { label: "Reports", value: reports.length, icon: AlertTriangle, color: "text-red-400", sub: `${reports.filter(r => !r.resolved).length} pending` }
                    ].map((stat, i) => (
                      <Card key={i} className="bg-white/[0.03] border-2 border-white/5 rounded-[2rem] p-8 hover:border-yellow-500/20 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                          <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                          </div>
                          <Badge variant="outline" className="border-white/5 text-[8px] uppercase">{stat.sub}</Badge>
                        </div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-5xl font-black text-white tabular-nums tracking-tighter">{stat.value}</h3>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                        <Database className="w-8 h-8 text-yellow-500" /> Database Management
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          onClick={handleSeedData} 
                          disabled={refreshing}
                          className="h-24 rounded-3xl bg-blue-600/10 border-2 border-blue-500/20 text-blue-500 font-black hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <Database className="w-6 h-6" />
                          <span className="text-[10px] tracking-widest uppercase">Seed Data</span>
                        </Button>
                        <Button 
                          onClick={() => setConfirmAction({ type: "reset_db", id: "all" })}
                          disabled={refreshing}
                          className="h-24 rounded-3xl bg-red-600/10 border-2 border-red-500/20 text-red-500 font-black hover:bg-red-600 hover:text-white transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <Trash2 className="w-6 h-6" />
                          <span className="text-[10px] tracking-widest uppercase">Reset DB</span>
                        </Button>
                      </div>
                      <p className="mt-6 text-white/20 text-[10px] font-black uppercase text-center tracking-widest italic">
                        * Seed will add dummy users, games, and stats for testing.
                      </p>
                    </Card>

                    <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 flex flex-col justify-center text-center group overflow-hidden relative">
                      <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <Crown className="w-32 h-32 text-yellow-500 mx-auto mb-8 animate-pulse drop-shadow-[0_0_50px_rgba(234,179,8,0.4)]" />
                      <h3 className="text-6xl font-black gold-text-gradient uppercase tracking-tighter mb-4">Supreme Admin</h3>
                      <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                          <p className="text-5xl font-black text-white">{analytics?.users?.verified}</p>
                          <p className="text-[10px] text-white/30 font-black uppercase mt-2 tracking-widest">Elite Players</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                          <p className="text-5xl font-black text-white">{analytics?.scores?.todayPlays}</p>
                          <p className="text-[10px] text-white/30 font-black uppercase mt-2 tracking-widest">Active Battles</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10">
                  <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-12">
                    <div className="relative w-full xl:w-96">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <Input 
                        placeholder="Search players..." 
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                        className="bg-white/5 border-white/10 text-white pl-16 h-16 rounded-[2rem] text-lg"
                      />
                    </div>
                    <div className="flex bg-white/5 border border-white/10 p-2 rounded-[2rem] w-full xl:w-auto overflow-x-auto no-scrollbar">
                      {["all", "active", "banned", "admin"].map(f => (
                        <button
                          key={f}
                          onClick={() => { setUserFilter(f); setUserPage(1); }}
                          className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${userFilter === f ? "gold-gradient text-black" : "text-white/40 hover:text-white"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden border border-white/5 rounded-[2rem]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Player Identity</th>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Platform Status</th>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] text-right">Direct Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {paginatedUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-8">
                              <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center font-black text-black text-xl shadow-lg">
                                  {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover rounded-2xl" /> : u.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-black uppercase text-base tracking-tight">{u.name}</p>
                                  <p className="text-white/30 text-xs font-medium">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              {u.isBanned ? (
                                <Badge variant="destructive" className="uppercase text-[10px] font-black px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 border-red-500/20">Banned</Badge>
                              ) : (
                                <Badge variant="outline" className="uppercase text-[10px] font-black px-4 py-1.5 rounded-full border-green-500/20 text-green-500">Active</Badge>
                              )}
                            </td>
                            <td className="p-8 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => setConfirmAction({ type: "ban", id: u.id, data: u.isBanned })}
                                  className={`rounded-2xl h-12 w-12 transition-all ${u.isBanned ? 'border-green-500/20 text-green-500 hover:bg-green-500/10' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}
                                >
                                  {u.isBanned ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => setConfirmAction({ type: "delete_user", id: u.id })} 
                                  className="rounded-2xl h-12 w-12 border-red-500/20 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalUserPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-12">
                      <Button variant="outline" onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="h-14 w-14 rounded-2xl border-white/5 bg-white/5"><ChevronLeft /></Button>
                      <span className="text-white font-black text-sm uppercase tracking-widest">Page {userPage} / {totalUserPages}</span>
                      <Button variant="outline" onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="h-14 w-14 rounded-2xl border-white/5 bg-white/5"><ChevronRight /></Button>
                    </div>
                  )}
                </Card>
              )}

              {activeTab === "games" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1">
                    <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 sticky top-32">
                      <h3 className="text-2xl font-black text-white uppercase mb-10 flex items-center gap-4">
                        <Plus className="w-8 h-8 text-yellow-500" /> {editingGame ? "Modify" : "Enlist"} Game
                      </h3>
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Official Name</Label>
                          <Input value={editingGame ? editingGame.name : newGame.name} onChange={(e) => editingGame ? setEditingGame({...editingGame, name: e.target.value}) : setNewGame({...newGame, name: e.target.value})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white text-lg" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Description</Label>
                          <textarea value={editingGame ? editingGame.description || "" : newGame.description} onChange={(e) => editingGame ? setEditingGame({...editingGame, description: e.target.value}) : setNewGame({...newGame, description: e.target.value})} className="w-full bg-white/5 border border-white/10 h-24 rounded-2xl p-4 text-white text-sm" placeholder="Describe this game..." />
                        </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Avatar/Icon</Label>
                              <Input value={editingGame ? editingGame.icon : newGame.icon} onChange={(e) => editingGame ? setEditingGame({...editingGame, icon: e.target.value}) : setNewGame({...newGame, icon: e.target.value})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white text-center text-3xl" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Stages/Levels</Label>
                              <Input type="number" value={editingGame ? editingGame.levels : newGame.levels} onChange={(e) => editingGame ? setEditingGame({...editingGame, levels: parseInt(e.target.value)}) : setNewGame({...newGame, levels: parseInt(e.target.value)})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Players Count</Label>
                              <Input type="number" value={editingGame ? editingGame.players : newGame.players} onChange={(e) => editingGame ? setEditingGame({...editingGame, players: parseInt(e.target.value)}) : setNewGame({...newGame, players: parseInt(e.target.value)})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Top Score Record</Label>
                              <Input type="number" value={editingGame ? editingGame.topScore : newGame.topScore} onChange={(e) => editingGame ? setEditingGame({...editingGame, topScore: parseInt(e.target.value)}) : setNewGame({...newGame, topScore: parseInt(e.target.value)})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" />
                            </div>
                          </div>

                        <Button onClick={editingGame ? handleUpdateGame : handleAddGame} className="w-full gold-gradient text-black font-black h-16 rounded-2xl text-xl shadow-xl hover:scale-105 transition-transform">
                          {editingGame ? "SAVE CHANGES" : "DEPLOY GAME"}
                        </Button>
                        {editingGame && <Button onClick={() => setEditingGame(null)} variant="ghost" className="w-full text-white/30 font-black tracking-widest text-[10px] uppercase">Discard Edits</Button>}
                      </div>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {games.map((game) => (
                      <Card key={game.id} className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-8 group hover:border-yellow-500/30 transition-all">
                          <div className="flex items-start justify-between mb-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-5xl border border-white/10 shadow-2xl group-hover:scale-110 transition-transform">{game.icon}</div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-2">
                                <Button size="icon" variant="ghost" onClick={() => setEditingGame(game)} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"><Edit2 className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setConfirmAction({ type: "delete_game", id: game.id })} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                              <Button 
                                onClick={() => toggleGameStatus(game.id, !game.disabled)}
                                className={`h-10 rounded-xl font-black text-[8px] uppercase tracking-widest ${!game.disabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                              >
                                {game.disabled ? "COMING SOON" : "USER ACCESS ON"}
                              </Button>
                            </div>
                          </div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{game.name}</h4>
                        <div className="flex items-center gap-4 mb-6">
                           <Badge variant="outline" className="border-white/10 text-white/30 text-[8px] uppercase font-black px-3 py-1">{game.category}</Badge>
                           <Badge variant="outline" className="border-white/10 text-white/30 text-[8px] uppercase font-black px-3 py-1">{game.levels} STAGES</Badge>
                        </div>
                        <Button 
                          onClick={() => router.push(`/games/${game.id}`)}
                          className="w-full h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
                        >
                          <Play className="w-4 h-4 mr-2" /> Test Mode Play
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "leaderboards" && (
                <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                      <Trophy className="w-10 h-10 text-yellow-500" /> Hall of Fame
                    </h3>
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <Input placeholder="Filter rankings..." value={lbSearch} onChange={(e) => setLbSearch(e.target.value)} className="bg-white/5 border-white/10 text-white h-16 rounded-2xl pl-16 text-lg" />
                    </div>
                  </div>
                  <div className="overflow-hidden border border-white/5 rounded-[2rem]">
                    <table className="w-full text-left">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Player</th>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Battleground</th>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Dominance Score</th>
                          <th className="p-8 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaderboard.filter(e => e.userName?.toLowerCase().includes(lbSearch.toLowerCase()) || e.gameName?.toLowerCase().includes(lbSearch.toLowerCase())).map((entry) => (
                          <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-8 text-white font-black uppercase text-base">{entry.userName || entry.username}</td>
                            <td className="p-8 text-white/40 font-black uppercase text-[10px] tracking-widest">{entry.gameName}</td>
                            <td className="p-8 text-yellow-500 font-black text-3xl tabular-nums tracking-tighter">{entry.score.toLocaleString()}</td>
                            <td className="p-8 text-right">
                              <Button variant="ghost" size="icon" onClick={() => setConfirmAction({ type: "delete_score", id: entry.id })} className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

                  {activeTab === "news" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-1">
                        <Card className="bg-white/[0.03] border-2 border-white/5 p-10 rounded-[3rem] sticky top-32">
                          <h3 className="text-2xl font-black text-white flex items-center gap-4 uppercase mb-10"><Megaphone className="w-8 h-8 text-yellow-500" /> Broadcast</h3>
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Headline</Label>
                              <Input value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} className="bg-white/5 border-white/10 text-white rounded-2xl h-14 text-lg" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Visual Cover URL</Label>
                              <Input value={newBanner.image} onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })} className="bg-white/5 border-white/10 text-white rounded-2xl h-14" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Target Link (Optional)</Label>
                              <Input value={newBanner.link} onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })} placeholder="e.g. /games/snake-pro" className="bg-white/5 border-white/10 text-white rounded-2xl h-14" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Category</Label>
                              <select 
                                value={newBanner.category} 
                                onChange={(e) => setNewBanner({ ...newBanner, category: e.target.value })} 
                                className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-4 text-white uppercase font-black text-[10px] tracking-widest"
                              >
                                <option value="announcement">📢 Announcement</option>
                                <option value="update">🚀 Game Update</option>
                                <option value="poster">🖼️ Poster</option>
                                <option value="ad">💰 Advertisement</option>
                              </select>
                            </div>
                            <Button onClick={handleAddBanner} className="w-full gold-gradient text-black font-black py-8 rounded-[2rem] text-xl mt-4 shadow-2xl hover:scale-105 transition-transform">POST NEWS</Button>
                          </div>
                        </Card>
                      </div>
                      <div className="lg:col-span-2 space-y-8">
                        {banners.map((banner) => (
                          <Card key={banner.id} className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-8 flex flex-col md:flex-row gap-10 items-center hover:border-yellow-500/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-6 right-24 z-10">
                              <Badge className="gold-gradient text-black uppercase text-[8px] font-black px-3 py-1">{banner.category}</Badge>
                            </div>
                            <div className="w-full md:w-64 h-36 rounded-[2rem] overflow-hidden bg-black shadow-2xl shrink-0"><img src={banner.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                            <div className="flex-1 text-left">
                              <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2">{banner.title}</h4>
                              <p className="text-white/40 font-bold italic text-sm">{banner.subtitle}</p>
                              {banner.link && <p className="text-yellow-500 text-[10px] font-black mt-2 uppercase tracking-widest">Link: {banner.link}</p>}
                            </div>
                            <Button variant="outline" size="icon" onClick={() => setConfirmAction({ type: "delete_banner", id: banner.id })} className="h-16 w-16 rounded-[2rem] border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 transition-all"><Trash2 className="w-6 h-6" /></Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}


                {activeTab === "notifications" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1">
                      <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 sticky top-32">
                        <h3 className="text-2xl font-black text-white uppercase mb-10 flex items-center gap-4">
                          <Bell className="w-8 h-8 text-yellow-500" /> Send Alert
                        </h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Alert Title</Label>
                            <Input value={newNotification.title} onChange={(e) => setNewNotification({...newNotification, title: e.target.value})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Alert Content</Label>
                            <textarea value={newNotification.content} onChange={(e) => setNewNotification({...newNotification, content: e.target.value})} className="w-full bg-white/5 border border-white/10 h-32 rounded-2xl p-4 text-white text-sm" />
                          </div>
                            <div className="space-y-2">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Alert Type</Label>
                              <select value={newNotification.type} onChange={(e) => setNewNotification({...newNotification, type: e.target.value})} className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-4 text-white uppercase font-black text-[10px]">
                                <option value="info">📢 Information</option>
                                <option value="update">🚀 Game Update</option>
                                <option value="warning">⚠️ Warning</option>
                                <option value="success">✅ Success</option>
                                <option value="error">🚨 Critical</option>
                              </select>
                            </div>

                          <Button onClick={handleSendNotification} className="w-full gold-gradient text-black font-black h-16 rounded-2xl text-lg mt-4">
                            BROADCAST NOW
                          </Button>
                        </div>
                      </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                      {notifications.map((notif) => (
                        <Card key={notif.id} className="bg-white/[0.03] border-2 border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-yellow-500/20">
                          <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-2xl ${notif.type === 'error' ? 'bg-red-500/10 text-red-500' : notif.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              <Bell className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-white uppercase">{notif.title}</h4>
                              <p className="text-white/40 text-sm line-clamp-1">{notif.content}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notif.id)} className="h-12 w-12 rounded-2xl text-white/20 hover:text-red-500">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}


              {activeTab === "rewards" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1">
                    <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 sticky top-32">
                      <h3 className="text-2xl font-black text-white uppercase mb-10 flex items-center gap-4"><Gift className="w-8 h-8 text-yellow-500" /> Forge Reward</h3>
                      <div className="space-y-8">
                        <div className="space-y-3"><Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Prize Title</Label><Input value={newReward.title} onChange={(e) => setNewReward({...newReward, title: e.target.value})} className="bg-white/5 border-white/10 h-16 rounded-2xl text-white text-lg" /></div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3"><Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Price (Gold)</Label><Input type="number" value={newReward.points} onChange={(e) => setNewReward({...newReward, points: parseInt(e.target.value)})} className="bg-white/5 border-white/10 h-16 rounded-2xl text-white" /></div>
                           <div className="space-y-3"><Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Icon/Emoji</Label><Input value={newReward.icon} onChange={(e) => setNewReward({...newReward, icon: e.target.value})} className="bg-white/5 border-white/10 h-16 rounded-2xl text-white text-center text-3xl" /></div>
                        </div>
                        <Button onClick={handleAddReward} className="w-full gold-gradient text-black font-black h-20 rounded-[2rem] text-xl shadow-2xl hover:scale-105 transition-transform">ADD TO VAULT</Button>
                      </div>
                    </Card>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {rewards.map(r => (
                      <Card key={r.id} className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 group hover:border-yellow-500/30 transition-all">
                        <div className="flex items-start justify-between mb-8">
                          <span className="text-6xl w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl group-hover:scale-110 transition-transform">{r.icon}</span>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmAction({ type: "delete_reward", id: r.id })} className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{r.title}</h4>
                        <p className="text-yellow-500 font-black text-sm tracking-widest uppercase">{r.points.toLocaleString()} GOLD POINTS</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 space-y-10">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-6"><AlertTriangle className="w-10 h-10 text-yellow-500" /> Grievance Portal</h3>
                  <div className="space-y-6">
                    {reports.map(report => (
                      <Card key={report.id} className={`bg-white/[0.02] border-2 rounded-[2.5rem] p-10 transition-all ${report.resolved ? 'border-green-500/10 opacity-60' : 'border-red-500/10 hover:border-red-500/30'}`}>
                        <div className="flex flex-col lg:flex-row gap-10 items-start">
                           <div className="flex-1 space-y-4">
                              <Badge variant={report.type === 'bug' ? 'destructive' : 'outline'} className="uppercase text-[10px] font-black px-6 py-2 rounded-full border-white/10">{report.type || 'PLAYER REPORT'}</Badge>
                              <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{report.subject || 'Platform Issue'}</h4>
                              <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                                <p className="text-white/70 text-base font-medium italic leading-relaxed">"{report.message}"</p>
                              </div>
                           </div>
                           <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-48">
                              {!report.resolved ? (
                                <Button 
                                  onClick={async () => { await updateDoc(doc(db, "reports", report.id), { resolved: true }); fetchAllData(); toast.success("Case Resolved"); }} 
                                  className="flex-1 lg:w-full bg-green-500 hover:bg-green-600 text-white font-black rounded-[1.5rem] h-20 text-lg shadow-xl"
                                >
                                  RESOLVE
                                </Button>
                              ) : (
                                <div className="flex-1 lg:w-full bg-green-500/10 border-2 border-green-500/20 text-green-500 py-6 rounded-[1.5rem] uppercase font-black text-center text-xs tracking-widest">RESOLVED</div>
                              )}
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setConfirmAction({ type: "delete_report", id: report.id })} 
                                className="h-20 w-full lg:w-20 rounded-[1.5rem] border-white/5 bg-white/5 text-white/20 hover:text-red-500 hover:border-red-500/20 transition-all"
                              >
                                <Trash2 className="w-8 h-8" />
                              </Button>
                           </div>
                        </div>
                      </Card>
                    ))}
                    {reports.length === 0 && (
                      <div className="text-center py-20 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6 opacity-20" />
                        <p className="text-white/20 font-black uppercase tracking-[0.3em]">All quiet on the support front</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

                {activeTab === "announcements" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1">
                      <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3rem] p-10 sticky top-32">
                        <h3 className="text-2xl font-black text-white uppercase mb-10 flex items-center gap-4">
                          <Newspaper className="w-8 h-8 text-yellow-500" /> New Announcement
                        </h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Title</Label>
                            <Input value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" placeholder="e.g. New Game Launched!" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Content</Label>
                            <textarea value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} className="w-full bg-white/5 border border-white/10 h-32 rounded-2xl p-4 text-white text-sm" placeholder="Describe the announcement..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Type</Label>
                              <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})} className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-4 text-white uppercase font-black text-[10px]">
                                <option value="general">General</option>
                                <option value="new_game">New Game</option>
                                <option value="update">Platform Update</option>
                                <option value="event">Event</option>
                                <option value="maintenance">Maintenance</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Icon</Label>
                              <Input value={newAnnouncement.icon} onChange={(e) => setNewAnnouncement({...newAnnouncement, icon: e.target.value})} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white text-center text-3xl" />
                            </div>
                          </div>
                          <Button onClick={handleAddAnnouncement} className="w-full gold-gradient text-black font-black h-16 rounded-2xl text-lg mt-4">
                            PUBLISH ANNOUNCEMENT
                          </Button>
                        </div>
                      </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                      {announcements.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                          <Newspaper className="w-20 h-20 text-yellow-500 mx-auto mb-6 opacity-20" />
                          <p className="text-white/20 font-black uppercase tracking-[0.3em]">No announcements yet</p>
                        </div>
                      )}
                      {announcements.map((ann) => (
                        <Card key={ann.id} className="bg-white/[0.03] border-2 border-white/5 rounded-[2.5rem] p-8 flex items-start justify-between group hover:border-yellow-500/20 transition-all">
                          <div className="flex items-start gap-6 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-3xl shrink-0 border border-yellow-500/20">
                              {ann.icon || "📢"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-black text-white uppercase tracking-tight">{ann.title}</h4>
                                <Badge variant="outline" className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                                  ann.type === 'new_game' ? 'border-green-500/20 text-green-500' :
                                  ann.type === 'update' ? 'border-blue-500/20 text-blue-500' :
                                  ann.type === 'event' ? 'border-purple-500/20 text-purple-500' :
                                  ann.type === 'maintenance' ? 'border-red-500/20 text-red-500' :
                                  'border-white/10 text-white/40'
                                }`}>{ann.type}</Badge>
                              </div>
                              <p className="text-white/50 text-sm leading-relaxed">{ann.content}</p>
                              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-3">
                                {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAnnouncement(ann.id)} className="h-12 w-12 rounded-2xl text-white/20 hover:text-red-500 shrink-0 ml-4">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                <div className="max-w-3xl mx-auto">
                  <Card className="bg-white/[0.03] border-2 border-white/5 rounded-[3.5rem] p-12 space-y-12">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-6">
                      <Settings className="w-10 h-10 text-yellow-500" /> Core System
                    </h3>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-yellow-500 text-xs font-black uppercase tracking-[0.2em]">Platform Identity</Label>
                        <Input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="bg-white/5 border-white/10 h-20 rounded-[2rem] text-white font-black uppercase text-2xl tracking-tight px-10" />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-yellow-500 text-xs font-black uppercase tracking-[0.2em]">Support Endpoint</Label>
                        <Input value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} className="bg-white/5 border-white/10 h-20 rounded-[2rem] text-white font-black text-xl px-10" />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                               <p className="text-white font-black uppercase text-sm mb-1">Maintenance</p>
                               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{settings.maintenanceMode ? 'OFFLINE' : 'OPERATIONAL'}</p>
                            </div>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-zinc-800'}`}>
                               <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                            </button>
                         </div>
                         <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                               <p className="text-white font-black uppercase text-sm mb-1">Registration</p>
                               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{settings.allowRegistration ? 'OPEN' : 'CLOSED'}</p>
                            </div>
                            <button onClick={() => setSettings({...settings, allowRegistration: !settings.allowRegistration})} className={`w-14 h-8 rounded-full transition-all relative ${settings.allowRegistration ? 'bg-green-500' : 'bg-zinc-800'}`}>
                               <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.allowRegistration ? 'right-1' : 'left-1'}`} />
                            </button>
                         </div>
                      </div>
                    </div>
                    <Button onClick={handleSaveSettings} className="w-full gold-gradient text-black font-black h-24 rounded-[2.5rem] text-2xl shadow-[0_20px_60px_rgba(234,179,8,0.2)] hover:scale-105 transition-transform">COMMIT CHANGES</Button>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 w-[320px] h-full bg-[#050505] border-r-2 border-white/5 z-50 p-8 flex flex-col pt-32 pb-12 overflow-y-auto no-scrollbar"
              >
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-2xl mb-6">
                  <Crown className="w-10 h-10 text-black" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Navigator</h2>
                <p className="text-yellow-500/40 text-[10px] font-black uppercase tracking-[0.2em]">Platform Control</p>
              </div>

              <div className="flex-1 space-y-3 pb-10">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group flex items-center gap-4 p-5 rounded-[2rem] transition-all relative overflow-hidden ${activeTab === tab.id ? 'gold-gradient text-black shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    <tab.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-black' : 'text-white/20 group-hover:text-yellow-500'}`} />
                    <span className="font-black uppercase tracking-tighter text-sm italic">{tab.label}</span>
                    {activeTab === tab.id && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-white/10" />}
                  </button>
                ))}
              </div>

              <div className="mt-auto p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-white font-black uppercase text-[10px] tracking-widest">Admin Access</p>
                    <p className="text-white/30 text-[8px] font-bold">Authenticated Profile</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 italic font-medium truncate">{user?.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="bg-zinc-950 border-2 border-white/10 rounded-[3rem] p-12 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Execute Action?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-medium italic text-base leading-relaxed">
              This directive is irreversible. The platform state will be permanently altered across all clusters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4 mt-8">
            <AlertDialogCancel className="rounded-[1.5rem] h-16 border-white/5 bg-white/5 text-white/40 font-black uppercase text-[10px] tracking-widest flex-1">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => { 
              if (!confirmAction) return; 
              if (confirmAction.type === 'ban') handleBanUser(confirmAction.id, confirmAction.data); 
              if (confirmAction.type === 'delete_user') handleDeleteUser(confirmAction.id); 
              if (confirmAction.type === 'delete_game') handleDeleteGame(confirmAction.id); 
              if (confirmAction.type === 'delete_banner') handleDeleteBanner(confirmAction.id); 
              if (confirmAction.type === 'delete_score') handleDeleteLBEntry(confirmAction.id); 
              if (confirmAction.type === 'delete_reward') handleDeleteReward(confirmAction.id); 
              if (confirmAction.type === 'reset_db') handleResetDB();
              if (confirmAction.type === 'delete_report') { deleteDoc(doc(db, "reports", confirmAction.id)); setConfirmAction(null); fetchAllData(); toast.success("Terminated"); } 
              setConfirmAction(null);
            }} className="rounded-[1.5rem] h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest flex-1 shadow-2xl">Execute</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
