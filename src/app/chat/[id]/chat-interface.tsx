'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";
import { sendMessage } from "../actions";
import Link from "next/link";
import Image from "next/image";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

interface ChatInterfaceProps {
    swapId: string;
    initialMessages: Message[];
    currentUserId: string;
    partnerName: string;
    partnerAvatar: string;
    isMobileView?: boolean;
}

export default function ChatInterface({
    swapId,
    initialMessages,
    currentUserId,
    partnerName,
    partnerAvatar,
    isMobileView = true
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const channel = supabase
            .channel('chat_room')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `swap_id=eq.${swapId}`
                },
                (payload) => {
                    setMessages((current) => [...current, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [swapId, supabase]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage;
        setNewMessage(""); // Optimistic clear

        await sendMessage(swapId, content);
    };

    return (
        <div className="flex flex-1 flex-col h-full bg-[#101922] relative min-h-0">
            {/* Messages Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="text-center py-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Exchange Started</p>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${isMe
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area (Fixed) */}
            <div className="p-4 border-t border-zinc-800 bg-[#101922]">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl h-10 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-zinc-600"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
