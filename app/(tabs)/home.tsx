import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";
import CardButton from "../../components/ui/CardButton";
import { useRouter } from "expo-router";
const DEFAULT_CATEGORIES = [
    { id: "disease", title: "🤒 Hastalık" },
    { id: "vaccine", title: "💉 Aşı" },
    { id: "symptom", title: "🌡️ Semptom" },
    { id: "nutrition", title: "🍎 Beslenme" },
    { id: "sleep", title: "😴 Uyku" },
    { id: "test", title: "🧪 Tahlil Sonuçları" },
    { id: "attack", title: "⚡ Atak Dönemleri" },
    { id: "other", title: "📝 Diğer" },
];

export default function HomeScreen() {
    const router = useRouter();
    const [records, setRecords] = useState<any[]>([]);
    const [recordsByCategory, setRecordsByCategory] = useState<{ [key: string]: any[] }>({});

    useEffect(() => {
        loadHealthEvents();
    }, []);

    const loadHealthEvents = async () => {
        const childId = await getSelectedChild();
        if (!childId) return;

        const { data, error } = await supabase
            .from("health_events")
            .select("*")
            .eq("child_id", childId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setRecords(data);
            groupRecordsByCategory(data);
        }
    };

    const groupRecordsByCategory = (data: any[]) => {
        const grouped: { [key: string]: any[] } = {};

        DEFAULT_CATEGORIES.forEach(cat => {
            grouped[cat.title] = [];
        });

        grouped["📝 Diğer"] = [];

        data.forEach((rec) => {
            const categoryTitle = findCategoryTitle(rec.category);
            if (!grouped[categoryTitle]) {
                grouped[categoryTitle] = [];
            }
            grouped[categoryTitle].push(rec);
        });

        setRecordsByCategory(grouped);
    };

    const findCategoryTitle = (category: string | null): string => {
        if (!category) return "📝 Diğer";

        const found = DEFAULT_CATEGORIES.find(
            cat => cat.title.toLowerCase().includes(category.toLowerCase()) ||
                category.toLowerCase().includes(cat.title.toLowerCase())
        );

        return found ? found.title : "📝 Diğer";
    };

    const handleCategoryPress = (categoryTitle: string) => {
        const categoryRecords = recordsByCategory[categoryTitle] || [];

        router.push({
            pathname: "/categories/category",
            params: {
                category: categoryTitle,
                records: JSON.stringify(categoryRecords)
            }
        });
    };

    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* 📌 Kategoriler */}
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <FlatList
                data={DEFAULT_CATEGORIES}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CardButton
                        title={item.title}
                        records={recordsByCategory[item.title] || []}
                        onPress={() => handleCategoryPress(item.title)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />

            {/* 📌 Takvim */}
            <Text style={styles.sectionTitle}>Takvim</Text>
            <View style={styles.calendarWrap}>
                <Calendar
                    current={new Date().toISOString().slice(0, 10)}
                    markedDates={records.reduce((acc, r) => {
                        const date = r.created_at.slice(0, 10);
                        acc[date] = { marked: true, dotColor: "#3b82f6" };
                        return acc;
                    }, {} as any)}
                    theme={{
                        backgroundColor: "#fff",
                        calendarBackground: "#fff",
                        selectedDayBackgroundColor: "#3b82f6",
                        selectedDayTextColor: "#fff",
                        todayTextColor: "#3b82f6",
                        arrowColor: "#3b82f6",
                        monthTextColor: "#111827",
                    }}
                />
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a" },
    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 12,
        marginLeft: 16,
    },
    calendarWrap: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 8,
        elevation: 3,
    },
});
