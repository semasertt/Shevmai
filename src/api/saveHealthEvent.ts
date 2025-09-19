import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";

export async function saveHealthEvent(payload: {
    category: string;
    title: string;
    date?: string;
    details?: string;
    advice?: string;
    image_url?: string;
    duration?: string;
    summary?: string;

}) {
    console.log("💾 Kaydediliyor:");

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
                image_url: payload.image_url,
                date: payload.date || new Date().toISOString(),
                follow_ups: [] ,// Boş array ile başlat
                summary: payload.summary,
                duration: payload.duration

            })
            .select();

        if (error) throw error;
        return data?.[0]?.id;

    } catch (err) {
        console.error("❌ saveHealthEvent hatası:", err);
        throw err;
    }
}
export async function addFollowUpToEvent(
    eventId: string,
    followUpData: {
        text?: string;
        advice?: string;
        image_url?: string;
        date?: string;      // olayın başlama tarihi
        duration?: string;  // olayın ne kadar sürdüğü
        summary?: string;

    }
) {
    try {
        // Önce mevcut event'i al
        const { data: existingEvent, error: fetchError } = await supabase
            .from("health_events")
            .select("details, follow_ups, advice, image_url, date, duration")
            .eq("id", eventId)
            .single();

        if (fetchError) throw fetchError;

        // Yeni follow_up objesi
        const newFollowUp = {
            text: followUpData.text,
            timestamp: new Date().toISOString(),
        };

        // follow_ups append
        const updatedFollowUps = [
            ...(existingEvent.follow_ups || []),
            newFollowUp,
        ];

        // details append
        const updatedDetails =
            (existingEvent.details || "") +
            `\nEbeveyn cevabı (${new Date().toLocaleString()}): ${followUpData.text}`;

        // Güncellenecek payload
        const updates: any = {
            follow_ups: updatedFollowUps,
            details: updatedDetails,
        };

        if (followUpData.advice) updates.advice = followUpData.advice;
        if (followUpData.image_url) updates.image_url = followUpData.image_url;
        if (followUpData.date) updates.date = followUpData.date;
        if (followUpData.duration) updates.duration = followUpData.duration;
        if (followUpData.summary) updates.summary = followUpData.summary;


        // Güncelleme isteği
        const { data, error } = await supabase
            .from("health_events")
            .update(updates)
            .eq("id", eventId)
            .select();

        if (error) throw error;
        return data?.[0];
    } catch (err) {
        console.error("❌ addFollowUpToEvent hatası:", err);
        throw err;
    }
}

