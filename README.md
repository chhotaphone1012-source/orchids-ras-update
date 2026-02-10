# 6GAMER - Premium Gaming Platform

A full-stack premium gaming platform built with Next.js 15, Firebase, and Framer Motion. Featuring 10 games (6 active + 4 coming soon) with infinite levels, real-time leaderboards, and a royal gold aesthetic.

## Recent Updates
- **10 Games Total**: 6 fully playable + 4 coming soon (Ludo King, Car Racing, Educational Adventures, Endless Runner)
- **Ludo King**: Full board game with 7-tier AI priority scoring, 2-4 player local modes, keyboard controls
- **Car Racing**: Canvas highway racing with 4-lane system, lane-based obstacle avoidance
- **Educational Adventures**: Quiz game with 50+ questions across Math, Science, History, Geography, General Knowledge; 50:50/Extra Time/Skip power-ups; 10 lives; difficulty scaling
- **Endless Runner**: Side-scrolling platformer with jump/slide mechanics, 4 obstacle types (crate/spike/bird/fire), 4 power-ups (shield/magnet/double/slow), particle effects, distance-based scoring
- **Firebase Verified**: Full seed data with 10 games, 4 users, leaderboard entries, achievements, challenges, banners
- **Mobile Responsive**: Full cross-device compatibility for all pages and games
- **Performance**: Optimized game animations and real-time score syncing with 60 FPS rendering

## Games List

### Active Games (Playable Now)
1. **Ball Maze** - Navigate through golden mazes with precision controls. Features fog of war, magnet power-up, moving walls (Level 5+), mini-map (M key), 20-minute timer.
2. **Ghost Kill** - Click/tap ghosts to score. 5 ghost types (normal/fast/bonus/danger/boss), combo multiplier (up to 3x), slow-time power-up, boss fights every 5 levels.
3. **Bird Fly** - Fly through pipes avoiding obstacles. Night mode (Level 4+), wind zones, golden rings (+50 bonus), coin collection, pipe object pooling.
4. **Snake Pro** - Classic snake reimagined. Phase mode (pass through walls), poison food (shrinks snake), 5 power-up types (speed/slow/bonus/time/phase), combo glow system.
5. **Typing Master** - Type words fast to score. 4 difficulty tiers (easy/medium/hard/expert), WPM tracking, streak multiplier, perfect word bonus (+100), accuracy meter, visual keyboard.
6. **Word Maker** - Create words from scrambled letters. 3 themes (Gaming/Space/Myth), bonus hidden words, decoy letters, 5 hints per level, streak multiplier.

### Coming Soon (Admin Test Mode Available)
7. **Ludo King** - Full 15x15 board game with 7-tier rule-based AI. 52-cell common path, 6-cell home paths, safe spots, capture mechanics, 3 consecutive 6s penalty. Keyboard: Space/Enter to roll, 1-4 to move pieces.
8. **Car Racing** - Canvas highway racing with 4-lane system. Arrow key controls, increasing speed per level, 3 obstacle color types, Web Audio API sounds.
9. **Educational Adventures** - Quiz game with 50+ questions across 5 categories (Math/Science/History/Geography/General). Category selection, 50:50 power-up, extra time (+15s), skip, 10 lives, 30s timer, streak/time bonuses, difficulty badges.
10. **Endless Runner** - Side-scrolling platformer with physics-based jumping/sliding. 4 obstacle types (crate/spike/bird/fire), 4 power-ups (shield/magnet/double/slow-mo), particle effects, coin collection, distance-based scoring.

## Features
- **Premium Gold UI**: Royal aesthetic with smooth gradients and galaxy background
- **Real-time Leaderboard**: See your rank against the world instantly via Firestore onSnapshot
- **Cross-Device**: Play perfectly on mobile, tablet, or PC
- **User Dashboard**: Dedicated stats, achievements, profile editing, theme selector
- **Admin Center**: Real-time user/game/score management, analytics, email broadcasting, OTP manager
- **Strict Auth**: Login required for all games, admin test mode for `admin@6gamer.com`
- **OTP Verification**: Email-based verification via Nodemailer SMTP (file-based OTP storage, 10-minute expiry)
- **Fullscreen Gaming**: Auto-fullscreen on game start with countdown
- **Infinite Play**: All games use infinite play mode (only ends on loss/time)

## Tech Stack
- **Frontend**: Next.js 15.3.5 (Turbopack), React 19, Framer Motion, Tailwind CSS 4
- **Backend**: Firebase (Firestore for real-time data, Auth for security, Storage for assets)
- **Styling**: Tailwind CSS 4, Custom CSS variables (gold-gradient, galaxy-bg)
- **Icons**: Lucide React
- **Notifications**: Sonner Toasts
- **Confetti**: canvas-confetti
- **Email**: Nodemailer (OTP/Email services)

## Project Structure
```
src/
├── app/                    # Next.js App Router (15 pages)
│   ├── api/                # 14 API routes
│   │   ├── auth/otp/       # OTP send & verify
│   │   ├── admin/          # Admin email & OTP management
│   │   ├── seed/           # Database seeding
│   │   ├── games/          # Game CRUD
│   │   ├── leaderboard/    # Score management
│   │   ├── users/          # User management
│   │   ├── achievements/   # Achievement system
│   │   ├── challenges/     # Daily challenges
│   │   ├── notifications/  # Notification system
│   │   ├── analytics/      # Platform analytics
│   │   └── user-stats/     # User statistics
│   ├── games/[id]/         # Dynamic game pages
│   ├── admin/              # Admin dashboard
│   ├── user-dashboard/     # User profile & stats
│   ├── leadership/         # Global leaderboard
│   ├── login/              # Authentication
│   ├── signup/             # Registration
│   ├── verify-otp/         # OTP verification
│   ├── reset-password/     # Password reset flow
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── terms/              # Terms of service
│   ├── privacy/            # Privacy policy
│   └── home/               # Alternative home
├── components/
│   ├── games/              # 10 game components
│   │   ├── BallMaze.tsx
│   │   ├── GhostKill.tsx
│   │   ├── BirdFly.tsx
│   │   ├── SnakeGame.tsx
│   │   ├── TypingMaster.tsx
│   │   ├── WordMaker.tsx
│   │   ├── LudoGame.tsx
│   │   ├── CarRacing.tsx
│   │   ├── EducationalAdventures.tsx
│   │   └── EndlessRunner.tsx
│   ├── ui/                 # 40+ Shadcn/UI components
│   ├── animations/         # Page loader, scroll animations, badge unlock
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── LoadingScreen.tsx
├── lib/
│   ├── firebase.ts         # Firebase config & initialization
│   ├── firestore.ts        # Firestore CRUD operations
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions (cn, playSound)
└── hooks/                  # Custom React hooks
```

## Firebase Collections
- `games` - 10 game entries (6 active + 4 disabled)
- `users` - User profiles with roles
- `leaderboard` - Global high scores
- `userStats` - Per-user statistics
- `achievements` - Achievement definitions
- `notifications` - System alerts
- `dailyChallenges` - Daily challenge targets
- `banners` - Home page banners
- `reports` - Bug reports
- `rewards` - Reward system

## Seed Data
The `/api/seed` endpoint populates Firebase with:
- 10 games (6 active, 4 coming soon)
- 4 dummy users (Rakesh Shukla, Aman Shukla, Mamta, Shammi)
- 6 leaderboard entries
- User stats for each user
- 3 achievements
- 2 banners
- 2 daily challenges
- 4 notifications
- 1 bug report

## Team
Developed by **Aman Shukla**, **Mamta**, **Shammi**
