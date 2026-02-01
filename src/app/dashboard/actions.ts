'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function requestSwapAction(providerId: string, serviceName: string, hours: number = 1) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('request_swap', {
        p_provider_id: providerId,
        p_service_name: serviceName,
        p_hours: hours
    });

    if (error) {
        console.error("RPC Error:", error);
        return { success: false, message: "Database error occurred." };
    }

    // The RPC returns a JSON object with { success, message }
    // depending on balance checks etc.

    if (data && data.success) {
        revalidatePath('/dashboard'); // Update balance display
    }

    return data;
}
