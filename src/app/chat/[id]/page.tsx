export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ChatInterface from "./chat-interface";
import CompleteSwapButton from "./complete-swap-button";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import ReviewDialog from "@/components/review-dialog";
// import { formatDistanceToNow } from "date-fns"; // Unused
import BottomNav from "@/components/bottom-nav";

interface PageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function ChatPage({ params }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { id: currentSwapId } = await params;

    // 1. Fetch ALL Accepted Swaps for Left Column (Simple List) - (Note: Left column is unused in mobile view, but kept for logic consistency if we expand)
    const { data: allSwaps } = await supabase
        .from("swaps")
        .select(`
            id, service_name, updated_at, status,
            sender:sender_id(id, username, avatar_url),
            receiver:receiver_id(id, username, avatar_url)
        `)
        .eq("status", "accepted")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

    // 2. ROBUST FETCH: Try to get swap, if fails, render error state friendly
    const { data: swap, error: swapError } = await supabase
        .from("swaps")
        .select("*")
        .eq("id", currentSwapId)
        .maybeSingle(); // Prevents throw on 0 rows

    if (swapError || !swap) {
        console.error("Chat fetch error:", swapError);
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#101922] text-white p-4">
                <MessageSquare className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold mb-2">Chat not found</h2>
                <p className="text-zinc-400 mb-6 text-center max-w-sm">This exchange (ID: {currentSwapId}) might have been canceled or does not exist.</p>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // 3. Security Check
    const isSender = swap.sender_id === user.id;
    const isReceiver = swap.receiver_id === user.id;

    if (!isSender && !isReceiver) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#101922] text-white">
                <p className="text-red-500">Unauthorized Access</p>
            </div>
        );
    }

    // 4. Fetch Profiles Manually for Robustness
    const { data: senderData } = await supabase.from("profiles").select("*").eq("id", swap.sender_id).single();
    const { data: receiverData } = await supabase.from("profiles").select("*").eq("id", swap.receiver_id).single();

    if (!senderData || !receiverData) return <div>Data Integrity Error: Missing Profile</div>;

    const partner = isSender ? receiverData : senderData;

    // 5. Fetch Messages
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("swap_id", currentSwapId)
        .order("created_at", { ascending: true });

    // 6. Fetch Existing Review by Current User
    const { data: existingReview } = await supabase
        .from("reviews")
        .select("rating")
        .eq("swap_id", currentSwapId)
        .eq("reviewer_id", user.id)
        .single();

    // Fetch current user profile for credits display in header
    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("time_balance")
        .eq("id", user.id)
        .single();

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] font-sans text-white overflow-hidden h-screen flex justify-center">
            <div className="relative flex h-full w-full flex-col max-w-[430px] mx-auto overflow-hidden border-x border-zinc-800 shadow-2xl bg-[#101922]">

                {/* 1. Header (Sticky Top) */}
                <header className="flex items-center bg-[#f6f7f8] dark:bg-[#101922] p-4 pb-2 justify-between z-20 sticky top-0 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Link href="/chats" className="p-1 -ml-1 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                                {partner.avatar_url ? (
                                    <Image src={partner.avatar_url} alt={partner.username} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                        {partner.username?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white text-sm font-bold leading-none mb-0.5">
                                    {partner.username}
                                </h2>
                                <p className="text-[10px] text-zinc-400 leading-none">Active now</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        {/* Status / Action Area */}
                        {swap.status === 'completed' ? (
                            existingReview ? (
                                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                                    <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                        {existingReview.rating} <Star className="w-3 h-3 fill-current" />
                                    </span>
                                </div>
                            ) : (
                                <ReviewDialog swapId={currentSwapId} />
                            )
                        ) : (
                            <CompleteSwapButton swapId={currentSwapId} initialStatus={swap.status} />
                        )}

                        <div className="flex items-center gap-1.5 bg-[#137fec]/20 border border-[#137fec]/30 px-3 py-1.5 rounded-full">
                            <span className="text-xs font-bold text-[#137fec]">Credits</span>
                            <p className="text-white text-sm font-bold leading-normal tracking-tight">
                                {currentUserProfile?.time_balance ?? 0}
                            </p>
                        </div>
                    </div>
                </header>

                {/* 2. Main Chat Area (Flex-1 to take available space) */}
                <main className="flex-1 flex flex-col min-h-0 relative bg-[#101922]">
                    <ChatInterface
                        swapId={currentSwapId}
                        initialMessages={messages || []}
                        currentUserId={user.id}
                        partnerName={partner.username}
                        partnerAvatar={partner.avatar_url}
                        isMobileView={true}
                    />
                </main>

                {/* 3. Footer Navigation (Sticky Bottom) */}
                <BottomNav />
            </div>
        </div>
    );
}
