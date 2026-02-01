export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRightLeft, Coins, Compass, MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import BottomNav from "@/components/bottom-nav";

export default async function ChatsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // 2. Fetch accepted/completed swaps with sender/receiver details
    // 2. Fetch accepted/completed swaps (Rely on RLS for security, Filter in logic if needed)
    const { data: allSwaps, error } = await supabase
        .from('swaps')
        .select(`
            *,
            sender:profiles!sender_id(username, avatar_url),
            receiver:profiles!receiver_id(username, avatar_url),
            messages(content, created_at)
        `)
        .in('status', ['accepted', 'completed'])
        .order('updated_at', { ascending: false }); // Order chats by their own update time (now supported)

    // Javascript Filter & Sort Messages
    const chats = allSwaps?.map(chat => {
        // Sort messages in JS since PostgREST nested limit can be tricky
        const sortedMessages = chat.messages?.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) || [];

        return {
            ...chat,
            messages: sortedMessages // Keep all or just [0] if we wanted, but we access [0] later
        };
    }).filter(chat =>
        chat.sender_id === user.id || chat.receiver_id === user.id
    ) || [];

    // ... Profile query for credits
    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("time_balance")
        .eq("id", user.id)
        .single();

    // ... (rest of code)

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] font-sans text-white overflow-hidden h-screen flex justify-center">
            {/* ... Header and container setup ... */}
            <div className="relative flex h-full w-full flex-col max-w-[430px] mx-auto overflow-hidden border-x border-zinc-800 shadow-2xl bg-[#101922]">
                {/* TopAppBar */}
                <header className="flex items-center bg-[#f6f7f8] dark:bg-[#101922] p-4 pb-2 justify-between z-20 sticky top-0 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#137fec] text-white p-1 rounded-lg">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            Chats
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

                <main className="flex-1 relative flex flex-col p-4 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {chats?.length === 0 ? (
                        <div className="text-center text-zinc-500 py-10">
                            <p>No active conversations.</p>
                        </div>
                    ) : (
                        chats?.map((chat: any) => {
                            // Defensive Partner Identification
                            const otherUser = chat.sender_id === user.id ? chat.receiver : chat.sender;
                            const lastMessage = chat.messages?.[0]; // Get the latest message

                            if (!otherUser) return null; // Defensive Skip

                            return (
                                <Link
                                    key={chat.id}
                                    href={`/chat/${chat.id}`}
                                    className="block bg-[#0d141c] border border-zinc-800/60 rounded-xl p-4 flex gap-4 hover:bg-zinc-800/40 transition-colors"
                                >
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                        {otherUser.avatar_url ? (
                                            <Image src={otherUser.avatar_url} alt={otherUser.username} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-500">
                                                {otherUser.username?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-sm text-white truncate">{otherUser.username}</h3>
                                            <span className="text-[10px] text-zinc-500">
                                                {formatDistanceToNow(new Date(lastMessage?.created_at || chat.updated_at || chat.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {chat.status === 'completed' ? (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                <p className="text-xs text-green-500 font-medium uppercase tracking-wide">Completed</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                                                {lastMessage ? (
                                                    <span className="text-zinc-300">{lastMessage.content}</span>
                                                ) : (
                                                    <span>Start chatting about <span className="text-blue-400">{chat.service_name}</span></span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </main>


                <BottomNav />
            </div>
        </div>
    );
}
