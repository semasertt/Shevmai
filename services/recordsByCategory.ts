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

export async function fetchRecordsByCategory(): Promise<RecordsByCategory> {
    const childId = await getSelectedChild();
    if (!childId) return {};

    const { data, error } = await supabase
        .from("health_events")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });

    if (error || !data) {
        console.error(error);
        return {};
    }

    // 🔹 kategorilere göre grupla
    const grouped: RecordsByCategory = {};
    for (const record of data) {
        const cat = record.category || "Diğer";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(record);
    }

    return grouped;
}
