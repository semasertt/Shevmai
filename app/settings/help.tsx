import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

export default function HelpScreen() {
    const { commonStyles, theme } = useTheme();

    return (
        <SafeAreaView  style={{ flex: 1, backgroundColor: theme.background }} edges={["top"]}>
            <StatusBar backgroundColor={theme.headerBg} barStyle={theme.statusBar} />

            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity onPress={() => router.replace("/settings")} style={commonStyles.headerIconLeft}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>❓ Yardım & SSS</Text>
            </View>

            {/* İçerik */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>Sıkça Sorulan Sorular</Text>
                    <Text style={commonStyles.detail}>
                        📌 <Text style={{ fontWeight: "bold" }}>Uygulama nasıl çalışır?</Text>{"\n"}
                        Çocuğunuzun bilgilerini ekledikten sonra sağlık asistanıyla sohbet edebilir,
                        kayıt tutabilir ve gelişimini takip edebilirsiniz.
                    </Text>
                    <Text style={commonStyles.detail}>
                        📌 <Text style={{ fontWeight: "bold" }}>Verilerim güvende mi?</Text>{"\n"}
                        Tüm veriler Supabase üzerinde yalnızca sizin hesabınıza özel tutulur. Başkaları
                        göremez.
                    </Text>
                    <Text style={commonStyles.detail}>
                        📌 <Text style={{ fontWeight: "bold" }}>Bildirimleri kapatabilir miyim?</Text>{"\n"}
                        Evet, Ayarlar → Bildirimler kısmından yönetebilirsiniz.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
