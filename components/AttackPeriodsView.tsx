import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { ATTACK_PROMPT } from "@/src/prompts";

export function AttackPeriodsView() {
    const [child, setChild] = useState<any>(null);
    const [periods, setPeriods] = useState<any[]>([]);
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

// 🔹 Sıralama ekle: şu anda > yaklaşan > geçildi
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
            <View style={styles.page}>
                <Text style={styles.title}>⚡ Atak Dönemleri</Text>
                <Text>Çocuk bilgisi bulunamadı</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.page}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={styles.title}>⚡ {child.name} için Atak Dönemleri</Text>

            {/* 🔹 Özet Kartı */}
            {summary ? (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>📌 Genel Özet</Text>
                    <Text style={styles.summaryText}>{summary}</Text>
                </View>
            ) : null}

            {/* 🔹 Atak Listesi */}
            {periods.length > 0 ? (
                periods.map((p, idx) => {
                    let cardStyle = styles.futureCard;
                    if (p.status === "geçildi") cardStyle = styles.pastCard;
                    if (p.status === "şu anda") cardStyle = styles.currentCard;

                    return (
                        <View key={idx} style={[styles.periodCard, cardStyle]}>
                            <Text style={styles.periodTitle}>
                                {p.status === "geçildi" ? "✅ " : p.status === "şu anda" ? "🔥 " : "⏳ "}
                                {p.title}
                            </Text>
                            <Text style={styles.periodDesc}>{p.description}</Text>
                            <Text style={styles.periodStatus}>Durum: {p.status}</Text>
                        </View>
                    );
                })
            ) : (
                <Text>Atak dönemi bilgisi bulunamadı</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, padding: 16, backgroundColor: "#0f172a" },
    title: {
        fontSize: 24,              // 🔹 Daha büyük
        fontWeight: "800",         // 🔹 Daha kalın
        marginBottom: 20,
        color: "#facc15",          // 🔹 Sarı (arka planda çok dikkat çeker)
        textAlign: "center"        // 🔹 Ortalayıp daha güçlü görünüm
    },

    summaryCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    summaryTitle: { color: "#93c5fd", fontSize: 16, fontWeight: "600", marginBottom: 6 },
    summaryText: { color: "#e0f2fe", fontSize: 14, lineHeight: 20 },

    periodCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    periodTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#fff" },
    periodDesc: { fontSize: 14, color: "#e5e7eb" },
    periodStatus: { fontSize: 12, marginTop: 6, fontStyle: "italic", color: "#cbd5e1" },

    // 🔹 Duruma göre renkler
    pastCard: { backgroundColor: "#334155" }, // Gri ton: geçmiş
    currentCard: { backgroundColor: "#166534" }, // Yeşil ton: şu anda
    futureCard: { backgroundColor: "#1e3a8a" }, // Mavi ton: yaklaşan
});
