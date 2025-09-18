import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "./children";

export type HealthRecord = {
    id: string;
    user_id: string;
    child_id: string;
    category: string;
    title?: string;
    details?: string;
    date?: string;
    risk?: string;
    suggestion?: string;
    created_at: string;
    advice?: string;
    image_url?: string;
};

export type RecordsByCategory = {
    [key: string]: HealthRecord[];
};

// services/healthEvents.ts - Mevcut fonksiyona ekle
export async function fetchRecordsByCategory(category?: string): Promise<RecordsByCategory | HealthRecord[]> {
    const childId = await getSelectedChild();
    if (!childId) return category ? [] : {};

    let query = supabase
        .from("health_events")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });

    // Eğer spesifik kategori istendiyse
    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error(error);
        return category ? [] : {};
    }

    // Eğer spesifik kategori istendiyse, direkt dizi dön
    if (category) {
        return data;
    }

    // Tüm kategorileri grupla
    const grouped: RecordsByCategory = {};
    for (const record of data) {
        const cat = record.category || "Diğer";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(record);
    }

    return grouped;
}