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
import { VACCINE_PROMPT } from "@/src/prompts";
import { commonStyles } from "@/src/styles/common";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function VaccineScheduleView() {
    const [child, setChild] = useState<any>(null);
    const [vaccines, setVaccines] = useState<any[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const CACHE_KEY = "vaccine_schedule_cache";

    useEffect(() => {
        (async () => {
            setLoading(true);

            // 📦 1. Cache varsa göster
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setSummary(parsed.summary || "");
                    setVaccines(parsed.vaccines || []);
                    setLoading(false); // önce göster
                } catch (e) {
                    console.warn("❌ Vaccine cache parse hatası:", e);
                }
            }

            // 📡 2. Güncel veriyi al
            try {
                const c = await getCurrentChildWithDetails();
                setChild(c);

                if (c?.birthdate) {
                    const birth = new Date(c.birthdate);
                    const today = new Date();
                    const ageMonths =
                        (today.getFullYear() - birth.getFullYear()) * 12 +
                        (today.getMonth() - birth.getMonth());

                    const prompt = VACCINE_PROMPT(c.name, ageMonths);
                    const aiResult = await analyzeText(prompt);

                    const clean = aiResult.replace(/```json|```/g, "").trim();
                    const parsed = JSON.parse(clean);

                    setSummary(parsed.summary || "");

                    // 🔹 sıralama: güncel > yaklaşan > yapıldı
                    const sorted = (parsed.vaccines || []).sort((a: any, b: any) => {
                        const order = { güncel: 0, yaklaşan: 1, yapıldı: 2, geçti: 2 };
                        // @ts-ignore
                        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
                    });

                    setVaccines(sorted);

                    // 📦 Cache güncelle
                    await AsyncStorage.setItem(
                        CACHE_KEY,
                        JSON.stringify({ summary: parsed.summary, vaccines: sorted })
                    );
                }
            } catch (err) {
                console.error("❌ Vaccine API hatası:", err);
            }

            setLoading(false);
        })();
    }, []);

    if (!child) {
        return (
            <View style={commonStyles.page}>
                <Text style={commonStyles.headerTitle}>💉 Aşı Takvimi</Text>
                <Text style={commonStyles.emptyText}>Çocuk bilgisi bulunamadı</Text>
            </View>
        );
    }

    if (loading && vaccines.length === 0) {
        return (
            <View style={commonStyles.page}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={commonStyles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>            {/* Header */}
            <View style={commonStyles.header}>
                <Text style={commonStyles.headerTitle}>
                    💉 {child.name} için Aşı Takvimi
                </Text>
            </View>

            {/* Liste */}
            <FlatList
                style={[commonStyles.page, { marginTop: 12 }]}
                data={vaccines}
                keyExtractor={(_, idx) => String(idx)}
                ListHeaderComponent={
                    summary ? (
                        <View style={commonStyles.summaryCard}>
                            <Text style={commonStyles.summaryTitle}>📌 Genel Özet</Text>
                            <Text style={commonStyles.summaryText}>{summary}</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item: v, index }) => {
                    const isOpen = openIndex === index;

                    let cardStyle = commonStyles.futureCard;
                    if (v.status === "yapıldı" || v.status === "geçti")
                        cardStyle = commonStyles.doneCard;
                    if (v.status === "güncel") cardStyle = commonStyles.currentCard;

                    return (
                        <TouchableOpacity
                            onPress={() => setOpenIndex(isOpen ? null : index)}
                            style={[commonStyles.vaccineCard, cardStyle]}
                            activeOpacity={0.8}
                        >
                            {/* Başlık + Status */}
                            <View style={commonStyles.recordHeader}>
                                <Text style={commonStyles.vaccineTitle}>{v.name}</Text>
                                <Text style={commonStyles.vaccineStatus}>
                                    {v.status.toUpperCase()}
                                </Text>
                            </View>

                            {/* Ay bilgisi */}
                            {v.month && (
                                <Text style={commonStyles.vaccineMonth}>
                                    📅 Ay(lar): {v.month}
                                </Text>
                            )}

                            {/* Durum Row */}
                            <View style={commonStyles.statusRow}>
                                <View
                                    style={[commonStyles.statusDot, getStatusStyle(v.status).dot]}
                                />
                                <Text
                                    style={[commonStyles.statusText, getStatusStyle(v.status).text]}
                                >
                                    {v.status}
                                </Text>
                            </View>

                            {/* Açılınca detay */}
                            {isOpen && (
                                <Text style={commonStyles.vaccineDesc}>{v.description}</Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <Text style={commonStyles.emptyText}>Aşı bilgisi bulunamadı</Text>
                }
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    );
}

// 🔹 Status renk helper
export const getStatusStyle = (status: string) => {
    switch (status) {
        case "güncel":
        case "şu anda":
            return { dot: { backgroundColor: "#2e7d32" }, text: { color: "#2e7d32" } };
        case "yaklaşan":
            return { dot: { backgroundColor: "#ff9800" }, text: { color: "#ff9800" } };
        case "yapıldı":
        case "geçti":
        case "geçildi":
            return { dot: { backgroundColor: "#757575" }, text: { color: "#757575" } };
        default:
            return { dot: { backgroundColor: "#9ca3af" }, text: { color: "#9ca3af" } };
    }
};
