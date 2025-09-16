
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {router} from "expo-router";

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MOCK_CHILDREN = [
    { id: 'c1', name: 'Ela', birth: '2021-05-10', height: '105 cm', weight: '18 kg', avatar: 'https://avatars.dicebear.com/api/avataaars/ela.png' },
    { id: 'c2', name: 'Mert', birth: '2023-02-01', height: '85 cm', weight: '12 kg', avatar: 'https://avatars.dicebear.com/api/avataaars/mert.png' },
];

export default function ProfileScreen() {
    const [currentChild, setCurrentChild] = useState(MOCK_CHILDREN[0]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const navigation = useNavigation();


    return (

        <View style={s.container}>
            <Text style={s.title}>Profil</Text>
            <Text style={s.info}>Burası profil sayfası. (Şimdilik sadece başlık.)</Text>
        </View>

    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 10 },
    title: {  fontSize: 22, fontWeight: '800' },
    info: {  },

        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* üst kısım: resim + bilgiler */}
            <View style={styles.topRow}>
                {/* avatar */}
                <View style={{ alignItems: 'center' }}>
                    <Image source={{ uri: currentChild.avatar }} style={styles.avatar} />

                    {/* çocuk değiştir */}
                    <TouchableOpacity
                        style={styles.changeChildBtn}
                        onPress={() => navigation.navigate('choose-child' as never)}
                    >
                        <Ionicons name="swap-horizontal" size={18} color="#fff" />
                        <Text style={styles.changeChildText}>Çocuğu Değiştir</Text>
                    </TouchableOpacity>
                </View>

                {/* bilgiler */}
                <View style={styles.infoBox}>
                    <Text style={styles.name}>{currentChild.name}</Text>
                    <Text style={styles.detail}>Doğum Tarihi: {currentChild.birth}</Text>
                    <Text style={styles.detail}>Boy: {currentChild.height}</Text>
                    <Text style={styles.detail}>Kilo: {currentChild.weight}</Text>
                </View>

                {/* ayarlar butonu */}
                <Pressable style={styles.settingsBtn} onPress={() => setSettingsOpen(!settingsOpen)}>
                    <Ionicons name="settings-outline" size={26} color="#fff" />
                </Pressable>
            </View>

            {/* sağ kenar dropdown */}
            {settingsOpen && (
                <View style={styles.dropdownRight}>
                    <Pressable style={styles.dropItem}><Text style={styles.dropText}>🔔 Bildirimler</Text></Pressable>
                    <Pressable style={styles.dropItem}><Text style={styles.dropText}>🌐 Dil Seçimi</Text></Pressable>
                    <Pressable style={styles.dropItem}><Text style={styles.dropText}>👤 Hesap Bilgileri</Text></Pressable>
                    <Pressable style={styles.dropItem}><Text style={styles.dropText}>🔒 Gizlilik</Text></Pressable>
                    <Pressable style={styles.dropItem}><Text style={styles.dropText}>🚪 Çıkış Yap</Text></Pressable>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#0f172a' },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        position: 'relative',
    },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#4f46e5' },
    infoBox: { marginLeft: 16, flex: 1 },
    name: { fontSize: 20, fontWeight: '700', color: '#fff' },
    detail: { fontSize: 14, color: '#c7d2fe', marginTop: 2 },

    settingsBtn: { position: 'absolute', top: 20, right: 20 },

    dropdownRight: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#1e3a8a',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 6,
        width: 180,
    },
    dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#312e81' },
    dropText: { color: '#fff', fontSize: 14 },

    changeChildBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4f46e5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginTop: 8,
    },
    changeChildText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },

});
