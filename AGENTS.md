## Project Summary
6GAMER is a premium gaming platform featuring 10 games (6 active + 4 coming soon) with real-time global leaderboards, achievements, and a royal gold aesthetic. It provides a high-performance experience with cross-device compatibility.

## Tech Stack
- **Framework**: Next.js 15.3.5 (Turbopack)
- **Frontend**: React 19, Framer Motion, Tailwind CSS 4, Lucide React
- **Backend/Database**: Firebase (Firestore for real-time scores, Auth for security, Storage for assets)
- **Utilities**: Nodemailer (Email/OTP), Sonner (Toasts), canvas-confetti (Celebrations)

## Architecture
- `src/app`: Next.js App Router for pages (15 pages) and API routes (14 endpoints)
- `src/components`: Reusable UI components and 10 game implementations
- `src/lib`: Firebase config, Firestore CRUD, TypeScript types, utility functions
- `src/hooks`: Custom React hooks

## User Preferences
- Only update, change, or remove exactly what is requested
- No extra features or unsolicited changes

## Project Guidelines
- Maintain the premium gold aesthetic
- Use Firebase for real-time features
- Follow existing patterns for components and API routes
- No comments unless requested

## Common Patterns
- Framer Motion for animations
- Lucide React for icons
- Shadcn/ui-like components in `src/components/ui`
- **Leaderboard**: Auto-sliding pagination (5s interval)
- **Games**: Infinite play mode (only ends on loss), immersive sounds, and automatic fullscreen on start
- **Dev Indicators**: Disabled in `next.config.ts` for a production-like aesthetic
- **Report**: Comprehensive 12,000+ word technical report available in `MINOR_PROJECT_REPORT.md`

## Games (10 Total)
### Active (6)
1. Ball Maze - Canvas-based maze with fog of war, magnet power-up, moving walls
2. Ghost Kill - Click-to-kill with boss fights, combo system, slow-time power-up
3. Bird Fly - Physics-based flyer with night mode, wind zones, golden rings
4. Snake Pro - Classic snake with phase mode, poison food, power-ups
5. Typing Master - WPM tracking, streak bonuses, accuracy meter, difficulty tiers
6. Word Maker - Theme-based word puzzles with bonus words, decoy letters, hints

### Coming Soon (4) - Admin Test Mode Available
7. Ludo King - Full board game with rule-based AI, 2-4 players, keyboard controls
8. Car Racing - Highway racing with lane-based obstacle avoidance
9. Educational Adventures - Quiz game with 50+ questions across 5 categories
10. Endless Runner - Side-scrolling platformer with power-ups and particle effects

## Ludo King Specifics
- Local AI only (rule-based: prioritize hits, home racing, safe spots)
- Keyboard support: Space/Enter to roll, 1-4 to move
- Strict Auth: Login required for all games, admin test mode available for `admin@6gamer.com`
- Redirect: Users are automatically redirected to `/user-dashboard` after login/verification

## Firebase Seed Data
- 10 games, 4 users, 6 leaderboard entries, 3 achievements, 2 banners, 2 challenges, 4 notifications, 1 report
- Seed endpoint: POST `/api/seed` | Clear: DELETE `/api/seed`
