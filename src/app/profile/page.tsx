import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRightLeft, Compass, MessageCircle, User } from "lucide-react";
import ProfileView from "./profile-view";
import BottomNav from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*, skills(*)")
        .eq("id", user.id)
        .single();

    if (!profile) return <div>Loading...</div>;

    // Fetch User Stats via RPC
    const { data: statsData } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id });

    // Fallback defaults if RPC returns null (shouldn't happen with correct SQL)
    const stats = {
        matches: statsData?.matches_count || 0, // Now correctly using 'matches_count' (Accepted + Completed)
        timeInvested: statsData?.hours_invested || 0,
        totalMatches: statsData?.matches_count || 0
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] font-sans text-white overflow-hidden h-screen flex justify-center">
            <div className="relative flex h-full w-full flex-col max-w-[430px] mx-auto overflow-hidden border-x border-zinc-800 shadow-2xl bg-[#101922]">

                {/* Client Component for Interactive Profile View/Edit */}
                <ProfileView initialProfile={profile} stats={stats} />

                {/* Sticky Footer Navigation */}
                {/* Sticky Footer Navigation */}
                <BottomNav />
            </div>
        </div>
    );
}
