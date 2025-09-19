import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";

function calculateAgeMonths(birthdate?: string): number {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
}

// Basit aşı takvimi (örnek Türkiye aşı takvimi ay bazında)
const VACCINE_SCHEDULE: Record<number, string[]> = {
    0: ["Hepatit B (ilk doz)"],
    2: ["BCG", "DaBT-IPA-Hib", "KPA", "Rotavirüs"],
    4: ["DaBT-IPA-Hib", "KPA", "Rotavirüs"],
    6: ["DaBT-IPA-Hib", "Hepatit B (3. doz)", "KPA", "Rotavirüs"],
    12: ["KKK", "KPA", "Suçiçeği", "DaBT-IPA-Hib pekiştirme"],
    24: ["Hepatit A"],
    48: ["DaBT-IPA-Hib pekiştirme", "Polio pekiştirme"],
};

export function VaccineScheduleView() {
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
                <Text style={styles.title}>💉 Aşı Takvimi</Text>
                <Text>Çocuk bilgisi bulunamadı</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>💉 {child.name} için Aşı Takvimi</Text>
            {Object.entries(VACCINE_SCHEDULE).map(([month, vaccines]) => {
                const m = parseInt(month);
                const status = ageMonths >= m ? "✅ Yapılmış olmalı" : "⏳ Yaklaşan";
                return (
                    <View key={month} style={styles.item}>
                        <Text style={styles.month}>{m}. ay</Text>
                        <Text style={styles.vaccines}>{vaccines.join(", ")}</Text>
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
    vaccines: { fontSize: 14, color: "#444", marginTop: 4 },
    status: { fontSize: 13, marginTop: 4, color: "#3b82f6" },
});
