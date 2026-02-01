'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signup } from './actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>, actionType: 'login' | 'signup') {
        event.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        const formData = new FormData(event.currentTarget);
        const action = actionType === 'login' ? login : signup;

        const result = await action(formData);

        // NOTE: If successful, the server action calls redirect(), so this code might not run 
        // unless redirect throws an error (which Next.js handles) or returns void.
        // However, if we returned an object, it means there was an error.
        if (result?.error) {
            setErrorMsg(result.error);
            setIsLoading(false);
        } else {
            // If no error returned, we assume redirect is happening or happened.
            // We can just keep loading state true until page navigation occurs.
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-blue-600">

            {/* Header */}
            <div className="absolute top-0 left-0 p-6 z-10">
                <Link href="/" className="flex items-center text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">

                    <div className="text-center mb-8 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">SkillSwap</h1>
                        <p className="text-zinc-400">Welcome back to the community.</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl h-auto mb-6">
                                <TabsTrigger
                                    value="login"
                                    className="h-10 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 rounded-lg transition-all font-medium hover:text-zinc-300"
                                    onClick={() => setErrorMsg(null)}
                                >
                                    Login
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    className="h-10 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 rounded-lg transition-all font-medium hover:text-zinc-300"
                                    onClick={() => setErrorMsg(null)}
                                >
                                    Sign Up
                                </TabsTrigger>
                            </TabsList>

                            {errorMsg && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-in fade-in slide-in-from-top-1">
                                    {errorMsg}
                                </div>
                            )}

                            <TabsContent value="login" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-300 ml-1" htmlFor="email-login">Email</label>
                                        <input
                                            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all font-medium"
                                            id="email-login"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-300 ml-1" htmlFor="password-login">Password</label>
                                        <input
                                            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all font-medium"
                                            id="password-login"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                    </button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-300 ml-1" htmlFor="email-signup">Email</label>
                                        <input
                                            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all font-medium"
                                            id="email-signup"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-300 ml-1" htmlFor="password-signup">Password</label>
                                        <input
                                            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all font-medium"
                                            id="password-signup"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                                    </button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <p className="mt-8 text-center text-xs text-zinc-600">
                        Secured by Supabase Auth.
                    </p>
                </div>
            </div>
        </div>
    );
}
