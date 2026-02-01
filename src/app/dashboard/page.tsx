export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import {
    ArrowRightLeft,
    Coins,
    Compass,
    MessageCircle,
    User,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SwapStack from "./swap-stack";
import BottomNav from "@/components/bottom-nav";

export default async function Dashboard() {
    const supabase = await createClient();

    // 1. Obtain current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get current user profile for balance display
    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("time_balance")
        .eq("id", user.id)
        .single();

    // 2. Get list of IDs interacting with (Swap sent or received)
    // Query SWAPS where sender_id = user.id OR receiver_id = user.id
    const { data: mySwaps } = await supabase
        .from('swaps')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    // Create Set of excluded IDs (including my own ID)
    const excludedIds = new Set([user.id]);
    mySwaps?.forEach(s => {
        if (s.sender_id) excludedIds.add(s.sender_id);
        if (s.receiver_id) excludedIds.add(s.receiver_id);
    });

    // 3. Search Profiles NOT in the Set
    // Using explicit exclusion logic
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, skills!inner(*)') // Inner join to ensure they have skills
        .not('id', 'in', `(${Array.from(excludedIds).map(id => `"${id}"`).join(',')})`) // Strict Mode: Exclude current interactions
        .limit(20); // Limit to keep it performant for now

    if (error) {
        console.error("Error fetching profiles:", error);
        return <div>Error loading profiles</div>;
    }

    // Filter valid profiles (ensure they have an offering skill) just in case logic above misses it
    const validProfiles =
        profiles?.filter((p) =>
            p.skills?.some((s: any) => s.type === "offering")
        ) || [];

    // 4. Fetch Current User's Seeking Skills for Matching
    const { data: mySkills } = await supabase
        .from('skills')
        .select('name')
        .eq('user_id', user.id)
        .eq('type', 'seeking');

    const mySeekingSkills = mySkills?.map(s => s.name) || [];

    // Prioritize Profiles that happen to OFFER what I SEEK
    // Simple sorting: If profile.skills (offering) includes any of mySeekingSkills, put first.
    const sortedProfiles = [...validProfiles].sort((a, b) => {
        const aOffers = a.skills?.filter((s: any) => s.type === 'offering').map((s: any) => s.name.toLowerCase());
        const bOffers = b.skills?.filter((s: any) => s.type === 'offering').map((s: any) => s.name.toLowerCase());

        const aMatch = aOffers?.some((offer: string) => mySeekingSkills.some(seek => offer.includes(seek.toLowerCase())));
        const bMatch = bOffers?.some((offer: string) => mySeekingSkills.some(seek => offer.includes(seek.toLowerCase())));

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0; // Maintain original order otherwise
    });


    // 4. Fetch Pending Swaps Count for Notification Dot
    const { count: pendingCount } = await supabase
        .from('swaps')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] font-sans text-white overflow-hidden min-h-screen flex justify-center">
            <div className="relative flex h-full min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-hidden border-x border-zinc-800 shadow-2xl bg-[#101922]">
                {/* TopAppBar */}
                <header className="flex items-center bg-[#f6f7f8] dark:bg-[#101922] p-4 pb-2 justify-between z-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#137fec] text-white p-1 rounded-lg">
                            <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            SkillSwap
                        </h2>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="flex items-center gap-1.5 bg-[#137fec]/20 border border-[#137fec]/30 px-3 py-1.5 rounded-full">
                            <Coins className="w-[18px] h-[18px] text-[#137fec]" />
                            <p className="text-white text-sm font-bold leading-normal tracking-tight">
                                {currentUserProfile?.time_balance ?? 0} Credits
                            </p>
                        </div>
                    </div>
                </header>

                {/* Main Discovery Feed Area */}
                <main className="flex-1 relative flex flex-col items-center justify-center p-4">
                    <SwapStack profiles={sortedProfiles} mySeekingSkills={mySeekingSkills} />
                </main>

                {/* BottomNavBar */}
                <BottomNav />
            </div>
        </div>
    );
}
