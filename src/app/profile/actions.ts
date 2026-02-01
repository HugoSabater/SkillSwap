'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const portfolio_url = formData.get("portfolio_url") as string;
    const avatar_url = formData.get("avatar_url") as string;
    const cover_url = formData.get("cover_url") as string;
    const skillsString = formData.get("skills_offering") as string; // Expecting comma separated

    // 1. Update Profile Basic Info
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            title,
            bio,
            location,
            portfolio_url,
            avatar_url: avatar_url || undefined,
            cover_url: cover_url || undefined,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (profileError) {
        console.error("Profile update error:", profileError);
        return { success: false, message: "Failed to update profile details" };
    }

    // 2. Update Skills (Offering & Seeking)
    const skillsOfferingStr = formData.get("skills_offering") as string;
    const skillsSeekingStr = formData.get("skills_seeking") as string;

    const processSkills = async (skillString: string, type: 'offering' | 'seeking') => {
        if (skillString !== null) {
            // Delete existing skills of this type
            const { error: deleteError } = await supabase
                .from("skills")
                .delete()
                .eq("user_id", user.id)
                .eq("type", type);

            if (deleteError) {
                console.error(`Error deleting ${type} skills:`, deleteError);
                return false;
            }

            // Insert new skills
            const skillsArray = skillString.split(",").map(s => s.trim()).filter(s => s.length > 0);

            if (skillsArray.length > 0) {
                const skillsToInsert = skillsArray.map(name => ({
                    user_id: user.id,
                    name: name,
                    type: type
                }));

                const { error: insertError } = await supabase
                    .from("skills")
                    .insert(skillsToInsert);

                if (insertError) {
                    console.error(`Error inserting ${type} skills:`, insertError);
                    return false;
                }
            }
        }
        return true;
    };

    await processSkills(skillsOfferingStr, 'offering');
    await processSkills(skillsSeekingStr, 'seeking');

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully" };
}
