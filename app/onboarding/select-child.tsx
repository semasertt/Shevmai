import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {SafeAreaView } from 'react-native-safe-area-context'

import { useAppStore } from '@/lib/store';

export default function SelectChild() {
    const router = useRouter();
    const children = useAppStore((s) => s.children);
    const setActiveChild = useAppStore((s) => s.setActiveChild);
    const setOnboarded = useAppStore((s) => s.setOnboarded);

    const goHome = () => {
        setOnboarded(true);
        router.replace('/(tabs)/home');
    };

    const selectChild = (id: string) => {
        setActiveChild(id);
        goHome();
    };

    const goAddChild = () => router.push('/onboarding/add-child');

    const isEmpty = children.length === 0;

    return (
        <SafeAreaView style={s.container}>
            <Text style={s.title}>Çocuk Seç</Text>

            {isEmpty ? (
                <View style={{ gap: 12 }}>
                    <Text style={s.desc}>Kayıtlı çocuk yok.</Text>
                    <Text style={s.desc}>Semaşevval</Text>

                    <TouchableOpacity style={s.btnOutline} onPress={goAddChild}>
                        <Text style={s.btnOutlineText}>➕ Çocuk Ekle</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={children}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={s.item} onPress={() => selectChild(item.id)}>
                                <Text style={s.itemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={[s.btnOutline, { marginTop: 16 }]} onPress={goAddChild}>
                        <Text style={s.btnOutlineText}>➕ Başka Çocuk Ekle</Text>
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 24, gap: 16 },
    title: { color: '#fff', fontSize: 24, fontWeight: '800' },
    desc: { color: '#cbd5e1', fontSize: 16 },

    item: { backgroundColor: '#111827', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1f2937' },
    itemText: { color: '#e5e7eb', fontSize: 16, fontWeight: '600' },

    btnOutline: { borderWidth: 2, borderColor: '#3b82f6', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    btnOutlineText: { color: '#3b82f6', fontWeight: '700', fontSize: 16 },
});