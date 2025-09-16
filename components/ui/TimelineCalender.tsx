import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type HealthCategory = 'vaccines' | 'weight' | 'illness' | 'allergy' | 'labs';

export interface HealthCard {
    id: string;
    childId: string;
    category: HealthCategory;
    title: string;
    subtitle?: string;
    dateISO: string; // "2025-09-10"
}

const categoryColor: Record<HealthCategory, string> = {
    vaccines: '#2563eb',
    weight:   '#16a34a',
    illness:  '#dc2626',
    allergy:  '#f59e0b',
    labs:     '#7c3aed',
};

type Props = { items: HealthCard[] };

function groupByMonth(items: HealthCard[]) {
    const map: Record<string, HealthCard[]> = {};
    for (const it of items) {
        const key = it.dateISO.slice(0, 7); // YYYY-MM
        if (!map[key]) map[key] = [];
        map[key].push(it);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

export default function Timeline({ items }: Props) {
    const groups = groupByMonth(items);
    return (
        <View>
            {groups.map(([month, arr]) => (
                <View key={month} style={styles.monthBlock}>
                    <Text style={styles.month}>{month}</Text>
                    {arr.map(item => (
                        <View key={item.id} style={styles.row}>
                            <View style={styles.leftRail}>
                                <View style={[styles.dot, { backgroundColor: categoryColor[item.category] }]} />
                                <View style={styles.rail} />
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.title}>{item.title}</Text>
                                {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
                                <Text style={styles.date}>{new Date(item.dateISO).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    monthBlock: { marginBottom: 8 },
    month: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    leftRail: { width: 18, alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
    rail: { flex: 1, width: 2, backgroundColor: '#e5e7eb', marginTop: 4 },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    title: { fontSize: 15, fontWeight: '700', color: '#111827' },
    subtitle: { fontSize: 13, color: '#4b5563', marginTop: 2 },
    date: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
});
