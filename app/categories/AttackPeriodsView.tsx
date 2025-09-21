import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { ATTACK_PROMPT } from "@/src/prompts";
import { commonStyles } from "@/src/styles/common";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// 🔹 Duruma göre renk helper
export const getStatusStyle = (status: string) => {
    switch (status) {
        case "güncel":
        case "şu anda":
            return { dot: { backgroundColor: "#2e7d32" }, text: { color: "#2e7d32" } }; // yeşil
        case "yaklaşan":
            return { dot: { backgroundColor: "#ff9800" }, text: { color: "#ff9800" } }; // turuncu
        case "yapıldı":
        case "geçti":
        case "geçildi":
            return { dot: { backgroundColor: "#757575" }, text: { color: "#757575" } }; // gri
        default:
            return { dot: { backgroundColor: "#9ca3af" }, text: { color: "#9ca3af" } }; // nötr
    }
};

export function AttackPeriodsView() {
    const [child, setChild] = useState<any>(null);
    const [periods, setPeriods] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [summary, setSummary] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // 📦 Cache key
    const CACHE_KEY = "attack_periods_cache";

    useEffect(() => {
        (async () => {
            setLoading(true);

            // 1. Cache varsa hemen göster
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setSummary(parsed.summary || "");
                    setPeriods(parsed.periods || []);
                    setLoading(false); // 👈 hemen göster
                } catch (e) {
                    console.warn("❌ Cache parse hatası:", e);
                }
            }

            // 2. Çocuğu ve AI sonucunu paralel çek
            try {
                const c = await getCurrentChildWithDetails();
                setChild(c);

                if (c?.birthdate) {
                    const birth = new Date(c.birthdate);
                    const today = new Date();
                    const ageMonths =
                        (today.getFullYear() - birth.getFullYear()) * 12 +
                        (today.getMonth() - birth.getMonth());

                    const prompt = ATTACK_PROMPT(c.name, ageMonths);

                    const aiResult = await analyzeText(prompt);
                    const clean = aiResult.replace(/```json|```/g, "").trim();
                    const parsed = JSON.parse(clean);

                    // 🔹 sıralama: şu anda > yaklaşan > geçildi
                    const sorted = (parsed.periods || []).sort((a: any, b: any) => {
                        const order: Record<string, number> = {
                            "şu anda": 0,
                            "yaklaşan": 1,
                            "geçildi": 2,
                        };
                        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
                    });

                    setSummary(parsed.summary || "");
                    setPeriods(sorted);

                    // 📦 Cache güncelle
                    await AsyncStorage.setItem(
                        CACHE_KEY,
                        JSON.stringify({ summary: parsed.summary, periods: sorted })
                    );
                }
            } catch (err) {
                console.error("❌ Attack API hatası:", err);
            }

            setLoading(false);
        })();
    }, []);

    if (!child) {
        return (
            <View style={commonStyles.page}>
                <Text style={commonStyles.headerTitle}>⚡ Atak Dönemleri</Text>
                <Text style={commonStyles.emptyText}>Çocuk bilgisi bulunamadı</Text>
            </View>
        );
    }

    if (loading && periods.length === 0) {
        return (
            <View style={commonStyles.page}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View
                style={[
                    commonStyles.header,
                    { flexDirection: "row", alignItems: "center", justifyContent: "center" },
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        marginTop:45,
                        position: "absolute",
                        left: 8,
                        justifyContent: "center",
                        height: "100%",
                        paddingHorizontal: 8,
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>

                <Text style={commonStyles.headerTitle}>
                    ⚡ {child.name} için Atak Dönemleri
                </Text>
            </View>

            {/* İçerik */}
            <FlatList
                style={[commonStyles.page, { marginTop: 12 }]}
                data={periods}
                keyExtractor={(_, idx) => String(idx)}
                ListHeaderComponent={
                    summary ? (
                        <View style={commonStyles.summaryCard}>
                            <Text style={commonStyles.summaryTitle}>📌 Genel Özet</Text>
                            <Text style={commonStyles.summaryText}>{summary}</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item, index }) => {
                    const statusStyle = getStatusStyle(item.status);
                    let cardStyle = commonStyles.futureCard;
                    if (item.status === "geçildi") cardStyle = commonStyles.doneCard;
                    if (item.status === "şu anda") cardStyle = commonStyles.currentCard;

                    const isOpen = expanded === index;

                    return (
                        <TouchableOpacity
                            style={[commonStyles.vaccineCard, cardStyle]}
                            onPress={() => setExpanded(isOpen ? null : index)}
                            activeOpacity={0.8}
                        >
                            {/* Başlık */}
                            <Text style={commonStyles.vaccineTitle}>{item.title}</Text>

                            {/* Durum Row */}
                            <View style={commonStyles.statusRow}>
                                <View style={[commonStyles.statusDot, statusStyle.dot]} />
                                <Text style={[commonStyles.statusText, statusStyle.text]}>
                                    {item.status}
                                </Text>
                            </View>

                            {/* Açılır Detay */}
                            {isOpen && (
                                <Text style={commonStyles.vaccineDesc}>{item.description}</Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <Text style={commonStyles.emptyText}>
                        Atak dönemi bilgisi bulunamadı
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    );

}
