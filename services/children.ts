// services/children.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "@/lib/supabase";
import type { Child } from '@/types';

const SELECTED_CHILD_KEY = 'selected_child_id';

// Mevcut fonksiyonlar aynen kalıyor
export async function fetchChildren(): Promise<Child[]> {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) throw new Error('Giriş gerekli.');

    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('owner_user_id', userData.user.id)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
}

export async function addChild(payload: { name: string; birthdate?: string; gender?: string; }) {
    if (!payload.name?.trim()) throw new Error('İsim zorunlu.');

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Giriş gerekli.');

    const { data, error } = await supabase
        .from('children')
        .insert({ ...payload, owner_user_id: userData.user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Child;
}

export async function deleteChild(id: string) {
    const { error } = await supabase.from('children').delete().eq('id', id);
    if (error) throw error;
    const selected = await AsyncStorage.getItem(SELECTED_CHILD_KEY);
    if (selected === id) await AsyncStorage.removeItem(SELECTED_CHILD_KEY);
}

export async function setSelectedChild(id: string) {
    await AsyncStorage.setItem(SELECTED_CHILD_KEY, id);
}

export async function getSelectedChild(): Promise<string | null> {
    return AsyncStorage.getItem(SELECTED_CHILD_KEY);
}

// ✅ YENİ EKLENEN FONKSİYONLAR (mevcut kodu bozmadan)

export interface ChildDetails {
    id: string;
    name: string;
    birthdate?: string;
    gender?: string;
    height?: string;
    weight?: string;
    avatar_url?: string;
    owner_user_id: string;
    created_at: string;
}

export async function getChildDetails(childId: string): Promise<ChildDetails | null> {
    try {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('id', childId)
            .single();

        if (error) {
            console.error("❌ Çocuk detayları getirme hatası:", error);
            return null;
        }

        return data;
    } catch (err) {
        console.error("❌ getChildDetails hatası:", err);
        return null;
    }
}

export async function updateChildDetails(
    childId: string,
    updates: {
        name?: string;
        birthdate?: string;
        height?: string;
        weight?: string;
        avatar_url?: string;
        gender?: string;
    }
): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('children')
            .update(updates)
            .eq('id', childId)
            .eq('owner_user_id', user.id);

        if (error) {
            console.error("❌ Çocuk güncelleme hatası:", error);
            return false;
        }

        console.log("✅ Çocuk bilgileri güncellendi:", updates);
        return true;
    } catch (err) {
        console.error("❌ updateChildDetails hatası:", err);
        return false;
    }
}

export async function getCurrentChildWithDetails(): Promise<ChildDetails | null> {
    try {
        const childId = await getSelectedChild();
        if (!childId) return null;

        return await getChildDetails(childId);
    } catch (err) {
        console.error("❌ getCurrentChildWithDetails hatası:", err);
        return null;
    }
}

export async function updateChildMeasurement(
    childId: string,
    height?: string,
    weight?: string
): Promise<boolean> {
    try {
        const updates: any = {};
        if (height !== undefined) updates.height = height;
        if (weight !== undefined) updates.weight = weight;

        if (Object.keys(updates).length === 0) return true;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('children')
            .update(updates)
            .eq('id', childId)
            .eq('owner_user_id', user.id);

        if (error) {
            console.error("❌ Çocuk ölçüm güncelleme hatası:", error);
            return false;
        }

        console.log("✅ Çocuk ölçümleri güncellendi:", updates);
        return true;
    } catch (err) {
        console.error("❌ updateChildMeasurement hatası:", err);
        return false;
    }
}

export async function updateChildProfile(
    childId: string,
    updates: {
        name?: string;
        birthdate?: string;
        gender?: string;
        avatar_url?: string;
    }
): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('children')
            .update(updates)
            .eq('id', childId)
            .eq('owner_user_id', user.id);

        if (error) {
            console.error("❌ Çocuk profil güncelleme hatası:", error);
            return false;
        }

        console.log("✅ Çocuk profili güncellendi:", updates);
        return true;
    } catch (err) {
        console.error("❌ updateChildProfile hatası:", err);
        return false;
    }
}