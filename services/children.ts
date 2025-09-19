import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "@/lib/supabase";   // ✅ supabase'i import et
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

// ✅ Child tipini biz tanımlayalım
export interface Child {
    id: string;
    name: string;
    birthdate?: string;
    gender?: string;
    height?: string;
    weight?: string;
    sleep_pattern?: string;
    allergies?: string;
    vaccines?: string;
    illnesses?: string;
    avatar_url?: string;
    owner_user_id: string;
    created_at: string;
}

const SELECTED_CHILD_KEY = 'selected_child_id';

// ----------------------
// Çocukları listele
// ----------------------
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

// ----------------------
// Çocuk ekle
// ----------------------
export async function addChild(payload: {
    name: string;
    birthdate?: string;
    gender?: string;
    height?: string;
    weight?: string;
    sleep_pattern?: string;
    allergies?: string;
    vaccines?: string;
    illnesses?: string;
}) {
    if (!payload.name?.trim()) throw new Error('İsim zorunlu.');

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Giriş gerekli.');

    const { data, error } = await supabase
        .from('children')
        .insert({
            ...payload,
            owner_user_id: userData.user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data as Child;
}

// ----------------------
// Çocuk sil
// ----------------------
export async function deleteChild(id: string) {
    const { error } = await supabase.from('children').delete().eq('id', id);
    if (error) throw error;
    const selected = await AsyncStorage.getItem(SELECTED_CHILD_KEY);
    if (selected === id) await AsyncStorage.removeItem(SELECTED_CHILD_KEY);
}

// ----------------------
// Seçili çocuk set/get
// ----------------------
export async function setSelectedChild(id: string) {
    await AsyncStorage.setItem(SELECTED_CHILD_KEY, id);
}

export async function getSelectedChild(): Promise<string | null> {
    return AsyncStorage.getItem(SELECTED_CHILD_KEY);
}
