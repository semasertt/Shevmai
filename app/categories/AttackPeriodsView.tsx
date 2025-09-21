import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { ATTACK_PROMPT } from "@/src/prompts";
import { commonStyles } from "@/src/styles/common";

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
    const [expanded, setExpanded] = useState<number | null>(null); // 🔹 Açık kart state
    const [summary, setSummary] = useState<string>("");
    const [loading, setLoading] = useState(true);

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
                } catch (err) {
                    console.error("❌ Attack API hatası:", err);
                }
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
                <Text style={commonStyles.headerTitle}>⚡ {child.name} için Atak Dönemleri</Text>
            </View>

            <ScrollView
                style={[commonStyles.page, { marginTop: 12 }]}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* 🔹 Özet Kartı */}
                {summary ? (
                    <View style={commonStyles.summaryCard}>
                        <Text style={commonStyles.summaryTitle}>📌 Genel Özet</Text>
                        <Text style={commonStyles.summaryText}>{summary}</Text>
                    </View>
                ) : null}

                {/* 🔹 Atak Listesi */}
                {periods.length > 0 ? (
                    periods.map((p, idx) => {
                        const statusStyle = getStatusStyle(p.status);
                        let cardStyle = commonStyles.futureCard;
                        if (p.status === "geçildi") cardStyle = commonStyles.doneCard;
                        if (p.status === "şu anda") cardStyle = commonStyles.currentCard;

                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[commonStyles.vaccineCard, cardStyle]}
                                onPress={() => setExpanded(expanded === idx ? null : idx)}
                            >
                                {/* Başlık */}
                                <Text style={commonStyles.vaccineTitle}>{p.title}</Text>

                                {/* Durum Row */}
                                <View style={commonStyles.statusRow}>
                                    <View style={[commonStyles.statusDot, statusStyle.dot]} />
                                    <Text style={[commonStyles.statusText, statusStyle.text]}>
                                        {p.status}
                                    </Text>
                                </View>

                                {/* Açılır Detay */}
                                {expanded === idx && (
                                    <Text style={commonStyles.vaccineDesc}>{p.description}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={commonStyles.emptyText}>Atak dönemi bilgisi bulunamadı</Text>
                )}
            </ScrollView>
        </View>
    );
}
