import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";

// services/healthEvents.ts
export async function saveHealthEvent(payload: {
    category: string;
    title: string;
    date?: string;
    details?: string;
    advice?: string;
    image_url?: string; // ⬅️ Bu alanın olup olmadığını kontrol et
}) {
    console.log("💾 Kayıt verisi:", payload);

    try {
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr || !userData?.user) throw new Error("Giriş gerekli.");

        const childId = await getSelectedChild();
        if (!childId) throw new Error("Önce bir çocuk seçmelisin.");

        // Görsel URI'sini de kaydet
        const { data, error } = await supabase
            .from("health_events")
            .insert({
                user_id: userData.user.id,
                child_id: childId,
                category: payload.category,
                title: payload.title,
                details: payload.details,
                advice: payload.advice,
                image_url: payload.image_url, // ⬅️ BURAYA EKLENDİ
                date: payload.date || new Date().toISOString(),
            })
            .select();

        if (error) {
            console.error("❌ Supabase insert error:", error);
            throw error;
        }

        console.log("✅ Görsel kaydı başarılı:", data);
        return data?.[0]?.id ?? null;

    } catch (err) {
        console.error("❌ saveHealthEvent hatası:", err);
        throw err;
    }
}