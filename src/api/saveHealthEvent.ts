import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";

export async function saveHealthEvent(payload: {
    category: string;
    title: string;
    date?: string;
    details?: string;
    advice?: string;
    severity?: string;
    image_url?: string;
}) {
    console.log("💾 Kayıt verisi:", payload);

    try {
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr || !userData?.user) throw new Error("Giriş gerekli.");

        const childId = await getSelectedChild();
        if (!childId) throw new Error("Önce bir çocuk seçmelisin.");

        const { data, error } = await supabase
            .from("health_events")
            .insert({
                user_id: userData.user.id,
                child_id: childId,
                category: payload.category,
                title: payload.title,
                details: payload.details,
                advice: payload.advice,
                severity: payload.severity,
                image_url: payload.image_url,
                date: payload.date || new Date().toISOString(),
                follow_ups: [] // Boş array ile başlat
            })
            .select();

        if (error) throw error;
        return data?.[0]?.id;

    } catch (err) {
        console.error("❌ saveHealthEvent hatası:", err);
        throw err;
    }
}
export async function updateHealthEvent(eventId: string, updates: any) {
    try {
        const { data, error } = await supabase
            .from("health_events")
            .update(updates)
            .eq("id", eventId)
            .select();

        if (error) throw error;
        return data?.[0];
    } catch (err) {
        console.error("❌ updateHealthEvent hatası:", err);
        throw err;
    }
}

export async function addFollowUpToEvent(eventId: string, followUpData: any) {
    try {
        // Önce mevcut follow_ups'ı al
        const { data: existingEvent, error: fetchError } = await supabase
            .from("health_events")
            .select("follow_ups")
            .eq("id", eventId)
            .single();

        if (fetchError) throw fetchError;

        // Yeni follow_up'ı ekle
        const updatedFollowUps = [
            ...(existingEvent.follow_ups || []),
            {
                ...followUpData,
                timestamp: new Date().toISOString()
            }
        ];

        // Güncelle
        const { data, error } = await supabase
            .from("health_events")
            .update({ follow_ups: updatedFollowUps })
            .eq("id", eventId)
            .select();

        if (error) throw error;
        return data?.[0];
    } catch (err) {
        console.error("❌ addFollowUpToEvent hatası:", err);
        throw err;
    }
}