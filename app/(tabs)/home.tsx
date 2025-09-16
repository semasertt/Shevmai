import { useEffect, useState } from 'react';
import {View, Text, ActivityIndicator, TouchableOpacity, Animated} from 'react-native';
import { fetchChildren, getSelectedChild } from '@/services/children';
import type { Child } from '@/types';
import { router } from 'expo-router';
import ScrollView = Animated.ScrollView;


const CATEGORIES = ["belirti", "ilaç", "aşı", "ölçüm", "tetkik", "doktorNotu"]; //isteğe göre yenisini ekleriz


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

    // @ts-ignore

    // @ts-ignore
    return (
        <View style={{ flex:1, padding:16 }}>
            <Text style={{ fontSize:18, fontWeight:'700' }}>Merhaba, {child.name} 👋</Text>
            <Text style={{ color:'#6b7280', marginTop:6 }}>
                Bu ekran seçili çocuk ile çalışır. İstersen değiştir:
            </Text>


            {/* 📌 Kategori Butonları (semanın kısmıyla değişecek) */}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 16 }}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() =>
                            router.push({
                                pathname: "/categories/category",
                                params: { category: cat },
                            })
                        }
                        style={{
                            width: 150,
                            height: 70,
                            backgroundColor: "#2563eb",
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            borderRadius: 9999,
                            marginRight: 12,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                            {cat.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>



        </View>
    );
}
