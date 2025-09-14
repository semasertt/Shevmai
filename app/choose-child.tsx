import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchChildren, setSelectedChild, deleteChild } from '@/services/children';
import type { Child } from '@/types';
import { router } from 'expo-router';

export default function ChooseChild() {
    const [items, setItems] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const list = await fetchChildren();
            setItems(list);
        } catch (e:any) {
            Alert.alert('Hata', e.message ?? 'Bir şeyler ters gitti');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    if (loading) {
        return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator />
            <Text style={{ marginTop:8 }}>Yükleniyor…</Text>
        </View>;
    }

    if (items.length === 0) {
        return <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
            <Text style={{ fontSize:16, marginBottom:12 }}>Kayıtlı çocuk yok.</Text>
            <TouchableOpacity
                onPress={() => router.push('/onboarding/add-child')}
                style={{ backgroundColor:'#111827', padding:12, borderRadius:12 }}
            >
                <Text style={{ color:'#fff', fontWeight:'600' }}>Çocuk Ekle</Text>
            </TouchableOpacity>
        </View>;
    }

    return (
        <View style={{ flex:1, padding:16 }}>
            <Text style={{ fontSize:18, fontWeight:'700', marginBottom:12 }}>Çocuk Seç</Text>
            <FlatList
                data={items}
                keyExtractor={(i) => i.id}
                ItemSeparatorComponent={() => <View style={{ height:10 }} />}
                renderItem={({ item }) => (
                    <View style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12 }}>
                        <Text style={{ fontSize:16, fontWeight:'600' }}>{item.name}</Text>
                        {!!item.birthdate && <Text style={{ color:'#6b7280' }}>Doğum: {item.birthdate}</Text>}
                        {!!item.gender && <Text style={{ color:'#6b7280' }}>Cinsiyet: {item.gender}</Text>}

                        <View style={{ flexDirection:'row', gap:10, marginTop:10 }}>
                            <TouchableOpacity
                                onPress={async () => { await setSelectedChild(item.id); router.replace('/(tabs)/home'); }}
                                style={{ backgroundColor:'#111827', paddingVertical:10, paddingHorizontal:14, borderRadius:10 }}
                            >
                                <Text style={{ color:'#fff', fontWeight:'600' }}>Seç</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={async () => {
                                    Alert.alert('Sil', `${item.name} silinsin mi?`, [
                                        { text: 'Vazgeç', style: 'cancel' },
                                        { text: 'Sil', style: 'destructive', onPress: async () => { await deleteChild(item.id); load(); } }
                                    ]);
                                }}
                                style={{ borderWidth:1, borderColor:'#ef4444', paddingVertical:10, paddingHorizontal:14, borderRadius:10 }}
                            >
                                <Text style={{ color:'#ef4444', fontWeight:'600' }}>Sil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity
                onPress={() => router.push('/onboarding/add-child')}
                style={{ position:'absolute', right:16, bottom:24, backgroundColor:'#2563eb', paddingVertical:14, paddingHorizontal:18, borderRadius:9999 }}
            >
                <Text style={{ color:'#fff', fontWeight:'700' }}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}
