'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeSwap(swapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Unauthorized" };

    // 1. Verify user is a participant
    const { data: swap, error: fetchError } = await supabase
        .from('swaps')
        .select('*')
        .eq('id', swapId)
        .single();

    if (fetchError || !swap) return { success: false, message: "Swap not found" };

    if (swap.sender_id !== user.id && swap.receiver_id !== user.id) {
        return { success: false, message: "Not authorized to complete this swap" };
    }

    // 2. Verified: Update Status
    const { error: updateError } = await supabase
        .from('swaps')
        .update({ status: 'completed' })
        .eq('id', swapId);

    if (updateError) return { success: false, message: updateError.message };

    // 3. Revalidate paths to update UI stats
    revalidatePath(`/chat/${swapId}`);
    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true };
}
