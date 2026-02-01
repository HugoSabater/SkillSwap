'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSwapStatus(swapId: string, status: 'accepted' | 'rejected') {
    const supabase = await createClient();

    // Ideally we would want to do this in a transaction or RPC if money/credits were moving *right now*.
    // For now, we just update the status.
    // If accepted, we might want to schedule it, but the requirement is just status update.

    const { error } = await supabase
        .from('swaps')
        .update({ status: status === 'rejected' ? 'canceled' : 'accepted' }) // Mapping UI 'rejected' to DB 'canceled' or keeping 'rejected' if enum allows. 
        // Schema said: check (status in ('pending', 'accepted', 'completed', 'canceled'))
        // So we use 'canceled' for rejection.
        .eq('id', swapId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/swaps');
    return { success: true };
}
