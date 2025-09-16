// services/healthEvents.ts
import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";

export async function saveHealthEvent(payload: {
    category: string;
    title: string;
    date?: string; //sonradan eklicem
    details?: string;//sonradan eklicem
    advice?: string;//sonradan eklicem
    image_url?: string; // 🔹foto saklicaz

}) {
    // Kullanıcıyı al
    const { data: userData, error: uErr } = await supabase.auth.getUser();
    if (uErr || !userData?.user) throw new Error("Giriş gerekli.");

    // Seçili çocuğu al
    const childId = await getSelectedChild();
    if (!childId) throw new Error("Önce bir çocuk seçmelisin.");

    // Supabase insert
    const { error } = await supabase.from("health_events").insert({
        user_id: userData.user.id,
        child_id: childId,
        ...payload,
    });

    if (error) {
        console.error("❌ Supabase insert error:", error);
        throw error;
    }

    console.log("✅ Supabase insert başarılı:", payload);
}
