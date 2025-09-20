import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type HealthCategory = "vaccines" | "weight" | "illness" | "allergy" | "labs";

export interface HealthCard {
    id: string;
    childId: string;
    category: HealthCategory;
    title: string;
    subtitle?: string;
    dateISO: string;
}

const categoryColor: Record<HealthCategory, string> = {
    vaccines: "#b47e5d", // ✅ common accent
    weight: "#16a34a",
    illness: "#dc2626",
    allergy: "#f59e0b",
    labs: "#5c4033", // ✅ kahverengi
};

type Props = { items: HealthCard[] };

export default function Timeline({ items }: Props) {
    if (items.length === 0) {
        return (
            <Text style={styles.empty}>Henüz kayıt bulunmuyor</Text>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>📋 Son Kayıtlar</Text>
            {items.map((item) => (
                <View key={item.id} style={styles.card}>
                    <View style={[styles.dot, { backgroundColor: categoryColor[item.category] }]} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{item.title}</Text>
                        {item.subtitle ? (
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        ) : null}
                        <Text style={styles.date}>
                            {new Date(item.dateISO).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 10 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#5c4033",
        marginBottom: 8,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fffaf5", // ✅ krem kutucuk
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    title: { fontSize: 15, fontWeight: "700", color: "#5c4033" },
    subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
    date: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
    empty: {
        textAlign: "center",
        color: "#9ca3af",
        fontSize: 14,
        marginTop: 20,
    },
});
