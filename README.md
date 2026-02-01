# SkillSwap 🔄

SkillSwap is a barter economy platform for professionals. It allows developers, designers, and marketers to exchange services directly using time credits instead of money, fostering a circular economy of skills.

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
   git clone [https://github.com/HugoSabater/SkillSwap.git](https://github.com/HugoSabater/SkillSwap.git)
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

4. Database Setup:
   This project relies on a specific PostgreSQL schema.
   Run the provided SQL scripts (located in /supabase/migrations or root) in your Supabase SQL Editor to create tables (profiles, swaps, messages, reviews) and apply RLS policies.

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.