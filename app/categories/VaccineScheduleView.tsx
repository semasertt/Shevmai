import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { VACCINE_PROMPT } from "@/src/prompts";
import { commonStyles } from "@/src/styles/common";

export function VaccineScheduleView() {
    const [child, setChild] = useState<any>(null);
    const [vaccines, setVaccines] = useState<any[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const c = await getCurrentChildWithDetails();
            setChild(c);

            if (c?.birthdate) {
                const birth = new Date(c.birthdate);
                const today = new Date();
                const ageMonths =
                    (today.getFullYear() - birth.getFullYear()) * 12 +
                    (today.getMonth() - birth.getMonth());

                try {
                    const prompt = VACCINE_PROMPT(c.name, ageMonths);
                    const aiResult = await analyzeText(prompt);

                    const clean = aiResult.replace(/```json|```/g, "").trim();
                    const parsed = JSON.parse(clean);

                    setSummary(parsed.summary || "");

                    // 🔹 Sıralama: güncel > yaklaşan > yapıldı
                    const sorted = (parsed.vaccines || []).sort((a: any, b: any) => {
                        const order = { güncel: 0, yaklaşan: 1, yapıldı: 2, geçti: 2 };
                        // @ts-ignore
                        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
                    });

                    setVaccines(sorted);
                } catch (err) {
                    console.error("❌ Vaccine API hatası:", err);
                }
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

    if (loading) {
        return (
            <View style={commonStyles.page}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={commonStyles.header}>
                <Text style={commonStyles.headerTitle}>
                    💉 {child.name} için Aşı Takvimi
                </Text>
            </View>

            {/* Scroll içerik */}
            <ScrollView
                style={[commonStyles.page, { marginTop: 12 }]}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Özet Kartı */}
                {summary ? (
                    <View style={commonStyles.summaryCard}>
                        <Text style={commonStyles.summaryTitle}>📌 Genel Özet</Text>
                        <Text style={commonStyles.summaryText}>{summary}</Text>
                    </View>
                ) : null}

                {/* Aşı Listesi */}
                {vaccines.length > 0 ? (
                    vaccines.map((v, idx) => {
                        const isOpen = openIndex === idx;

                        let cardStyle = commonStyles.futureCard;
                        if (v.status === "yapıldı" || v.status === "geçti")
                            cardStyle = commonStyles.doneCard;
                        if (v.status === "güncel") cardStyle = commonStyles.currentCard;

                        return (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setOpenIndex(isOpen ? null : idx)}
                                style={[commonStyles.vaccineCard, cardStyle]}
                                activeOpacity={0.8}
                            >
                                {/* Başlık ve durum */}
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
                                {/* 🔹 Durum Row */}
                                <View style={commonStyles.statusRow}>
                                    <View style={[commonStyles.statusDot, getStatusStyle(v.status).dot]} />
                                    <Text style={[commonStyles.statusText, getStatusStyle(v.status).text]}>
                                        {v.status}
                                    </Text>
                                </View>
                                {/* Açılınca detay */}
                                {isOpen && (
                                    <Text style={commonStyles.vaccineDesc}>{v.description}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={commonStyles.emptyText}>Aşı bilgisi bulunamadı</Text>
                )}
            </ScrollView>
        </View>
    );
}
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
