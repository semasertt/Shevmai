import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchChildren, getSelectedChild } from '../../services/children';
import type { Child } from '../../types';
import { router } from 'expo-router';

export default function Home() {
    const [child, setChild] = useState<Child | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const selectedId = await getSelectedChild();
            const list = await fetchChildren();
            const match = list.find(c => c.id === selectedId) ?? null;
            setChild(match);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator />
        </View>;
    }

    if (!child) {
        return <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
            <Text style={{ fontSize:16, marginBottom:12 }}>Seçili çocuk bulunamadı.</Text>
            <TouchableOpacity
                onPress={() => router.replace('/choose-child')}
                style={{ backgroundColor:'#111827', padding:12, borderRadius:12 }}
            >
                <Text style={{ color:'#fff', fontWeight:'600' }}>Çocuk Seç</Text>
            </TouchableOpacity>
        </View>;
    }

    return (
        <View style={{ flex:1, padding:16 }}>
            <Text style={{ fontSize:18, fontWeight:'700' }}>Merhaba, {child.name} 👋</Text>
            <Text style={{ color:'#6b7280', marginTop:6 }}>
                Bu ekran seçili çocuk ile çalışır. İstersen değiştir:
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/choose-child')}
                style={{ marginTop:12, borderWidth:1, borderColor:'#e5e7eb', padding:10, borderRadius:10 }}
            >
                <Text>Çocuk Değiştir</Text>
            </TouchableOpacity>
        </View>
    );
}
