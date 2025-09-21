import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    BackHandler,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { fetchChildren, deleteChild } from "@/services/children";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const [children, setChildren] = useState<any[]>([]);
    const { isDark, toggleTheme, commonStyles, theme } = useTheme();

    // ✅ Çocukları yükle
    useEffect(() => {
        const load = async () => {
            try {
                const list = await fetchChildren();
                setChildren(list);
            } catch (err) {
                console.error("Çocuklar yüklenemedi:", err);
            }
        };
        load();
    }, []);

    // ✅ Çocuk Silme
    const onDeleteChild = async (childId: string, name: string) => {
        Alert.alert(
            "Onay",
            `${name} isimli çocuğu silmek istediğine emin misin?`,
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteChild(childId);
                            setChildren((prev) => prev.filter((c) => c.id !== childId));
                            Alert.alert("Başarılı", `${name} silindi.`);
                        } catch (err: any) {
                            Alert.alert("Hata", err.message ?? "Silme işlemi başarısız.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={commonStyles.page}>
            {/* Status Bar */}
            <StatusBar
                backgroundColor={theme.headerBg}
                barStyle={isDark ? "light-content" : "dark-content"}
            />

            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity
                    onPress={() => router.push("/profile")}
                    style={commonStyles.headerIconLeft}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>⚙️ Ayarlar</Text>
                <View style={commonStyles.headerIconRight} />
            </View>

            {/* Kaydırılabilir içerik */}
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* 👶 Çocuk Yönetimi */}
                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>👶 Çocuk Yönetimi</Text>

                    <TouchableOpacity
                        style={commonStyles.settingItem}
                        onPress={() => router.push("/onboarding/add-child")}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#34d399" />
                        <Text style={commonStyles.settingText}>Yeni Çocuk Ekle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={commonStyles.settingItem}
                        onPress={() => router.push("/choose-child")}
                    >
                        <Ionicons name="swap-horizontal-outline" size={20} color="#fbbf24" />
                        <Text style={commonStyles.settingText}>Çocuk Değiştir</Text>
                    </TouchableOpacity>

                    {children.length > 0 ? (
                        children.map((child) => (
                            <TouchableOpacity
                                key={child.id}
                                style={commonStyles.settingItem}
                                onPress={() => onDeleteChild(child.id, child.name)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#f87171" />
                                <Text style={commonStyles.settingText}>{child.name} — Sil</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ color: theme.secondaryText, marginTop: 8 }}>
                            Henüz kayıtlı çocuk yok.
                        </Text>
                    )}
                </View>

                {/* 👤 Hesap */}
                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>👤 Hesap</Text>

                    <TouchableOpacity style={commonStyles.settingItem}>
                        <Ionicons name="person-circle-outline" size={20} color="#fbbf24" />
                        <Text style={commonStyles.settingText}>Profil Bilgilerim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={commonStyles.settingItem}>
                        <Ionicons name="key-outline" size={20} color="#f87171" />
                        <Text style={commonStyles.settingText}>Şifre Değiştir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={commonStyles.settingItem}>
                        <Ionicons name="mail-outline" size={20} color="#a78bfa" />
                        <Text style={commonStyles.settingText}>E-posta Güncelle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={commonStyles.settingItem}>
                        <Ionicons name="language-outline" size={20} color="#22c55e" />
                        <Text style={commonStyles.settingText}>Dil Seçimi</Text>
                    </TouchableOpacity>
                </View>

                {/* 📌 Diğer */}
                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>📌 Diğer</Text>

                    <TouchableOpacity style={commonStyles.settingItem} onPress={toggleTheme}>
                        <Ionicons
                            name={isDark ? "moon" : "sunny"}
                            size={20}
                            color={isDark ? "#facc15" : "#f59e0b"}
                        />
                        <Text style={commonStyles.settingText}>
                            Tema: {isDark ? "Karanlık" : "Aydınlık"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={commonStyles.settingItem}
                        onPress={() => router.push("/settings/notifications")}
                    >
                        <Ionicons name="notifications-outline" size={20} color="#38bdf8" />
                        <Text style={commonStyles.settingText}>Bildirimler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={commonStyles.settingItem}
                        onPress={() => router.push("/settings/help")}
                    >
                        <Ionicons name="help-circle-outline" size={20} color="#60a5fa" />
                        <Text style={commonStyles.settingText}>Yardım / SSS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={commonStyles.settingItem}
                        onPress={() => router.push("/settings/terms")}
                    >
                        <Ionicons name="document-text-outline" size={20} color="#facc15" />
                        <Text style={commonStyles.settingText}>Kullanım Koşulları</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={commonStyles.settingItem}
                        onPress={() => router.push("/settings/support")}
                    >
                        <Ionicons name="chatbubbles-outline" size={20} color="#34d399" />
                        <Text style={commonStyles.settingText}>Destek & İletişim</Text>
                    </TouchableOpacity>
                </View>

                {/* 🚪 Çıkış Butonu */}
                <TouchableOpacity
                    style={[commonStyles.logoutBtn, { marginTop: 20, marginBottom: 40 }]}
                    onPress={async () => {
                        await supabase.auth.signOut();
                        router.replace("/(auth)/sign-in");
                        if (Platform.OS === "android") {
                            BackHandler.exitApp();
                        }
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={commonStyles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
