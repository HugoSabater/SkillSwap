'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const formSchema = z.object({
    username: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    title: z.string().min(2, {
        message: 'Job title must be at least 2 characters.',
    }),
    bio: z.string().max(160, {
        message: 'Bio must not be longer than 160 characters.',
    }),
    offering: z.string().min(2, {
        message: 'Skill offering must be at least 2 characters.',
    }),
    offeringLevel: z.enum(['Beginner', 'Expert', 'Intermediate']),
    seeking: z.string().min(2, {
        message: 'Skill seeking must be at least 2 characters.',
    }),
});

export default function ProfileCreatePage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUserId(user.id);
            }
        };
        checkUser();
    }, [router, supabase]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            title: '',
            bio: '',
            offering: '',
            offeringLevel: 'Intermediate',
            seeking: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!userId) return;
        setIsLoading(true);

        try {
            // 1. Update Profile
            const updateProfile = supabase
                .from('profiles')
                // @ts-ignore
                .update({
                    username: values.username,
                    bio: values.bio,
                    title: values.title, // Requires migration
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('id', userId);

            // 2. Insert Offering Skill
            // @ts-ignore
            const insertOffering = supabase.from('skills').insert({
                user_id: userId,
                name: values.offering,
                type: 'offering',
                years_exp: values.offeringLevel === 'Expert' ? 5 : values.offeringLevel === 'Intermediate' ? 2 : 1, // Simplified logic for MPV
            } as any);

            // 3. Insert Seeking Skill
            // @ts-ignore
            const insertSeeking = supabase.from('skills').insert({
                user_id: userId,
                name: values.seeking,
                type: 'seeking',
                years_exp: 0,
            } as any);

            const [profileRes, offeringRes, seekingRes] = await Promise.all([
                updateProfile,
                insertOffering,
                insertSeeking,
            ]);

            if (profileRes.error) throw profileRes.error;
            if (offeringRes.error) throw offeringRes.error;
            if (seekingRes.error) throw seekingRes.error;

            toast.success('Profile created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error creating profile:', error);
            toast.error('Failed to create profile. ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (!userId) {
        return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#f6f7f8] dark:bg-[#09090b] p-4">
            <Card className="w-full max-w-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
                        Complete Your Profile
                    </CardTitle>
                    <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">
                        Tell us about yourself to start swapping skills.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Senior React Developer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="I love building scalable web apps..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="offering"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skill You Offer</FormLabel>
                                            <FormControl>
                                                <Input placeholder="React, Design..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="offeringLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Level</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="Expert">Expert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="seeking"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skill You Seek</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SEO, Python..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-[#137fec] hover:bg-[#137fec]/90" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Create Profile & Get 2 Credits"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
