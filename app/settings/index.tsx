import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export default function SettingsScreen() {
    return (
        <ScrollView style={styles.page}>
            <Text style={styles.title}>⚙️ Ayarlar</Text>

            {/* 🚪 Çıkış Butonu (ÜSTE ALINDI) */}
            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                    await supabase.auth.signOut();
                    router.replace("/(auth)/sign-in");
                }}
            >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>

            {/* 👶 Çocuk Yönetimi Kartı */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>👶 Çocuk Yönetimi</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push("/onboarding/add-child")}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#34d399" />
                    <Text style={styles.settingText}>Yeni Çocuk Ekle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push("/choose-child")}
                >
                    <Ionicons name="swap-horizontal-outline" size={20} color="#fbbf24" />
                    <Text style={styles.settingText}>Çocuk Değiştir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="trash-outline" size={20} color="#f87171" />
                    <Text style={styles.settingText}>Çocuk Sil</Text>
                </TouchableOpacity>
            </View>

            {/* 👤 Hesap Kartı */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>👤 Hesap</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="person-circle-outline" size={20} color="#fbbf24" />
                    <Text style={styles.settingText}>Profil Bilgilerim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="key-outline" size={20} color="#f87171" />
                    <Text style={styles.settingText}>Şifre Değiştir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="mail-outline" size={20} color="#a78bfa" />
                    <Text style={styles.settingText}>E-posta Güncelle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="language-outline" size={20} color="#22c55e" />
                    <Text style={styles.settingText}>Dil Seçimi</Text>
                </TouchableOpacity>
            </View>

            {/* 📌 Diğer Kartı */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📌 Diğer</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="color-palette-outline" size={20} color="#f472b6" />
                    <Text style={styles.settingText}>Tema</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="notifications-outline" size={20} color="#38bdf8" />
                    <Text style={styles.settingText}>Bildirimler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="help-circle-outline" size={20} color="#60a5fa" />
                    <Text style={styles.settingText}>Yardım / SSS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="document-text-outline" size={20} color="#facc15" />
                    <Text style={styles.settingText}>Kullanım Koşulları</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="chatbubbles-outline" size={20} color="#34d399" />
                    <Text style={styles.settingText}>Destek ile İletişim</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
    title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    card: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
        paddingBottom: 6,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    settingText: { color: "#fff", marginLeft: 10, fontSize: 16 },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ef4444",
        padding: 14,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: "center",
    },
    logoutText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
});
