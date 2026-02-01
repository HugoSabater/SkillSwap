import Link from "next/link";
import { ArrowRightLeft, Compass, MessageCircle, User } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function BottomNav() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let pendingCount = 0;

    if (user) {
        const { count } = await supabase
            .from('swaps')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        pendingCount = count || 0;
    }

    return (
        <nav className="flex gap-2 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl px-4 pb-8 pt-3 z-40 sticky bottom-0 w-full shrink-0">
            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-zinc-500 hover:text-white transition-colors" href="/dashboard">
                <div className="flex h-7 items-center justify-center relative">
                    <Compass className="w-[26px] h-[26px]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Discover</p>
            </Link>

            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-zinc-500 hover:text-white transition-colors relative" href="/swaps">
                <div className="flex h-7 items-center justify-center relative">
                    <ArrowRightLeft className="w-[26px] h-[26px]" />
                    {/* Notification Dot */}
                    {pendingCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 size-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                    )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Inbox</p>
            </Link>

            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-zinc-500 hover:text-white transition-colors" href="/chats">
                <div className="flex h-7 items-center justify-center">
                    <MessageCircle className="w-[26px] h-[26px]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Chat</p>
            </Link>

            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-zinc-500 hover:text-white transition-colors" href="/profile">
                <div className="flex h-7 items-center justify-center">
                    <User className="w-[26px] h-[26px]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Profile</p>
            </Link>
        </nav>
    );
}
