# SkillSwap 🔄

> **Live Demo:** [https://skill-swap-two-psi.vercel.app](https://skill-swap-two-psi.vercel.app)

SkillSwap is a barter economy platform for professionals. It allows developers, designers, and marketers to exchange services directly using time credits instead of money, fostering a circular economy of skills.

## 🎥 Project Presentation

Watch the deep-dive analysis of SkillSwap's architecture and features:

[![SkillSwap Demo](https://img.youtube.com/vi/RqI4sG0DTpY/0.jpg)](https://www.youtube.com/watch?v=RqI4sG0DTpY)

> *An AI-generated analysis of the project's technical architecture, security, and business logic.*

## 🚀 Key Features

- **🔐 Secure Auth & RLS:** Robust authentication with Supabase SSR and Row Level Security (RLS) policies to protect user data.
- **💎 Skill Economy:** Users earn credits by offering services and spend them to get help.
- **💬 Real-time Chat:** Instant messaging to coordinate swaps, powered by Supabase Realtime protocols.
- **⭐ Reputation System:** Complete feedback loop with 5-star ratings and reviews after swap completion.
- **🧠 Smart Dashboard:** "Strict Mode" filtering algorithm that ensures users always discover new connections, hiding previous interactions.
- **🎨 Modern UI:** Built with Next.js 14, Tailwind CSS, and Shadcn/ui (Dark Mode) for a native-app feel.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router & Server Actions)
- **Database:** Supabase (PostgreSQL + Realtime)
- **Styling:** Tailwind CSS + Shadcn/ui + Lucide Icons
- **State Management:** URL State + Optimistic UI

## 📦 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/HugoSabater/SkillSwap.git
   cd SkillSwap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables: Create a .env.local file with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Database Setup: This project relies on a specific PostgreSQL schema. Run the provided SQL scripts (located in /supabase/migrations or root) in your Supabase SQL Editor to create tables (profiles, swaps, messages, reviews) and apply RLS policies.

5. Run the development server:
   ```bash
   npm run dev
   ```

## 🔮 Future Roadmap
Corporate Swapping (B2B): Scaling the model for companies to exchange blocks of expert hours (e.g., Cybersecurity for AI consulting) without financial bureaucracy.

Mobile App: Native implementation using React Native.

Smart Contracts: Exploring blockchain for decentralized credit verification.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.