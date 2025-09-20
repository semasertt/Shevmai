import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { VACCINE_PROMPT } from "@/src/prompts";

export function VaccineScheduleView() {
    const [child, setChild] = useState<any>(null);
    const [vaccines, setVaccines] = useState<any[]>([]);
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
                    const prompt = VACCINE_PROMPT(c.name, ageMonths);
                    const aiResult = await analyzeText(prompt);

                    const clean = aiResult.replace(/```json|```/g, "").trim();
                    const parsed = JSON.parse(clean);

                    setSummary(parsed.summary || "");

                    // 🔹 Sıralama ekle: güncel > yaklaşan > yapıldı
                    const sorted = (parsed.vaccines || []).sort((a: any, b: any) => {
                        const order = { "güncel": 0, "yaklaşan": 1, "yapıldı": 2 };
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
            <View style={styles.page}>
                <Text style={styles.title}>💉 Aşı Takvimi</Text>
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
            <Text style={styles.title}>💉 {child.name} için Aşı Takvimi</Text>

            {/* 🔹 Özet Kartı */}
            {summary ? (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>📌 Genel Özet</Text>
                    <Text style={styles.summaryText}>{summary}</Text>
                </View>
            ) : null}

            {/* 🔹 Aşı Listesi */}
            {vaccines.length > 0 ? (
                vaccines.map((v, idx) => {
                    let cardStyle = styles.futureCard;
                    if (v.status === "geçti") cardStyle = styles.doneCard;
                    if (v.status === "güncel") cardStyle = styles.currentCard;

                    return (
                        <View key={idx} style={[styles.vaccineCard, cardStyle]}>
                            <Text style={styles.vaccineTitle}>
                                {v.status === "geçti" ? "✅ " : v.status === "güncel" ? "💉 " : "⏳ "}
                                {v.name}
                            </Text>
                            <Text style={styles.vaccineDesc}>{v.description}</Text>
                            {v.month && (
                                <Text style={styles.vaccineMonth}>📅 Ay(lar): {v.month}</Text>
                            )}
                            <Text style={styles.vaccineStatus}>Durum: {v.status}</Text>
                        </View>
                    );
                })
            ) : (
                <Text style={{ color: "#fff" }}>Aşı bilgisi bulunamadı</Text>
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

    vaccineCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    vaccineTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#fff" },
    vaccineDesc: { fontSize: 14, color: "#e5e7eb" },
    vaccineMonth: { fontSize: 13, marginTop: 4, color: "#bae6fd" },
    vaccineStatus: { fontSize: 12, marginTop: 6, fontStyle: "italic", color: "#cbd5e1" },

    // 🔹 Duruma göre renkler
    doneCard: { backgroundColor: "#334155" }, // gri: yapıldı
    currentCard: { backgroundColor: "#166534" }, // yeşil: güncel
    futureCard: { backgroundColor: "rgba(30,58,138,0.7)" }, // 🔹 mavi, %70 opak
});
