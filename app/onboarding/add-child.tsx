import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';

export default function AddChild() {
    const [name, setName] = useState('');
    const router = useRouter();
    const addChild = useAppStore((s) => s.addChild);
    const setOnboarded = useAppStore((s) => s.setOnboarded);

    const save = () => {
        if (!name.trim()) return;
        addChild(name);
        setOnboarded(true);
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView style={s.container}>
            <Text style={s.title}>Çocuk Ekle</Text>

            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="İsim"
                placeholderTextColor="#94a3b8"
                style={s.input}
            />

            <TouchableOpacity style={s.btnPrimary} onPress={save}>
                <Text style={s.btnPrimaryText}>Kaydet ve Anasayfa</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 24, gap: 16 },
    title: { color: '#fff', fontSize: 24, fontWeight: '800' },
    input: {
        backgroundColor: '#111827',
        color: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    btnPrimary: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    btnPrimaryText: { color: '#0b1020', fontWeight: '800', fontSize: 16 },
});
