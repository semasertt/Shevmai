import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";

function calculateAgeMonths(birthdate?: string): number {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
}

// Basit gelişim/atak dönemleri tablosu
const ATTACK_PERIODS: Record<number, string[]> = {
    4: ["4. ay büyüme atağı", "Uyku düzensizliği olabilir"],
    8: ["Diş çıkarma atağı", "Huzursuzluk görülebilir"],
    18: ["2 yaş sendromu başlangıcı"],
    36: ["Dil gelişimi hızlanır, davranışsal ataklar olabilir"],
};

export function AttackPeriodsView() {
    const [child, setChild] = useState<any>(null);
    const [ageMonths, setAgeMonths] = useState(0);

    useEffect(() => {
        (async () => {
            const c = await getCurrentChildWithDetails();
            setChild(c);
            setAgeMonths(calculateAgeMonths(c?.birthdate));
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

    return (
        <View style={styles.page}>
            <Text style={styles.title}>⚡ {child.name} için Atak Dönemleri</Text>
            {Object.entries(ATTACK_PERIODS).map(([month, periods]) => {
                const m = parseInt(month);
                const status = ageMonths >= m ? "📌 Geçmiş" : "🔔 Yaklaşan";
                return (
                    <View key={month} style={styles.item}>
                        <Text style={styles.month}>{m}. ay</Text>
                        <Text style={styles.periods}>{periods.join(", ")}</Text>
                        <Text style={styles.status}>{status}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, padding: 16, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    month: { fontSize: 16, fontWeight: "600" },
    periods: { fontSize: 14, color: "#444", marginTop: 4 },
    status: { fontSize: 13, marginTop: 4, color: "#3b82f6" },
});
