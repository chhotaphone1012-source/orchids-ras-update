# MINOR PROJECT REPORT

**Project Title:** 6GAMER: A Premium Multi-Game Web Platform
**Technology Stack:** Next.js, Firebase, Tailwind CSS
**Project Level:** BCA Semester Project
**Academic Year:** 2025-26

---

## 1. COVER PAGE
**Project Name:** 6GAMER
**Submitted By:** Aman Shukla, Mamta, Shammi
**Course:** Bachelor of Computer Applications (BCA)
**University:** [University Name]
**Guided By:** [Guide Name]

---

## 2. MINOR PROJECT COMPLETION CERTIFICATE
This is to certify that the project entitled **"6GAMER"** is a bonafide work carried out by Aman Shukla, Mamta, and Shammi in partial fulfillment of the requirements for the award of the degree of Bachelor of Computer Applications.

---

## 3. INDEX
1. Introduction
2. Problem Statement
3. Objectives
4. Scope of the Project
5. Advantages
6. System Design
7. Technology Stack
8. Implementation Details
9. Testing
10. Deployment
11. Conclusion
12. Future Enhancements
13. References

---

## 4. INTRODUCTION
**Overview:**
6GAMER is a premium web-based gaming platform that offers a collection of 6 exclusive games. The platform features a royal gold-themed user interface, real-time global leaderboards, and an achievement system.

**Purpose:**
The purpose of the system is to provide a seamless, high-performance gaming experience that works across all devices, allowing users to compete globally and track their progress through a dedicated dashboard.

**SDLC Model:**
The project follows the **Agile Development Model**, allowing for iterative development, continuous feedback, and rapid deployment of features.

---

## 5. PROBLEM STATEMENT AND REQUIREMENT ANALYSIS
Existing web-based gaming platforms often suffer from slow loading times, cluttered interfaces, and a lack of real-time competitive features. Users need a centralized platform that is visually appealing, easy to navigate, and provides instant feedback on their gaming performance.

---

## 6. LIMITATION OF EXISTING SYSTEM
- Slow response times in multiplayer/competitive settings.
- Inconsistent UI/UX across different games.
- Complex registration and login processes.
- Lack of integrated achievement tracking.

---

## 7. OBJECTIVES OF THE PROJECT
- To build a high-performance gaming platform using Next.js.
- To implement real-time data synchronization using Firebase Firestore.
- To create a visually stunning 'Gold Theme' UI using Tailwind CSS.
- To provide an integrated dashboard for user profile management.

---

## 8. SCOPE OF THE PROJECT
The project covers:
- Secure User Authentication (Email, OTP verification).
- Six diverse games: Ball Maze, Ghost Kill, Bird Fly, Snake Pro, Typing Master, Word Maker.
- Global Leaderboard and User Stats tracking.
- Admin Panel for platform moderation.

---

## 9. ADVANTAGES OF THE PROPOSED SYSTEM
- **Speed:** Fast page transitions and minimal load times.
- **Real-time:** Instant score updates and ranking changes.
- **Aesthetic:** Premium, consistent design across all pages.
- **Security:** Robust authentication with OTP verification.

---

## 10. SYSTEM DESIGN
**High-Level Architecture:**
The platform uses a Client-Server architecture where the Next.js frontend interacts directly with Firebase services (Auth, Firestore, Storage) and backend API routes for utility tasks like sending emails.

**Low-Level Design:**
- **State Management:** React Hooks (useState, useEffect) for local state.
- **Navigation:** Next.js App Router for server-side and client-side routing.
- **Animations:** Framer Motion for smooth transitions and game effects.

**Data Flow Diagram (DFD):**
1. User enters credentials -> API/Auth verifies -> Access granted.
2. Game Score -> Firestore Update -> Leaderboard Sync -> UI Update.

**Database Design (Firestore Collections):**
- `users`: Stores user profiles (name, email, photoURL).
- `userStats`: Stores individual game performance data.
- `leaderboard`: Stores high scores for all users.
- `banners`: Stores dynamic news and announcements.

---

## 11. TECHNOLOGY STACK DESCRIPTION
- **Next.js 15:** Framework for server-rendered React applications.
- **Firebase Firestore:** NoSQL database for real-time data storage.
- **Firebase Auth:** For secure user management.
- **Tailwind CSS:** For modern, responsive styling.
- **Framer Motion:** For production-ready animations.

---

## 12. IMPLEMENTATION DETAILS
**Frontend Development:**
Developed using React 19 components with a mobile-first approach. Custom hooks are used for data fetching and real-time listeners.

**Backend / Firebase Integration:**
Integrated Firebase SDK for real-time score tracking and user authentication. API routes handle SMTP logic for OTP delivery.

---

## 13. TESTING
- **Unit Testing:** Testing individual game components and utility functions.
- **Integration Testing:** Ensuring the flow between login, game play, and score saving.
- **User Acceptance Testing:** Gathering feedback from users to improve UI clarity.

---

## 14. DEPLOYMENT DETAILS
The application is deployed on **Firebase Hosting**, providing a global CDN for fast delivery and SSL security.

---

## 15. SCREENSHOTS
- **Home Page:** Featuring the Royal Gold Banner and Game Library.
- **My Page:** Displaying User Stats and Theme Selector.
- **Best Players:** Global Ranking list.
- **Admin Panel:** Database management tools.

---

## 16. CONCLUSION
6GAMER successfully demonstrates a modern web application that combines entertainment with high-end tech. The platform is robust, fast, and provides a unique aesthetic experience for gamers.

---

## 17. FUTURE ENHANCEMENTS
- Adding Multiplayer support for Ludo and Car Racing.
- Implementing a Reward system with redeemable coins.
- Adding a friend system and direct messaging.

---

## 18. REFERENCES
1. Next.js Documentation (nextjs.org)
2. Firebase Official Guides (firebase.google.com)
3. Tailwind CSS Documentation (tailwindcss.com)
4. IEEE Standard for Web Applications (IEEE 26702)
