import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Child } from '../types';

const SELECTED_CHILD_KEY = 'selected_child_id';

export async function fetchChildren(): Promise<Child[]> {
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function addChild(payload: { name: string; birthdate?: string; gender?: string; }) {
    if (!payload.name?.trim()) throw new Error('İsim zorunlu.');
    const { data, error } = await supabase
        .from('children')
        .insert(payload)
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
