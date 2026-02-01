'use client';

import { useState } from 'react';
import Image from "next/image";
import { BadgeCheck, MapPin, X, Info, Check, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestSwapAction } from "./actions";

interface Skill {
    id: string;
    name: string;
    type: string;
}

interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    title?: string;
    bio: string;
    created_at: string;
    skills: Skill[];
}

export default function SwapStack({ profiles, mySeekingSkills = [] }: { profiles: Profile[], mySeekingSkills?: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showBio, setShowBio] = useState(false);

    const currentProfile = profiles[currentIndex];

    // Reset Info toggle when changing profiles
    const nextCard = () => {
        setDirection(null);
        setCurrentIndex(prev => prev + 1);
        setShowBio(false);
    };

    const handleSwipe = async (action: 'like' | 'pass') => {
        if (!currentProfile || isLoading) return;

        if (action === 'like') {
            setIsLoading(true); // Lock UI
            const skillName = currentProfile.skills.find(s => s.type === 'offering')?.name || 'General Help';
            const toastId = toast.loading("Processing request...");

            try {
                // AWAIT Server Action
                const result = await requestSwapAction(currentProfile.id, skillName);

                if (result.success) {
                    // SUCCESS: Show success and animate card away
                    toast.success(`Request sent to ${currentProfile.username}!`, { id: toastId });

                    setDirection('right');
                    await new Promise(r => setTimeout(r, 200));
                    nextCard();
                } else {
                    // FAIL: Show error, DO NOT REMOVE CARD
                    toast.error(result.message || "Failed to send request", { id: toastId });
                }
            } catch (error) {
                toast.error("An unexpected error occurred", { id: toastId });
            } finally {
                setIsLoading(false); // Unlock UI
            }
        } else {
            // PASS: Always succeeds instantly
            setDirection('left');
            await new Promise(r => setTimeout(r, 200));
            nextCard();
        }
    };

    if (!currentProfile) {
        return (
            <div className="text-center p-8 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <User className="text-zinc-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                <p className="text-zinc-400 max-w-[200px]">
                    No more professionals match your criteria right now.
                </p>
                <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl w-full">
                    <p className="text-blue-400 text-sm font-medium">
                        Check back later for new joins.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-[3/4] max-h-[600px] flex flex-col">

            {/* Background Cards for Depth */}
            <div className="absolute inset-x-4 -bottom-4 h-full bg-zinc-900/40 border border-zinc-800/50 rounded-2xl scale-[0.92] z-0 pointer-events-none transition-transform"></div>
            <div className="absolute inset-x-2 -bottom-2 h-full bg-zinc-900 border border-zinc-800 rounded-2xl scale-[0.96] z-10 pointer-events-none transition-transform"></div>

            {/* Active Card */}
            <div className={`
                relative w-full flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden z-20 shadow-2xl flex flex-col
                transition-all duration-300 transform origin-bottom select-none
                ${direction === 'right' ? 'translate-x-[150%] rotate-12 opacity-0' : ''}
                ${direction === 'left' ? '-translate-x-[150%] -rotate-12 opacity-0' : ''}
            `}>
                {/* Profile Image Layer */}
                <div className="absolute inset-0 bg-center bg-cover z-0">
                    {currentProfile.avatar_url ? (
                        <Image
                            src={currentProfile.avatar_url}
                            alt={currentProfile.username || "Professional"}
                            fill
                            className="object-cover"
                            priority
                            draggable={false}
                        />
                    ) : (
                        <Image
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                            alt="Placeholder"
                            fill
                            className="object-cover grayscale"
                            priority
                            draggable={false}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-[#101922]/40 to-transparent"></div>

                    {/* Match Badge */}
                    {(() => {
                        const hasMatch = currentProfile.skills.some(s =>
                            s.type === 'offering' &&
                            mySeekingSkills?.some(seek => s.name.toLowerCase().includes(seek.toLowerCase()))
                        );
                        if (hasMatch) {
                            return (
                                <div className="absolute top-4 right-4 bg-yellow-500/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in zoom-in spin-in-3 duration-500 z-20">
                                    <span>✨</span> Best Match
                                </div>
                            );
                        }
                    })()}
                </div>

                {/* Bio Overlay (Toggleable) */}
                {showBio && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 p-8 flex flex-col justify-center animate-in fade-in duration-200 gap-6">
                        <div>
                            <h4 className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-2">About</h4>
                            <p className="text-white text-base leading-relaxed font-medium">
                                {currentProfile.bio || "This user hasn't written a bio yet."}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* OFFERS Section */}
                            <div>
                                <h4 className="flex items-center gap-1.5 text-blue-400 text-xs uppercase font-bold tracking-widest mb-2">
                                    <span>⚡</span> Offers
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {currentProfile.skills.filter(s => s.type === 'offering').map(s => {
                                        // Highlight Logic
                                        const isMatch = mySeekingSkills?.some(seek => s.name.toLowerCase().includes(seek.toLowerCase()));
                                        return (
                                            <span key={s.id} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border ${isMatch
                                                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                                : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {isMatch && <span className="text-[10px]">✨</span>}
                                                {s.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SEEKS Section (Conditionally Rendered) */}
                            {currentProfile.skills.some(s => s.type === 'seeking') && (
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-purple-400 text-xs uppercase font-bold tracking-widest mb-2">
                                        <span>🔍</span> Seeks
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentProfile.skills.filter(s => s.type === 'seeking').map(s => (
                                            <span key={s.id} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border border-zinc-700 bg-zinc-800 text-zinc-400">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Card Content (Visible unless bio covers full, but here bio is overlay) */}
                <div className="mt-auto relative p-6 w-full flex flex-col gap-3 z-20 pointer-events-none">
                    {/* Information Text */}
                    <div className={showBio ? 'opacity-0 transition-opacity' : 'opacity-100 transition-opacity'}>
                        <div className="flex items-center gap-2">
                            <h3 className="text-white text-3xl font-bold shadow-black drop-shadow-md tracking-tight">
                                {currentProfile.username}
                            </h3>
                            <BadgeCheck className="text-[#137fec] w-6 h-6 drop-shadow-md" />
                        </div>
                        <p className="text-zinc-200 text-xl font-medium drop-shadow-md">
                            {currentProfile.title || "Professional"}
                        </p>
                        <div className="flex items-center gap-1.5 text-zinc-300 mt-2 font-medium drop-shadow-md">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Remote / Global</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-6 py-6 w-full z-30 px-4">
                <button
                    onClick={() => handleSwipe('pass')}
                    disabled={isLoading}
                    className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-red-500 shadow-xl hover:bg-zinc-800 hover:border-red-500/30 active:scale-95 transition-all text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Pass"
                >
                    <X className="w-7 h-7" />
                </button>

                <button
                    onClick={() => setShowBio(!showBio)}
                    disabled={isLoading}
                    className={`flex size-10 cursor-pointer items-center justify-center rounded-full border shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${showBio ? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                >
                    <Info className="w-5 h-5" />
                </button>

                <button
                    onClick={() => handleSwipe('like')}
                    disabled={isLoading}
                    className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-emerald-500 shadow-xl hover:bg-zinc-800 hover:border-emerald-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Request Swap"
                >
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Check className="w-8 h-8 font-bold" />}
                </button>
            </div>
        </div>
    );
}
