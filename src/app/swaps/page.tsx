export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRightLeft, CheckCircle2, ChevronRight, Clock, Coins, Compass, MessageCircle, MessageSquare, User, XCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwapActionButtons } from "./swap-action-buttons";
import BottomNav from "@/components/bottom-nav";

export default async function SwapsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Get current user profile for balance display
    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("time_balance")
        .eq("id", user.id)
        .single();

    const { data: incomingSwaps } = await supabase
        .from("swaps")
        .select(`*, sender:sender_id(username, avatar_url)`)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

    const { data: outgoingSwaps } = await supabase
        .from("swaps")
        .select(`*, receiver:receiver_id(username, avatar_url)`)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'accepted': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] font-sans text-white overflow-hidden h-screen flex justify-center">
            <div className="relative flex h-full w-full flex-col max-w-[430px] mx-auto overflow-hidden border-x border-zinc-800 shadow-2xl bg-[#101922]">
                <header className="flex items-center bg-[#f6f7f8] dark:bg-[#101922] p-4 pb-2 justify-between z-20 sticky top-0 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#137fec] text-white p-1 rounded-lg">
                            <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            Inbox
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

                <main className="flex-1 relative flex flex-col p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <Tabs defaultValue="received" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
                            <TabsTrigger value="received">Requests</TabsTrigger>
                            <TabsTrigger value="sent">Sent</TabsTrigger>
                        </TabsList>

                        <TabsContent value="received" className="space-y-4">
                            {incomingSwaps?.length === 0 ? (
                                <p className="text-center text-zinc-500 py-10">No requests yet.</p>
                            ) : (
                                incomingSwaps?.map((swap: any) => (
                                    <div key={swap.id} className="bg-[#0d141c] border border-zinc-800/60 rounded-xl p-4 flex gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                            {swap.sender?.avatar_url ? (
                                                <Image src={swap.sender.avatar_url} alt={swap.sender.username} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-500">
                                                    {swap.sender?.username?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-sm">{swap.sender?.username}</h3>
                                                <span className="text-[10px] text-zinc-500">{new Date(swap.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-3">
                                                Wants to learn <span className="text-blue-400">{swap.service_name}</span>
                                            </p>

                                            {swap.status === 'pending' ? (
                                                <SwapActionButtons swapId={swap.id} />
                                            ) : (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <StatusBadge status={swap.status} />
                                                    <span className="text-xs font-medium capitalize text-zinc-300">{swap.status}</span>
                                                    {swap.status === 'accepted' && (
                                                        <Link href={`/chat/${swap.id}`} className="ml-auto text-xs font-bold text-blue-400 hover:text-blue-300">
                                                            Open Chat
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="sent" className="space-y-4">
                            {outgoingSwaps?.length === 0 ? (
                                <p className="text-center text-zinc-500 py-10">No sent requests.</p>
                            ) : (
                                outgoingSwaps?.map((swap: any) => (
                                    <div key={swap.id} className="bg-[#0d141c] border border-zinc-800/60 rounded-xl p-4 flex gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                            {swap.receiver?.avatar_url ? (
                                                <Image src={swap.receiver.avatar_url} alt={swap.receiver.username} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-500">
                                                    {swap.receiver?.username?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-sm">{swap.receiver?.username}</h3>
                                                <span className="text-[10px] text-zinc-500">{new Date(swap.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-2">
                                                You asked for <span className="text-blue-400">{swap.service_name}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <StatusBadge status={swap.status} />
                                                <span className="text-xs font-medium capitalize text-zinc-300">{swap.status}</span>
                                                {swap.status === 'accepted' && (
                                                    <Link href={`/chat/${swap.id}`} className="ml-auto text-xs font-bold text-blue-400 hover:text-blue-300">
                                                        Open Chat
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
