'use client';

import { createClient } from "@/utils/supabase/client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRightLeft, Camera, Check, Coins, Compass, MapPin, MessageCircle, User, X } from "lucide-react";
import Link from "next/link";
import { updateProfile } from "./actions";
import { toast } from "sonner";

interface Skill {
    id: string;
    name: string;
    type: 'offering' | 'seeking';
}

interface ProfileData {
    id: string;
    username: string;
    title: string | null;
    bio: string | null;
    location: string | null;
    portfolio_url: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    time_balance: number;
    skills: Skill[];
}

export default function ProfileView({ initialProfile, stats = { matches: 0, timeInvested: 0 } }: { initialProfile: ProfileData, stats?: { matches: number, timeInvested: number } }) {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(initialProfile);
    const [isLoading, setIsLoading] = useState(false);

    // Form states for optimistic UI updates (or simple controlled inputs)
    // We'll use uncontrolled inputs with defaultValue for simplicity in the form submission, 
    // but for the "live" feel we might want controlled if we want to preview changes instantly.
    // Let's stick to standard form submission for robustness first.

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        // Optimistic update logic could go here, but let's wait for server response for safety
        const result = await updateProfile(formData);

        if (result.success) {
            toast.success("Profile updated");
            setIsEditing(false);

            // Update local state to reflect changes without full reload
            setProfile(prev => ({
                ...prev,
                title: formData.get("title") as string,
                bio: formData.get("bio") as string,
                location: formData.get("location") as string,
                portfolio_url: formData.get("portfolio_url") as string,
                avatar_url: formData.get("avatar_url") as string,
                cover_url: formData.get("cover_url") as string,
                // Skills handling is complex to optimistic update accurately without parsing, 
                // but we can try or just trust revalidatePath from server action will eventually refresh it.
                // For now, let's trigger a router refresh or just trust the new props coming in if we were using a server component wrapper properly.
                // Since this is a client component holding state, we might need to manually update skills state or force a refresh.
            }));
            // Force a hard refresh to get new server data (easiest for now)
            window.location.reload();
        } else {
            toast.error(result.message);
        }
        setIsLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'avatars' | 'covers', field: keyof ProfileData) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading("Uploading...");
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            toast.error(`Upload failed: ${uploadError.message}`, { id: toastId });
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        setProfile(prev => ({ ...prev, [field]: publicUrl }));
        toast.success("Image uploaded", { id: toastId });
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 relative flex flex-col overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Header Image (Cover) */}
            <div className="h-40 relative shrink-0 group">
                {/* Default Gradient or Custom Image */}
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-zinc-900 ${profile.cover_url ? 'hidden' : 'block'}`} />
                {profile.cover_url && (
                    <Image src={profile.cover_url} alt="Cover" fill className="object-cover" />
                )}

                {/* Edit Cover Overlay */}
                {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <label className="cursor-pointer flex flex-col items-center gap-2 hover:opacity-80 transition">
                            <div className="bg-black/50 p-3 rounded-full border border-white/20">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs text-white font-medium uppercase tracking-widest">Change Cover</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'covers', 'cover_url')}
                            />
                        </label>
                        <input type="hidden" name="cover_url" value={profile.cover_url || ""} />
                    </div>
                )}

                {/* Navigation Back (only when not editing? Or always?) - User removed it previously. */}
            </div>

            {/* Profile Content */}
            <div className="px-6 -mt-16 flex-1 pb-8">
                {/* Header Row: Avatar + Edit Toggle */}
                <div className="flex justify-between items-end mb-4">
                    {/* Avatar */}
                    <div className="relative w-32 h-32 rounded-full border-4 border-[#101922] overflow-hidden bg-zinc-800 shadow-2xl group">
                        {profile.avatar_url ? (
                            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-500">
                                {profile.username?.[0]}
                            </div>
                        )}

                        {/* Edit Avatar Overlay */}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition">
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                    <Camera className="w-8 h-8 text-white mb-1" />
                                    <span className="text-[10px] text-white font-medium uppercase">Examine</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'avatars', 'avatar_url')}
                                    />
                                </label>
                                <input type="hidden" name="avatar_url" value={profile.avatar_url || ""} />
                            </div>
                        )}
                    </div>

                    {/* Edit/Save Buttons */}
                    <div className="mb-4 z-10">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setProfile(initialProfile);
                                    }}
                                    className="px-4 py-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition font-medium text-sm flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-900/50"
                                >
                                    {isLoading ? "Saving..." : <><Check className="w-4 h-4" /> Save</>}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-700 transition font-medium text-sm"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Name & Title */}
                <div className="mb-6">
                    {isEditing ? (
                        <div className="space-y-3">
                            {/* Username Input */}
                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase">Username</label>
                                <input
                                    name="username"
                                    defaultValue={profile.username}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-blue-500 outline-none font-bold"
                                    placeholder="Username"
                                />
                            </div>

                            {/* Job Title Input */}
                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase">Job Title</label>
                                <input
                                    name="title"
                                    defaultValue={profile.title || ""}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. Full Stack Developer"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{profile.username}</h1>
                            <p className="text-zinc-400 font-medium">{profile.title || "Member"}</p>
                        </div>
                    )}

                    {/* Location & Portfolio */}
                    <div className="flex flex-col gap-1 mt-2">
                        {isEditing ? (
                            <div className="space-y-2 mt-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                                    <input
                                        name="location"
                                        defaultValue={profile.location || ""}
                                        className="flex-1 bg-transparent border-b border-zinc-700 text-sm text-white focus:border-blue-500 outline-none placeholder:text-zinc-600"
                                        placeholder="City, Country"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Compass className="w-4 h-4 text-zinc-500 shrink-0" />
                                    <input
                                        name="portfolio_url"
                                        defaultValue={profile.portfolio_url || ""}
                                        className="flex-1 bg-transparent border-b border-zinc-700 text-sm text-blue-400 focus:border-blue-500 outline-none placeholder:text-zinc-600"
                                        placeholder="https://yourwork.com"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    <span>{profile.location || "Remote"}</span>
                                </div>
                                {profile.portfolio_url && (
                                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline truncate max-w-[200px] flex items-center gap-1.5">
                                        <Compass className="w-3.5 h-3.5" />
                                        {profile.portfolio_url.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {/* Time Balance */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
                            <Coins className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-white leading-none">{profile.time_balance}</div>
                        <div className="text-[10px] text-zinc-500 font-medium uppercase mt-1">Credits</div>
                    </div>

                    {/* Time Invested */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
                            <Compass className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-white leading-none">
                            {Math.floor(stats.timeInvested / 60)}<span className="text-xs font-normal text-zinc-500">h</span> {stats.timeInvested % 60}<span className="text-xs font-normal text-zinc-500">m</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium uppercase mt-1">Hours Swapped</div>
                    </div>

                    {/* Matches */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-1">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-white leading-none">{stats.matches}</div>
                        <div className="text-[10px] text-zinc-500 font-medium uppercase mt-1">Matches</div>
                    </div>
                </div>

                {/* Bio */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">About Me</h3>
                    {isEditing ? (
                        <textarea
                            name="bio"
                            defaultValue={profile.bio || ""}
                            className="w-full min-h-[120px] bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 focus:border-blue-500 outline-none leading-relaxed resize-none [&::-webkit-scrollbar]:hidden"
                            placeholder="Write a short bio..."
                        />
                    ) : (
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                            {profile.bio || "No bio yet."}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    {isEditing ? (
                        <div className="grid gap-4">
                            {/* Offering Input */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                                    <span className="text-sm">⚡</span> Skills I Offer
                                </label>
                                <textarea
                                    name="skills_offering"
                                    defaultValue={profile.skills?.filter((s) => s.type === 'offering').map((s) => s.name).join(", ") || ""}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 focus:border-blue-500 outline-none text-sm resize-none h-20 [&::-webkit-scrollbar]:hidden"
                                    placeholder="React, Python, Design... (comma separated)"
                                />
                            </div>

                            {/* Seeking Input */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                                    <span className="text-sm">🔍</span> Skills I'm Seeking
                                </label>
                                <textarea
                                    name="skills_seeking"
                                    defaultValue={profile.skills?.filter((s) => s.type === 'seeking').map((s) => s.name).join(", ") || ""}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 focus:border-purple-500 outline-none text-sm resize-none h-20 [&::-webkit-scrollbar]:hidden"
                                    placeholder="Figma, SEO, Marketing... (comma separated)"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500">Separate skills with commas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Offering Section */}
                            {profile.skills?.some(s => s.type === 'offering') && (
                                <div>
                                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        ⚡ Offering
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills?.filter(s => s.type === 'offering').map((s) => (
                                            <span key={s.id} className="px-3 py-1.5 rounded-full text-xs font-bold border border-blue-500/30 bg-blue-500/10 text-blue-400">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Seeking Section */}
                            {profile.skills?.some(s => s.type === 'seeking') && (
                                <div>
                                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        🔍 Seeking
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills?.filter(s => s.type === 'seeking').map((s) => (
                                            <span key={s.id} className="px-3 py-1.5 rounded-full text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!profile.skills || profile.skills.length === 0) && (
                                <p className="text-zinc-500 text-sm italic">No skills added yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
